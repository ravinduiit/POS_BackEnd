import Product from "../models/Product.js";
import Counter from "../models/Counter.js";

// for add a product
export const addProduct = async (req, res) => {
  try {
    const {
      name,
      barcode,
      category_id,
      brand_id,
      unit,
      costPrice,
      sellingPrice,
      best_price,
      stockQty,
      reorderLevel,
      description,
      image,
    } = req.body;

    if (
      !name ||
      !category_id ||
      !unit ||
      costPrice === undefined ||
      sellingPrice === undefined ||
      stockQty === undefined
    ) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    if (barcode) {
      const existingBarcode = await Product.findOne({ barcode });
      if (existingBarcode) {
        return res.status(400).json({ error: "Barcode already exists" });
      }
    }

    const counter = await Counter.findOneAndUpdate(
      { id: "product_id" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const newProduct = new Product({
      product_id: counter.seq,
      name,
      barcode,
      category_id,
      brand_id: brand_id || "",
      unit,
      best_price,
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      stockQty: Number(stockQty),
      reorderLevel: reorderLevel !== undefined ? Number(reorderLevel) : 5,
      description: description || "",
      image: image || "",
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product added successfully",
      product: {
        product_id: newProduct.product_id,
        name: newProduct.name,
        barcode: newProduct.barcode,
        category: newProduct.category,
        brand: newProduct.brand,
        unit: newProduct.unit,
        best_price: newProduct.best_price,
        costPrice: newProduct.costPrice,
        sellingPrice: newProduct.sellingPrice,
        stockQty: newProduct.stockQty,
        reorderLevel: newProduct.reorderLevel,
        description: newProduct.description,
        image: newProduct.image,
        isActive: newProduct.isActive,
      },
    });
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// for get product list
export const getProductList = async (req, res) => {
  try {
    const products = await Product.find({}, { _id: 0, __v: 0 }).sort({ product_id: 1 });

    res.status(200).json({
      message: "Product list fetched successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get product list error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// for get single product by id
export const getSingleProduct = async (req, res) => {
  try {
    const { product_id } = req.body;

    if (!product_id || isNaN(product_id)) {
      return res.status(400).json({
        error: "Valid product_id is required",
      });
    }

    const product = await Product.findOne(
      { product_id: Number(product_id) },
      { _id: 0, __v: 0 }
    );

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.error("Get single product error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// for update a product
export const updateProduct = async (req, res) => {
  try {
    const { product_id } = req.body;
    const {
      name,
      barcode,
      category,
      brand,
      unit,
      costPrice,
      sellingPrice,
      best_price,
      stockQty,
      reorderLevel,
      description,
      image,
      lastStockFillingDate,
    } = req.body;

    if (!product_id || isNaN(product_id)) {
      return res.status(400).json({
        error: "Valid product_id is required",
      });
    }

    const product = await Product.findOne({ product_id: Number(product_id) });

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    if (barcode && barcode !== product.barcode) {
      const existingBarcode = await Product.findOne({ barcode });
      if (existingBarcode) {
        return res.status(400).json({
          error: "Barcode already exists",
        });
      }
    }

    if (name !== undefined) product.name = name;
    if (barcode !== undefined) product.barcode = barcode;
    if (category !== undefined) product.category = category;
    if (brand !== undefined) product.brand = brand;
    if (best_price !== undefined) product.best_price = Number(best_price);
    if (unit !== undefined) product.unit = unit;
    if (costPrice !== undefined) product.costPrice = Number(costPrice);
    if (sellingPrice !== undefined) product.sellingPrice = Number(sellingPrice);
    if (stockQty !== undefined) product.stockQty = Number(stockQty);
    if (reorderLevel !== undefined) product.reorderLevel = Number(reorderLevel);
    if (description !== undefined) product.description = description;
    if (image !== undefined) product.image = image;
    if (lastStockFillingDate !== undefined) {
      product.lastStockFillingDDate = lastStockFillingDate || null;
    }

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product: {
        product_id: product.product_id,
        name: product.name,
        barcode: product.barcode,
        category: product.category,
        brand: product.brand,
        unit: product.unit,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        stockQty: product.stockQty,
        best_price: product.best_price,
        reorderLevel: product.reorderLevel,
        description: product.description,
        image: product.image,
        lastStockFillingDate: product.lastStockFillingDate,
        isActive: product.isActive,
      },
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// for toggle product status (active/inactive)
export const toggleProductStatus = async (req, res) => {
  try {
    const { product_id } = req.body;

    if (!product_id || isNaN(product_id)) {
      return res.status(400).json({
        error: "Valid product_id is required",
      });
    }

    const product = await Product.findOne({ product_id: Number(product_id) });

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.status(200).json({
      message: `Product has been ${product.isActive ? "activated" : "deactivated"} successfully`,
      product: {
        product_id: product.product_id,
        name: product.name,
        isActive: product.isActive,
      },
    });
  } catch (error) {
    console.error("Toggle product status error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// for get active product list
export const getActiveProductList = async (req, res) => {
  try {
    const products = await Product.find(
      { isActive: true },
      { _id: 0, __v: 0 }
    ).sort({ product_id: 1 });

    res.status(200).json({
      message: "Active product list fetched successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get active product list error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// for search product by any keyword
export const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.body;

    if (!keyword || !keyword.trim()) {
      return res.status(400).json({
        error: "Search keyword is required",
      });
    }

    const searchRegex = new RegExp(keyword.trim(), "i");

    const products = await Product.find(
      {
        $or: [
          { name: searchRegex },
          { barcode: searchRegex },
          { category: searchRegex },
          { brand: searchRegex },
          { description: searchRegex },
        ],
      },
      { _id: 0, __v: 0 }
    ).sort({ product_id: 1 });

    res.status(200).json({
      message: "Search products fetched successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Search products error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// filter by category, brands, stock status, active status
export const filterProducts = async (req, res) => {
  try {
    const { name, category, brand, stockStatus, isActive } = req.body;

    const filter = {};

    if (name && name.trim()) {
      filter.name = new RegExp(name.trim(), "i");
    }

    if (category && category.trim()) {
      filter.category = new RegExp(`^${category.trim()}$`, "i");
    }

    if (brand && brand.trim()) {
      filter.brand = new RegExp(`^${brand.trim()}$`, "i");
    }

    if (typeof isActive === "boolean") {
      filter.isActive = isActive;
    }

    if (stockStatus) {
      if (stockStatus === "in_stock") {
        filter.stockQty = { $gt: 0 };
      } else if (stockStatus === "out_of_stock") {
        filter.stockQty = 0;
      } else if (stockStatus === "low_stock") {
        filter.$expr = { $lte: ["$stockQty", "$reorderLevel"] };
      } else {
        return res.status(400).json({
          error: "Invalid stockStatus. Use in_stock, out_of_stock, or low_stock",
        });
      }
    }

    const products = await Product.find(filter, { _id: 0, __v: 0 }).sort({
      product_id: 1,
    });

    res.status(200).json({
      message: "Filtered products fetched successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Filter products error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// for low stock products
export const getLowStockProducts = async (req, res) => {
  try {
    const { isActive } = req.body || {};

    const filter = {
      $expr: { $lte: ["$stockQty", "$reorderLevel"] },
    };

    if (typeof isActive === "boolean") {
      filter.isActive = isActive;
    }

    const products = await Product.find(filter, { _id: 0, __v: 0 }).sort({
      stockQty: 1,
      product_id: 1,
    });

    res.status(200).json({
      message: "Low stock products fetched successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get low stock products error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// for get product by barcode
export const getProductByBarcode = async (req, res) => {
  try {
    const { barcode } = req.body;

    if (!barcode || !barcode.trim()) {
      return res.status(400).json({
        error: "Barcode is required",
      });
    }

    const product = await Product.findOne(
      { barcode: barcode.trim() },
      { _id: 0, __v: 0 }
    );

    if (!product) {
      return res.status(404).json({
        error: "Product not found for this barcode",
      });
    }

    res.status(200).json({
      message: "Product fetched successfully by barcode",
      product,
    });
  } catch (error) {
    console.error("Get product by barcode error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// for update product stock and last stock filling date
export const updateProductStock = async (req, res) => {
  try {
    const { product_id, stockQty } = req.body;

    if (!product_id || isNaN(product_id)) {
      return res.status(400).json({
        error: "Valid product_id is required",
      });
    }

    if (stockQty === undefined || isNaN(stockQty) || Number(stockQty) < 0) {
      return res.status(400).json({
        error: "Valid stockQty is required",
      });
    }

    const product = await Product.findOne({ product_id: Number(product_id) });

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    product.stockQty = Number(stockQty);
    product.lastStockFillingDDate = new Date(); // Set last stock filling date to current date when stock is updated

    await product.save();

    res.status(200).json({
      message: "Product stock updated successfully",
      product: {
        product_id: product.product_id,
        name: product.name,
        barcode: product.barcode,
        stockQty: product.stockQty,
        reorderLevel: product.reorderLevel,
        lastStockFillingDate: product.lastStockFillingDDate,
        isActive: product.isActive,
      },
    });
  } catch (error) {
    console.error("Update product stock error:", error);
    res.status(500).json({ error: "Server error" });
  }
};