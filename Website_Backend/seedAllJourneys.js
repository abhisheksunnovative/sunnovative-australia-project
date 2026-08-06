import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/sunnovative_ecommerce";

// Schemas are resolved dynamically from mongoose models.
import { OrderJourneySettings } from "./src/models/OrderJourneySettings.js";

const AU_STEPS = [
  {
    stepNumber: 1,
    title: "Check Subsidy Eligibility (STC)",
    description: "Verify your postcode and quarterly electricity bill to determine your STC Zone and calculate your estimated government subsidy discount.",
    assignedTo: "customer",
    allowedRoles: ["customer"],
    actionLabel: "Verify Postcode & Bill Details",
    requiredActions: [
      { label: "Postcode", fileType: "text", required: true },
      { label: "Quarterly Bill Amount ($)", fileType: "text", required: true }
    ],
    slaDays: 2,
    enabled: true
  },
  {
    stepNumber: 2,
    title: "Upload Electricity Bill",
    description: "Please upload a recent quarterly electricity bill (front and back page) showing your NMI (National Metering Identifier) and consumption graph.",
    assignedTo: "customer",
    allowedRoles: ["customer", "bde"],
    actionLabel: "Upload NMI Electricity Bill",
    requiredActions: [
      { label: "Electricity Bill (PDF)", fileType: "pdf", required: true }
    ],
    slaDays: 2,
    enabled: true
  },
  {
    stepNumber: 3,
    title: "Upload Roof & Property Photos",
    description: "Provide photos of your rooftop, switchboard, and access point to help CEC installers design the solar panel layout.",
    assignedTo: "customer",
    allowedRoles: ["customer", "bde"],
    actionLabel: "Upload Property Images",
    requiredActions: [
      { label: "Rooftop Aerial/Slope Photo", fileType: "image", required: true },
      { label: "Switchboard Photo", fileType: "image", required: true }
    ],
    slaDays: 2,
    enabled: true
  },
  {
    stepNumber: 4,
    title: "Select Certified Solar Installer",
    description: "Review CEC accredited solar installer options suggested by your BDE. Accept the preferred quote and design to proceed.",
    assignedTo: "customer",
    allowedRoles: ["customer"],
    actionLabel: "Choose & Accept Installer",
    requiredActions: [
      { label: "Installer Selection Note", fileType: "text", required: true }
    ],
    slaDays: 3,
    enabled: true
  },
  {
    stepNumber: 5,
    title: "Review & Sign Quote Proposal",
    description: "Sign the formal quote agreement document detailing system components (Tier-1 Panels, Inverter) and the point-of-sale STC discount.",
    assignedTo: "customer",
    allowedRoles: ["customer"],
    actionLabel: "Sign Agreement Document",
    requiredActions: [
      { label: "Signed Quote Proposal (PDF)", fileType: "pdf", required: true }
    ],
    slaDays: 2,
    enabled: true
  },
  {
    stepNumber: 6,
    title: "DNSP Grid Connection Pre-Approval",
    description: "EPC Partner applies to the distributor (DNSP, e.g. Ausgrid, Endeavour Energy) to ensure solar export capability.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    actionLabel: "Upload DNSP Approval Letter",
    requiredActions: [
      { label: "DNSP Pre-Approval Letter", fileType: "pdf", required: true }
    ],
    slaDays: 4,
    enabled: true
  },
  {
    stepNumber: 7,
    title: "Schedule Installation Date",
    description: "EPC partner schedules the physical solar panel installation date with the customer.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner", "bde"],
    actionLabel: "Confirm Date & Schedule",
    requiredActions: [
      { label: "Confirmed Installation Date", fileType: "text", required: true }
    ],
    slaDays: 2,
    enabled: true
  },
  {
    stepNumber: 8,
    title: "System Physical Installation",
    description: "CEC accredited electricians mount panels, install the solar inverter, and complete electrical safety checks.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    actionLabel: "Submit Installation Proofs",
    requiredActions: [
      { label: "Installed Solar Array Image", fileType: "image", required: true },
      { label: "Inverter Mounting Image", fileType: "image", required: true }
    ],
    slaDays: 3,
    enabled: true
  },
  {
    stepNumber: 9,
    title: "Electrical Safety Inspection (CES)",
    description: "Independent electrical inspector reviews wiring compliance and signs off the Certificate of Electrical Safety.",
    assignedTo: "company",
    allowedRoles: ["company"],
    actionLabel: "Upload Safety Certificate",
    requiredActions: [
      { label: "Certificate of Electrical Safety (CES)", fileType: "pdf", required: true }
    ],
    slaDays: 3,
    enabled: true
  },
  {
    stepNumber: 10,
    title: "Digitally Sign STC Assignment Form",
    description: "Digitally sign the SAA certified STC assignment document to finalize points of sale discount.",
    assignedTo: "customer",
    allowedRoles: ["customer"],
    actionLabel: "Sign STC Assignment",
    requiredActions: [
      { label: "Signed STC Form (PDF)", fileType: "pdf", required: true }
    ],
    slaDays: 2,
    enabled: true
  },
  {
    stepNumber: 11,
    title: "Energy Retailer Smart Meter Update",
    description: "EPC submits a meter exchange request to the customer's energy retailer to allow tracking exports.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    actionLabel: "Upload Meter Request Receipt",
    requiredActions: [
      { label: "Meter Update Request Document", fileType: "pdf", required: true }
    ],
    slaDays: 3,
    enabled: true
  },
  {
    stepNumber: 12,
    title: "Final System Handover",
    description: "EPC provides system user manuals, warranty certificates, and performs a live handover checklist.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    actionLabel: "Submit Handover Dossier",
    requiredActions: [
      { label: "Handover Dossier (PDF)", fileType: "pdf", required: true }
    ],
    slaDays: 2,
    enabled: true
  }
];

const IN_STEPS = [
  {
    stepNumber: 1,
    title: "Check Sanctioned Load Eligibility",
    description: "Verify your sanctioned electrical load (in kW) on your DISCOM connection to calculate eligible PM Surya Ghar subsidy capacity.",
    assignedTo: "customer",
    allowedRoles: ["customer"],
    actionLabel: "Submit Sanctioned Load Details",
    requiredActions: [
      { label: "Sanctioned Load (kW)", fileType: "text", required: true }
    ],
    slaDays: 2,
    enabled: true
  },
  {
    stepNumber: 2,
    title: "Submit Latest Electricity Bill",
    description: "Upload your latest state DISCOM utility electricity bill (showing consumer number) to authorize feasibility.",
    assignedTo: "customer",
    allowedRoles: ["customer"],
    actionLabel: "Upload DISCOM Bill",
    requiredActions: [
      { label: "DISCOM Bill (PDF)", fileType: "pdf", required: true }
    ],
    slaDays: 2,
    enabled: true
  },
  {
    stepNumber: 3,
    title: "Upload Terrace Area Photos",
    description: "Provide roof measurements or photos to ensure a shadow-free area for panel layout structure.",
    assignedTo: "customer",
    allowedRoles: ["customer"],
    actionLabel: "Upload Rooftop Photo",
    requiredActions: [
      { label: "Terrace Area Photo", fileType: "image", required: true }
    ],
    slaDays: 2,
    enabled: true
  },
  {
    stepNumber: 4,
    title: "Verify Customer Details & Eligibility",
    description: "Admin reviews consumer number, name match on bill, and GEDA/DISCOM rooftop feasibility parameters.",
    assignedTo: "company",
    allowedRoles: ["company"],
    actionLabel: "Approve Eligibility & Feasibility",
    requiredActions: [
      { label: "Feasibility Verification Notes", fileType: "text", required: true }
    ],
    slaDays: 2,
    enabled: true
  },
  {
    stepNumber: 5,
    title: "EPC Partner Acceptance",
    description: "EPC Partner claims the order and locks assignment from the FCFS open bid pool.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    actionLabel: "Accept Order Allocation",
    requiredActions: [
      { label: "Acceptance Commitment Note", fileType: "text", required: true }
    ],
    slaDays: 2,
    enabled: true
  },
  {
    stepNumber: 6,
    title: "Technical Site Survey & Design",
    description: "EPC partner conducts physical structure survey and submits shadow-free layout structure blueprint.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    actionLabel: "Upload Site Survey Report",
    requiredActions: [
      { label: "Site Layout Blueprint (PDF)", fileType: "pdf", required: true }
    ],
    slaDays: 3,
    enabled: true
  },
  {
    stepNumber: 7,
    title: "Submit DISCOM Net-Metering Application",
    description: "EPC partner registers net-metering application on GEDA/DISCOM portal on behalf of consumer.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    actionLabel: "Upload Registration Proof",
    requiredActions: [
      { label: "Net-Meter Application Receipt (PDF)", fileType: "pdf", required: true }
    ],
    slaDays: 3,
    enabled: true
  },
  {
    stepNumber: 8,
    title: "Solar Panel & Inverter Installation",
    description: "Physical mounting of structures, solar panels and net-meter grid tie inverter wiring.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    actionLabel: "Upload Installation Photos",
    requiredActions: [
      { label: "Solar Panels Layout photo", fileType: "image", required: true },
      { label: "Grid Tie Inverter photo", fileType: "image", required: true }
    ],
    slaDays: 4,
    enabled: true
  },
  {
    stepNumber: 9,
    title: "DISCOM Net-Meter Inspector Testing",
    description: "DISCOM engineers test the solar plant wiring compliance and swap the utility meter with a bidirectional net-meter.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    actionLabel: "Upload Net-Metering Agreement",
    requiredActions: [
      { label: "DISCOM Signed Net-Meter Agreement (PDF)", fileType: "pdf", required: true }
    ],
    slaDays: 5,
    enabled: true
  },
  {
    stepNumber: 10,
    title: "Project Completion Report (PCR) Submission",
    description: "EPC uploads completion document photos on the national solar portal to release central government subsidy.",
    assignedTo: "epc-partner",
    allowedRoles: ["epc-partner"],
    actionLabel: "Upload PCR Receipt",
    requiredActions: [
      { label: "National Portal PCR Receipt (PDF)", fileType: "pdf", required: true }
    ],
    slaDays: 3,
    enabled: true
  },
  {
    stepNumber: 11,
    title: "Final Verification & Project Closure",
    description: "Admin verifies subsidy dispatch token and closes the live tracking status.",
    assignedTo: "company",
    allowedRoles: ["company"],
    actionLabel: "Approve PCR & Close Project",
    requiredActions: [
      { label: "Closure Clearance Certificate", fileType: "pdf", required: true }
    ],
    slaDays: 2,
    enabled: true
  }
];

const seedAll = async () => {
  try {
    console.log("Connecting to Database:", MONGO_URI);
    await mongoose.connect(MONGO_URI);

    const projectTypes = ["residential", "commercial", "group", "common-meter"];

    // ── Seed Australia ──
    const auJourneys = projectTypes.map((type) => {
      const typeLabel = type.charAt(0).toUpperCase() + type.slice(1) + " Solar Journey";
      return {
        projectType: type,
        projectTypeLabel: typeLabel,
        enabled: true,
        description: `Premium end-to-end Australia solar tracking for ${type} connections.`,
        epcSelectionType: "CUSTOMER_SELECT", // Australia BDE Suggestion Flow
        steps: AU_STEPS.map((s, idx) => ({ ...s, id: `au-${type}-step-${idx + 1}` }))
      };
    });

    const auSettingsKey = "australia_all_all";
    await OrderJourneySettings.deleteOne({ _settingsKey: auSettingsKey });
    await OrderJourneySettings.create({
      country: "australia",
      state: "all",
      district: "all",
      _settingsKey: auSettingsKey,
      journeys: auJourneys
    });
    console.log("✅ Seeded Australia Journeys (CUSTOMER_SELECT flow)!");

    // ── Seed India ──
    const inJourneys = projectTypes.map((type) => {
      const typeLabel = type.charAt(0).toUpperCase() + type.slice(1) + " Solar Journey";
      return {
        projectType: type,
        projectTypeLabel: typeLabel,
        enabled: true,
        description: `PM Surya Ghar Yojana GEDA/DISCOM feasibility tracking for ${type} connections.`,
        epcSelectionType: "FCFS", // India FCFS Flow
        steps: IN_STEPS.map((s, idx) => ({ ...s, id: `in-${type}-step-${idx + 1}` }))
      };
    });

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
