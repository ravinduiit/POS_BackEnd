import express from "express";
import {
  addCategory,
  getCategoryList,
  getActiveCategoryList,
  getSingleCategory,
  updateCategory,
  toggleCategoryStatus,
  searchCategories,
  filterCategories,
} from "../controllers/categoryController.js";
import verifyToken from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/add",
  verifyToken,
  authorizeRoles("Admin"),
  addCategory
);

router.get(
  "/list",
  verifyToken,
  authorizeRoles("Admin", "Cashier"),
  getCategoryList
);

router.get(
  "/active-list",
  verifyToken,
  authorizeRoles("Admin", "Cashier"),
  getActiveCategoryList
);

router.post(
  "/single",
  verifyToken,
  authorizeRoles("Admin", "Cashier"),
  getSingleCategory
);

router.patch(
  "/update",
  verifyToken,
  authorizeRoles("Admin"),
  updateCategory
);

router.patch(
  "/toggle-status",
  verifyToken,
  authorizeRoles("Admin"),
  toggleCategoryStatus
);

router.post(
  "/search",
  verifyToken,
  authorizeRoles("Admin", "Cashier"),
  searchCategories
);

router.post(
  "/filter",
  verifyToken,
  authorizeRoles("Admin", "Cashier"),
  filterCategories
);

export default router;