import mongoose from "mongoose";

// Individual step completion record
const StepCompletionSchema = new mongoose.Schema({
  stepId: { type: String, required: true },
  stepNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  assignedTo: { type: String, enum: ['customer', 'epc-partner', 'company', 'bde'], default: "company" },
  allowedRoles: { type: [String], default: [] },
  milestoneType: { 
    type: String, 
    enum: ['standard', 'customer_payment', 'epc_advance', 'rating', 'stc_minting', 'doc_upload'], 
    default: 'standard' 
  },
  requiresAdminApproval: { type: Boolean, default: false },
  completionCondition: { type: String, enum: ["manual", "document_upload", "admin_approval"], default: "manual" },
  paymentPercentage: { type: Number, default: 0 },
  visibleToCustomer: { type: Boolean, default: true },
  visibleToEpc: { type: Boolean, default: true },
  slaDays: { type: Number, default: 2 },
  status: {
    type: String,
    enum: ["pending", "in-progress", "awaiting-approval", "completed", "skipped", "blocked"],
    default: "pending",
  },
  completedAt: { type: Date, default: null },
  completedBy: { type: String, default: "" }, // name/email of who completed
  evidenceUrl: { type: String, default: "" }, // photo/doc upload URL
  evidenceNote: { type: String, default: "" },
  pendingActionAlert: { type: String, default: "" }, // e.g. "Survey report upload karo"
  isMandatory: { type: Boolean, default: false },
  requiresDoc: { type: Boolean, default: false },
  requiredAction: { type: String, default: "" },
  isCustomerAction: { type: Boolean, default: false },
  // --- OVERDUE TRACKING ---
  startedAt: { type: Date, default: null }, // When the step transitioned to 'in-progress' or 'pending' as the current step
  isOverdue: { type: Boolean, default: false },
  daysOverdue: { type: Number, default: 0 },
  isCritical: { type: Boolean, default: false }, // If past redAlertDays
  overdueNotifiedAt: { type: Date, default: null },
  escalatedToAdminAt: { type: Date, default: null },
  // --- ADMIN CONTROL & REUPLOAD FIELDS ---
  adminNote: { type: String, default: "" },
  adminNoteBy: { type: String, default: "" },
  adminNoteAt: { type: Date, default: null },
  reuploadRequested: { type: Boolean, default: false },
  reuploadReason: { type: String, default: "" },
  canBeCompletedByBDE: { type: Boolean, default: false },
  externalParty: { type: String, default: "" },
  requiredActions: [
    {
      label: { type: String, required: true },
      fileType: { type: String, enum: ["pdf", "image", "text"], default: "pdf" },
      required: { type: Boolean, default: true }
    }
  ],
  uploadedActions: [
    {
      label: { type: String, required: true },
      fileType: { type: String, enum: ["pdf", "image", "text"], default: "pdf" },
      value: { type: String, default: "" },
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  notifyCustomer: { type: Boolean, default: true },
  notifyEPC: { type: Boolean, default: false },
  notifyAdmin: { type: Boolean, default: false }
}, { _id: false });

// Geo location schema
const GeoLocationSchema = new mongoose.Schema({
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  address: { type: String, default: "" },
  district: { type: String, default: "" },
  discom: { type: String, default: "" }, // Discom company mapping
  taluka: { type: String, default: "" },
  pincode: { type: String, default: "" },
  city: { type: String, default: "" },
  state: { type: String, default: "Gujarat" },
  capturedAt: { type: Date, default: null },
  captureMethod: {
    type: String,
    enum: ["gps-auto", "manual", "address-lookup"],
    default: "manual",
  },
}, { _id: false });

const ProjectOrderSchema = new mongoose.Schema(
  {
    // ── Order Identity ────────────────────────────────────────
    orderNumber: { type: String, unique: true }, // e.g. SUN-2026-0001
    projectType: {
      type: String,
      enum: ["residential", "commercial", "group", "common-meter", "solar-battery", "farm-rural", "community-strata"],
      required: true,
    },
    projectTypeLabel: { type: String, default: "" },

    // ── Customer Info ─────────────────────────────────────────
    customerName: { type: String, required: true },
    customerMobile: { type: String, required: true },
    customerEmail: { type: String, default: "" },
    customerId: { type: String, default: null }, // linked customer login

    // ── Project Details ───────────────────────────────────────
    systemSizeKW: { type: Number, default: 0 },
    monthlyBillAmount: { type: Number, default: 0 },
    estimatedSubsidy: { type: Number, default: 0 },
    totalProjectCost: { type: Number, default: 0 },
    preferredSolarBrand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    preferredInverterBrand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    selectedSolarBrand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    selectedInverterBrand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    country: { type: String, default: "india" },
    state: { type: String, default: "Gujarat" },

    // ── Geo Location ──────────────────────────────────────────
    location: { type: GeoLocationSchema, default: () => ({}) },
    rooftopPhoto: { type: String, default: "" },
    preferredInstallDate: { type: Date, default: null },
    isInstallDateFixed: { type: Boolean, default: false },

    // ── Installation Date Negotiation Flow ────────────────────
    installDateNegotiation: {
      proposedDateByBde: { type: Date, default: null },
      
      // EPC's Response
      epcStatus: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
      epcNote: { type: String, default: "" },
      epcProposedAlternateDate: { type: Date, default: null },
      
      // Customer's Response
      customerStatus: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
      customerNote: { type: String, default: "" },
      customerProposedAlternateDate: { type: Date, default: null },
      
      // Final Outcome
      isFinalized: { type: Boolean, default: false },
      finalInstallationDate: { type: Date, default: null }
    },

    // ── Payment (Signup Token) ────────────────────────────────
    paymentStatus: { type: String, enum: ["pending", "paid", "not_required"], default: "not_required" },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },

    // ── Assignment ────────────────────────────────────────────
    assignedEPCId: { type: String, default: null },
    assignedEPCName: { type: String, default: "" },
    assignedBde: { type: mongoose.Schema.Types.ObjectId, ref: 'BDE', default: null },

    // ── Journey & Step Tracking ───────────────────────────────
    currentStepNumber: { type: Number, default: 1 },
    currentStepTitle: { type: String, default: "Lead Captured" },
    completionPercentage: { type: Number, default: 0 },
    customerRating: { type: Number, default: 0 },
    customerReviewComment: { type: String, default: "" },
    customerRatedAt: { type: Date, default: null },
    steps: { type: [StepCompletionSchema], default: [] },

    // ── Overall Status ────────────────────────────────────────
    status: {
      type: String,
      enum: [
        // Legacy statuses
        "lead", "qualified", "surveyed", "in-progress", "completed", "closed", "cancelled", "on-hold",
        // New ERP Journey Statuses
        "awaiting-admin-confirmation",
        "Enquiry Created",
        "Open For EPC",
        "EPC Accepted",
        "Acceptance Fee Paid",
        "Document Pending",
        "Documents Uploaded",
        "Customer Payment Pending",
        "Customer Payment Received",
        "Order Created",
        "Installation Scheduled",
        "Work In Progress",
        "Installation Completed",
        "Verification Pending",
        "Customer Approval",
        "Project Completed",
        "10% Payment Released",
        "Warranty Activated"
      ],
      default: "Enquiry Created",
    },

    // ── Payment & Escrow Tracking ─────────────────────────────
    escrowPayment: {
      totalAmountPaid: { type: Number, default: 0 },
      amountReleasedToEpc: { type: Number, default: 0 },
      amountHeldInEscrow: { type: Number, default: 0 },
      isFullyReleased: { type: Boolean, default: false }
    },

    // ── Warranty Details ──────────────────────────────────────
    warrantyDetails: {
      isActivated: { type: Boolean, default: false },
      activatedOn: { type: Date, default: null },
      validUntil: { type: Date, default: null }
    },

    // ── Pending Action ────────────────────────────────────────
    pendingActionAlert: { type: String, default: "" },
    pendingActionFor: {
      type: String,
      enum: ["company", "epc-partner", "customer", "bde", "admin", "none"],
      default: "company",
    },
    // --- OVERDUE TRACKING (Root level for quick query) ---
    hasOverdueSteps: { type: Boolean, default: false },
    lastActivityAt: { type: Date, default: Date.now },

    // ── Notifications sent ────────────────────────────────────
    notificationLog: [
      {
        sentAt: Date,
        type: String, // "sms" | "email"
        recipient: String,
        message: String,
      },
    ],

    // ── Admin Notes ───────────────────────────────────────────
    adminNotes: { type: String, default: "" },
    internalTags: [String],

    // STC Tracking (Australia Specific)
    stcDetails: {
      systemSizeKw: { type: Number, default: 0 },
      postcode: { type: String, default: "" },
      zone: { type: Number, default: 0 },
      deemingYears: { type: Number, default: 0 },
      stcs: { type: Number, default: 0 },
      stcPriceUsed: { type: Number, default: 0 },
      stcRebateAmount: { type: Number, default: 0 },
    },
    stcStatus: {
      assignmentFormSigned: { type: Boolean, default: false },
      assignmentFormSignedAt: Date,
      customerSignatureUrl: String,
      cecProductsVerified: { type: Boolean, default: false },
      cesCertificateUploaded: { type: Boolean, default: false },
      stcsCreatedInRegistry: { type: Boolean, default: false },
      stcsCreatedDate: Date,
      stcsTraded: { type: Boolean, default: false },
      stcsTradedDate: Date,
      amountRecovered: { type: Number, default: 0 }
    },
    // EPC Payout Flow (Customer -> Admin -> EPC)
    epcPayout: {
      percentage: { type: Number, default: 90 },
      amount: { type: Number, default: 0 },
      qrCodeUrl: { type: String, default: "" },
      status: { 
        type: String, 
        enum: ["not-started", "qr-shared", "epc-marked-received", "admin-confirmed"], 
        default: "not-started" 
      },
      epcProofUrl: { type: String, default: "" },
      epcMarkedAt: { type: Date, default: null },
      adminConfirmedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

// Auto-generate order number before save
ProjectOrderSchema.pre("save", async function () {
  if (!this.orderNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model("ProjectOrder").countDocuments();
    this.orderNumber = `SUN-${year}-${String(count + 1).padStart(4, "0")}`;
  }
});

// Index for fast queries
ProjectOrderSchema.index({ customerMobile: 1 });
ProjectOrderSchema.index({ status: 1 });
ProjectOrderSchema.index({ projectType: 1 });
ProjectOrderSchema.index({ "location.district": 1 });
ProjectOrderSchema.index({ assignedEPCId: 1 });


export const ProjectOrder = mongoose.model("ProjectOrder", ProjectOrderSchema);
