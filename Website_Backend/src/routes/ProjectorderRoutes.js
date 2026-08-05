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
  updateStcStatus,
  approveStep,
  rejectStep,
  addAdminNote,
  requestReupload,
  completeStepOnBehalf,
  shareEpcPayoutQr,
  markEpcPayoutReceived,
  confirmEpcPayout
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
router.post("/:id/steps/:stepId/approve", approveStep);
router.post("/:id/steps/:stepId/reject", rejectStep);
router.post("/:id/steps/:stepId/note", addAdminNote);
router.post("/:id/steps/:stepId/request-reupload", requestReupload);
router.post("/:id/steps/:stepId/complete-for-customer", completeStepOnBehalf);
router.put("/:id/location", updateLocation);
router.put("/:id/assign-epc", assignEPC);

// EPC Payout Flow
router.post("/:id/epc-payout/share-qr", shareEpcPayoutQr);
router.post("/:id/epc-payout/mark-received", markEpcPayoutReceived);
router.post("/:id/epc-payout/confirm", confirmEpcPayout);

// Customer portal — public journey status
router.get("/:id/journey-status", getJourneyStatus);

// Confirm Date
router.post("/:id/confirm-install-date", confirmInstallDate);

// STC Admin Actions (Australia Specific)
router.post("/:id/stc-status", updateStcStatus);

export default router;
