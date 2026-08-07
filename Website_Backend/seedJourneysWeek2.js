import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/sunnovative_ecommerce";

// Schemas are resolved dynamically from mongoose models.
import { OrderJourneySettings } from "./src/models/OrderJourneySettings.js";

const AU_RESIDENTIAL_STEPS = [
  { stepNumber: 1, title: "Enquiry + Load Analysis", assignedTo: "company", requiredActions: [{ label: "12 months bills, NMI number", fileType: "pdf", required: true }], slaDays: 2, enabled: true },
  { stepNumber: 2, title: "Energy Audit", assignedTo: "epc-partner", requiredActions: [{ label: "Energy Audit Report", fileType: "pdf", required: true }], slaDays: 2, enabled: true },
  { stepNumber: 3, title: "System Design", assignedTo: "company", requiredActions: [{ label: "Engineering Design", fileType: "pdf", required: true }], slaDays: 2, enabled: true },
  { stepNumber: 4, title: "DNSP Pre-Approval", assignedTo: "company", requiredActions: [{ label: "DNSP Letter", fileType: "pdf", required: true }], slaDays: 4, enabled: true, requiresAdminApproval: true },
  { stepNumber: 5, title: "Proposal + Finance", assignedTo: "company", requiredActions: [{ label: "Proposal", fileType: "pdf", required: true }], slaDays: 2, enabled: true },
  { stepNumber: 6, title: "Contract Sign", assignedTo: "customer", requiredActions: [{ label: "Signed Contract", fileType: "pdf", required: true }], slaDays: 2, enabled: true },
  { stepNumber: 7, title: "Building Permit", assignedTo: "epc-partner", requiredActions: [{ label: "Building Permit", fileType: "pdf", required: true }], slaDays: 5, enabled: true },
  { stepNumber: 8, title: "Material Dispatch", assignedTo: "company", requiredActions: [{ label: "Dispatch Challan", fileType: "pdf", required: true }], slaDays: 2, enabled: true },
  { stepNumber: 9, title: "Installation", assignedTo: "epc-partner", requiredActions: [{ label: "Installation Photos", fileType: "image", required: true }], slaDays: 3, enabled: true },
  { stepNumber: 10, title: "Electrical Inspection (CES)", assignedTo: "company", requiredActions: [{ label: "Safety Certificate", fileType: "pdf", required: true }], slaDays: 3, enabled: true },
  { stepNumber: 11, title: "Metering Upgrade", assignedTo: "epc-partner", requiredActions: [{ label: "Meter Works Completion", fileType: "pdf", required: true }], slaDays: 3, enabled: true },
  { stepNumber: 12, title: "DNSP Connection", assignedTo: "company", requiredActions: [{ label: "Connection Letter", fileType: "pdf", required: true }], slaDays: 3, enabled: true, requiresAdminApproval: true },
  { stepNumber: 13, title: "STC Assignment Form", assignedTo: "customer", requiredActions: [{ label: "Signed STC Form", fileType: "pdf", required: true }], slaDays: 2, enabled: true },
  { stepNumber: 14, title: "STC Processing", assignedTo: "company", requiredActions: [{ label: "Trade Confirm", fileType: "pdf", required: true }], slaDays: 3, enabled: true, requiresAdminApproval: true },
  { stepNumber: 15, title: "Tax Invoice + ABN", assignedTo: "company", requiredActions: [{ label: "Tax Invoice", fileType: "pdf", required: true }], slaDays: 2, enabled: true },
  { stepNumber: 16, title: "Monitoring Setup", assignedTo: "epc-partner", requiredActions: [{ label: "Platform Access", fileType: "text", required: true }], slaDays: 2, enabled: true },
  { stepNumber: 17, title: "FIT Registration", assignedTo: "customer", requiredActions: [{ label: "Retailer Confirmation", fileType: "pdf", required: true }], slaDays: 2, enabled: true },
  { stepNumber: 18, title: "Final Handover", assignedTo: "epc-partner", requiredActions: [{ label: "Handover Docs", fileType: "pdf", required: true }], slaDays: 2, enabled: true },
  { stepNumber: 19, title: "Project Closed", assignedTo: "company", requiredActions: [{ label: "Completion Certificate", fileType: "pdf", required: true }], slaDays: 2, enabled: true, requiresAdminApproval: true }
];

const IN_RESIDENTIAL_STEPS = [
  { stepNumber: 1, title: "Lead Captured", assignedTo: "company", requiredActions: [], slaDays: 1, enabled: true },
  { stepNumber: 2, title: "Eligibility Check", assignedTo: "company", requiredActions: [{ label: "Electricity Bill", fileType: "pdf", required: true }], slaDays: 1, enabled: true },
  { stepNumber: 3, title: "Site Survey", assignedTo: "company", requiredActions: [{ label: "Survey Report", fileType: "pdf", required: true }], slaDays: 2, enabled: true, requiresAdminApproval: true },
  { stepNumber: 4, title: "System Design", assignedTo: "company", requiredActions: [{ label: "System Design", fileType: "pdf", required: true }], slaDays: 2, enabled: true, requiresAdminApproval: true },
  { stepNumber: 5, title: "Quotation Approval", assignedTo: "customer", requiredActions: [{ label: "Signed Quote", fileType: "pdf", required: true }], slaDays: 2, enabled: true, requiresAdminApproval: true },
  { stepNumber: 6, title: "MNRE Registration", assignedTo: "company", requiredActions: [{ label: "MNRE Reg No", fileType: "text", required: true }], slaDays: 2, enabled: true, requiresAdminApproval: true },
  { stepNumber: 7, title: "Cash/Loan Approval", assignedTo: "customer", requiredActions: [{ label: "Sanction Letter", fileType: "pdf", required: true }], slaDays: 3, enabled: true, requiresAdminApproval: true },
  { stepNumber: 8, title: "EPC Assignment", assignedTo: "company", requiredActions: [{ label: "Assignment Letter", fileType: "pdf", required: true }], slaDays: 1, enabled: true, requiresAdminApproval: true },
  { stepNumber: 9, title: "Material Dispatch", assignedTo: "company", requiredActions: [{ label: "Dispatch Challan", fileType: "pdf", required: true }], slaDays: 2, enabled: true },
  { stepNumber: 10, title: "Installation", assignedTo: "epc-partner", requiredActions: [{ label: "Installation Photos", fileType: "image", required: true }], slaDays: 3, enabled: true, requiresAdminApproval: true },
  { stepNumber: 11, title: "QC Inspection", assignedTo: "company", requiredActions: [{ label: "QC Checklist", fileType: "pdf", required: true }], slaDays: 2, enabled: true, requiresAdminApproval: true },
  { stepNumber: 12, title: "Net Meter Application", assignedTo: "epc-partner", requiredActions: [{ label: "DISCOM Application", fileType: "pdf", required: true }], slaDays: 3, enabled: true, requiresAdminApproval: true },
  { stepNumber: 13, title: "DISCOM Inspection", assignedTo: "company", requiredActions: [{ label: "Inspection Report", fileType: "pdf", required: true }], slaDays: 4, enabled: true, requiresAdminApproval: true },
  { stepNumber: 14, title: "Subsidy Application", assignedTo: "company", requiredActions: [{ label: "Subsidy Form", fileType: "pdf", required: true }], slaDays: 2, enabled: true, requiresAdminApproval: true },
  { stepNumber: 15, title: "90% Payment Release", assignedTo: "company", requiredActions: [{ label: "Payment Confirmation", fileType: "pdf", required: true }], slaDays: 2, enabled: true, requiresAdminApproval: true },
  { stepNumber: 16, title: "Customer Rating", assignedTo: "customer", requiredActions: [], slaDays: 1, enabled: true },
  { stepNumber: 17, title: "Subsidy Disbursed", assignedTo: "company", requiredActions: [{ label: "Credit Screenshot", fileType: "image", required: true }], slaDays: 5, enabled: true, requiresAdminApproval: true },
  { stepNumber: 18, title: "10% Payment Release", assignedTo: "company", requiredActions: [{ label: "Final Payment Confirmation", fileType: "pdf", required: true }], slaDays: 2, enabled: true, requiresAdminApproval: true },
  { stepNumber: 19, title: "Project Completed", assignedTo: "company", requiredActions: [{ label: "Completion Certificate", fileType: "pdf", required: true }], slaDays: 1, enabled: true, requiresAdminApproval: true }
];

const IN_COMMERCIAL_STEPS = [
  ...IN_RESIDENTIAL_STEPS.slice(0, 10),
  { stepNumber: 11, title: "CEIG Approval", assignedTo: "company", requiredActions: [{ label: "CEIG Certificate", fileType: "pdf", required: true }], slaDays: 5, enabled: true, requiresAdminApproval: true },
  ...IN_RESIDENTIAL_STEPS.slice(11).map(s => ({ ...s, stepNumber: s.stepNumber + 1 }))
];

const seedAll = async () => {
  try {
    console.log("Connecting to Database:", MONGO_URI);
    await mongoose.connect(MONGO_URI);

    // ── Seed Australia ──
    // THE USER SAID: "autrlai ka resesndeatila order jouenry un touchedh rhene do usme koi chaneg mt rkna ok"
    // So we skip Australia completely here.
    // console.log("✅ Skipping Australia Journeys...");

    // ── Seed India ──
    const inJourneys = [
      {
        projectType: "residential",
        projectTypeLabel: "Residential Solar Journey",
        enabled: true,
        description: "PM Surya Ghar Yojana GEDA/DISCOM feasibility tracking for residential connections.",
        epcSelectionType: "FCFS",
        steps: IN_RESIDENTIAL_STEPS.map((s) => ({ ...s, id: `in-residential-step-${s.stepNumber}` }))
      },
      {
        projectType: "commercial",
        projectTypeLabel: "Commercial Solar Journey",
        enabled: true,
        description: "Commercial Solar tracking including CEIG Approval.",
        epcSelectionType: "FCFS",
        steps: IN_COMMERCIAL_STEPS.map((s) => ({ ...s, id: `in-commercial-step-${s.stepNumber}` }))
      }
    ];

    const inSettingsKey = "india_all_all";
    await OrderJourneySettings.deleteOne({ _settingsKey: inSettingsKey });
    await OrderJourneySettings.create({
      country: "india",
      state: "all",
      district: "all",
      _settingsKey: inSettingsKey,
      journeys: inJourneys
    });
    console.log("✅ Seeded India Journeys (FCFS flow)!");

    console.log("🎉 Seeding Journeys Successfully Completed!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
};

seedAll();
