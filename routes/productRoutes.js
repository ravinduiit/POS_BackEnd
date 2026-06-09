import express from "express";
import { 
  addProduct,
  getProductList,
  filterProducts,
  searchProducts,
  getSingleProduct, 
  getActiveProductList, 
  updateProduct, 
  toggleProductStatus,
  getLowStockProducts,
  getProductByBarcode,
  updateProductStock

} from "../controllers/productController.js";
import verifyToken from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/add",
  verifyToken,
  authorizeRoles("Admin"),
  addProduct
);

router.get(
  "/list",
  verifyToken,
  authorizeRoles("Admin", "Cashier"),
  getProductList
);

router.post(
  "/product_by_id",
  verifyToken,
  authorizeRoles("Admin", "Cashier"),
  getSingleProduct
);

router.get(
  "/active_list",
  verifyToken,
  authorizeRoles("Admin", "Cashier"),
  getActiveProductList
);

router.patch(
  "/update",
  verifyToken,
  authorizeRoles("Admin"),
  updateProduct
);

router.patch(
  "/toggle_status",
  verifyToken,
  authorizeRoles("Admin"),
  toggleProductStatus
);

router.post(
  "/search",
  verifyToken,
  authorizeRoles("Admin", "Cashier"),
  searchProducts
);

router.post(
  "/filter",
  verifyToken,
  authorizeRoles("Admin", "Cashier"),
  filterProducts
);

router.post(
  "/low_stock",
  verifyToken,
  authorizeRoles("Admin", "Cashier"),
  getLowStockProducts
);

router.post(
  "/barcode",
  verifyToken,
  authorizeRoles("Admin", "Cashier"),
  getProductByBarcode
);

router.patch(
  "/update-stock",
  verifyToken,
  authorizeRoles("Admin"),
  updateProductStock
);













export default router;