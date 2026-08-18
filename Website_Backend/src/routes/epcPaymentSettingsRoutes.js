import express from "express";
import { protectEpc } from "../middleware/protectEpc.js";
import { getEpcSettings, saveEpcSettings } from "../controllers/epcPaymentSettingsController.js";
import { extractCountry } from "../middleware/countryMiddleware.js";

const router = express.Router();

router.use(extractCountry);

// GET /api/epc/payment-settings?country=...&projectType=...
router.get("/", protectEpc, getEpcSettings);

// POST /api/epc/payment-settings
router.post("/", protectEpc, saveEpcSettings);

export default router;
