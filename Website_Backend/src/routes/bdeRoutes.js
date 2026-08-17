import express from "express";
import multer from "multer";
import {
  createBDE, getAllBDEs, getBDEById, updateBDE, deleteBDE,
  bdeLogin, getBDEDashboard, getBDELeads, getDemandPool, assignLeadToBDE, updateBDELead,
  createBDELead, getBDEProjects, getBDEOverdueProjects, uploadBDEProjectDoc, updateBDELeadDetails,
  requestBdeOtp, verifyOtpAndSetPassword, getEpcCalendarForBde, scheduleAndQualifyLead, getAustralianEpcsForBde,
  getEligibleBDEsForLead, adminAssignLeadToBDE
} from "../controllers/bdeController.js";

const router = express.Router();

router.get("/epcs", getAustralianEpcsForBde);

// Admin Manual Lead Assignment
router.get("/eligible-for-lead/:leadId", getEligibleBDEsForLead);
router.post("/admin-assign-lead", adminAssignLeadToBDE);

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Admin BDE Management Routes
router.route("/")
  .get(getAllBDEs)
  .post(createBDE);

router.route("/:id")
  .get(getBDEById)
  .put(updateBDE)
  .delete(deleteBDE);

// BDE Portal Auth Route
router.post("/auth/login", bdeLogin);
router.post("/auth/request-otp", requestBdeOtp);
router.post("/auth/verify-otp", verifyOtpAndSetPassword);
router.get("/:bdeId/epc-calendar", getEpcCalendarForBde);

// BDE Portal Feature Routes
router.get("/:bdeId/dashboard", getBDEDashboard);
router.get("/:bdeId/leads", getBDELeads);
router.post("/:bdeId/leads", createBDELead);
router.get("/:bdeId/projects", getBDEProjects);
router.get("/:bdeId/overdue-projects", getBDEOverdueProjects);
router.post("/projects/:projectId/step/:stepId/upload", upload.single('file'), uploadBDEProjectDoc);
router.get("/:bdeId/demand-pool", getDemandPool);
router.post("/assign-lead", assignLeadToBDE);
router.put("/leads/:leadId", updateBDELead);
router.put("/leads/:leadId/details", updateBDELeadDetails);
router.post("/leads/:leadId/schedule", scheduleAndQualifyLead);

export default router;

