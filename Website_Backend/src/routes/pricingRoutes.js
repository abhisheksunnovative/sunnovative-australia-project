import express from "express";
import { getCapacities, getPricings, createPricing, updatePricing, deletePricing } from "../controllers/pricingController.js";

const router = express.Router();
router.get("/capacities", getCapacities);
router.get("/", getPricings);
router.post("/", createPricing);
router.put("/:id", updatePricing);
router.delete("/:id", deletePricing);

export default router;
