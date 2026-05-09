// routes/saleRoutes.js
import express from "express";
import {createSale, getTodayTotalDue, getTodaySummary, getSalesOverTime} from "../controllers/saleController.js";
import verifyToken from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/createSale", createSale);

router.post("/todayTotalDue", getTodayTotalDue)

router.post("/summary", getTodaySummary);

router.post("/overtimeSummary", getSalesOverTime);

export default router;