import express from "express";
import { getFeatureAnalytics, createFeatureRollout, updateFeatureRollout } from "../controllers/featureAnalyticsController.js";

const router = express.Router();

router.get("/", getFeatureAnalytics);
router.post("/", createFeatureRollout);
router.put("/:id", updateFeatureRollout);

export default router;
