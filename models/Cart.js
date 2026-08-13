import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema({
  product_id: {
    type: Number,
    required: true,
  },
  name: {type:String, required : true},

  quantity: {
    type: Number,
    required: true,
  },

  sellingPrice: {
    type: Number,
    required: true,
  },

  lineTotal: { // total price for this quantity 
    type: Number,
    required: true,
  },
});

const cartSchema = new mongoose.Schema(
  {
    cart_id: {
      type: Number,
      required: true,
      unique: true,
    },

    items: {
      type: [saleItemSchema],
      required: true,
    },

    subtotal: { // total before discount
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
    },

    grandTotal: { // total after discount (final bill total add should be there)
      type: Number,
      required: true,
    },

    // payment
    paymentMethod: {
      type: String,
      enum: ["cash", "card"]
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    balance: {
      type: Number,
      default: 0,
    },

    // if debit sale, link to customer
    customer_id: {
        type: Number,
        default: 0,
    },

    customer_name: {
        type: String,
        default: null,
    },

    dueAmount: {
      type: Number,
      default: 0,
    },

    sale_type: {
      type: String,
      required : true,
    },

    // optional tracking
    createdBy: {
        type: String,
    },

    createdAt:{
        type: Date,
        default: Date.now,
    },

    cartStatus: {
        type: String,
        enum: ["active", "completed", "cancelled"],
        default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);