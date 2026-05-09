// models/db.js
import { connect } from 'mongoose';

const connectDB = async () => {
  try {
    // Connect to the internet database using the secret URL
    await connect(process.env.MONGO_URI);
    console.log("🟢 MongoDB connected successfully!");
  } catch (error) {
    console.log("🔴 MongoDB connection failed:", error.message);
  }
};

export default connectDB;