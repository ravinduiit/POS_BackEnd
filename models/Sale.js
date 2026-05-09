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

const saleSchema = new mongoose.Schema(
  {
    selling_id: {
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

    grandTotal: { // total after discount
      type: Number,
      required: true,
    },

    // payment
    paymentMethod: {
      type: String,
      enum: ["cash", "card"],
      required: true,
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

    dueAmount: {
      type: Number,
      default: 0,
    },

    // optional tracking
    createdBy: {
        type: String,
        required: true,
    },

    createdAt:{
        type: Date,
        default: Date.now,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Sale", saleSchema);