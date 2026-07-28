import express from "express";
import {
  getAllCountrySettings,
  getCountrySettingsByCode,
  getAdminCountrySettingsByCode,
  updateCountrySettings,
  togglePublishStatus
} from "../controllers/countryWebsiteSettingsController.js";

const router = express.Router();

// Public endpoint for frontend landing pages
router.get("/public/:countryCode", getCountrySettingsByCode);

// Admin endpoints (would normally be protected by admin auth middleware)
router.get("/", getAllCountrySettings);
router.get("/:countryCode", getAdminCountrySettingsByCode);
router.put("/:countryCode", updateCountrySettings);
router.post("/:countryCode/publish", togglePublishStatus);

export default router;
