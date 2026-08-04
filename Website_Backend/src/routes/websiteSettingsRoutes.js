import express from "express";
import {
  getWebsiteSettings,
  updateWebsiteSettings,
  resetWebsiteSettings,
} from "../controllers/websiteSettingsController.js";
import { extractCountry } from "../middleware/countryMiddleware.js";

const router = express.Router();

router.use(extractCountry);

router.get("/", getWebsiteSettings);
router.get("/:country/:projectType", getWebsiteSettings);
router.put("/:country/:projectType", updateWebsiteSettings);
router.post("/reset", resetWebsiteSettings);

export default router;
