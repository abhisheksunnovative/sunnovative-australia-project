import { EligibilitySettings } from "../models/EligibilitySettings.js";

const getDefaultSettingsFor = (countryCode) => {
  const code = (countryCode || 'india').toLowerCase();
  
  const base = {
    projectCategories: [
      { id: "residential", name: "Residential Solar", enabled: true, minKW: 1, maxKW: 10, subsidyEligible: true, maxSubsidyAmount: 78000, description: "Residential rooftop solar system" },
      { id: "commercial", name: "Commercial Solar", enabled: true, minKW: 10, maxKW: 500, subsidyEligible: false, maxSubsidyAmount: 0, description: "Commercial rooftop solar system" },
      { id: "ppa", name: "Solar Power Purchase Agreement (PPA)", enabled: true, minKW: 30, maxKW: 1000, subsidyEligible: false, maxSubsidyAmount: 0, description: "Zero upfront capital cost solar PPA solution" },
      { id: "microgrid", name: "Embedded Network & Microgrid", enabled: true, minKW: 50, maxKW: 2000, subsidyEligible: false, maxSubsidyAmount: 0, description: "Multi-tenant embedded network solar microgrid system" },
      { id: "battery-storage", name: "Commercial & Grid Battery Storage", enabled: true, minKW: 10, maxKW: 500, subsidyEligible: false, maxSubsidyAmount: 0, description: "BESS energy storage for peak shaving & backup" },
    ],
    inverterTypes: [
      { id: "string", name: "String Inverter", enabled: true, efficiency: 97, suitableFor: ["Residential Solar", "Commercial Solar"], description: "Most common, cost-effective for standard rooftops" },
      { id: "micro", name: "Micro Inverter", enabled: true, efficiency: 99, suitableFor: ["Residential Solar", "Group Solar"], description: "Panel-level optimization, ideal for shaded rooftops" },
      { id: "hybrid", name: "Hybrid Inverter", enabled: true, efficiency: 98, suitableFor: ["Residential Solar", "Group Solar", "Commercial Solar"], description: "Battery + grid compatible, future-ready" },
    ],
    eligibilityRules: {
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

  if (code === 'australia') {
    base.eligibilityRules.billToKwRanges = [
      { id: "r1", minBill: 0, maxBill: 150, suggestedKW: 3, label: "$0–$150 (Quarterly)" },
      { id: "r2", minBill: 151, maxBill: 250, suggestedKW: 5, label: "$151–$250 (Quarterly)" },
      { id: "r3", minBill: 251, maxBill: 400, suggestedKW: 6.6, label: "$251–$400 (Quarterly)" },
      { id: "r4", minBill: 401, maxBill: 99999, suggestedKW: 10, label: "$401+ (Quarterly)" }
    ];
    base.eligibilityRules.dueAmountThreshold.maxAllowedDueAmount = 500;
  } else if (code === 'united-kingdom') {
    base.eligibilityRules.billToKwRanges = [
      { id: "r1", minBill: 0, maxBill: 50, suggestedKW: 2, label: "£0–£50 (Monthly)" },
      { id: "r2", minBill: 51, maxBill: 90, suggestedKW: 3.5, label: "£51–£90 (Monthly)" },
      { id: "r3", minBill: 91, maxBill: 130, suggestedKW: 5, label: "£91–£130 (Monthly)" },
      { id: "r4", minBill: 131, maxBill: 99999, suggestedKW: 6.5, label: "£131+ (Monthly)" }
    ];
    base.eligibilityRules.dueAmountThreshold.maxAllowedDueAmount = 200;
  } else if (code === 'united-states') {
    base.eligibilityRules.billToKwRanges = [
      { id: "r1", minBill: 0, maxBill: 100, suggestedKW: 3, label: "$0–$100 (Monthly)" },
      { id: "r2", minBill: 101, maxBill: 160, suggestedKW: 5, label: "$101–$160 (Monthly)" },
      { id: "r3", minBill: 161, maxBill: 220, suggestedKW: 7, label: "$161–$220 (Monthly)" },
      { id: "r4", minBill: 221, maxBill: 99999, suggestedKW: 10, label: "$221+ (Monthly)" }
    ];
    base.eligibilityRules.dueAmountThreshold.maxAllowedDueAmount = 500;
  } else if (code === 'new-zealand') {
    base.eligibilityRules.billToKwRanges = [
      { id: "r1", minBill: 0, maxBill: 120, suggestedKW: 3, label: "$0–$120 (Monthly)" },
      { id: "r2", minBill: 121, maxBill: 200, suggestedKW: 4.5, label: "$121–$200 (Monthly)" },
      { id: "r3", minBill: 201, maxBill: 280, suggestedKW: 6, label: "$201–$280 (Monthly)" },
      { id: "r4", minBill: 281, maxBill: 99999, suggestedKW: 8, label: "$281+ (Monthly)" }
    ];
    base.eligibilityRules.dueAmountThreshold.maxAllowedDueAmount = 300;
  } else {
    // default (India)
    base.eligibilityRules.billToKwRanges = [
      { id: "r1", minBill: 0, maxBill: 500, suggestedKW: 0.5, label: "Very Low (₹0–₹500)" },
      { id: "r2", minBill: 501, maxBill: 1000, suggestedKW: 1, label: "Low (₹501–₹1,000)" },
      { id: "r3", minBill: 1001, maxBill: 1500, suggestedKW: 1.5, label: "Low-Medium (₹1,001–₹1,500)" },
      { id: "r4", minBill: 1501, maxBill: 2500, suggestedKW: 2, label: "Medium (₹1,501–₹2,500)" },
      { id: "r5", minBill: 2501, maxBill: 4000, suggestedKW: 3, label: "Medium-High (₹2,501–₹4,000)" },
      { id: "r6", minBill: 4001, maxBill: 6000, suggestedKW: 4, label: "High (₹4,001–₹6,000)" },
      { id: "r7", minBill: 6001, maxBill: 9000, suggestedKW: 6, label: "Very High (₹6,001–₹9,000)" },
      { id: "r8", minBill: 9001, maxBill: 99999, suggestedKW: 10, label: "Ultra High (₹9,001+)" },
    ];
    base.eligibilityRules.dueAmountThreshold.maxAllowedDueAmount = 5000;
  }

  return base;
};

// GET /api/eligibility-settings
export const getEligibilitySettings = async (req, res) => {
  try {
    const country = req.query.country || req.headers['x-country'] || 'india';
    let settings = await EligibilitySettings.findOne({ country: country.toLowerCase() });

    // Pehli baar — seed defaults
    if (!settings) {
      const defaultSettings = getDefaultSettingsFor(country);
      settings = await EligibilitySettings.create({ ...defaultSettings, country: country.toLowerCase() });
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
    const countryQuery = req.query.country || req.headers['x-country'] || 'india';
    const country = countryQuery.toLowerCase();

    let settings = await EligibilitySettings.findOne({ country });

    if (!settings) {
      settings = await EligibilitySettings.create({ ...req.body, country });
    } else {
      settings = await EligibilitySettings.findOneAndUpdate(
        { country },
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