import mongoose from "mongoose";

const debt_listSchema = new mongoose.Schema({
    sale_id: {
        type: Number,
        required: true,
    },
    dueAmount: {
        type: Number,
        required: true,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const customerSchema = new mongoose.Schema(
  {
    customer_id: {
        type: Number,
        required: true,
        unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    total_due: {
      type: Number,
      default: 0,
    },

    email: {
      type: String,
      default: "",
      trim: true,
    },

    debt_list: [debt_listSchema],
    
    isActive: {
      type: Boolean,
      default: true,
    },
    
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);