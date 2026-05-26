import express from "express";

import {
  createCustomer,
  getCustomerDue,
  getAllCustomersTotalDue,
  getTodayTotalDue,
  updateCustomerPhone,
  updateCustomerDue,
  getCustomerList,
  toggleCustomerStatus,
  filterCustomer
} from "../controllers/customerController.js";


import verifyToken from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/create", createCustomer);

router.post("/due", getCustomerDue);

router.get("/list", getCustomerList);

router.get("/total/all", getAllCustomersTotalDue);

// router.get("/report/today", getTodayTotalDue);

router.post("/update/phone", updateCustomerPhone);

router.post("/update/customerDue", updateCustomerDue);

router.post("/filter", filterCustomer);

router.post("/toggle_status", toggleCustomerStatus);


export default router;