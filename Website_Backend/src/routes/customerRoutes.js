import express from 'express';
import { sendOtp, verifyOtp, getMe, updateProfile, setPin, loginWithPin } from '../controllers/customerAuthController.js';
import { getMyProjects, getProjectDetail, uploadDocument, applyForProject, payEscrow, payToken, getAvailableEpcs, completeStep, signStcForm } from '../controllers/customerProjectController.js';
import { protectCustomer } from '../middleware/protectCustomer.js';
import upload from '../middleware/upload.js';
import EpcPartner from '../models/EpcPartner.js';
import EligibilitySettings  from '../models/EligibilitySettings.js';
import { OrderJourneySettings } from '../models/OrderJourneySettings.js';
import { extractCountry } from '../middleware/countryMiddleware.js';

const router = express.Router();
router.use(extractCountry);

// Auth — public
router.post('/auth/send-otp',       sendOtp);
router.post('/auth/verify-otp',     verifyOtp);
router.post('/auth/set-pin',        setPin);
router.post('/auth/login-with-pin', loginWithPin);

// Profile — protected
router.get ('/auth/me',          protectCustomer, getMe);
router.put ('/auth/profile',     protectCustomer, updateProfile);

// Projects — protected
router.get ('/projects',                          protectCustomer, getMyProjects);
router.get ('/projects/:id',                      protectCustomer, getProjectDetail);
router.post('/projects',                          protectCustomer, upload.single('rooftopPhoto'), applyForProject);
router.post('/projects/:id/documents',            protectCustomer, upload.single('file'), uploadDocument);
router.post('/projects/:id/pay-token',            protectCustomer, payToken);
router.post('/projects/:id/pay-escrow',           protectCustomer, payEscrow);
router.post('/projects/:id/complete-step',        protectCustomer, upload.single('evidence'), completeStep);
router.post('/projects/:id/sign-stc',             protectCustomer, signStcForm);
router.get ('/epcs',                              protectCustomer, getAvailableEpcs);

// ── Public data (no auth needed) ─────────────────────────────────────────────

// EPC partners public list (filtered, safe fields only)
router.get('/public/epc-partners', async (req, res) => {
  try {
    const { district, projectType } = req.query;
    const filter = { onboardingStatus: 'Active', isActive: true };
    if (district) filter.activeDistricts = district;
    if (projectType) filter.qualifiedProjectTypes = projectType;

    const epcs = await EpcPartner.find(filter)
      .select('companyName city district state plan rating totalRatings yearsOfExperience qualifiedProjectTypes activeDistricts onTimeCompletionPercent')
      .sort({ rating: -1, onTimeCompletionPercent: -1 })
      .limit(20);

    res.json({ success: true, count: epcs.length, data: epcs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Eligibility settings public (categories, subsidy) for solar packages display
router.get('/public/solar-packages', async (req, res) => {
  try {
    let settings = await EligibilitySettings.findOne();
    const packages = [
      { id: "1kw",  kw: 1,  name: "Starter Solar",   desc: "Small households ke liye — 1-2 BHK apartments",  centralSubsidy: 30000, installCost: 65000, units: 90,  suitable: ["Residential Solar"], badge: null },
      { id: "2kw",  kw: 2,  name: "Family Solar",    desc: "Average family homes ke liye — 2-3 BHK",          centralSubsidy: 60000, installCost: 115000, units: 180, suitable: ["Residential Solar"], badge: "Popular" },
      { id: "3kw",  kw: 3,  name: "Premium Solar",   desc: "Large homes ke liye — 3-4 BHK, AC wale ghar",     centralSubsidy: 78000, installCost: 155000, units: 270, suitable: ["Residential Solar", "Group Solar"], badge: "Max Subsidy" },
      { id: "5kw",  kw: 5,  name: "Business Solar",  desc: "Small shops, offices, clinics ke liye",             centralSubsidy: 0,     installCost: 230000, units: 450, suitable: ["Commercial Solar"], badge: null },
      { id: "10kw", kw: 10, name: "Commercial Pro",  desc: "Factories, large offices, warehouses ke liye",      centralSubsidy: 0,     installCost: 420000, units: 900, suitable: ["Commercial Solar"], badge: "Best ROI" },
    ];
    const stateOverrides = settings?.eligibilityRules?.stateSubsidyOverrides || {};

    let journeySettings = await OrderJourneySettings.findOne();
    const minBookingDays = journeySettings?.globalSettings?.minBookingDays || 5;

    res.json({ success: true, packages, stateOverrides, minBookingDays });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;