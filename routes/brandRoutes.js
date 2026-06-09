import express from "express";
import {
  addBrand,
  getBrandList
} from "../controllers/brandController.js";
import verifyToken from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/add",
  // verifyToken,
  // authorizeRoles("Admin"),
  addBrand
);

router.get(
  "/list",
  // verifyToken,
  // authorizeRoles("Admin", "Cashier"),
  getBrandList
);

export default router;