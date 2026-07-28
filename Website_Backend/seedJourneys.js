import mongoose from "mongoose";
import dotenv from "dotenv";

// Assuming we run this from Website_Backend root, so load env
dotenv.config();

// Define the nested Schemas exactly as in OrderJourneySettings.js
const JourneyStepSchema = new mongoose.Schema({
  id: { type: String, required: true },
  stepNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  assignedTo: {
    type: String,
    enum: ["company", "epc-partner", "customer", "both"],
    default: "company",
  },
  enabled: { type: Boolean, default: true },
  estimatedDays: { type: Number, default: 1 },
  slaDays: { type: Number, default: 1 },
  isMandatory: { type: Boolean, default: false },
  actionLabel: { type: String, default: "" },
  notifyCustomer: { type: Boolean, default: true },
  notifyEPC: { type: Boolean, default: false },
  notifyAdmin: { type: Boolean, default: false },
  requiresDocumentUpload: { type: Boolean, default: false },
  documentName: { type: String, default: "" },
  requiresAdminApproval: { type: Boolean, default: false },
  completionCondition: { 
    type: String, 
    enum: ["manual", "document_upload", "admin_approval"],
    default: "manual"
  },
}, { _id: false });

const ProjectJourneySchema = new mongoose.Schema({
  projectType: { type: String, required: true },
  projectTypeLabel: { type: String, default: "" },
  enabled: { type: Boolean, default: true },
  description: { type: String, default: "" },
  signupToken: {
    enabled: { type: Boolean, default: false },
    amount: { type: Number, default: 0 }
  },
  epcSelectionType: {
    type: String,
    enum: ["FCFS", "CUSTOMER_SELECT"],
    default: "FCFS"
  },
  steps: { type: [JourneyStepSchema], default: [] },
}, { _id: false });

const OrderJourneySettingsSchema = new mongoose.Schema(
  {
    country: { type: String, default: "india" },
    state: { type: String, default: "all" },
    district: { type: String, default: "all" },
    _settingsKey: { type: String },
    journeys: { type: [ProjectJourneySchema], default: [] },
    globalSettings: {
      autoProgressOnCompletion: { type: Boolean, default: true },
      requireEvidenceAtEachStep: { type: Boolean, default: false },
      sendSMSNotifications: { type: Boolean, default: true },
      sendEmailNotifications: { type: Boolean, default: true },
      allowEPCToUpdateSteps: { type: Boolean, default: true },
      customerPortalVisible: { type: Boolean, default: true },
      minBookingDays: { type: Number, default: 5 },
    },
  },
  { timestamps: true }
);

const OrderJourneySettings = mongoose.model("OrderJourneySettings", OrderJourneySettingsSchema);

// Data mappings
const INDIA_STEPS = [
  // Customer
  { title: "Check Subsidy Eligibility", role: "customer" },
  { title: "Submit Electricity Bill", role: "customer", doc: "Electricity Bill" },
  { title: "Upload Property Details", role: "customer", doc: "Property Details" },
  { title: "Select Installation Date", role: "customer" },
  { title: "Make Payment", role: "customer" },
  // Admin
  { title: "Verify Customer Eligibility", role: "company" },
  { title: "Verify Documents", role: "company" },
  { title: "Allocate EPC Partner", role: "company" },
  { title: "Process Subsidy Application", role: "company" },
  { title: "Monitor Project Progress", role: "company" },
  // EPC
  { title: "Accept Project", role: "epc-partner" },
  { title: "Conduct Site Survey", role: "epc-partner", doc: "Site Survey Report" },
  { title: "Submit Proposal", role: "epc-partner", doc: "Project Proposal" },
  { title: "Install Solar System", role: "epc-partner" },
  { title: "Upload Installation Documents", role: "epc-partner", doc: "Installation Photos" },
  { title: "Complete Net Meter Process", role: "epc-partner" },
  { title: "Close Project", role: "epc-partner" }
];

const AUSTRALIA_STEPS = [
  // Customer
  { title: "Submit Enquiry", role: "customer" },
  { title: "Upload Electricity Bill", role: "customer", doc: "Electricity Bill" },
  { title: "Approve Proposal", role: "customer" },
  { title: "Confirm Installation", role: "customer" },
  { title: "Complete Payment", role: "customer" },
  // Admin
  { title: "Verify Customer Details", role: "company" },
  { title: "Assign Certified Installer", role: "company" },
  { title: "Track Installation", role: "company" },
  { title: "Quality Review", role: "company" },
  // EPC
  { title: "Accept Project", role: "epc-partner" },
  { title: "Site Assessment", role: "epc-partner", doc: "Site Assessment Report" },
  { title: "Installation", role: "epc-partner" },
  { title: "Commissioning", role: "epc-partner" },
  { title: "Upload Completion Report", role: "epc-partner", doc: "Completion Report" }
];

const NZ_STEPS = [
  { title: "Submit Enquiry", role: "customer" },
  { title: "Property Verification", role: "customer" },
  { title: "Proposal Approval", role: "customer" },
  { title: "Installation Confirmation", role: "customer" },
  { title: "Project Completion", role: "customer" },
  { title: "Lead Verification", role: "company" },
  { title: "Installer Assignment", role: "company" },
  { title: "Installation Monitoring", role: "company" },
  { title: "Site Survey", role: "epc-partner", doc: "Site Survey" },
  { title: "Installation", role: "epc-partner" },
  { title: "Quality Inspection", role: "epc-partner" },
  { title: "Handover", role: "epc-partner", doc: "Handover Docs" }
];

const UK_STEPS = [
  { title: "Submit Enquiry", role: "customer" },
  { title: "Property Details", role: "customer", doc: "Property Details" },
  { title: "Approve Quotation", role: "customer" },
  { title: "Installation Booking", role: "customer" },
  { title: "Completion Confirmation", role: "customer" },
  { title: "Eligibility Review", role: "company" },
  { title: "Installer Assignment", role: "company" },
  { title: "Project Monitoring", role: "company" },
  { title: "Site Survey", role: "epc-partner" },
  { title: "Installation", role: "epc-partner" },
  { title: "Testing & Commissioning", role: "epc-partner" },
  { title: "Completion Documentation", role: "epc-partner", doc: "MCS Certificate" }
];

const USA_STEPS = [
  { title: "Submit Enquiry", role: "customer" },
  { title: "Financing Selection", role: "customer" },
  { title: "Proposal Approval", role: "customer" },
  { title: "Installation Scheduling", role: "customer" },
  { title: "Final Payment", role: "customer" },
  { title: "Customer Verification", role: "company" },
  { title: "Finance Verification", role: "company" },
  { title: "Installer Assignment", role: "company" },
  { title: "Project Monitoring", role: "company" },
  { title: "Site Inspection", role: "epc-partner" },
  { title: "Installation", role: "epc-partner" },
  { title: "Inspection & Commissioning", role: "epc-partner" },
  { title: "Project Closure", role: "epc-partner", doc: "PTO Document" }
];

const convertToSchema = (rawList) => {
  return rawList.map((step, index) => ({
    id: `step-${Date.now()}-${index}`,
    stepNumber: index + 1,
    title: step.title,
    assignedTo: step.role,
    requiresDocumentUpload: !!step.doc,
    documentName: step.doc || "",
    isMandatory: true,
    enabled: true,
    slaDays: 2
  }));
};

const runSeeder = async () => {
  try {
    const mongoUri = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/sunnovative_ecommerce";
    console.log("Connecting to:", mongoUri);
    await mongoose.connect(mongoUri);

    const countriesData = [
      { id: "india", label: "India", steps: INDIA_STEPS },
      { id: "australia", label: "Australia", steps: AUSTRALIA_STEPS },
      { id: "new-zealand", label: "New Zealand", steps: NZ_STEPS },
      { id: "uk", label: "United Kingdom", steps: UK_STEPS },
      { id: "usa", label: "United States", steps: USA_STEPS },
    ];

    for (const country of countriesData) {
      const key = `${country.id}_all_all`;
      await OrderJourneySettings.deleteOne({ _settingsKey: key });
      
      const newDoc = new OrderJourneySettings({
        country: country.id,
        state: "all",
        district: "all",
        _settingsKey: key,
        journeys: [
          {
            projectType: "residential",
            projectTypeLabel: "Residential Solar Journey",
            enabled: true,
            description: `Default residential journey for ${country.label}`,
            epcSelectionType: "FCFS",
            steps: convertToSchema(country.steps)
          }
        ]
      });
      await newDoc.save();
      console.log(`Seeded settings for ${country.label}`);
    }

    console.log("Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding:", err);
    process.exit(1);
  }
};

runSeeder();
