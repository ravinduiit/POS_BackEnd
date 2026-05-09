import express from "express";
import {
  createCustomer,
  getCustomerDue,
  getAllCustomersTotalDue,
  getTodayTotalDue,
  updateCustomerPhone,
  updateCustomerDue,
} from "../controllers/customerController.js";

const router = express.Router();

router.post("/create", createCustomer);

router.post("/due", getCustomerDue);

router.get("/total/all", getAllCustomersTotalDue);

// router.get("/report/today", getTodayTotalDue);

router.post("/update/phone", updateCustomerPhone);

router.post("/update/customerDue", updateCustomerDue);



export default router;