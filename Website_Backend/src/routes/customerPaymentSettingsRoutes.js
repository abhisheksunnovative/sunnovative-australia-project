import express from "express";
import { getPaymentSettings, savePaymentSettings } from "../controllers/customerPaymentSettingsController.js";

const router = express.Router();

router.get("/payment-settings", getPaymentSettings);
router.post("/payment-settings", savePaymentSettings);

export default router;
