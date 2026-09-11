import express from "express";
import { getCapacities, getPricings, createPricing, updatePricing, deletePricing, resolvePricing, getAvailableKws } from "../controllers/pricingController.js";

const router = express.Router();

router.get("/capacities", getCapacities);
router.get("/available-kws", getAvailableKws);
router.get("/", getPricings);
router.post("/", createPricing);
router.put("/:id", updatePricing);
router.delete("/:id", deletePricing);
router.get("/resolve", resolvePricing);

export default router;
