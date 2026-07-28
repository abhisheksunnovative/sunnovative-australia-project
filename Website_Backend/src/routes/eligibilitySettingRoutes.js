import express from "express";
import EligibilitySettings from "../models/EligibilitySettings.js";
import { extractCountry } from "../middleware/countryMiddleware.js";

const router = express.Router();

router.use(extractCountry);

// Default data — pehli baar DB mein seed hoga
const DEFAULT_DATA = {
  projectCategories: [
    { id: "residential", name: "Residential Solar", enabled: true, minKW: 1, maxKW: 10, subsidyEligible: true, maxSubsidyAmount: 78000, description: "Single family homes, apartments" },
    { id: "group", name: "Group Solar", enabled: true, minKW: 5, maxKW: 50, subsidyEligible: true, maxSubsidyAmount: 78000, description: "Housing societies, RWAs" },
    { id: "commercial", name: "Commercial Solar", enabled: true, minKW: 10, maxKW: 500, subsidyEligible: false, maxSubsidyAmount: 0, description: "Shops, offices, factories" },
    { id: "common-meter", name: "Common Meter Solar", enabled: true, minKW: 2, maxKW: 20, subsidyEligible: true, maxSubsidyAmount: 78000, description: "Common area meter installations" },
  ],
  inverterTypes: [
    { id: "string", name: "String Inverter", enabled: true, efficiency: 97, suitableFor: ["Residential Solar", "Commercial Solar"], description: "Most common, cost-effective for standard rooftops" },
    { id: "micro", name: "Micro Inverter", enabled: true, efficiency: 99, suitableFor: ["Residential Solar", "Group Solar"], description: "Panel-level optimization, ideal for shaded rooftops" },
    { id: "hybrid", name: "Hybrid Inverter", enabled: true, efficiency: 98, suitableFor: ["Residential Solar", "Group Solar", "Commercial Solar"], description: "Battery + grid compatible, future-ready" },
  ],
  eligibilityRules: {
    billToKwRanges: [
      { id: "r1", minBill: 0, maxBill: 500, suggestedKW: 0.5, label: "Very Low (₹0–₹500)" },
      { id: "r2", minBill: 501, maxBill: 1000, suggestedKW: 1, label: "Low (₹501–₹1,000)" },
      { id: "r3", minBill: 1001, maxBill: 1500, suggestedKW: 1.5, label: "Low-Medium (₹1,001–₹1,500)" },
      { id: "r4", minBill: 1501, maxBill: 2500, suggestedKW: 2, label: "Medium (₹1,501–₹2,500)" },
      { id: "r5", minBill: 2501, maxBill: 4000, suggestedKW: 3, label: "Medium-High (₹2,501–₹4,000)" },
      { id: "r6", minBill: 4001, maxBill: 6000, suggestedKW: 4, label: "High (₹4,001–₹6,000)" },
      { id: "r7", minBill: 6001, maxBill: 9000, suggestedKW: 6, label: "Very High (₹6,001–₹9,000)" },
      { id: "r8", minBill: 9001, maxBill: 99999, suggestedKW: 10, label: "Ultra High (₹9,001+)" },
    ],
    meterCategories: [
      { category: "Residential (LT-1)", eligible: true, minMonthlyBill: 500, maxMonthlyBill: 50000 },
      { category: "Commercial (LT-2)", eligible: true, minMonthlyBill: 1000, maxMonthlyBill: 500000 },
      { category: "Industrial (HT)", eligible: false, minMonthlyBill: 0, maxMonthlyBill: 0 },
      { category: "Agricultural", eligible: false, minMonthlyBill: 0, maxMonthlyBill: 0 },
    ],
    billStatusRules: { paidBillAllowed: true, dueBillAllowed: true, pendingBillAllowed: false, overdueMaxMonths: 2 },
    subsidyCriteria: { minMonthlyUnits: 100, maxMonthlyUnits: 10000, pmSuryaGharEligibleCategories: ["Residential (LT-1)"], maxSubsidyKW: 3 },
    kwDerivationRules: { unitsPerKW: 90, safetyBuffer: 1.1, roundUpToNext: 0.5, maxAutoSuggestKW: 10 },
    dueAmountThreshold: { enabled: true, maxAllowedDueAmount: 5000, blockIfExceeds: false, showWarningIfExceeds: true },
    stateSubsidyOverrides: {},
  },
};

// ── GET /api/eligibility-settings ─────────────────────────────────────────────
// Settings fetch karo — agar DB mein nahi hai toh default seed karo
router.get("/", async (req, res) => {
  try {
    let settings = await EligibilitySettings.findOne({ country: req.country });

    if (!settings) {
      // Pehli baar — default data DB mein save karo
      settings = await EligibilitySettings.create({ ...DEFAULT_DATA, country: req.country });
    }

    res.json({ success: true, data: settings });
  } catch (err) {
    console.error("EligibilitySettings GET error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/eligibility-settings ─────────────────────────────────────────────
// Admin jo bhi change kare, save karo
router.put("/", async (req, res) => {
  try {
    let settings = await EligibilitySettings.findOne({ country: req.country });

    if (!settings) {
      // Pehli baar save
      settings = await EligibilitySettings.create({ ...req.body, country: req.country });
    } else {
      // Existing update karo
      settings = await EligibilitySettings.findByIdAndUpdate(
        settings._id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
    }

    res.json({ success: true, data: settings, message: "Settings saved successfully!" });
  } catch (err) {
    console.error("EligibilitySettings PUT error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;