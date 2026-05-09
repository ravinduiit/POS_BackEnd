// models/User.js
import { Schema, model } from 'mongoose';

// We create a Schema (blueprint) for a User
const userSchema = new Schema({
  user_id: { type: Number, required: true, unique: true }, // Unique identifier for the user
  name: { type: String, required: true }, // Added for POS receipts/UI
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['Admin', 'IT', 'Cashier'], 
    default: 'Cashier' 
  },
  isActive: { type: Boolean, default: true }
});

// We turn the blueprint into a real Model and export it
const User = model('User', userSchema);
export default User;