import { OrderJourneySettings } from "../models/OrderJourneySettings.js";

// ── Default journey data ──────────────────────────────────────────────────────
const INDIA_RESIDENTIAL = {
  projectType: "residential",
  projectTypeLabel: "Residential Solar",
  enabled: true,
  description: "PM Surya Ghar Yojana ke liye standard residential rooftop solar installation journey",
  steps: [
    { id: "in_r1", stepNumber: 1, title: "Check Subsidy Eligibility", assignedTo: "customer", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Check Eligibility", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "in_r2", stepNumber: 2, title: "Submit Electricity Bill", assignedTo: "customer", enabled: true, slaDays: 1, isMandatory: true, requiresDocumentUpload: true, documentName: "Electricity Bill", actionLabel: "Upload Bill", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "in_r3", stepNumber: 3, title: "Upload Property Details", assignedTo: "customer", enabled: true, slaDays: 1, isMandatory: true, requiresDocumentUpload: true, documentName: "Property Photo", actionLabel: "Upload Details", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "in_r4", stepNumber: 4, title: "Verify Customer Eligibility", assignedTo: "company", enabled: true, slaDays: 1, isMandatory: true, requiresAdminApproval: true, actionLabel: "Verify Customer", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "in_r5", stepNumber: 5, title: "Verify Documents", assignedTo: "company", enabled: true, slaDays: 1, isMandatory: true, requiresAdminApproval: true, actionLabel: "Verify Docs", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "in_r6", stepNumber: 6, title: "Select Installation Date", assignedTo: "customer", enabled: true, slaDays: 2, isMandatory: true, actionLabel: "Select Date", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "in_r7", stepNumber: 7, title: "Make Payment", assignedTo: "customer", enabled: true, slaDays: 3, isMandatory: true, actionLabel: "Pay Now", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "in_r8", stepNumber: 8, title: "Allocate EPC Partner", assignedTo: "company", enabled: true, slaDays: 1, isMandatory: true, requiresAdminApproval: true, actionLabel: "Allocate EPC", notifyCustomer: false, notifyEPC: true, notifyAdmin: false },
    { id: "in_r9", stepNumber: 9, title: "Accept Project", assignedTo: "epc-partner", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Accept", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "in_r10", stepNumber: 10, title: "Conduct Site Survey", assignedTo: "epc-partner", enabled: true, slaDays: 2, isMandatory: true, requiresDocumentUpload: true, documentName: "Survey Report", actionLabel: "Upload Survey", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "in_r11", stepNumber: 11, title: "Submit Proposal", assignedTo: "epc-partner", enabled: true, slaDays: 2, isMandatory: true, requiresDocumentUpload: true, documentName: "Proposal", actionLabel: "Submit Proposal", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "in_r12", stepNumber: 12, title: "Install Solar System", assignedTo: "epc-partner", enabled: true, slaDays: 7, isMandatory: true, actionLabel: "Mark Installed", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "in_r13", stepNumber: 13, title: "Upload Installation Documents", assignedTo: "epc-partner", enabled: true, slaDays: 1, isMandatory: true, requiresDocumentUpload: true, documentName: "Installation Proofs", actionLabel: "Upload Proofs", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "in_r14", stepNumber: 14, title: "Complete Net Meter Process", assignedTo: "epc-partner", enabled: true, slaDays: 7, isMandatory: true, actionLabel: "Complete Net Meter", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "in_r15", stepNumber: 15, title: "Process Subsidy Application", assignedTo: "company", enabled: true, slaDays: 3, isMandatory: true, actionLabel: "Process Subsidy", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "in_r16", stepNumber: 16, title: "Monitor Project Progress", assignedTo: "company", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Review Progress", notifyCustomer: false, notifyEPC: false, notifyAdmin: false },
    { id: "in_r17", stepNumber: 17, title: "Close Project", assignedTo: "epc-partner", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Close", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
  ],
};

const AUSTRALIA_RESIDENTIAL = {
  projectType: "residential",
  projectTypeLabel: "Residential Solar",
  enabled: true,
  description: "Australia CEC compliant residential installation journey",
  steps: [
    { id: "au_r1", stepNumber: 1, title: "Submit Enquiry & Power Bill", assignedTo: "customer", enabled: true, slaDays: 1, isMandatory: true, requiresDocumentUpload: true, documentName: "Electricity Bill", actionLabel: "Submit", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "au_r2", stepNumber: 2, title: "Verify STC Eligibility & Load Profile", assignedTo: "company", enabled: true, slaDays: 1, isMandatory: true, requiresAdminApproval: true, actionLabel: "Verify", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "au_r3", stepNumber: 3, title: "Grid Connection Approval (DNSP)", assignedTo: "company", enabled: true, slaDays: 7, isMandatory: true, actionLabel: "Approve DNSP", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "au_r4", stepNumber: 4, title: "Select SAA Accredited Installer", assignedTo: "company", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Assign Installer", notifyCustomer: false, notifyEPC: true, notifyAdmin: false },
    { id: "au_r5", stepNumber: 5, title: "Generate Final Proposal", assignedTo: "epc-partner", enabled: true, slaDays: 2, isMandatory: true, requiresDocumentUpload: true, documentName: "Proposal", actionLabel: "Submit Proposal", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_r6", stepNumber: 6, title: "Customer Approves Proposal", assignedTo: "customer", enabled: true, slaDays: 2, isMandatory: true, actionLabel: "Approve", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_r7", stepNumber: 7, title: "Pay Deposit / Setup Finance", assignedTo: "customer", enabled: true, slaDays: 3, isMandatory: true, actionLabel: "Pay Deposit", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_r8", stepNumber: 8, title: "Install Solar System", assignedTo: "epc-partner", enabled: true, slaDays: 5, isMandatory: true, actionLabel: "Mark Installed", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_r9", stepNumber: 9, title: "Certificate of Electrical Safety (CES)", assignedTo: "epc-partner", enabled: true, slaDays: 2, isMandatory: true, requiresDocumentUpload: true, documentName: "CES Certificate", actionLabel: "Upload CES", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_r10", stepNumber: 10, title: "Retailer Upgrades Smart Meter", assignedTo: "company", enabled: true, slaDays: 14, isMandatory: true, actionLabel: "Confirm Meter Upgrade", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "au_r11", stepNumber: 11, title: "Final Payment", assignedTo: "customer", enabled: true, slaDays: 3, isMandatory: true, actionLabel: "Pay Final", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_r12", stepNumber: 12, title: "Project Handover & Warranty", assignedTo: "company", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Close Project", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
  ],
};

const NZ_RESIDENTIAL = {
  projectType: "residential",
  projectTypeLabel: "Residential Solar",
  enabled: true,
  description: "New Zealand residential solar journey",
  steps: [
    { id: "nz_r1", stepNumber: 1, title: "Submit Enquiry", assignedTo: "customer", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Submit", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "nz_r2", stepNumber: 2, title: "Property Verification", assignedTo: "customer", enabled: true, slaDays: 2, isMandatory: true, actionLabel: "Verify", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "nz_r3", stepNumber: 3, title: "Lead Verification", assignedTo: "company", enabled: true, slaDays: 1, isMandatory: true, requiresAdminApproval: true, actionLabel: "Verify Lead", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "nz_r4", stepNumber: 4, title: "Installer Assignment", assignedTo: "company", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Assign Installer", notifyCustomer: false, notifyEPC: true, notifyAdmin: false },
    { id: "nz_r5", stepNumber: 5, title: "Site Survey", assignedTo: "epc-partner", enabled: true, slaDays: 2, isMandatory: true, actionLabel: "Complete Survey", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "nz_r6", stepNumber: 6, title: "Proposal Approval", assignedTo: "customer", enabled: true, slaDays: 2, isMandatory: true, actionLabel: "Approve", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "nz_r7", stepNumber: 7, title: "Installation Confirmation", assignedTo: "customer", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Confirm", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "nz_r8", stepNumber: 8, title: "Installation", assignedTo: "epc-partner", enabled: true, slaDays: 5, isMandatory: true, actionLabel: "Mark Installed", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "nz_r9", stepNumber: 9, title: "Quality Inspection", assignedTo: "epc-partner", enabled: true, slaDays: 2, isMandatory: true, requiresDocumentUpload: true, documentName: "Inspection Report", actionLabel: "Upload Report", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "nz_r10", stepNumber: 10, title: "Handover", assignedTo: "epc-partner", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Complete Handover", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "nz_r11", stepNumber: 11, title: "Installation Monitoring", assignedTo: "company", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Monitor", notifyCustomer: false, notifyEPC: false, notifyAdmin: false },
    { id: "nz_r12", stepNumber: 12, title: "Project Completion", assignedTo: "customer", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Confirm Completion", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
  ],
};

const UK_RESIDENTIAL = {
  projectType: "residential",
  projectTypeLabel: "Residential Solar",
  enabled: true,
  description: "UK MCS compliant residential solar journey",
  steps: [
    { id: "uk_r1", stepNumber: 1, title: "Submit Enquiry", assignedTo: "customer", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Submit", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "uk_r2", stepNumber: 2, title: "Property Details", assignedTo: "customer", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Upload Details", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "uk_r3", stepNumber: 3, title: "Eligibility Review", assignedTo: "company", enabled: true, slaDays: 1, isMandatory: true, requiresAdminApproval: true, actionLabel: "Review", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "uk_r4", stepNumber: 4, title: "Installer Assignment", assignedTo: "company", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Assign", notifyCustomer: false, notifyEPC: true, notifyAdmin: false },
    { id: "uk_r5", stepNumber: 5, title: "Site Survey", assignedTo: "epc-partner", enabled: true, slaDays: 2, isMandatory: true, actionLabel: "Complete Survey", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "uk_r6", stepNumber: 6, title: "Approve Quotation", assignedTo: "customer", enabled: true, slaDays: 2, isMandatory: true, actionLabel: "Approve", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "uk_r7", stepNumber: 7, title: "Installation Booking", assignedTo: "customer", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Book", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "uk_r8", stepNumber: 8, title: "Installation", assignedTo: "epc-partner", enabled: true, slaDays: 4, isMandatory: true, actionLabel: "Mark Installed", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "uk_r9", stepNumber: 9, title: "Testing & Commissioning", assignedTo: "epc-partner", enabled: true, slaDays: 2, isMandatory: true, actionLabel: "Complete Testing", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "uk_r10", stepNumber: 10, title: "Completion Documentation", assignedTo: "epc-partner", enabled: true, slaDays: 1, isMandatory: true, requiresDocumentUpload: true, documentName: "MCS Certificate", actionLabel: "Upload Docs", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "uk_r11", stepNumber: 11, title: "Project Monitoring", assignedTo: "company", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Review", notifyCustomer: false, notifyEPC: false, notifyAdmin: false },
    { id: "uk_r12", stepNumber: 12, title: "Completion Confirmation", assignedTo: "customer", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Confirm", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
  ],
};

const USA_RESIDENTIAL = {
  projectType: "residential",
  projectTypeLabel: "Residential Solar",
  enabled: true,
  description: "USA residential solar journey (Loans/PPA)",
  steps: [
    { id: "us_r1", stepNumber: 1, title: "Submit Enquiry", assignedTo: "customer", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Submit", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "us_r2", stepNumber: 2, title: "Financing Selection", assignedTo: "customer", enabled: true, slaDays: 2, isMandatory: true, actionLabel: "Select Financing", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "us_r3", stepNumber: 3, title: "Customer Verification", assignedTo: "company", enabled: true, slaDays: 1, isMandatory: true, requiresAdminApproval: true, actionLabel: "Verify Customer", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "us_r4", stepNumber: 4, title: "Finance Verification", assignedTo: "company", enabled: true, slaDays: 2, isMandatory: true, requiresAdminApproval: true, requiresDocumentUpload: true, documentName: "Credit Approval", actionLabel: "Verify Finance", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "us_r5", stepNumber: 5, title: "Installer Assignment", assignedTo: "company", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Assign", notifyCustomer: false, notifyEPC: true, notifyAdmin: false },
    { id: "us_r6", stepNumber: 6, title: "Site Inspection", assignedTo: "epc-partner", enabled: true, slaDays: 3, isMandatory: true, actionLabel: "Complete Inspection", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "us_r7", stepNumber: 7, title: "Proposal Approval", assignedTo: "customer", enabled: true, slaDays: 2, isMandatory: true, actionLabel: "Approve", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "us_r8", stepNumber: 8, title: "Installation Scheduling", assignedTo: "customer", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Schedule", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "us_r9", stepNumber: 9, title: "Installation", assignedTo: "epc-partner", enabled: true, slaDays: 5, isMandatory: true, actionLabel: "Mark Installed", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "us_r10", stepNumber: 10, title: "Inspection & Commissioning", assignedTo: "epc-partner", enabled: true, slaDays: 5, isMandatory: true, requiresDocumentUpload: true, documentName: "PTO Document", actionLabel: "Upload PTO", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "us_r11", stepNumber: 11, title: "Project Monitoring", assignedTo: "company", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Review", notifyCustomer: false, notifyEPC: false, notifyAdmin: false },
    { id: "us_r12", stepNumber: 12, title: "Project Closure", assignedTo: "epc-partner", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Close", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "us_r13", stepNumber: 13, title: "Final Payment", assignedTo: "customer", enabled: true, slaDays: 3, isMandatory: true, actionLabel: "Pay Final", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
  ],
};

const AUSTRALIA_COMMERCIAL = {
  projectType: "commercial",
  projectTypeLabel: "Commercial Solar",
  enabled: true,
  description: "High capacity commercial rooftop solar installation for business premises",
  steps: AUSTRALIA_RESIDENTIAL.steps
};

const AUSTRALIA_PPA = {
  projectType: "ppa",
  projectTypeLabel: "Solar Power Purchase Agreement (PPA)",
  enabled: true,
  description: "Zero upfront capital cost solar PPA solution for commercial enterprises",
  steps: AUSTRALIA_RESIDENTIAL.steps
};

const AUSTRALIA_MICROGRID = {
  projectType: "microgrid",
  projectTypeLabel: "Embedded Network & Microgrid",
  enabled: true,
  description: "Multi-tenant embedded network solar microgrid system",
  steps: AUSTRALIA_RESIDENTIAL.steps
};

const AUSTRALIA_BATTERY = {
  projectType: "battery-storage",
  projectTypeLabel: "Commercial & Grid Battery Storage",
  enabled: true,
  description: "Battery energy storage systems (BESS) for peak shaving & backup",
  steps: AUSTRALIA_RESIDENTIAL.steps
};

const INDIA_COMMERCIAL = {
  projectType: "commercial",
  projectTypeLabel: "Commercial Solar",
  enabled: true,
  description: "Industrial & commercial rooftop solar for businesses in India",
  steps: INDIA_RESIDENTIAL.steps
};

const DEFAULT_GLOBAL_SETTINGS = {
  autoProgressOnCompletion: true,
  requireEvidenceAtEachStep: false,
  sendSMSNotifications: true,
  sendEmailNotifications: true,
  allowEPCToUpdateSteps: true,
  customerPortalVisible: true,
  minBookingDays: 5,
};

const initializeCountry = async (countryName, journeysArray) => {
  await OrderJourneySettings.findOneAndUpdate(
    { country: countryName, state: "all", district: "all" },
    {
      country: countryName,
      state: "all",
      district: "all",
      discom: "all",
      _settingsKey: Math.random().toString(),
      journeys: journeysArray,
      globalSettings: DEFAULT_GLOBAL_SETTINGS
    },
    { upsert: true }
  );
};

export const getOrderJourneySettings = async (req, res) => {
  try {
    let country = req.query.country || 'india';
    let state = req.headers['x-state'] || req.query.state || 'all';
    let district = req.headers['x-district'] || req.query.district || 'all';
    let discom = req.headers['x-discom'] || req.query.discom || 'all';

    let settings = await OrderJourneySettings.findOne({ country, state, district, discom });

    if (!settings || !settings.journeys || settings.journeys.length === 0) {
      if (country === 'india') {
        await initializeCountry("india", [INDIA_RESIDENTIAL, INDIA_COMMERCIAL]);
      } else if (country === 'australia') {
        await initializeCountry("australia", [
          AUSTRALIA_RESIDENTIAL,
          AUSTRALIA_COMMERCIAL,
          AUSTRALIA_PPA,
          AUSTRALIA_MICROGRID,
          AUSTRALIA_BATTERY
        ]);
      } else {
        await initializeCountry(country, [NZ_RESIDENTIAL]);
      }
      settings = await OrderJourneySettings.findOne({ country, state, district, discom });
    } else {
      // ── MIGRATION CHECK: Ensure country has correct project types ──
      if (country === 'india') {
        const types = settings.journeys.map(j => j.projectType);
        if (types.includes('group') || types.includes('common-meter') || settings.journeys.length !== 2) {
          settings.journeys = [INDIA_RESIDENTIAL, INDIA_COMMERCIAL];
          await settings.save();
        }
      } else if (country === 'australia') {
        const types = settings.journeys.map(j => j.projectType);
        if (!types.includes('ppa') || !types.includes('microgrid') || !types.includes('battery-storage') || settings.journeys.length < 5) {
          settings.journeys = [
            AUSTRALIA_RESIDENTIAL,
            AUSTRALIA_COMMERCIAL,
            AUSTRALIA_PPA,
            AUSTRALIA_MICROGRID,
            AUSTRALIA_BATTERY
          ];
          await settings.save();
        }
      }
    }

    res.json({ success: true, data: settings });
  } catch (err) {
    console.error("getOrderJourneySettings error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const saveOrderJourneySettings = async (req, res) => {
  try {
    const { country, state, district, discom, journeys, globalSettings } = req.body;
    let settings = await OrderJourneySettings.findOne({ country, state, district, discom: discom || 'all' });

    if (!settings) {
      settings = new OrderJourneySettings({
        country, state, district, discom: discom || 'all', _settingsKey: Math.random().toString()
      });
    }

    if (journeys) settings.journeys = journeys;
    if (globalSettings) settings.globalSettings = globalSettings;

    await settings.save();
    res.json({ success: true, data: settings, message: "Settings saved successfully" });
  } catch (err) {
    console.error("saveOrderJourneySettings error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const resetOrderJourneySettings = async (req, res) => {
  try {
    const country = req.query.country || 'india';
    
    // Wipe all and re-seed to get fresh defaults for the requested country
    await OrderJourneySettings.deleteMany({ country });
    
    if (country === 'india') await initializeCountry("india", [INDIA_RESIDENTIAL, INDIA_COMMERCIAL]);
    if (country === 'australia') await initializeCountry("australia", [
      AUSTRALIA_RESIDENTIAL,
      AUSTRALIA_COMMERCIAL,
      AUSTRALIA_PPA,
      AUSTRALIA_MICROGRID,
      AUSTRALIA_BATTERY
    ]);
    if (country === 'newzealand') await initializeCountry("newzealand", NZ_RESIDENTIAL);
    if (country === 'uk') await initializeCountry("uk", UK_RESIDENTIAL);
    if (country === 'usa') await initializeCountry("usa", USA_RESIDENTIAL);

    const reset = await OrderJourneySettings.findOne({ country });
    res.json({ success: true, data: reset, message: "Reset to defaults for " + country });
  } catch (err) {
    console.error("resetOrderJourneySettings error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPublicJourney = async (req, res) => {
  try {
    const { projectType } = req.params;
    const country = req.query.country || req.country || 'india';
    const state = req.headers['x-state'] || req.query.state || 'all';
    const district = req.headers['x-district'] || req.query.district || 'all';
    const discom = req.headers['x-discom'] || req.query.discom || 'all';

    let settings = await OrderJourneySettings.findOne({ country, state, district, discom });
    
    // Fallback logic
    if (!settings && discom !== 'all') {
      settings = await OrderJourneySettings.findOne({ country, state, district, discom: 'all' });
    }
    if (!settings && district !== 'all') {
      settings = await OrderJourneySettings.findOne({ country, state, district: 'all', discom: 'all' });
    }
    if (!settings && state !== 'all') {
      settings = await OrderJourneySettings.findOne({ country, state: 'all', district: 'all', discom: 'all' });
    }
    if (!settings) {
      return res.status(404).json({ success: false, message: "No settings found for this country" });
    }

    const journey = settings.journeys.find(
      (j) => j.projectType === projectType && j.enabled
    );

    if (!journey) {
      return res.status(404).json({ success: false, message: "Journey not found for this project type" });
    }

    const publicJourney = {
      ...journey.toObject(),
      steps: journey.steps.filter((s) => s.enabled),
    };

    res.json({ success: true, data: publicJourney });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
