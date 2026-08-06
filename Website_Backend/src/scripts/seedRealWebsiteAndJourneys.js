import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { WebsiteSettings } from "../models/WebsiteSettings.js";
import { OrderJourneySettings } from "../models/OrderJourneySettings.js";

const MONGO_URI = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/sunnovative_ecommerce";

// ==========================================
// 1. ORDER JOURNEY STEPS blue prints
// ==========================================

const INDIA_RESIDENTIAL_STEPS = [
  {
    id: "in-res-step-1",
    stepNumber: 1,
    title: "Check Subsidy Eligibility",
    description: "Provide details to check eligibility under PM Surya Ghar Yojana.",
    assignedTo: "customer",
    allowedRoles: ["customer", "bde"],
    canBeCompletedByBDE: true,
    slaDays: 1,
    milestoneType: "standard",
    requiresAdminApproval: false,
    completionCondition: "manual",
    warningDays: 1,
    redAlertDays: 2,
    autoNotifyOverdue: true,
    escalateToAdminAfterDays: 3
  },
  {
    id: "in-res-step-2",
    stepNumber: 2,
    title: "Submit Electricity Bill",
    description: "Upload a copy of your recent PGVCL electricity bill for sanctioned load verification.",
    assignedTo: "customer",
    allowedRoles: ["customer", "bde"],
    canBeCompletedByBDE: true,
    slaDays: 2,
    milestoneType: "doc_upload",
    requiresDocumentUpload: true,
    documentRequirements: ["Electricity Bill"],
    completionCondition: "document_upload",
    warningDays: 1,
    redAlertDays: 3,
    autoNotifyOverdue: true,
    escalateToAdminAfterDays: 4
  },
  {
    id: "in-res-step-3",
    stepNumber: 3,
    title: "Upload Property Details",
    description: "Provide tax bill or property occupancy certificate as address proof.",
    assignedTo: "customer",
    allowedRoles: ["customer", "bde"],
    canBeCompletedByBDE: true,
    slaDays: 2,
    milestoneType: "doc_upload",
    requiresDocumentUpload: true,
    documentRequirements: ["Property Occupancy Certificate"],
    completionCondition: "document_upload",
    warningDays: 1,
    redAlertDays: 3,
    autoNotifyOverdue: true,
    escalateToAdminAfterDays: 4
  },
  {
    id: "in-res-step-4",
    stepNumber: 4,
    title: "Verify Customer Eligibility",
    description: "Compliance team checks subsidy tier compatibility and consumer details.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 2,
    milestoneType: "standard",
    requiresAdminApproval: true,
    completionCondition: "admin_approval",
    warningDays: 1,
    redAlertDays: 3,
    autoNotifyOverdue: false,
    escalateToAdminAfterDays: 4
  },
  {
    id: "in-res-step-5",
    stepNumber: 5,
    title: "Verify Documents",
    description: "Admin approves structural layout feasibility and consumer number matching.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 2,
    milestoneType: "standard",
    requiresAdminApproval: true,
    completionCondition: "admin_approval",
    warningDays: 1,
    redAlertDays: 3,
    autoNotifyOverdue: false,
    escalateToAdminAfterDays: 4
  },
  {
    id: "in-res-step-6",
    stepNumber: 6,
    title: "Select Installation Date",
    description: "Select preferred slot on the calendar for installation.",
    assignedTo: "customer",
    allowedRoles: ["customer", "bde"],
    canBeCompletedByBDE: true,
    slaDays: 2,
    milestoneType: "standard",
    requiresAdminApproval: false,
    completionCondition: "manual",
    warningDays: 1,
    redAlertDays: 3,
    autoNotifyOverdue: true,
    escalateToAdminAfterDays: 4
  },
  {
    id: "in-res-step-7",
    stepNumber: 7,
    title: "Make Payment",
    description: "Complete full system booking advance payment.",
    assignedTo: "customer",
    allowedRoles: ["customer", "bde"],
    canBeCompletedByBDE: true,
    slaDays: 5,
    milestoneType: "customer_payment",
    paymentPercentage: 100,
    requiresAdminApproval: false,
    completionCondition: "manual",
    warningDays: 2,
    redAlertDays: 7,
    autoNotifyOverdue: true,
    escalateToAdminAfterDays: 9
  },
  {
    id: "in-res-step-8",
    stepNumber: 8,
    title: "Allocate EPC Partner",
    description: "System allocates certified regional GEDA empanelled installer.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 2,
    milestoneType: "standard",
    requiresAdminApproval: true,
    completionCondition: "admin_approval",
    warningDays: 1,
    redAlertDays: 3,
    autoNotifyOverdue: false,
    escalateToAdminAfterDays: 4
  },
  {
    id: "in-res-step-9",
    stepNumber: 9,
    title: "Accept Project",
    description: "EPC Partner reviews load structure and accepts deployment responsibility.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 2,
    milestoneType: "standard",
    requiresAdminApproval: false,
    completionCondition: "manual",
    warningDays: 1,
    redAlertDays: 3,
    autoNotifyOverdue: false,
    escalateToAdminAfterDays: 4
  },
  {
    id: "in-res-step-10",
    stepNumber: 10,
    title: "Conduct Site Survey",
    description: "EPC survey crew verifies shadow-free area and uploads roof layout diagrams.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 3,
    milestoneType: "doc_upload",
    requiresDocumentUpload: true,
    documentRequirements: ["Site Survey Report"],
    completionCondition: "document_upload",
    warningDays: 1,
    redAlertDays: 4,
    autoNotifyOverdue: false,
    escalateToAdminAfterDays: 5
  },
  {
    id: "in-res-step-11",
    stepNumber: 11,
    title: "Submit Proposal",
    description: "EPC submits structural feasibility load sign-off certificate.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 3,
    milestoneType: "doc_upload",
    requiresDocumentUpload: true,
    documentRequirements: ["Project Proposal / Layout Design"],
    completionCondition: "document_upload",
    warningDays: 1,
    redAlertDays: 4,
    autoNotifyOverdue: false,
    escalateToAdminAfterDays: 5
  },
  {
    id: "in-res-step-12",
    stepNumber: 12,
    title: "Install Solar System",
    description: "Physical mounting of mono-perc arrays and inverter wiring.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 3,
    milestoneType: "standard",
    requiresAdminApproval: false,
    completionCondition: "manual",
    warningDays: 1,
    redAlertDays: 4,
    autoNotifyOverdue: false,
    escalateToAdminAfterDays: 5
  },
  {
    id: "in-res-step-13",
    stepNumber: 13,
    title: "Upload Installation Documents",
    description: "EPC uploads high-res geo-tagged solar installation photos for GEDA verification.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 2,
    milestoneType: "doc_upload",
    requiresDocumentUpload: true,
    documentRequirements: ["Installation Photos"],
    completionCondition: "document_upload",
    warningDays: 1,
    redAlertDays: 3,
    autoNotifyOverdue: false,
    escalateToAdminAfterDays: 4
  },
  {
    id: "in-res-step-14",
    stepNumber: 14,
    title: "Complete Net Meter Process",
    description: "Liaisoning with PGVCL division engineers to commission bi-directional meter.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 15,
    milestoneType: "standard",
    requiresAdminApproval: false,
    completionCondition: "manual",
    warningDays: 3,
    redAlertDays: 20,
    autoNotifyOverdue: false,
    escalateToAdminAfterDays: 25
  },
  {
    id: "in-res-step-15",
    stepNumber: 15,
    title: "Process Subsidy Application",
    description: "National Subsidy Portal document upload and DBT approval verification.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 25,
    milestoneType: "standard",
    requiresAdminApproval: true,
    completionCondition: "admin_approval",
    warningDays: 5,
    redAlertDays: 30,
    autoNotifyOverdue: false,
    escalateToAdminAfterDays: 35
  },
  {
    id: "in-res-step-16",
    stepNumber: 16,
    title: "Monitor Project Progress",
    description: "Company audits generation safety values.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 10,
    milestoneType: "standard",
    requiresAdminApproval: false,
    completionCondition: "manual",
    warningDays: 2,
    redAlertDays: 12,
    autoNotifyOverdue: false,
    escalateToAdminAfterDays: 15
  },
  {
    id: "in-res-step-17",
    stepNumber: 17,
    title: "Close Project",
    description: "Handover GEDA certificate and initiate 5-year AMC warranty tracking.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner", "company"],
    canBeCompletedByBDE: false,
    slaDays: 2,
    milestoneType: "standard",
    requiresAdminApproval: false,
    completionCondition: "manual",
    warningDays: 1,
    redAlertDays: 3,
    autoNotifyOverdue: false,
    escalateToAdminAfterDays: 4
  }
];

const INDIA_COMMERCIAL_STEPS = INDIA_RESIDENTIAL_STEPS.map((step, idx) => {
  const overrides = {};
  if (step.id === "in-res-step-2") {
    overrides.title = "Submit Electricity Bill & GST Certificate";
    overrides.description = "Provide recent commercial connection bill and GST details for tax input credits.";
    overrides.documentRequirements = ["Electricity Bill", "GST Certificate"];
  } else if (step.id === "in-res-step-3") {
    overrides.title = "Upload Business & Structural Load details";
    overrides.description = "Provide company registration certificate and licensed architect roof structural approval.";
    overrides.documentRequirements = ["Business Registration Certificate", "Structural Load Analysis"];
  } else if (step.id === "in-res-step-4") {
    overrides.title = "Verify Commercial Feasibility";
    overrides.description = "Check sanctioned 3-phase capacity against proposed solar array load limits.";
  } else if (step.id === "in-res-step-14") {
    overrides.title = "DISCOM 3-Phase Net Meter Integration";
    overrides.description = "Coordinate with DISCOM sub-division office for HT/LT meter commissioning.";
  } else if (step.id === "in-res-step-15") {
    overrides.title = "Verify 40% Accelerated Depreciation Approval";
    overrides.description = "Audit compliance paperwork for corporate tax benefit asset claim.";
  }
  return {
    ...step,
    id: step.id.replace("res", "comm"),
    title: overrides.title || step.title,
    description: overrides.description || step.description,
    documentRequirements: overrides.documentRequirements || step.documentRequirements
  };
});

// ==========================================
// AUSTRALIA JOURNEYS STEPS
// ==========================================

const AU_RESIDENTIAL_STEPS = [
  {
    id: "au-res-step-1",
    stepNumber: 1,
    title: "Enquiry + Postcode → Zone → STC Auto Calc",
    description: "Enquiry logged. System automatically resolves postcode to STC Zone and computes deeming value.",
    assignedTo: "customer",
    allowedRoles: ["customer", "bde"],
    canBeCompletedByBDE: true,
    slaDays: 1,
    milestoneType: "standard",
    requiresAdminApproval: false,
    completionCondition: "manual",
    warningDays: 0,
    redAlertDays: 2,
    autoNotifyOverdue: true,
    escalateToAdminAfterDays: 3
  },
  {
    id: "au-res-step-2",
    stepNumber: 2,
    title: "Quote with STC Discount Shown Upfront",
    description: "Admin validates pricing and presents contract showing direct STC point-of-sale rebate subtraction.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 1,
    milestoneType: "standard",
    requiresAdminApproval: false,
    completionCondition: "manual",
    warningDays: 0,
    redAlertDays: 2,
    autoNotifyOverdue: false,
    escalateToAdminAfterDays: 3
  },
  {
    id: "au-res-step-3",
    stepNumber: 3,
    title: "Site Assessment — CEC Accredited",
    description: "CEC installer checks switchboard size, shadow obstacles and uploads geo-tagged rooftop photos.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 2,
    milestoneType: "doc_upload",
    requiresDocumentUpload: true,
    documentRequirements: ["Site Assessment Report"],
    completionCondition: "document_upload",
    warningDays: 1,
    redAlertDays: 3,
    autoNotifyOverdue: false,
    escalateToAdminAfterDays: 4
  },
  {
    id: "au-res-step-4",
    stepNumber: 4,
    title: "System Design — CEC Approved Products Only",
    description: "EPC submits CAD wiring diagram and system design utilizing AS/NZS compliant hardware.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 2,
    milestoneType: "standard",
    requiresAdminApproval: false,
    completionCondition: "manual",
    warningDays: 1,
    redAlertDays: 3,
    autoNotifyOverdue: false,
    escalateToAdminAfterDays: 4
  },
  {
    id: "au-res-step-5",
    stepNumber: 5,
    title: "Contract & STC Assignment Form Signed",
    description: "Customer digitally signs system contract and STC legal allocation transfer.",
    assignedTo: "customer",
    allowedRoles: ["customer", "bde"],
    canBeCompletedByBDE: true,
    slaDays: 3,
    milestoneType: "doc_upload",
    requiresDocumentUpload: true,
    documentRequirements: ["Signed Contract", "STC Assignment Form"],
    completionCondition: "document_upload",
    warningDays: 1,
    redAlertDays: 5,
    autoNotifyOverdue: true,
    escalateToAdminAfterDays: 6
  },
  {
    id: "au-res-step-6",
    stepNumber: 6,
    title: "DNSP Grid Connection Application (Before Install)",
    description: "Submitting pre-approval request to Ausgrid / Endeavour / CitiPower database.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 5,
    milestoneType: "standard",
    requiresAdminApproval: true,
    completionCondition: "admin_approval",
    warningDays: 2,
    redAlertDays: 10,
    autoNotifyOverdue: false,
    escalateToAdminAfterDays: 12
  },
  {
    id: "au-res-step-7",
    stepNumber: 7,
    title: "Material + Install Date Selection",
    description: "EPC schedules logistics delivery and locks installation on the calendar.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 3,
    milestoneType: "standard",
    requiresAdminApproval: false,
    completionCondition: "manual",
    warningDays: 1,
    redAlertDays: 5,
    autoNotifyOverdue: false,
    escalateToAdminAfterDays: 6
  },
  {
    id: "au-res-step-8",
    stepNumber: 8,
    title: "Installation (1-2 days)",
    description: "Physical execution by Solar Accreditation Australia certified electricians.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 2,
    milestoneType: "doc_upload",
    requiresDocumentUpload: true,
    documentRequirements: ["Installation Work Photos"],
    completionCondition: "document_upload",
    warningDays: 1,
    redAlertDays: 4,
    autoNotifyOverdue: false,
    escalateToAdminAfterDays: 5
  },
  {
    id: "au-res-step-9",
    stepNumber: 9,
    title: "Certificate of Electrical Safety (CES)",
    description: "Upload the mandatory independent electrical inspector regulatory clearance document.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 3,
    milestoneType: "doc_upload",
    requiresDocumentUpload: true,
    documentRequirements: ["Certificate of Electrical Safety (CES)"],
    completionCondition: "document_upload",
    warningDays: 1,
    redAlertDays: 5,
    autoNotifyOverdue: false,
    escalateToAdminAfterDays: 6
  },
  {
    id: "au-res-step-10",
    stepNumber: 10,
    title: "DNSP Smart Meter Upgrade Request",
    description: "Submit digital meter setup commands to retailer for feed-in-tariff capture.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 14,
    milestoneType: "standard",
    requiresAdminApproval: false,
    completionCondition: "manual",
    warningDays: 3,
    redAlertDays: 20,
    autoNotifyOverdue: false,
    escalateToAdminAfterDays: 22
  },
  {
    id: "au-res-step-11",
    stepNumber: 11,
    title: "STC Filed in REC Registry",
    description: "Filing and validation of STC tokens on the Clean Energy Regulator database.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 7,
    milestoneType: "stc_minting",
    requiresAdminApproval: true,
    completionCondition: "admin_approval",
    warningDays: 2,
    redAlertDays: 10,
    autoNotifyOverdue: false,
    escalateToAdminAfterDays: 12
  },
  {
    id: "au-res-step-12",
    stepNumber: 12,
    title: "Project Closed & State Rebate Guidance",
    description: "Handover CEC documentation packs and configure performance app tracking.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 2,
    milestoneType: "standard",
    requiresAdminApproval: false,
    completionCondition: "manual",
    warningDays: 1,
    redAlertDays: 4,
    autoNotifyOverdue: false,
    escalateToAdminAfterDays: 5
  }
];

const AU_COMMERCIAL_STEPS = [
  {
    id: "au-comm-step-1",
    stepNumber: 1,
    title: "Commercial Enquiry + Energy Audit",
    description: "Capture interval data and perform load profile analysis.",
    assignedTo: "company",
    allowedRoles: ["company", "bde"],
    canBeCompletedByBDE: false,
    slaDays: 2,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-comm-step-2",
    stepNumber: 2,
    title: "System Size Recommendation + ROI Calc",
    description: "Provide ROI metrics, payback projections and STC / LGC suitability assessment.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 3,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-comm-step-3",
    stepNumber: 3,
    title: "Development Approval (DA) Check",
    description: "Verify local council heritage, fire regulations and DA triggers.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 10,
    milestoneType: "standard",
    requiresAdminApproval: true,
    completionCondition: "admin_approval"
  },
  {
    id: "au-comm-step-4",
    stepNumber: 4,
    title: "Site Assessment + Structural Engineering Report",
    description: "EPC inspector signs structural wind load cert and reviews 3-phase switchboard limits.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 4,
    milestoneType: "doc_upload",
    requiresDocumentUpload: true,
    documentRequirements: ["Structural Engineering Report"],
    completionCondition: "document_upload"
  },
  {
    id: "au-comm-step-5",
    stepNumber: 5,
    title: "System Design — 3-Phase, Large Inverter",
    description: "Design 3-phase wiring grid compliant with IEC 61215:2021 guidelines.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 3,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-comm-step-6",
    stepNumber: 6,
    title: "Commercial Contract + Finance Options",
    description: "Review outright purchase, commercial loan, PPA, or lease details.",
    assignedTo: "customer",
    allowedRoles: ["customer", "bde"],
    canBeCompletedByBDE: true,
    slaDays: 5,
    milestoneType: "doc_upload",
    requiresDocumentUpload: true,
    documentRequirements: ["Signed Commercial Agreement"],
    completionCondition: "document_upload"
  },
  {
    id: "au-comm-step-7",
    stepNumber: 7,
    title: "DNSP Application — Complex Study Required",
    description: "Submit engineering grid stability application to DNSP (>30kW connection study).",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 15,
    milestoneType: "standard",
    requiresAdminApproval: true,
    completionCondition: "admin_approval"
  },
  {
    id: "au-comm-step-8",
    stepNumber: 8,
    title: "Equipment Procurement",
    description: "Admin triggers logistics supply for high-load commercial panels.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 10,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-comm-step-9",
    stepNumber: 9,
    title: "Installation (3-10 days)",
    description: "EPC team constructs array mounts and performs high-voltage wiring.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 10,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-comm-step-10",
    stepNumber: 10,
    title: "Commissioning + Testing",
    description: "Harmonics, grid safety parameters, and insulation testing completed.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 3,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-comm-step-11",
    stepNumber: 11,
    title: "CES + Compliance Documentation",
    description: "Submit final independent inspector signoff sheets.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 3,
    milestoneType: "doc_upload",
    requiresDocumentUpload: true,
    documentRequirements: ["Compliance Certificate / CES Form"],
    completionCondition: "document_upload"
  },
  {
    id: "au-comm-step-12",
    stepNumber: 12,
    title: "DNSP Final Activation + Smart Meter",
    description: "DNSP logs grid-connection commands and activates digital export meters.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 14,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-comm-step-13",
    stepNumber: 13,
    title: "STC Filed (<100kW) or LGC Setup (>100kW)",
    description: "Process REC Registry tokens matching the output profile.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 7,
    milestoneType: "standard",
    requiresAdminApproval: true,
    completionCondition: "admin_approval"
  },
  {
    id: "au-comm-step-14",
    stepNumber: 14,
    title: "Project Closed + Performance Monitoring",
    description: "Initialize BAS tax write-off logs and remote SCADA monitoring dashboard.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 2,
    milestoneType: "standard",
    completionCondition: "manual"
  }
];

const AU_BATTERY_STEPS = [
  ...AU_RESIDENTIAL_STEPS.slice(0, 5),
  {
    id: "au-bat-step-6",
    stepNumber: 6,
    title: "DNSP Application — Battery Export Rules",
    description: "File export guidelines matching AS/NZS 5139 lithium battery standards.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 5,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-bat-step-7",
    stepNumber: 7,
    title: "Material — Solar + Battery Procurement",
    description: "Verify solar modules and premium hybrid lithium storage units are in inventory.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 4,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-bat-step-8",
    stepNumber: 8,
    title: "Installation — Solar + Battery (2-3 days)",
    description: "EPC team completes panel mounts, runs backup lines and wires the inverter.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 3,
    milestoneType: "doc_upload",
    requiresDocumentUpload: true,
    documentRequirements: ["Installation & Wiring Photos"],
    completionCondition: "document_upload"
  },
  {
    id: "au-bat-step-9",
    stepNumber: 9,
    title: "Dual Compliance Certificate",
    description: "Upload CES electrical safety and battery installation signoffs.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 3,
    milestoneType: "doc_upload",
    requiresDocumentUpload: true,
    documentRequirements: ["Dual Compliance Certificate (CES)"],
    completionCondition: "document_upload"
  },
  {
    id: "au-bat-step-10",
    stepNumber: 10,
    title: "DNSP Smart Meter + Battery Meter Config",
    description: "Configure export limits and setup smart control links.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 14,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-bat-step-11",
    stepNumber: 11,
    title: "VPP Enrollment — Optional",
    description: "Configure Virtual Power Plant links to earn premium feed-in credits.",
    assignedTo: "customer",
    allowedRoles: ["customer", "bde"],
    canBeCompletedByBDE: true,
    slaDays: 5,
    milestoneType: "standard",
    isMandatory: false,
    completionCondition: "manual"
  },
  {
    id: "au-bat-step-12",
    stepNumber: 12,
    title: "Solar STC + Battery STC Filed Separately",
    description: "Filing distinct credits in the REC Registry.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 7,
    milestoneType: "standard",
    requiresAdminApproval: true,
    completionCondition: "admin_approval"
  },
  {
    id: "au-bat-step-13",
    stepNumber: 13,
    title: "Project Closed + Battery App Setup",
    description: "App login transfer and battery charge mode config handover.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 2,
    milestoneType: "standard",
    completionCondition: "manual"
  }
];

const AU_FARM_RURAL_STEPS = [
  {
    id: "au-farm-step-1",
    stepNumber: 1,
    title: "Farm Energy Audit + Off-Grid Assessment",
    description: "Verify farm load profile (irrigation, pumps, high-voltage sheds).",
    assignedTo: "company",
    allowedRoles: ["company", "bde"],
    canBeCompletedByBDE: false,
    slaDays: 2,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-farm-step-2",
    stepNumber: 2,
    title: "Grid Connection Feasibility",
    description: "Calculate cost projections for rural SWER lines vs custom off-grid battery arrays.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 3,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-farm-step-3",
    stepNumber: 3,
    title: "Rural DA / Development Approval",
    description: "Verify rural zone boundaries and submit building permit.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 15,
    milestoneType: "standard",
    requiresAdminApproval: true,
    completionCondition: "admin_approval"
  },
  {
    id: "au-farm-step-4",
    stepNumber: 4,
    title: "Site Assessment — Roof + Ground Mount Option",
    description: "EPC team checks ground soil conditions and roof structure integrity.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 4,
    milestoneType: "doc_upload",
    requiresDocumentUpload: true,
    documentRequirements: ["Rural Site Assessment Report"],
    completionCondition: "document_upload"
  },
  {
    id: "au-farm-step-5",
    stepNumber: 5,
    title: "System Design — Grid or Off-Grid Config",
    description: "Draft structural mount wiring diagrams using AS/NZS 4509 standards.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 3,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-farm-step-6",
    stepNumber: 6,
    title: "Contract + Finance (Farm Loan / ATO Depreciation)",
    description: "Digitally sign rural solar contract and allocate finance path.",
    assignedTo: "customer",
    allowedRoles: ["customer", "bde"],
    canBeCompletedByBDE: true,
    slaDays: 5,
    milestoneType: "doc_upload",
    requiresDocumentUpload: true,
    documentRequirements: ["Signed Rural Agreement"],
    completionCondition: "document_upload"
  },
  {
    id: "au-farm-step-7",
    stepNumber: 7,
    title: "DNSP Application (If Grid-Tied)",
    description: "File connection layout details under rural network rules.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 10,
    milestoneType: "standard",
    requiresAdminApproval: true,
    completionCondition: "admin_approval"
  },
  {
    id: "au-farm-step-8",
    stepNumber: 8,
    title: "Equipment + Remote Logistics",
    description: "Logistics dispatch for ground-mounting frames and large capacity hardware.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 7,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-farm-step-9",
    stepNumber: 9,
    title: "Installation (3-7 Days)",
    description: "EPC team runs earthworks, sets mounts, and installs panels/batteries.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 7,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-farm-step-10",
    stepNumber: 10,
    title: "Compliance + Off-Grid Commissioning",
    description: "Initiate system testing and submit commissioning safety records.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 3,
    milestoneType: "doc_upload",
    requiresDocumentUpload: true,
    documentRequirements: ["Rural Commissioning Report"],
    completionCondition: "document_upload"
  },
  {
    id: "au-farm-step-11",
    stepNumber: 11,
    title: "DNSP Meter (Grid-Tied) or Battery Config (Off-Grid)",
    description: "Configure export profiles or off-grid remote bypass controllers.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 14,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-farm-step-12",
    stepNumber: 12,
    title: "STC (<100kW) or LGC Registration (>100kW)",
    description: "Register solar capacity under federal incentive schemes.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 7,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-farm-step-13",
    stepNumber: 13,
    title: "ATO Asset Write-Off Documentation",
    description: "Export invoice records matching GST guidelines for tax depreciation claiming.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 2,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-farm-step-14",
    stepNumber: 14,
    title: "Project Closed + Remote Monitoring Setup",
    description: "Configure 4G/Satellite remote SCADA monitoring tool.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 2,
    milestoneType: "standard",
    completionCondition: "manual"
  }
];

const AU_COMMUNITY_STEPS = [
  {
    id: "au-comy-step-1",
    stepNumber: 1,
    title: "Initial Feasibility + Body Corporate Approach",
    description: "Audit roof layout and evaluate shared solar allocation potential.",
    assignedTo: "company",
    allowedRoles: ["company", "bde"],
    canBeCompletedByBDE: false,
    slaDays: 3,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-comy-step-2",
    stepNumber: 2,
    title: "Owners Corporation Vote / Body Corporate Resolution",
    description: "Obtain 75% majority vote agreement and log signed strata resolution.",
    assignedTo: "customer",
    allowedRoles: ["customer", "bde"],
    canBeCompletedByBDE: true,
    slaDays: 14,
    milestoneType: "doc_upload",
    requiresDocumentUpload: true,
    documentRequirements: ["Signed Strata Resolution"],
    requiresAdminApproval: true,
    completionCondition: "admin_approval"
  },
  {
    id: "au-comy-step-3",
    stepNumber: 3,
    title: "Strata Permit + DA Application",
    description: "File DA documents highlighting structural load compliance.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 15,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-comy-step-4",
    stepNumber: 4,
    title: "Detailed Site Assessment",
    description: "EPC team maps cable runs, common areas and switchboard space.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 4,
    milestoneType: "doc_upload",
    requiresDocumentUpload: true,
    documentRequirements: ["Detailed Common Roof Assessment"],
    completionCondition: "document_upload"
  },
  {
    id: "au-comy-step-5",
    stepNumber: 5,
    title: "Embedded Network Design",
    description: "Configure per-unit energy allocations.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 5,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-comy-step-6",
    stepNumber: 6,
    title: "Individual Unit Consent + Contract",
    description: "Collect agreements from participating apartment owners.",
    assignedTo: "customer",
    allowedRoles: ["customer", "bde"],
    canBeCompletedByBDE: true,
    slaDays: 10,
    milestoneType: "doc_upload",
    requiresDocumentUpload: true,
    documentRequirements: ["Consent Agreements Bundle"],
    completionCondition: "document_upload"
  },
  {
    id: "au-comy-step-7",
    stepNumber: 7,
    title: "DNSP Application — Embedded Network Registration",
    description: "Register solar network on the local distribution grid.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 15,
    milestoneType: "standard",
    requiresAdminApproval: true,
    completionCondition: "admin_approval"
  },
  {
    id: "au-comy-step-8",
    stepNumber: 8,
    title: "Installation — Common Roof (3-5 Days)",
    description: "EPC team completes common area panel mounting structures.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 5,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-comy-step-9",
    stepNumber: 9,
    title: "Common Area Electrical Work",
    description: "Wire distribution boards and configure safety isolators.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 3,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-comy-step-10",
    stepNumber: 10,
    title: "CES + Embedded Network Compliance",
    description: "Verify compliance and log regulatory inspector safety sheets.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    canBeCompletedByBDE: false,
    slaDays: 3,
    milestoneType: "doc_upload",
    requiresDocumentUpload: true,
    documentRequirements: ["Strata Compliance Certificate / CES"],
    completionCondition: "document_upload"
  },
  {
    id: "au-comy-step-11",
    stepNumber: 11,
    title: "DNSP Activation + Building Meter Config",
    description: "Activate main building export meters.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 14,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-comy-step-12",
    stepNumber: 12,
    title: "Solar Allocation System Setup",
    description: "Register units in energy allocation software.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 5,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-comy-step-13",
    stepNumber: 13,
    title: "STC Filed (Whole Building as One Unit)",
    description: "Claim bulk STC credits for building layout.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 7,
    milestoneType: "standard",
    requiresAdminApproval: true,
    completionCondition: "admin_approval"
  },
  {
    id: "au-comy-step-14",
    stepNumber: 14,
    title: "Body Corporate Report + Billing Setup",
    description: "Verify solar savings and configure billing cycles.",
    assignedTo: "customer",
    allowedRoles: ["customer"],
    canBeCompletedByBDE: false,
    slaDays: 3,
    milestoneType: "standard",
    completionCondition: "manual"
  },
  {
    id: "au-comy-step-15",
    stepNumber: 15,
    title: "Project Closed + Unit Owner Activation",
    description: "Complete owner account setups in monitoring portal.",
    assignedTo: "company",
    allowedRoles: ["company"],
    canBeCompletedByBDE: false,
    slaDays: 2,
    milestoneType: "standard",
    completionCondition: "manual"
  }
];

// ==========================================
// 2. WEBSITE SETTINGS SEED blue prints
// ==========================================

const INDIA_BASE_SETTINGS = {
  _settingsKey: "india_default_settings",
  country: "india",
  projectType: "default",
  brand: {
    companyName: "SUNNOVATIVE",
    tagline: "SOLAR SYSTEM",
    phone: "+91 98982 31245",
    hubLabel: "Call Rajkot Hub",
    topBannerText: "PM Surya Ghar Yojana Empaneled Vendor | Up to ₹78,000 Govt Subsidy Guaranteed"
  },
  hero: {
    badge: "PM Surya Ghar Yojana - Gujarat Resident Portal",
    headingLine1: "Surya Ghar Yojana ke liye",
    headingHighlight: "Rooftop Solar Lagvao!",
    subtext: "Bijli bill bachao, subsidy ka benefit lo, aur trusted solar expert ke saath solar installation karao. Get up to ₹78,000 subsidy transferred directly to your bank account with Sunnovative Solar System Pvt Ltd.",
    ctaPrimary: "Free Solar Consultation",
    ctaSecondary: "Check Eligibility (Guj)",
    socialProofText: "Rajkot Residents: Save up to ₹78,000 on Solar Subsidy!"
  },
  stats: [
    { value: "1200+", label: "Rajkot Homes Solarized" },
    { value: "₹48 Lakh+", label: "Subsidy Disbursed" },
    { value: "3.8 MW", label: "Current Capacity" }
  ],
  benefits: {
    sectionTitle: "Why Install Solar Now?",
    sectionSubtitle: "PM Surya Ghar Yojana ke Benefits & Savings",
    sectionDesc: "Sarkari Subsidy and Sunnovative Solar System's advanced German engineering make Rooftop Solar the single smartest investment for every home in Rajkot.",
    items: [
      {
        title: "Government Subsidy Support",
        subtitle: "Up to ₹78,000 Direct Return",
        desc: "MNRE National Portal key direct integration: 1kW translates to ₹33,000, 2kW offers ₹66,000, and 3kW or above gains ₹78,000 maximum direct bank transfer.",
        badge: "Rajkot Authorized Geda vendor"
      },
      {
        title: "Zero Electricity Bill Savings",
        subtitle: "Save up to 90% Every Month",
        desc: "Free up to 300 units of energy monthly depending on panel size. Any extra energy generated goes back to PGVCL grid, lowering your electric tab to near-zero.",
        badge: "Rajkot Authorized Geda vendor"
      },
      {
        title: "End-to-End Installation",
        subtitle: "Tier-1 Components & Warranty",
        desc: "Complete rooftop mounting structure with wind-flow optimization (withstands Cyclone gusts in Saurashtra), structural safety certified by architects.",
        badge: "Rajkot Authorized Geda vendor"
      },
      {
        title: "Hassle-Free Liaisoning",
        subtitle: "Zero Red Tape or Document Stress",
        desc: "We fully manage documentation on the PGVCL portal, structural drawing submissions, subsidy eligibility approval, and regulatory liaisoning.",
        badge: "Rajkot Authorized Geda vendor"
      },
      {
        title: "Bi-directional Net-Metering",
        subtitle: "Turn Sun into Guaranteed Earnings",
        desc: "Full coordination with PGVCL division engineers to commission standard and secure bi-directional meters. Monitor production from your smartphone.",
        badge: "Rajkot Authorized Geda vendor"
      }
    ]
  },
  howItWorks: {
    sectionTitle: "Easy 4-Step Process",
    sectionSubtitle: "Solar Installation Kaise Kaam Karta Hai?",
    steps: [
      { stepNum: "01", timeLabel: "In 2 Minutes", title: "Light Bill Details Submit Kare", desc: "Hamari system me apna Consumer Number ya Average monthly bill enter kare. High-resolution utility bill upload option available." },
      { stepNum: "02", timeLabel: "Within 1 Hour", title: "Team Eligibility Check Karegi", desc: "Sunnovative experts PGVCL database se load allocation aur sanjay-yojana slab details match karke optimal solar size estimate karenge." },
      { stepNum: "03", timeLabel: "In 24 Hours", title: "Free Site Survey & Quotation", desc: "Rajkot ke field officers aapke rooftop area, shadow profiles aur tile strength check kareke high-durability customized quote design karenge." },
      { stepNum: "04", timeLabel: "Direct Transfer", title: "Installation & Subsidy Credit", desc: "Within 10-15 days, structure setup and net-meter commissioning are finalized. Government subsidy amount directly transfers into your bank account." }
    ]
  },
  calculator: {
    sectionTitle: "Realtime Solar Simulator",
    sectionSubtitle: "Check Your Subsidy & Rooftop Solar Estimate",
    demoConsumerNumbers: "04602123456 or 04608987654",
    tipText: "Keep a PDF or photo of your latest PGVCL utility bill ready to streamline step 1 calculation!"
  },
  trust: {
    sectionTitle: "Local Trusted Expert",
    sectionSubtitle: "Sunnovative Solar System Pvt Ltd",
    sectionDesc: "As the leading epc service firm in Rajkot & Saurashtra region, we combine world-class PV component logistics with rigorous local engineering standards, protecting families against volatile power rates for the next 25+ years.",
    points: [
      { title: "Empaneled Solar Contractor", desc: "Proud GEDA (Gujarat Energy Development Agency) authorized empanelled solar installer. Certified to load subsidy directly on the National Portal." },
      { title: "Residential Solar Pioneers", desc: "Authorized partner in Rajkot for residential solar panels, supporting zero-overhead setups for single-family homes, complexes, and high-rise apartments." },
      { title: "Commercial & Industrial Solar", desc: "Custom high-load commercial arrays with 40% accelerated depreciation tax benefits, bringing down corporate, hospital, and factory energy bills significantly." },
      { title: "Tier-1 Certified Components", desc: "We exclusively deploy ALMM-approved, ultra-high-efficiency Mono Perc and Bifacial panels with a 25-year performance warranty." },
      { title: "Timely Local Maintenance", desc: "Based in Rajkot (Kalawad Road). Our mobile response team promises site checkups and cleanup services within 24 hours of call logged." }
    ]
  },
  footer: {
    address: "302, Shivalik Corporate Park, Near Kalawad Road, Rajkot, Gujarat - 360005",
    phone: "+91 98982 31245",
    email: "info@sunnovative.com",
    gedaCertNo: "#RJK-20412",
    copyrightText: "Sunnovative Solar System Pvt Ltd is Rajkot's premium GEDA registered EPC service provider specialized in standard residential PM Surya Ghar Yojana. Turns rooftop shadows into guaranteed cash savings."
  },
  projectForm: {
    title: "Apply for Solar",
    subtitle: "Fill in your details for an instant quote.",
    formId: "default_lead_form",
    fields: [
      { label: "Consumer Number (For Auto-Scan)", key: "consumerNumber", type: "text", required: true, options: [] },
      { label: "Full Name", key: "fullName", type: "text", required: true, options: [] },
      { label: "Mobile Number", key: "mobileNumber", type: "tel", required: true, options: [] },
      { label: "Postcode / Pincode", key: "postcode", type: "number", required: true, options: [] },
      { label: "City", key: "city", type: "text", required: true, options: [] },
      { label: "State", key: "customerState", type: "select", required: true, options: ["Gujarat", "Maharashtra", "Rajasthan"] },
      { label: "Average Monthly Bill", key: "monthlyBill", type: "number", required: true, options: [] },
      { label: "Do you own the property?", key: "ownsProperty", type: "select", required: true, options: ["Yes", "No"] },
      { label: "Upload Electricity Bill", key: "billFile", type: "file", required: false, options: [] }
    ]
  },
  videos: {
    customerWebsiteVideo: {
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0",
      enabled: false // Hidden by default (Mock)
    },
    epcDashboardVideo: {
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0",
      enabled: false // Hidden by default (Mock)
    }
  }
};

const INDIA_COMMERCIAL_SETTINGS = {
  ...INDIA_BASE_SETTINGS,
  _settingsKey: "india_commercial_settings",
  projectType: "commercial",
  brand: {
    ...INDIA_BASE_SETTINGS.brand,
    topBannerText: "Commercial & Industrial Solar Solutions | 40% Accelerated Depreciation & GST input credit"
  },
  hero: {
    badge: "Sunnovative Commercial Solar",
    headingLine1: "Industrial & Commercial",
    headingHighlight: "Solar ROI Optimized!",
    subtext: "Reduce factory, corporate or hospital operational energy costs up to 90%. Benefit from 40% accelerated depreciation write-offs and claim 18% GST input credit with our tier-1 engineering setups.",
    ctaPrimary: "Free Energy Audit",
    ctaSecondary: "Download Solar Brochure",
    socialProofText: "India Businesses: Save Lakhs on quarterly operational energy bills!"
  },
  benefits: {
    sectionTitle: "High-Load Commercial Solar",
    sectionSubtitle: "GST Credits & Accelerated Depreciation",
    sectionDesc: "Corporate and industrial high-yield configurations engineered to offer maximum return on rooftop assets.",
    items: [
      {
        title: "GST Input Tax Credits",
        subtitle: "18% GST Savings Upfront",
        desc: "Offset installation GST against company outbound liabilities instantly, cutting capital setup costs significantly.",
        badge: "Tax Benefit"
      },
      {
        title: "40% Accelerated Depreciation",
        subtitle: "Corporate Income Tax Relief",
        desc: "Write-off 40% of solar asset value in year-one, reducing the corporate tax burden for factories and offices.",
        badge: "Tax Relief"
      },
      {
        title: "CEIG & 3-Phase Liaisoning",
        subtitle: "Zero Liaisoning Red Tape",
        desc: "We manage complete CEIG high-voltage inspector clearances, DISCOM grid feasibility and 3-phase net metering setup.",
        badge: "Compliance Managed"
      }
    ]
  }
};

const AUSTRALIA_BASE_SETTINGS = {
  _settingsKey: "australia_default_settings",
  country: "australia",
  projectType: "default",
  brand: {
    companyName: "SUNNOVATIVE",
    tagline: "SOLAR ENERGY",
    phone: "1300 123 456",
    hubLabel: "Call Australia Hub",
    topBannerText: "SAA Accredited Solar Retailer | Get up to $4,000 STC Upfront Discount"
  },
  hero: {
    badge: "CEC Accredited Installer Network",
    headingLine1: "Go Solar and Claim Your",
    headingHighlight: "STC Government Rebates!",
    subtext: "Australian Small-scale Technology Certificates (STC) reduce your solar installation costs instantly upfront. Our Solar Accreditation Australia (SAA) experts handle all DNSP pre-approvals and compliance filings.",
    ctaPrimary: "Free Solar Quote",
    ctaSecondary: "Check STC Eligibility",
    socialProofText: "Australian Homeowners: Get up to $4,000 point-of-sale STC discount!"
  },
  stats: [
    { value: "1500+", label: "Australian Homes Solarized" },
    { value: "$2.5M+", label: "STC Rebates Claimed" },
    { value: "10 MW", label: "Clean Capacity Installed" }
  ],
  benefits: {
    sectionTitle: "Why Install Solar Now?",
    sectionSubtitle: "Federal STC Discounts & Savings",
    sectionDesc: "Federal SRES incentives make rooftop solar arrays highly cost-effective across Australian postcodes.",
    items: [
      {
        title: "Federal STC Scheme",
        subtitle: "Up to $4,000 Upfront Savings",
        desc: "Small-scale Technology Certificates (STC) act as a point-of-sale rebate. Your installer claims it, lowering your net out-of-pocket setup invoice.",
        badge: "Point-of-Sale Rebate"
      },
      {
        title: "Retailer Feed-in Tariffs",
        subtitle: "Earn 3c to 15c per kWh",
        desc: "Export surplus daytime electricity generation back to the DNSP grid and earn energy credits from your retailer (AGL, Origin).",
        badge: "Surplus Feed-in"
      },
      {
        title: "CEC Approved Components",
        subtitle: "Tier-1 Quality Compliance",
        desc: "We exclusively deploy PV solar panels and micro-inverters compliant with strict AS/NZS 5033 installation standards.",
        badge: "Accredited Equipment"
      }
    ]
  },
  howItWorks: {
    sectionTitle: "Easy 4-Step Process",
    sectionSubtitle: "How Australian Solar Installation Works",
    steps: [
      { stepNum: "01", timeLabel: "Instant", title: "Enter Postcode & Bill Details", desc: "Provide your postcode and quarterly bill amount to calculate your STC zone and estimated savings instantly." },
      { stepNum: "02", timeLabel: "24 Hours", title: "Quote & DNSP Approval", desc: "Receive a tailored quote with STC upfront discount applied. We submit the grid connection application to your DNSP." },
      { stepNum: "03", timeLabel: "1-2 Days", title: "Installation by SAA Experts", desc: "Our SAA/CEC accredited installers fit your system using approved panels and inverters. Certificate of Electrical Safety (CES) issued." },
      { stepNum: "04", timeLabel: "Final", title: "Smart Meter & FiT Setup", desc: "Your retailer upgrades your meter. System is turned on, and you start earning Feed-in Tariffs and saving on quarterly bills." }
    ]
  },
  calculator: {
    sectionTitle: "Australia STC Estimator",
    sectionSubtitle: "Calculate Your Federal Solar Rebate Instantly",
    demoConsumerNumbers: "Postcode e.g. 2000, 3000, 4000",
    tipText: "Keep a recent PDF of your Energy retailer bill ready to estimate feed-in options!"
  },
  trust: {
    sectionTitle: "Australian Solar Experts",
    sectionSubtitle: "Sunnovative Energy Systems",
    sectionDesc: "Connecting Australian homeowners with verified, high-quality SAA accredited solar installers.",
    points: [
      { title: "SAA Accredited Installers", desc: "All installations are performed by Solar Accreditation Australia (SAA) certified professionals." },
      { title: "CEC Approved Products", desc: "We exclusively use Tier-1 solar panels and inverters approved by the Clean Energy Council." },
      { title: "AS/NZS 5033 Compliant", desc: "Strict adherence to Australian installation and electrical safety standards." },
      { title: "Hassle-free DNSP Processing", desc: "We handle all the paperwork with Ausgrid, Energex, CitiPower, or your local distributor." },
      { title: "Comprehensive Warranty", desc: "25-year performance warranty on panels and workmanship guarantees." }
    ]
  },
  footer: {
    address: "Level 12, 100 Collins Street, Melbourne, VIC 3000, Australia",
    phone: "1300 123 456",
    email: "info@sunnovative.com.au",
    gedaCertNo: "ABN: 12 345 678 910",
    copyrightText: "Sunnovative Energy Systems is an SAA accredited solar provider, helping Australians slash power bills with premium tier-1 solar solutions."
  },
  projectForm: {
    title: "Apply for Solar",
    subtitle: "Fill in your details for an instant quote.",
    formId: "default_lead_form_au",
    fields: [
      { label: "Full Name", key: "fullName", type: "text", required: true, options: [] },
      { label: "Mobile Number", key: "mobileNumber", type: "tel", required: true, options: [] },
      { label: "Postcode", key: "postcode", type: "number", required: true, options: [] },
      { label: "City", key: "city", type: "text", required: true, options: [] },
      { label: "State", key: "customerState", type: "select", required: true, options: ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania"] },
      { label: "Average Quarterly Bill", key: "monthlyBill", type: "number", required: true, options: [] },
      { label: "Do you own the property?", key: "ownsProperty", type: "select", required: true, options: ["Yes", "No"] },
      { label: "Upload Electricity Bill", key: "billFile", type: "file", required: false, options: [] }
    ]
  },
  videos: {
    customerWebsiteVideo: {
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0",
      enabled: false // Hidden by default (Mock)
    },
    epcDashboardVideo: {
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0",
      enabled: false // Hidden by default (Mock)
    }
  }
};

const AUSTRALIA_COMMERCIAL_SETTINGS = {
  ...AUSTRALIA_BASE_SETTINGS,
  _settingsKey: "australia_commercial_settings",
  projectType: "commercial",
  brand: {
    ...AUSTRALIA_BASE_SETTINGS.brand,
    topBannerText: "Commercial & Industrial Solar Australia | Level 3 DNSP Study & Grid Feasibility"
  },
  hero: {
    badge: "High-Capacity C&I Solar Assemblies",
    headingLine1: "Australia Commercial Solar",
    headingHighlight: "DNSP Level 3 pre-approved!",
    subtext: "Claim immediate asset write-offs and slash commercial operating expenses. Our compliance engineers design, submit, and commission high-capacity switchboards conforming to Level 3 DNSP rules.",
    ctaPrimary: "Request Energy Audit",
    ctaSecondary: "Grid Feasibility Tool",
    socialProofText: "AU Enterprises: Claim instant tax depreciation write-offs!"
  },
  benefits: {
    sectionTitle: "Commercial & Industrial Solar Solutions",
    sectionSubtitle: "ATO Tax Write-Offs & DNSP Grid Audits",
    sectionDesc: "Engineered to lower operational carbon footprints and lock-in long-term power expense stability.",
    items: [
      {
        title: "Instant Asset Write-Off",
        subtitle: "Claim Up to 100% Tax Relief",
        desc: "Claim capital setups as an immediate tax write-off under ATO small business tax incentives, accelerating financial ROI.",
        badge: "ATO Incentive"
      },
      {
        title: "Level 3 DNSP Studies",
        subtitle: "Complex Network Pre-Approval",
        desc: "We submit full Single Line Diagrams (SLD) and grid stability load flow studies to distributors (Ausgrid, Powercor).",
        badge: "Grid Engineering"
      },
      {
        title: "Harmonics & Power Quality",
        subtitle: "Grid Compliance testing",
        desc: "Integrated power factor corrections and CSIP-AUS smart inverter software setups to maintain compliance limits.",
        badge: "Smart Grid Ready"
      }
    ]
  }
};


// ==========================================
// SEED EXECUTION
// ==========================================

async function run() {
  try {
    console.log("Connecting to:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    // 1. Seed Order Journey Blueprints
    // ---------------------------------
    // INDIA
    console.log("Updating India Order Journey blue prints...");
    await OrderJourneySettings.findOneAndUpdate(
      { country: "india", state: "all", district: "all" },
      {
        country: "india",
        state: "all",
        district: "all",
        _settingsKey: "india_all_all",
        journeys: [
          {
            projectType: "residential",
            projectTypeLabel: "Residential Solar",
            enabled: true,
            description: "PM Surya Ghar Yojana government subsidy residential journey.",
            epcSelectionType: "FCFS",
            steps: INDIA_RESIDENTIAL_STEPS
          },
          {
            projectType: "commercial",
            projectTypeLabel: "Commercial Solar",
            enabled: true,
            description: "India Commercial and Industrial net-metering journey.",
            epcSelectionType: "FCFS",
            steps: INDIA_COMMERCIAL_STEPS
          }
        ]
      },
      { upsert: true, new: true }
    );
    console.log("India Order Journeys seeded successfully.");

    // AUSTRALIA
    console.log("Updating Australia Order Journey blue prints...");
    await OrderJourneySettings.findOneAndUpdate(
      { country: "australia", state: "all", district: "all" },
      {
        country: "australia",
        state: "all",
        district: "all",
        _settingsKey: "australia_all_all",
        journeys: [
          {
            projectType: "residential",
            projectTypeLabel: "Residential Solar (STC)",
            enabled: true,
            description: "Australia CEC residential solar upfront STC rebate journey.",
            epcSelectionType: "BDE_SELECT",
            steps: AU_RESIDENTIAL_STEPS
          },
          {
            projectType: "commercial",
            projectTypeLabel: "Commercial Solar",
            enabled: true,
            description: "Australia Commercial & Industrial DNSP level 3 pre-approval journey.",
            epcSelectionType: "BDE_SELECT",
            steps: AU_COMMERCIAL_STEPS
          },
          {
            projectType: "solar-battery",
            projectTypeLabel: "Solar + Battery",
            enabled: true,
            description: "CEC solar + storage battery hybrid setup journey.",
            epcSelectionType: "BDE_SELECT",
            steps: AU_BATTERY_STEPS
          },
          {
            projectType: "farm-rural",
            projectTypeLabel: "Farm / Rural Solar",
            enabled: true,
            description: "Farm ground-mount off-grid or remote network hybrid solar journey.",
            epcSelectionType: "BDE_SELECT",
            steps: AU_FARM_RURAL_STEPS
          },
          {
            projectType: "community-strata",
            projectTypeLabel: "Community / Strata Solar",
            enabled: true,
            description: "Embedded network multi-unit strata body corporate solar journey.",
            epcSelectionType: "BDE_SELECT",
            steps: AU_COMMUNITY_STEPS
          }
        ]
      },
      { upsert: true, new: true }
    );
    console.log("Australia Order Journeys seeded successfully.");

    // 2. Seed Website Settings
    // ---------------------------------
    // INDIA RESIDENTIAL (default)
    console.log("Seeding India Residential Website Settings...");
    await WebsiteSettings.findOneAndUpdate(
      { country: "india", projectType: "default" },
      INDIA_BASE_SETTINGS,
      { upsert: true, new: true }
    );

    // INDIA COMMERCIAL
    console.log("Seeding India Commercial Website Settings...");
    await WebsiteSettings.findOneAndUpdate(
      { country: "india", projectType: "commercial" },
      INDIA_COMMERCIAL_SETTINGS,
      { upsert: true, new: true }
    );

    // AUSTRALIA RESIDENTIAL (default)
    console.log("Seeding Australia Residential Website Settings...");
    await WebsiteSettings.findOneAndUpdate(
      { country: "australia", projectType: "default" },
      AUSTRALIA_BASE_SETTINGS,
      { upsert: true, new: true }
    );

    // AUSTRALIA COMMERCIAL
    console.log("Seeding Australia Commercial Website Settings...");
    await WebsiteSettings.findOneAndUpdate(
      { country: "australia", projectType: "commercial" },
      AUSTRALIA_COMMERCIAL_SETTINGS,
      { upsert: true, new: true }
    );

    console.log("All Website Settings seeded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed with error:", err);
    process.exit(1);
  }
}

run();
