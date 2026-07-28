import express from "express";
import {
  getDemandSupplySettings,
  updateRegionConfig,
  updateGlobalSettings
} from "../controllers/demandSupplyController.js";

const router = express.Router();

router.route("/")
  .get(getDemandSupplySettings);

router.route("/region")
  .put(updateRegionConfig);

router.route("/global")
  .put(updateGlobalSettings);

export default router;
