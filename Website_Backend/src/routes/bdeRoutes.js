import express from "express";
import multer from "multer";
import {
  createBDE, getAllBDEs, getBDEById, updateBDE, deleteBDE,
  bdeLogin, getBDEDashboard, getBDELeads, getDemandPool, assignLeadToBDE, updateBDELead,
  createBDELead, getBDEProjects, getBDEOverdueProjects, uploadBDEProjectDoc, updateBDELeadDetails,
  markLeadEligible, moveLeadToOrderJourney,
  requestBdeOtp, verifyOtpAndSetPassword, getEpcCalendarForBde, scheduleAndQualifyLead, getAustralianEpcsForBde,
  getEligibleBDEsForLead, adminAssignLeadToBDE, getBDEsHierarchy,
  uploadOnboardingDoc, approveOnboardingDoc
} from "../controllers/bdeController.js";

const router = express.Router();

router.get("/hierarchy", getBDEsHierarchy);
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
router.put("/leads/:leadId/eligibility", markLeadEligible);
router.put("/leads/:leadId/move-to-order", moveLeadToOrderJourney);
router.post("/leads/:leadId/schedule", scheduleAndQualifyLead);

// ── BDE Onboarding Documents ──
import path from "path";
import fs from "fs";
const docUploadPath = "uploads/bde-docs/";
if (!fs.existsSync(docUploadPath)) fs.mkdirSync(docUploadPath, { recursive: true });

const docStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, docUploadPath),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${req.params.id}-${unique}${path.extname(file.originalname)}`);
  }
});
const docUpload = multer({ storage: docStorage, limits: { fileSize: 10 * 1024 * 1024 } });

// BDE uploads from My Profile
router.post("/:id/onboarding-docs", docUpload.single("file"), uploadOnboardingDoc);
// Admin approves a doc
router.put("/:id/onboarding-docs/:docName/approve", approveOnboardingDoc);

export default router;
