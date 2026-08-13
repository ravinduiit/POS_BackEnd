// routes/saleRoutes.js
import express from "express";
import {createSale, getCartById, getTodayTotalDue, getCartByCustomerId,  getSaleDetailsById, getCartList,  getTodaySummary, getSalesOverTime, createCart} from "../controllers/saleController.js";
import verifyToken from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/createSale", createSale);

router.post("/todayTotalDue", getTodayTotalDue)

router.post("/summary", getTodaySummary);

router.post("/overtimeSummary", getSalesOverTime);

router.post("/getSaleDetailsById", getSaleDetailsById);

router.post("/cart", createCart);

router.post("/getCartList", getCartList);

router.post("/getCartBYCustomerId", getCartByCustomerId);

router.post("/getCartById", getCartById)

export default router;