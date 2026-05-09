import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    product_id: {
      type: Number,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    barcode: {
      type: String,
      default: "",
      sparse: true,
      trim: true,
    },

    category_id: {
      type: Number,
      required: true,
      trim: true,
    },

    brand_id: {
      type: Number,
      default: null,
      trim: true,
    },

    best_price : {
      type: Number,
      default: 0,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
      enum: ["piece", "kg", "g", "liter", "ml", "packet", "box", "bottle"],
      default: "piece",
    },

    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    stockQty: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    reorderLevel: { // New field for low stock alert
      type: Number,
      default: 5,
      min: 0,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    lastStockFillingDDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = model("Product", productSchema);

export default Product;