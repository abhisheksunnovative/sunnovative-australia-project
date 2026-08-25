import express from "express";
import { getFeatureAnalytics, createFeatureRollout, updateFeatureRollout, trackFeatureClick, trackFeatureAttribution } from "../controllers/featureAnalyticsController.js";

const router = express.Router();

router.get("/", getFeatureAnalytics);
router.post("/", createFeatureRollout);
router.put("/:id", updateFeatureRollout);

router.post("/:id/track-click", trackFeatureClick);
router.post("/:id/track-attribution", trackFeatureAttribution);

export default router;
