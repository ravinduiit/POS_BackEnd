// routes/userRoutes.js
import express from "express";
import { toggleUserStatus, getUserList, getSingleUser, updateUser, changePassword, changeUserRole } from "../controllers/userController.js";
import verifyToken from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// Only Admin can toggle user status
router.post("/toggle_status", verifyToken, authorizeRoles("Admin"), toggleUserStatus);

router.get("/list", verifyToken, authorizeRoles("Admin"), getUserList );

router.post("/single", verifyToken, authorizeRoles("Admin"),getSingleUser);

router.put("/update", verifyToken, authorizeRoles("Admin"), updateUser);

router.put( "/change-password", verifyToken, changePassword);

router.put("/change-role",verifyToken,authorizeRoles("Admin"),changeUserRole);

export default router;