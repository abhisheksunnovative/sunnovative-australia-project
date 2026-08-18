import express from "express";
import { getPaymentSettings, savePaymentSettings } from "../controllers/customerPaymentSettingsController.js";
import { extractCountry } from "../middleware/countryMiddleware.js";

const router = express.Router();

router.use(extractCountry);

router.get("/payment-settings", getPaymentSettings);
router.post("/payment-settings", savePaymentSettings);

export default router;
