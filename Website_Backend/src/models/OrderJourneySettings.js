import mongoose from "mongoose";

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
  estimatedDays: { type: Number, default: 1 }, // Legacy field, keeping for compatibility
  slaDays: { type: Number, default: 1 }, // New SLA field
  milestoneType: { 
    type: String, 
    enum: ['standard', 'customer_payment', 'epc_advance', 'rating', 'stc_minting', 'doc_upload'], 
    default: 'standard' 
  },
  paymentPercentage: { type: Number, default: 0 },
  visibleToCustomer: { type: Boolean, default: true },
  visibleToEpc: { type: Boolean, default: true },
  isMandatory: { type: Boolean, default: false },
  actionLabel: { type: String, default: "" }, // CTA label e.g. "Upload Survey Report"
  notifyCustomer: { type: Boolean, default: true },
  notifyEPC: { type: Boolean, default: false },
  notifyAdmin: { type: Boolean, default: false }, // New field
  notificationMedium: { 
    type: [String], 
    enum: ["in-app", "email", "sms", "whatsapp"],
    default: ["email"] 
  }, // Deep notification setting
  requiresDocumentUpload: { type: Boolean, default: false }, // Legacy, keep for backward compatibility
  documentRequirements: [String], // Support multiple documents
  documentName: { type: String, default: "" }, // Legacy
  requiresAdminApproval: { type: Boolean, default: false }, // New field
  completionCondition: { 
    type: String, 
    enum: ["manual", "document_upload", "admin_approval"],
    default: "manual"
  }, // New field
  // --- OVERDUE SETTINGS ---
  warningDays: { type: Number, default: 0 }, // Days before SLA to send warning
  redAlertDays: { type: Number, default: 0 }, // Days after SLA to mark critical
  autoNotifyOverdue: { type: Boolean, default: false }, // Auto-notify customer/BDE on overdue
  escalateToAdminAfterDays: { type: Number, default: 0 } // Escalate to Admin after N days overdue
}, { _id: false });

const ProjectJourneySchema = new mongoose.Schema({
  projectType: {
    type: String,
    required: true,
    // e.g. "residential", "commercial", "group", "common-meter"
  },
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
    discom: { type: String, default: "all" },
    _settingsKey: { type: String }, // To prevent E11000 dup key error from old index
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

export const OrderJourneySettings = mongoose.model(
  "OrderJourneySettings",
  OrderJourneySettingsSchema
);