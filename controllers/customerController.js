import Customer from "../models/Customer.js";
import Counter from "../models/Counter.js";

export const createCustomer = async (req, res) => {
  try {
    const { name, phone } = req.body;

    // Generate unique customer_id
    const counter = await Counter.findOneAndUpdate(
      { id: "customer_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );
    const customer_id = counter.seq;

    const customer = new Customer({
      customer_id,
      name,
      phone,
      total_due: 0,
      debt_list: [],
    });

    await customer.save();

    res.json({
      message: "Customer created successfully",
      customer,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCustomerDue = async (req, res) => {
  try {
    const { customer_id } = req.body;

    const customer = await Customer.findOne({ customer_id });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({
      customer_id: customer.customer_id,
      name: customer.name,
      total_due: customer.total_due,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllCustomersTotalDue = async (req, res) => {
  try {
    const result = await Customer.aggregate([
      {
        $group: {
          _id: null,
          total_due_all_customers: { $sum: "$total_due" },
        },
      },
    ]);

    res.json({
      total_due_all_customers: result[0]?.total_due_all_customers || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTodayTotalDue = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const customers = await Customer.find({
      "debt_list.createdAt": { $gte: startOfDay },
    });

    let totalTodayDue = 0;

    customers.forEach((customer) => {
      customer.debt_list.forEach((debt) => {
        if (debt.createdAt >= startOfDay) {
          totalTodayDue += debt.dueAmount;
        }
      });
    });

    res.json({
      date: startOfDay,
      total_today_due: totalTodayDue,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCustomerDue = async ({
  customer_id,
  paidAmount,
}) => {
  try {
    const customer = await Customer.findOne({ customer_id });

    if (!customer) {
      throw new Error("Customer not found");
    }

    customer.total_due -= paidAmount;

    customer.debt_list.push({
      sale_id: null, // You can link this to a specific sale if needed
      dueAmount: -paidAmount, // Negative because it's a payment
    });

    await customer.save();

    return customer;
  } catch (err) {
    throw new Error(err.message);
  }
};

export const updateCustomerPhone = async ({ customer_id, phone }) => {
  try {
    const {customer_id, phone } = req.body;

    const updatedCustomer = await Customer.findOneAndUpdate(
        { customer_id },
        { phone },
        { returnDocument: "after" }
    );
    
    if (!updatedCustomer) {     
        return res.status(404).json({ error: "Customer not found" });
    }

    res.json({
        message: "Customer phone updated successfully",
        customer: updatedCustomer,
    });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



