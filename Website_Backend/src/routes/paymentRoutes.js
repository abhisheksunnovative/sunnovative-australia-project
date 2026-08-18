import express from "express";
import { 
  createOrder, 
  verifyPayment, 
  createTokenOrder, 
  verifyTokenPayment, 
  createStageOrder, 
  verifyStagePayment 
} from "../controllers/paymentController.js";

const router = express.Router();

// Route: POST /api/payments/create-order
router.post("/create-order", createOrder);

// Route: POST /api/payments/verify
router.post("/verify", verifyPayment);

// Token Payments
router.post("/create-token-order", createTokenOrder);
router.post("/verify-token", verifyTokenPayment);

// Stage-wise milestone payments
router.post("/create-stage-order", createStageOrder);
router.post("/verify-stage-payment", verifyStagePayment);

export default router;
