import { OrderJourneySettings } from "../models/OrderJourneySettings.js";
import { ProjectOrder } from "../models/ProjectModel.js";

// ── Default journey data ──────────────────────────────────────────────────────
const INDIA_RESIDENTIAL = {
  projectType: "residential",
  projectTypeLabel: "Residential Solar",
  enabled: true,
  description: "PM Surya Ghar Yojana ke liye standard residential rooftop solar installation journey",
  steps: [
    { id: "in_r1", stepNumber: 1, title: "Check Subsidy Eligibility", assignedTo: "customer", allowedRoles: ["customer", "bde"], canBeCompletedByBDE: true, enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Check Eligibility", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "in_r2", stepNumber: 2, title: "Submit Electricity Bill", assignedTo: "customer", allowedRoles: ["customer", "bde"], canBeCompletedByBDE: true, enabled: true, slaDays: 1, isMandatory: true, requiresDocumentUpload: true, documentName: "Electricity Bill", actionLabel: "Upload Bill", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "in_r3", stepNumber: 3, title: "Upload Property Details", assignedTo: "customer", allowedRoles: ["customer", "bde"], canBeCompletedByBDE: true, enabled: true, slaDays: 1, isMandatory: true, requiresDocumentUpload: true, documentName: "Property Photo", actionLabel: "Upload Details", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "in_r4", stepNumber: 4, title: "Verify Customer Eligibility", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 1, isMandatory: true, requiresAdminApproval: true, actionLabel: "Verify Customer", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "in_r5", stepNumber: 5, title: "Verify Documents", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 1, isMandatory: true, requiresAdminApproval: true, actionLabel: "Verify Docs", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "in_r6", stepNumber: 6, title: "Select Installation Date", assignedTo: "customer", allowedRoles: ["customer", "bde"], canBeCompletedByBDE: true, enabled: true, slaDays: 2, isMandatory: true, actionLabel: "Select Date", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "in_r7", stepNumber: 7, title: "Make Payment", assignedTo: "customer", allowedRoles: ["customer", "bde"], canBeCompletedByBDE: true, enabled: true, slaDays: 3, isMandatory: true, actionLabel: "Pay Now", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "in_r8", stepNumber: 8, title: "Allocate EPC Partner", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 1, isMandatory: true, requiresAdminApproval: true, actionLabel: "Allocate EPC", notifyCustomer: false, notifyEPC: true, notifyAdmin: false },
    { id: "in_r9", stepNumber: 9, title: "Accept Project", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Accept", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "in_r10", stepNumber: 10, title: "Conduct Site Survey", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 2, isMandatory: true, requiresDocumentUpload: true, documentName: "Survey Report", actionLabel: "Upload Survey", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "in_r11", stepNumber: 11, title: "Submit Proposal", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 2, isMandatory: true, requiresDocumentUpload: true, documentName: "Proposal", actionLabel: "Submit Proposal", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "in_r12", stepNumber: 12, title: "Install Solar System", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 7, isMandatory: true, actionLabel: "Mark Installed", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "in_r13", stepNumber: 13, title: "Upload Installation Documents", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 1, isMandatory: true, requiresDocumentUpload: true, documentName: "Installation Proofs", actionLabel: "Upload Proofs", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "in_r14", stepNumber: 14, title: "Complete Net Meter Process", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 7, isMandatory: true, actionLabel: "Complete Net Meter", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "in_r15", stepNumber: 15, title: "Process Subsidy Application", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 3, isMandatory: true, actionLabel: "Process Subsidy", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "in_r16", stepNumber: 16, title: "Monitor Project Progress", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Review Progress", notifyCustomer: false, notifyEPC: false, notifyAdmin: false },
    { id: "in_r17", stepNumber: 17, title: "Close Project", assignedTo: "epc-partner", allowedRoles: ["epc-partner", "company"], enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Close", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
  ],
};

const AUSTRALIA_RESIDENTIAL = {
  projectType: "residential",
  projectTypeLabel: "Residential Solar",
  enabled: true,
  description: "Australia CEC compliant residential rooftop solar installation journey (12 Steps)",
  steps: [
    { id: "au_res_1", stepNumber: 1, title: "Enquiry + Postcode → Zone → STC Auto Calc", assignedTo: "customer", allowedRoles: ["customer", "bde"], canBeCompletedByBDE: true, enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Calculate STC", notifyCustomer: true },
    { id: "au_res_2", stepNumber: 2, title: "Quote with STC Discount Shown Upfront", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 1, isMandatory: true, actionLabel: "View Quote", notifyCustomer: true },
    { id: "au_res_3", stepNumber: 3, title: "Site Assessment — CEC Accredited", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 2, isMandatory: true, requiresDocumentUpload: true, documentName: "Geo-tagged Site Photo", actionLabel: "Upload Survey Report" },
    { id: "au_res_4", stepNumber: 4, title: "System Design — CEC Approved Products Only", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 2, isMandatory: true, actionLabel: "Submit System Design" },
    { id: "au_res_5", stepNumber: 5, title: "Contract + STC Assignment Form Signed", assignedTo: "customer", allowedRoles: ["customer", "bde"], canBeCompletedByBDE: true, enabled: true, slaDays: 2, isMandatory: true, requiresDocumentUpload: true, documentName: "STC Assignment Form", actionLabel: "Sign & Upload Contract" },
    { id: "au_res_6", stepNumber: 6, title: "DNSP Grid Application (Before Install)", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 7, isMandatory: true, externalParty: "DNSP", actionLabel: "Submit Grid Application" },
    { id: "au_res_7", stepNumber: 7, title: "Material + Install Date", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 2, isMandatory: true, actionLabel: "Confirm Install Date" },
    { id: "au_res_8", stepNumber: 8, title: "Installation (1-2 days)", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 2, isMandatory: true, requiresDocumentUpload: true, documentName: "AS/NZS 5033 Compliance Photos", actionLabel: "Upload Installation Proofs" },
    { id: "au_res_9", stepNumber: 9, title: "Certificate of Electrical Safety (CES)", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 2, isMandatory: true, requiresDocumentUpload: true, documentName: "CES Certificate", actionLabel: "Upload CES Certificate" },
    { id: "au_res_10", stepNumber: 10, title: "DNSP Smart Meter Upgrade", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 14, isMandatory: true, externalParty: "DNSP", actionLabel: "Confirm Smart Meter Upgrade" },
    { id: "au_res_11", stepNumber: 11, title: "STC Filed in REC Registry", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 3, isMandatory: true, actionLabel: "File STCs" },
    { id: "au_res_12", stepNumber: 12, title: "Project Closed + State Rebate Guidance", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Close Project" },
  ]
};

const AUSTRALIA_COMMERCIAL = {
  projectType: "commercial",
  projectTypeLabel: "Commercial Solar",
  enabled: true,
  description: "Commercial rooftop solar for business premises (14 Steps)",
  steps: [
    { id: "au_com_1", stepNumber: 1, title: "Commercial Enquiry + Energy Audit", assignedTo: "company", enabled: true, slaDays: 2, isMandatory: true, actionLabel: "Complete Energy Audit" },
    { id: "au_com_2", stepNumber: 2, title: "System Size Recommendation + ROI Calc", assignedTo: "company", enabled: true, slaDays: 2, isMandatory: true, actionLabel: "Generate ROI Proposal" },
    { id: "au_com_3", stepNumber: 3, title: "Development Approval (DA) Check", assignedTo: "company", enabled: true, slaDays: 14, isMandatory: true, requiresAdminApproval: true, externalParty: "Council", actionLabel: "Verify DA Requirements" },
    { id: "au_com_4", stepNumber: 4, title: "Site Assessment + Structural Engineering Report", assignedTo: "epc-partner", enabled: true, slaDays: 3, isMandatory: true, requiresDocumentUpload: true, documentName: "Engineering & 3-Phase Check Report", actionLabel: "Upload Engineering Report" },
    { id: "au_com_5", stepNumber: 5, title: "System Design — 3-Phase, Large Inverter", assignedTo: "epc-partner", enabled: true, slaDays: 3, isMandatory: true, actionLabel: "Submit 3-Phase Design" },
    { id: "au_com_6", stepNumber: 6, title: "Commercial Contract + Finance Options", assignedTo: "customer", enabled: true, slaDays: 3, isMandatory: true, requiresDocumentUpload: true, documentName: "Signed Commercial Contract", actionLabel: "Sign Contract & Finance" },
    { id: "au_com_7", stepNumber: 7, title: "DNSP Application — Complex Study Required", assignedTo: "company", enabled: true, slaDays: 21, isMandatory: true, requiresAdminApproval: true, externalParty: "DNSP", actionLabel: "Submit DNSP Network Study" },
    { id: "au_com_8", stepNumber: 8, title: "Equipment Procurement", assignedTo: "company", enabled: true, slaDays: 14, isMandatory: true, actionLabel: "Procure Commercial Gear" },
    { id: "au_com_9", stepNumber: 9, title: "Installation (3-10 days)", assignedTo: "epc-partner", enabled: true, slaDays: 10, isMandatory: true, requiresDocumentUpload: true, documentName: "Safety Management & Install Photos", actionLabel: "Upload Installation Proofs" },
    { id: "au_com_10", stepNumber: 10, title: "Commissioning + Testing", assignedTo: "epc-partner", enabled: true, slaDays: 3, isMandatory: true, actionLabel: "Complete Power Quality Test" },
    { id: "au_com_11", stepNumber: 11, title: "CES + Compliance Documentation", assignedTo: "epc-partner", enabled: true, slaDays: 2, isMandatory: true, requiresDocumentUpload: true, documentName: "CES & Independent Inspector Cert", actionLabel: "Upload CES & Compliance" },
    { id: "au_com_12", stepNumber: 12, title: "DNSP Final Activation + Smart Meter", assignedTo: "company", enabled: true, slaDays: 7, isMandatory: true, externalParty: "DNSP", actionLabel: "Activate Grid Export" },
    { id: "au_com_13", stepNumber: 13, title: "STC Filed (<100kW) or LGC Setup (>100kW)", assignedTo: "company", enabled: true, slaDays: 5, isMandatory: true, requiresAdminApproval: true, actionLabel: "File STC / Setup LGC" },
    { id: "au_com_14", stepNumber: 14, title: "Project Closed + Performance Monitoring", assignedTo: "company", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Activate Performance Dashboard" },
  ]
};

const AUSTRALIA_SOLAR_BATTERY = {
  projectType: "solar-battery",
  projectTypeLabel: "Solar + Battery",
  enabled: true,
  description: "Solar PV system with BESS battery energy storage (13 Steps)",
  steps: [
    { id: "au_bat_1", stepNumber: 1, title: "Enquiry + Postcode → Zone → STC Auto Calc", assignedTo: "customer", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Calculate Solar & Battery STCs" },
    { id: "au_bat_2", stepNumber: 2, title: "Quote with STC Discount Shown Upfront", assignedTo: "company", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "View Package Quote" },
    { id: "au_bat_3", stepNumber: 3, title: "Site Assessment — CEC Accredited", assignedTo: "epc-partner", enabled: true, slaDays: 2, isMandatory: true, requiresDocumentUpload: true, documentName: "Battery Location & Geo-Photo", actionLabel: "Upload Site Assessment" },
    { id: "au_bat_4", stepNumber: 4, title: "System Design — CEC Approved Products Only", assignedTo: "epc-partner", enabled: true, slaDays: 2, isMandatory: true, actionLabel: "Submit Solar+Battery Design" },
    { id: "au_bat_5", stepNumber: 5, title: "Contract + STC Assignment Form Signed", assignedTo: "customer", enabled: true, slaDays: 2, isMandatory: true, requiresDocumentUpload: true, documentName: "Signed STC Form", actionLabel: "Sign & Upload Contract" },
    { id: "au_bat_6", stepNumber: 6, title: "DNSP Application — Battery Export Rules", assignedTo: "company", enabled: true, slaDays: 7, isMandatory: true, externalParty: "DNSP", actionLabel: "Submit Battery DNSP Application" },
    { id: "au_bat_7", stepNumber: 7, title: "Material — Solar + Battery Procurement", assignedTo: "epc-partner", enabled: true, slaDays: 5, isMandatory: true, actionLabel: "Procure CEC Approved Battery" },
    { id: "au_bat_8", stepNumber: 8, title: "Installation — Solar + Battery (2-3 days)", assignedTo: "epc-partner", enabled: true, slaDays: 3, isMandatory: true, requiresDocumentUpload: true, documentName: "Battery Safety & Mount Photos", actionLabel: "Upload Installation Proofs" },
    { id: "au_bat_9", stepNumber: 9, title: "Dual Compliance Certificate (CES + AS/NZS 5139)", assignedTo: "epc-partner", enabled: true, slaDays: 2, isMandatory: true, requiresDocumentUpload: true, documentName: "Dual CES & AS/NZS 5139 Cert", actionLabel: "Upload Dual Compliance Cert" },
    { id: "au_bat_10", stepNumber: 10, title: "DNSP Smart Meter + Battery Meter Config", assignedTo: "company", enabled: true, slaDays: 10, isMandatory: true, externalParty: "DNSP", actionLabel: "Configure Import/Export Meter" },
    { id: "au_bat_11", stepNumber: 11, title: "VPP Enrollment — Optional", assignedTo: "customer", enabled: false, isOptional: true, actionLabel: "Enroll in VPP (Optional)" },
    { id: "au_bat_12", stepNumber: 12, title: "Solar STC + Battery STC Filed Separately", assignedTo: "company", enabled: true, slaDays: 3, isMandatory: true, actionLabel: "File Solar & Battery STCs" },
    { id: "au_bat_13", stepNumber: 13, title: "Project Closed + Battery App Setup", assignedTo: "company", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Complete Battery App Setup" },
  ]
};

const AUSTRALIA_FARM_RURAL = {
  projectType: "farm-rural",
  projectTypeLabel: "Farm / Rural Solar",
  enabled: true,
  description: "Rural, agricultural & off-grid solar solutions (14 Steps)",
  steps: [
    { id: "au_farm_1", stepNumber: 1, title: "Farm Energy Audit + Off-Grid vs Grid Assessment", assignedTo: "company", enabled: true, slaDays: 2, isMandatory: true, actionLabel: "Complete Load Analysis" },
    { id: "au_farm_2", stepNumber: 2, title: "Grid Connection Feasibility", assignedTo: "company", enabled: true, slaDays: 5, isMandatory: true, actionLabel: "Check Rural Grid Capacity" },
    { id: "au_farm_3", stepNumber: 3, title: "Rural DA / Development Approval", assignedTo: "company", enabled: true, slaDays: 30, isMandatory: true, requiresAdminApproval: true, externalParty: "Council", actionLabel: "Submit Rural DA Application" },
    { id: "au_farm_4", stepNumber: 4, title: "Site Assessment — Roof + Ground Mount Option", assignedTo: "epc-partner", enabled: true, slaDays: 3, isMandatory: true, requiresDocumentUpload: true, documentName: "Ground Mount & Cable Run Report", actionLabel: "Upload Ground Mount Assessment" },
    { id: "au_farm_5", stepNumber: 5, title: "System Design — Grid or Off-Grid Configuration", assignedTo: "epc-partner", enabled: true, slaDays: 3, isMandatory: true, actionLabel: "Submit Off-Grid / Hybrid Design" },
    { id: "au_farm_6", stepNumber: 6, title: "Contract + Finance (Farm Loan / ATO Depreciation)", assignedTo: "customer", enabled: true, slaDays: 5, isMandatory: true, actionLabel: "Sign Farm Contract & Finance" },
    { id: "au_farm_7", stepNumber: 7, title: "DNSP Application (If Grid-Tied)", assignedTo: "company", enabled: true, slaDays: 21, isMandatory: true, requiresAdminApproval: true, externalParty: "DNSP", actionLabel: "Submit Rural DNSP Application" },
    { id: "au_farm_8", stepNumber: 8, title: "Equipment + Remote Logistics", assignedTo: "company", enabled: true, slaDays: 14, isMandatory: true, actionLabel: "Schedule Remote Freight & Gear" },
    { id: "au_farm_9", stepNumber: 9, title: "Installation (3-7 Days)", assignedTo: "epc-partner", enabled: true, slaDays: 7, isMandatory: true, actionLabel: "Complete Ground/Shed Install" },
    { id: "au_farm_10", stepNumber: 10, title: "Compliance + Off-Grid Commissioning", assignedTo: "epc-partner", enabled: true, slaDays: 3, isMandatory: true, requiresDocumentUpload: true, documentName: "AS/NZS 4509 Off-Grid Cert", actionLabel: "Upload Off-Grid Commissioning Cert" },
    { id: "au_farm_11", stepNumber: 11, title: "DNSP Meter (Grid-Tied) or Battery Config (Off-Grid)", assignedTo: "company", enabled: true, slaDays: 7, isMandatory: true, actionLabel: "Configure Rural Metering" },
    { id: "au_farm_12", stepNumber: 12, title: "STC (<100kW) or LGC Registration (>100kW)", assignedTo: "company", enabled: true, slaDays: 5, isMandatory: true, actionLabel: "Register STC / LGC" },
    { id: "au_farm_13", stepNumber: 13, title: "ATO Asset Write-Off Documentation", assignedTo: "company", enabled: true, slaDays: 2, isMandatory: true, actionLabel: "Issue ATO Tax Depreciation Invoice" },
    { id: "au_farm_14", stepNumber: 14, title: "Project Closed + Remote Monitoring Setup", assignedTo: "company", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Activate 4G/Satellite Monitoring" },
  ]
};

const AUSTRALIA_COMMUNITY_STRATA = {
  projectType: "community-strata",
  projectTypeLabel: "Community / Strata Solar",
  enabled: true,
  description: "Multi-tenant strata body corporate embedded network solar (15 Steps)",
  steps: [
    { id: "au_strata_1", stepNumber: 1, title: "Initial Feasibility + Body Corporate Approach", assignedTo: "company", enabled: true, slaDays: 3, isMandatory: true, actionLabel: "Present Shared Savings Feasibility" },
    { id: "au_strata_2", stepNumber: 2, title: "Owners Corporation Vote / Body Corporate Resolution", assignedTo: "customer", enabled: true, slaDays: 30, isMandatory: true, requiresAdminApproval: true, externalParty: "Body Corporate", actionLabel: "Record 75% Strata Majority Vote" },
    { id: "au_strata_3", stepNumber: 3, title: "Strata Permit + DA Application", assignedTo: "company", enabled: true, slaDays: 21, isMandatory: true, externalParty: "Council", actionLabel: "Submit Strata DA Application" },
    { id: "au_strata_4", stepNumber: 4, title: "Detailed Site Assessment", assignedTo: "epc-partner", enabled: true, slaDays: 3, isMandatory: true, requiresDocumentUpload: true, documentName: "Common Roof & Cable Route Plan", actionLabel: "Upload Strata Assessment" },
    { id: "au_strata_5", stepNumber: 5, title: "Embedded Network Design", assignedTo: "company", enabled: true, slaDays: 7, isMandatory: true, actionLabel: "Design ENO & Sub-metering" },
    { id: "au_strata_6", stepNumber: 6, title: "Individual Unit Consent + Contract", assignedTo: "customer", enabled: true, slaDays: 7, isMandatory: true, actionLabel: "Collect Unit Agreements" },
    { id: "au_strata_7", stepNumber: 7, title: "DNSP Application — Embedded Network Registration", assignedTo: "company", enabled: true, slaDays: 28, isMandatory: true, externalParty: "AER / DNSP", actionLabel: "Register Embedded Network" },
    { id: "au_strata_8", stepNumber: 8, title: "Installation — Common Roof (3-5 Days)", assignedTo: "epc-partner", enabled: true, slaDays: 5, isMandatory: true, actionLabel: "Complete Common Roof Install" },
    { id: "au_strata_9", stepNumber: 9, title: "Common Area Electrical Work", assignedTo: "epc-partner", enabled: true, slaDays: 3, isMandatory: true, actionLabel: "Install Sub-metering & Distribution" },
    { id: "au_strata_10", stepNumber: 10, title: "CES + Embedded Network Compliance", assignedTo: "epc-partner", enabled: true, slaDays: 2, isMandatory: true, requiresDocumentUpload: true, documentName: "CES & ENO Compliance Confirmation", actionLabel: "Upload Strata Compliance Cert" },
    { id: "au_strata_11", stepNumber: 11, title: "DNSP Activation + Building Meter Config", assignedTo: "company", enabled: true, slaDays: 7, isMandatory: true, externalParty: "DNSP", actionLabel: "Activate Building Parent Meter" },
    { id: "au_strata_12", stepNumber: 12, title: "Solar Allocation System Setup", assignedTo: "company", enabled: true, slaDays: 3, isMandatory: true, actionLabel: "Configure Credit Allocation Software" },
    { id: "au_strata_13", stepNumber: 13, title: "STC Filed (Whole Building as One Unit)", assignedTo: "company", enabled: true, slaDays: 3, isMandatory: true, actionLabel: "File Building STC Benefit" },
    { id: "au_strata_14", stepNumber: 14, title: "Body Corporate Report + Billing Setup", assignedTo: "customer", enabled: true, slaDays: 2, isMandatory: true, actionLabel: "Setup Solar Credits on Unit Bills" },
    { id: "au_strata_15", stepNumber: 15, title: "Project Closed + Unit Owner Activation", assignedTo: "company", enabled: true, slaDays: 1, isMandatory: true, actionLabel: "Activate Unit Owner Portal Access" },
  ]
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
          AUSTRALIA_SOLAR_BATTERY,
          AUSTRALIA_FARM_RURAL,
          AUSTRALIA_COMMUNITY_STRATA
        ]);
      } else {
        await initializeCountry(country, [NZ_RESIDENTIAL]);
      }
      settings = await OrderJourneySettings.findOne({ country, state, district, discom });
    } else {
      // ── MIGRATION CHECK: Ensure country has correct project types from PDF ──
      if (country === 'india') {
        const types = settings.journeys.map(j => j.projectType);
        if (types.includes('group') || types.includes('common-meter') || settings.journeys.length !== 2) {
          settings.journeys = [INDIA_RESIDENTIAL, INDIA_COMMERCIAL];
          await settings.save();
        }
      } else if (country === 'australia') {
        const types = settings.journeys.map(j => j.projectType);
        if (!types.includes('solar-battery') || !types.includes('farm-rural') || !types.includes('community-strata') || settings.journeys.length !== 5) {
          settings.journeys = [
            AUSTRALIA_RESIDENTIAL,
            AUSTRALIA_COMMERCIAL,
            AUSTRALIA_SOLAR_BATTERY,
            AUSTRALIA_FARM_RURAL,
            AUSTRALIA_COMMUNITY_STRATA
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
    const country = req.body.country || req.headers['x-country'] || 'india';
    const state = req.body.state || req.headers['x-state'] || 'all';
    const district = req.body.district || req.headers['x-district'] || 'all';
    const discom = req.body.discom || req.headers['x-discom'] || 'all';
    const { journeys, globalSettings } = req.body;

    let settings = await OrderJourneySettings.findOne({ country, state, district, discom: discom || 'all' });

    if (!settings) {
      settings = new OrderJourneySettings({
        country, state, district, discom: discom || 'all', _settingsKey: Math.random().toString()
      });
    }

    if (journeys) settings.journeys = journeys;
    if (globalSettings) settings.globalSettings = globalSettings;

    await settings.save();

    // Dynamically sync updated steps parameters to active, uncompleted project orders
    if (journeys && journeys.length > 0) {
      for (const j of journeys) {
        const activeProjects = await ProjectOrder.find({
          projectType: j.projectType,
          status: { $nin: ["completed", "cancelled"] }
        });

        for (const p of activeProjects) {
          let updated = false;
          p.steps.forEach((step) => {
            // Find corresponding step config in master journey (match by stepNumber or stepId or id)
            const masterStep = j.steps.find((s) => 
              s.id === step.stepId || 
              s.id === step.id || 
              s.stepId === step.stepId ||
              s.stepNumber === step.stepNumber
            );

            if (masterStep) {
              // Only sync settings if the step is not completed yet
              if (step.status === "in-progress" || step.status === "pending" || step.status === "awaiting-approval") {
                step.requiresDocumentUpload = masterStep.requiresDocumentUpload;
                step.requiresDoc = masterStep.requiresDoc || masterStep.requiresDocumentUpload;
                step.requiredActions = masterStep.requiredActions || [];
                step.documentRequirements = masterStep.documentRequirements || [];
                step.documentName = masterStep.documentName;
                step.requiresAdminApproval = masterStep.requiresAdminApproval;
                step.visibleToCustomer = masterStep.visibleToCustomer;
                step.visibleToEpc = masterStep.visibleToEpc;
                step.notifyCustomer = masterStep.notifyCustomer !== false;
                step.notifyEPC = masterStep.notifyEPC || false;
                step.notifyAdmin = masterStep.notifyAdmin || false;
                updated = true;
              }
            }
          });
          if (updated) {
            p.markModified("steps");
            await p.save();
          }
        }
      }
    }

    res.json({ success: true, data: settings, message: "Settings saved and active workflows synced successfully" });
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
      AUSTRALIA_SOLAR_BATTERY,
      AUSTRALIA_FARM_RURAL,
      AUSTRALIA_COMMUNITY_STRATA
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
