import express from "express";
import {
  getOrderJourneySettings,
  saveOrderJourneySettings,
  resetOrderJourneySettings,
  getPublicJourney,
} from "../controllers/orderJourneySettingsController.js";
import { extractCountry } from "../middleware/countryMiddleware.js";

const router = express.Router();

router.use(extractCountry);

// Admin routes
router.get("/", getOrderJourneySettings);
router.put("/", saveOrderJourneySettings);
router.post("/reset", resetOrderJourneySettings);

// Public route — frontend customer portal ke liye
router.get("/public/:projectType", getPublicJourney);

export default router;