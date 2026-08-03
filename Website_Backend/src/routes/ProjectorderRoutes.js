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
  updateStcStatus
} from "../controllers/projectOrderController.js";
import upload from "../middleware/multer.js";

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
router.post("/:id/complete-step", upload.single('evidence'), completeStep);
router.put("/:id/location", updateLocation);
router.put("/:id/assign-epc", assignEPC);

// Customer portal — public journey status
router.get("/:id/journey-status", getJourneyStatus);

// Confirm Date
router.post("/:id/confirm-install-date", confirmInstallDate);

// STC Admin Actions (Australia Specific)
router.post("/:id/stc-status", updateStcStatus);

export default router;