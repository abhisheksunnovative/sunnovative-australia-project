import express from "express";
import {
  createProjectOrder,
  getAllProjectOrders,
  getProjectOrder,
  completeStep,
  updateLocation,
  assignEPC,
  getPendingActions,
  updateProjectOrder,
  getJourneyStatus,
  getProjectOrderStats,
  qualifyProjectOrder,
  confirmInstallDate,
} from "../controllers/projectOrderController.js";

const router = express.Router();

// Stats & pending actions (before /:id routes)
router.get("/stats", getProjectOrderStats);
router.get("/pending-actions", getPendingActions);

// CRUD
router.get("/", getAllProjectOrders);
router.post("/", createProjectOrder);
router.get("/:id", getProjectOrder);
router.put("/:id", updateProjectOrder);

// Journey actions
router.post("/:id/qualify", qualifyProjectOrder);
router.post("/:id/complete-step", completeStep);
router.put("/:id/location", updateLocation);
router.put("/:id/assign-epc", assignEPC);

// Customer portal — public journey status
router.get("/:id/journey-status", getJourneyStatus);

// Confirm Date
router.post("/:id/confirm-install-date", confirmInstallDate);

export default router;