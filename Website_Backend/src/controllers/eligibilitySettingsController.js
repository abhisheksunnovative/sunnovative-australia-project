import { EligibilitySettings } from "../models/EligibilitySettings.js";

// Default data jo pehli baar DB mein seed hoga
const DEFAULT_SETTINGS = {
  projectCategories: [
    { id: "residential", name: "Residential Solar", enabled: true, minKW: 1, maxKW: 10, subsidyEligible: true, maxSubsidyAmount: 78000, description: "Residential rooftop solar system" },
    { id: "commercial", name: "Commercial Solar", enabled: true, minKW: 10, maxKW: 500, subsidyEligible: false, maxSubsidyAmount: 0, description: "Commercial rooftop solar system" },
    { id: "ppa", name: "Solar Power Purchase Agreement (PPA)", enabled: true, minKW: 30, maxKW: 1000, subsidyEligible: false, maxSubsidyAmount: 0, description: "Zero upfront capital cost solar PPA solution" },
    { id: "microgrid", name: "Embedded Network & Microgrid", enabled: true, minKW: 50, maxKW: 2000, subsidyEligible: false, maxSubsidyAmount: 0, description: "Multi-tenant embedded network solar microgrid system" },
    { id: "battery-storage", name: "Commercial & Grid Battery Storage", enabled: true, minKW: 10, maxKW: 500, subsidyEligible: false, maxSubsidyAmount: 0, description: "BESS energy storage for peak shaving & backup" },
  ],
  inverterTypes: [
    {
      id: "string",
      name: "String Inverter",
      enabled: true,
      efficiency: 97,
      suitableFor: ["Residential Solar", "Commercial Solar"],
      description: "Most common, cost-effective for standard rooftops",
    },
    {
      id: "micro",
      name: "Micro Inverter",
      enabled: true,
      efficiency: 99,
      suitableFor: ["Residential Solar", "Group Solar"],
      description: "Panel-level optimization, ideal for shaded rooftops",
    },
    {
      id: "hybrid",
      name: "Hybrid Inverter",
      enabled: true,
      efficiency: 98,
      suitableFor: ["Residential Solar", "Group Solar", "Commercial Solar"],
      description: "Battery + grid compatible, future-ready",
    },
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
    billStatusRules: {
      paidBillAllowed: true,
      dueBillAllowed: true,
      pendingBillAllowed: false,
      overdueMaxMonths: 2,
    },
    subsidyCriteria: {
      minMonthlyUnits: 100,
      maxMonthlyUnits: 10000,
      pmSuryaGharEligibleCategories: ["Residential (LT-1)"],
      maxSubsidyKW: 3,
    },
    kwDerivationRules: {
      unitsPerKW: 90,
      safetyBuffer: 1.1,
      roundUpToNext: 0.5,
      maxAutoSuggestKW: 10,
    },
    dueAmountThreshold: {
      enabled: true,
      maxAllowedDueAmount: 5000,
      blockIfExceeds: false,
      showWarningIfExceeds: true,
    },
  },
};

// GET /api/eligibility-settings
export const getEligibilitySettings = async (req, res) => {
  try {
    let settings = await EligibilitySettings.findOne();

    // Pehli baar — seed defaults
    if (!settings) {
      settings = await EligibilitySettings.create(DEFAULT_SETTINGS);
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error("getEligibilitySettings error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/eligibility-settings
export const updateEligibilitySettings = async (req, res) => {
  try {
    const countryHeader = req.headers['x-country'] || 'india';
    const country = countryHeader === 'india' ? 'india' : countryHeader === 'australia' ? 'australia' : countryHeader;

    let settings = await EligibilitySettings.findOne();

    if (!settings) {
      settings = await EligibilitySettings.create(req.body);
    } else {
      settings = await EligibilitySettings.findOneAndUpdate(
        {},
        { $set: req.body },
        { new: true, runValidators: false }
      );
    }

    // ── AUTO-SYNC: Sync Project Categories to OrderJourneySettings for this country ──
    if (req.body.projectCategories && Array.isArray(req.body.projectCategories)) {
      try {
        const { OrderJourneySettings } = await import('../models/OrderJourneySettings.js');
        let journeyDoc = await OrderJourneySettings.findOne({ country });
        
        const defaultSteps = [
          { id: 's1', stepNumber: 1, title: 'Check Subsidy / STC Eligibility', assignedTo: 'company', enabled: true },
          { id: 's2', stepNumber: 2, title: 'Submit Electricity Bill', assignedTo: 'customer', enabled: true },
          { id: 's3', stepNumber: 3, title: 'Upload Property Details', assignedTo: 'customer', enabled: true },
          { id: 's4', stepNumber: 4, title: 'Verify Customer Eligibility', assignedTo: 'company', enabled: true },
          { id: 's5', stepNumber: 5, title: 'Verify Documents', assignedTo: 'company', enabled: true },
          { id: 's6', stepNumber: 6, title: 'Select Installation Date', assignedTo: 'customer', enabled: true },
          { id: 's7', stepNumber: 7, title: 'Make Payment', assignedTo: 'customer', enabled: true },
          { id: 's8', stepNumber: 8, title: 'Allocate EPC Partner', assignedTo: 'company', enabled: true },
          { id: 's9', stepNumber: 9, title: 'Accept Project', assignedTo: 'epc-partner', enabled: true },
          { id: 's10', stepNumber: 10, title: 'Conduct Site Survey', assignedTo: 'epc-partner', enabled: true },
          { id: 's11', stepNumber: 11, title: 'Submit Proposal', assignedTo: 'epc-partner', enabled: true },
          { id: 's12', stepNumber: 12, title: 'Install Solar System', assignedTo: 'epc-partner', enabled: true },
          { id: 's13', stepNumber: 13, title: 'Upload Installation Documents', assignedTo: 'epc-partner', enabled: true },
          { id: 's14', stepNumber: 14, title: 'Complete Net Meter Process', assignedTo: 'company', enabled: true },
          { id: 's15', stepNumber: 15, title: 'Process Subsidy Application', assignedTo: 'company', enabled: true },
          { id: 's16', stepNumber: 16, title: 'Monitor Project Progress', assignedTo: 'company', enabled: true }
        ];

        if (!journeyDoc) {
          const initialJourneys = req.body.projectCategories.map((cat) => ({
            projectType: cat.id || cat.name.toLowerCase().replace(/\s+/g, '-'),
            projectTypeLabel: cat.name || 'Solar Project',
            enabled: cat.enabled !== false,
            description: cat.description || '',
            steps: defaultSteps
          }));
          await OrderJourneySettings.create({
            country,
            state: 'all',
            district: 'all',
            discom: 'all',
            journeys: initialJourneys
          });
        } else {
          const existingJourneys = journeyDoc.journeys || [];
          req.body.projectCategories.forEach((cat) => {
            const slug = cat.id || cat.name.toLowerCase().replace(/\s+/g, '-');
            const existing = existingJourneys.find(j => j.projectType === slug);
            if (existing) {
              existing.projectTypeLabel = cat.name || existing.projectTypeLabel;
              existing.enabled = cat.enabled !== false;
              existing.description = cat.description || existing.description;
            } else {
              existingJourneys.push({
                projectType: slug,
                projectTypeLabel: cat.name || 'Solar Project',
                enabled: cat.enabled !== false,
                description: cat.description || '',
                steps: defaultSteps
              });
            }
          });
          journeyDoc.journeys = existingJourneys;
          await journeyDoc.save();
        }
      } catch (syncErr) {
        console.error("Auto-sync to OrderJourneySettings failed:", syncErr.message);
      }
    }

    res.json({
      success: true,
      message: "Eligibility settings updated and auto-synced to Order Journey!",
      data: settings,
    });
  } catch (error) {
    console.error("updateEligibilitySettings error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/eligibility-settings/reset
export const resetEligibilitySettings = async (req, res) => {
  try {
    await EligibilitySettings.deleteMany({});
    const settings = await EligibilitySettings.create(DEFAULT_SETTINGS);
    res.json({
      success: true,
      message: "Reset to defaults!",
      data: settings,
    });
  } catch (error) {
    console.error("resetEligibilitySettings error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/eligibility-settings/public — Frontend ke liye (categories + inverter types only)
export const getPublicEligibilityData = async (req, res) => {
  try {
    let settings = await EligibilitySettings.findOne();
    if (!settings) {
      settings = await EligibilitySettings.create(DEFAULT_SETTINGS);
    }

    // Sirf enabled categories aur inverter types return karo
    const publicData = {
      projectCategories: settings.projectCategories.filter((c) => c.enabled),
      inverterTypes: settings.inverterTypes.filter((inv) => inv.enabled),
      billToKwRanges: settings.eligibilityRules.billToKwRanges || [],
      kwDerivationRules: settings.eligibilityRules.kwDerivationRules,
      subsidyCriteria: settings.eligibilityRules.subsidyCriteria,
    };

    res.json({ success: true, data: publicData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};