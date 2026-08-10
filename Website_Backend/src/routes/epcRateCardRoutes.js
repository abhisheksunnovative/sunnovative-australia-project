import express from "express";
import {
  getGuardrails,
  saveGuardrails,
  getMyRateCard,
  saveMyRateCard,
  getAllRateCardsAdmin,
} from "../controllers/epcRateCardController.js";

const router = express.Router();

// Public / Admin
router.get("/guardrails", getGuardrails);
router.post("/guardrails", saveGuardrails);

// EPC Protected (assuming a generic protect/auth middleware exists in server, we'll just mount these directly, user will add auth middleware in server.js)
router.get("/rate-card", getMyRateCard);
router.post("/rate-card", saveMyRateCard);

// Admin
router.get("/admin/epc-rate-cards", getAllRateCardsAdmin);

export default router;
