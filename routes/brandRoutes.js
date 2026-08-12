import express from "express";
import {
  addBrand,
  getBrandList,
  searchBrands,
  updateBrands,
  toggleBrandStatus
} from "../controllers/brandController.js";
import verifyToken from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/add",
  verifyToken,
  authorizeRoles("Admin"),
  addBrand
);

router.post(
  "/toggle-status",
  verifyToken,
  authorizeRoles("Admin"),
  toggleBrandStatus
);

router.post(
  "/search",
  verifyToken,
  authorizeRoles("Admin"),
  searchBrands
);

router.post(
  "/updateBrand",
  verifyToken,
  authorizeRoles("Admin"),
  updateBrands
);

router.get(
  "/list",
  verifyToken,
  authorizeRoles("Admin", "Cashier"),
  getBrandList
);

export default router;