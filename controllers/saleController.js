import mongoose from "mongoose";
import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import Cart from "../models/Cart.js";
import Counter from "../models/Counter.js";

const generateSellingId = async (session) => {
  const counter = await Counter.findOneAndUpdate(
    { id: "sell_id" },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true, session }
  );
  return counter.seq;
};

const generateCartId = async (session) => {
  const counter = await Counter.findOneAndUpdate(
    { id: "cart_id" },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true, session }
  );
  return counter.seq;
};

const calculatePayment = ({
  paymentMethod,
  paidAmount,
  grandTotal,
  customer_id,
  cut_debit,
}) => {
  let balance = 0;
  let dueAmount = 0;

  if (paymentMethod === "cash") {
    if (paidAmount >= grandTotal) {
      if (cut_debit) {
        if (!customer_id) {
          throw new Error("Customer name required for credit sale");
        }
        balance = 0;
        dueAmount = grandTotal - paidAmount; // negative
      } else {
        balance = paidAmount - grandTotal;
        dueAmount = 0;
      }
    } else {
      if (!customer_id) {
        throw new Error("Customer required for credit sale");
      }

      dueAmount = grandTotal - paidAmount;
    }
  }

  if (paymentMethod === "card") {
    balance = 0;
    dueAmount = 0;
  }

  if (paymentMethod === "debit") {
    if (!customer_id) {
      throw new Error("Customer required for credit sale");
    }
    balance = 0;
    dueAmount = grandTotal;
  }

  return { balance, dueAmount };
};

// NEW FUNCTION: handle customer balance update
const updateCustomerBalance = async ({
  customer_id,
  paidAmount,
  grandTotal,
  cut_debit,
  selling_id,
  dueAmount,
  session,
}) => {
  const hasCustomer = customer_id && customer_id !== 0;

  if (!hasCustomer) return;

  let amountDiff = 0;

  if (dueAmount > 0) {
    // increase debt
    amountDiff = dueAmount;
  } else if (dueAmount < 0 && cut_debit) {
    // reduce debt
    amountDiff = dueAmount; // negative
  }

  if (amountDiff === 0) return;

  const updatedCustomer = await Customer.findOneAndUpdate(
    { customer_id },
    {
      $inc: {
        total_due: amountDiff,
      },
      $push: {
        debt_list: {
          sale_id: selling_id,
          dueAmount: amountDiff,
        },
      },
    },
    { returnDocument: "after", session }
  );

  if (!updatedCustomer) {
    throw new Error("Customer not found");
  }
};

export const createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      items,
      paymentMethod,
      paidAmount = 0,
      discount = 0,
      customer_id = 0,
      Customer_name,
      grandTotal_from_client,
      sale_type,
      createdBy,
      cut_debit = false,
    } = req.body;

    console.log("This use for edit updated price ",items);


    if (!items || items.length === 0) {
      throw new Error("Cart is empty");
    }

    if (!["cash", "card"].includes(paymentMethod)) {
      throw new Error("Invalid payment method");
    }

    if (!createdBy) {
      throw new Error("Created by is required");
    }

    let subtotal = 0; // total before discount
    const validatedItems = [];
    const productMap = {};

    // Fetch all products in one query
    const productIds = items.map((i) => i.product_id);
    const products = await Product.find({
      product_id: { $in: productIds },
    }).session(session);

    products.forEach((p) => {
      productMap[p.product_id] = p;
    });

    // Validate items
    for (const item of items) {
      const product = productMap[item.product_id];

      if (!product) {
        throw new Error(`Product not found (ID: ${item.product_id})`);
      }

      // Negative stock allowed temporarily
      let price = 0;

      if(sale_type === "wholesale"){
        price = Number(product.wholesale_price);
      } else {
        price = Number(product.sellingPrice); // this should be change because in frontend can change the price
      }
      const lineTotal = item.quantity * price;

      subtotal += lineTotal;

      validatedItems.push({
        product_id: item.product_id,
        name: product.name,
        quantity: item.quantity,
        sellingPrice: price,
        lineTotal,
      });
    }

    
    const discountValue = Number(discount) || 0;

    const grandTotal = Math.max(subtotal - discountValue, 0);  // total after discount

    const { balance, dueAmount } = calculatePayment({
        paymentMethod,
        paidAmount,
        grandTotal,
        customer_id,
        cut_debit,
    });

    // Generate selling ID
    const selling_id = await generateSellingId(session);

    // Update stock
    const bulkOps = validatedItems.map((item) => ({
        updateOne: {
            filter: { product_id: item.product_id },
            update: {
            $inc: { stockQty: -item.quantity },
            },
        },
    }));

    await Product.bulkWrite(bulkOps, { session });

    // Create sale
    const sale = new Sale({
      selling_id,
      items: validatedItems,
      subtotal,
      discount: discountValue,
      grandTotal,
      paymentMethod,
      sale_type,
      paidAmount,
      balance,
      dueAmount,
      customer_id:
        customer_id === 0 || customer_id === null ? null : customer_id,
      Customer_name,
      createdBy,
    });

    await sale.save({ session });

    // Use extracted function
    await updateCustomerBalance({
      customer_id,
      paidAmount,
      grandTotal,
      cut_debit,
      selling_id,
      dueAmount,
      session,
    });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Sale completed successfully",
      sale,
    });
  } catch (err) {
    // Rollback transaction
    await session.abortTransaction();
    session.endSession();

    console.error(err);

    res.status(400).json({
      error: err.message || "Sale failed",
    });
  }
};

export const getTodayTotalDue = async (req, res) => {
  try {
    // Get today's start and end
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const result = await Sale.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalDue: { $sum: "$dueAmount" },
        },
      },
    ]);

    const totalDue = result.length > 0 ? result[0].totalDue : 0;

    return res.status(200).json({
      success: true,
      totalDue,
    });
  } catch (error) {
    console.error("Error getting today's total due:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getTodaySummary = async (req, res) => {
  try {
    const { paymentMethod, createdBy } = req.query;

    // ✅ Sri Lanka timezone boundaries
    const now = new Date();
    const startOfDay = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Colombo" })
    );
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Colombo" })
    );
    endOfDay.setHours(23, 59, 59, 999);

    // ✅ Dynamic filter
    const matchFilter = {
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    };

    if (paymentMethod) matchFilter.paymentMethod = paymentMethod;
    if (createdBy) matchFilter.createdBy = createdBy;

    const [result] = await Sale.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$grandTotal" },
          totalPaid: { $sum: "$paidAmount" },
          totalDue: { $sum: "$dueAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          totalSales: 1,
          totalRevenue: 1,
          totalPaid: 1,
          totalDue: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: result || {
        totalSales: 0,
        totalRevenue: 0,
        totalPaid: 0,
        totalDue: 0,
      },
    });
  } catch (error) {
    console.error("getTodaySummary error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getSalesOverTime = async (req, res) => {
  try {
    const {
      type = "daily", // daily | weekly | monthly
      startDate,
      endDate,
    } = req.body;

    // ✅ Map type to Mongo unit
    const unitMap = {
      daily: "day",
      weekly: "week",
      monthly: "month",
    };

    const unit = unitMap[type];

    if (!unit) {
      return res.status(400).json({
        success: false,
        message: "Invalid type (daily, weekly, monthly)",
      });
    }

    // ✅ Date filter
    const matchFilter = {};

    if (startDate && endDate) {
      matchFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const result = await Sale.aggregate([
      { $match: matchFilter },

      {
        $group: {
          _id: {
            $dateTrunc: {
              date: "$createdAt",
              unit: unit,
              timezone: "Asia/Colombo", // ✅ critical
            },
          },
          totalRevenue: { $sum: "$grandTotal" },
          totalSales: { $sum: 1 },
        },
      },

      { $sort: { _id: 1 } },

      {
        $project: {
          _id: 0,
          date: "$_id",
          totalRevenue: 1,
          totalSales: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      type,
      data: result,
    });
  } catch (error) {
    console.error("getSalesOverTime error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getSaleDetailsById = async (req, res) => {
  try {
    console.log("hiiii")
    const { selling_id } = req.body;

    if (!selling_id) {
      return res.status(400).json({
        success: false,
        message: "Sale ID is required",
      });
    }

    const sale = await Sale.findOne({ selling_id });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    res.status(200).json({
      success: true,
      data: sale,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const recentSale =  async (req, res) => {
    try{
        const recentSale = await Sale.find({},selling_id, customer_id, paymentMethod, sale_type, grandTotal, createdAt, dueAmount).limit(10);
        res.status(200).json({
            success: true,
            todaysaleData: recentSale,
        });
    }catch{
        res.status(500).json({
            success: false,
            message: "Failed to get today's sales data.",
            error: error.message,
        });
    }
};

export const createCart = async (req, res) => {
  try {
    const {
      items,
      discount = 0,
      paymentMethod,
      paidAmount = 0,
      customer_id = 0,
      customer_name = null,
      sale_type,
      createdBy,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart must contain at least one item",
      });
    }

    if (!sale_type) {
      return res.status(400).json({
        success: false,
        message: "Sale type is required",
      });
    };

    const cart_id = await generateCartId();


    const processedItems = items.map((item) => {
      const quantity = Number(item.quantity);
      const sellingPrice = Number(item.sellingPrice);

      if (!item.product_id || !item.name) {
        throw new Error("Each cart item must have product_id and name");
      }

      if (quantity <= 0) {
        throw new Error(
          `Quantity must be greater than 0 for product ${item.name}`
        );
      }
      const lineTotal = quantity * sellingPrice;

      return {
        product_id: item.product_id,
        name: item.name,
        quantity,
        sellingPrice,
        lineTotal,
      };
    });

    // Calculate subtotal
    const subtotal = processedItems.reduce(
      (total, item) => total + item.lineTotal,
      0
    );

    // Validate discount
    const discountAmount = Number(discount);

    if (discountAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Discount cannot be negative",
      });
    }

    if (discountAmount > subtotal) {
      return res.status(400).json({
        success: false,
        message: "Discount cannot be greater than subtotal",
      });
    }

    // Calculate final bill amount
    const grandTotal = subtotal - discountAmount;

    // Validate paid amount
    const paid = Number(paidAmount);

    if (paid < 0) {
      return res.status(400).json({
        success: false,
        message: "Paid amount cannot be negative",
      });
    }

    // Calculate balance
    const balance = Math.max(paid - grandTotal, 0);

    // Calculate due amount
    const dueAmount = Math.max(grandTotal - paid, 0);

    // Create cart
    const cart = await Cart.create({
      cart_id,
      items: processedItems,

      subtotal,
      discount: discountAmount,
      grandTotal,

      paymentMethod,
      paidAmount: paid,
      balance,

      customer_id,
      customer_name,

      dueAmount,

      sale_type,
      createdBy,

      cartStatus: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Cart created successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Create cart error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create cart",
    });
  }
};

export const getCartList = async (req, res) => {
  try {
    const carts = await Cart.find().sort({ createdAt: -1 }).select("customer_name cart_id grandTotal createdAt cartStatus items customer_id paymentMethod paidAmount discount dueAmount sale_type createdBy");  
    return res.status(200).json({
      success: true,
      data: carts,
    });
  } catch (error) {
    console.error("Get cart list error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get cart list",
    });
  }
};

export const getCartByCustomerId = async (req, res) => {
  try {
    const { keyword } = req.body;
    console.log("Keyword received:", keyword.keyword);
    const cart = await Cart.find({ customer_name: { $regex: keyword.keyword, $options: "i" } });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Get cart by customer ID error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get cart by customer ID",
    });
  }
};

export const getCartById = async (req, res) => {
  try {
    const { cart_id } = req.body;
    const cart = await Cart.findOne({ cart_id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Get cart by ID error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get cart by ID",
    });
  }
};

