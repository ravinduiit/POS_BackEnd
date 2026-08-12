import express from "express";
import { todaySaleData } from "../controllers/chartsController.js";

import verifyToken from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

router = express.Router();

router.get(
    "/today_sale_data",
    verifyToken,
    authorizeRoles("Admin", "Cashier"),
    todaySaleData
);

export default router;