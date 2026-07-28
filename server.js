import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import saleRoutes from "./routes/sale.js";
import connectDB from "./models/db.js";
import customerRoutes from "./routes/costumerRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import brandRouter from "./routes/brandRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin:[ "http://localhost:5173",
      "http://wavepos.s3-website-ap-southeast-2.amazonaws.com",
      "https://d1t4byt8d25y4p.cloudfront.net",
      "https://pos.buylottox.com"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/category", categoryRouter);
app.use("/api/brand", brandRouter);

// Connect database
connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Professional Server running on http://localhost:${PORT}`);
});