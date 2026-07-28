import mongoose from "mongoose";

// Individual step completion record
const StepCompletionSchema = new mongoose.Schema({
  stepId: { type: String, required: true },
  stepNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  assignedTo: { type: String, default: "company" },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "skipped", "blocked"],
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
      enum: ["residential", "commercial", "group", "common-meter"],
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
    country: { type: String, default: "india" },
    state: { type: String, default: "Gujarat" },

    // ── Geo Location ──────────────────────────────────────────
    location: { type: GeoLocationSchema, default: () => ({}) },
    rooftopPhoto: { type: String, default: "" },
    preferredInstallDate: { type: Date, default: null },
    isInstallDateFixed: { type: Boolean, default: false },

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
    steps: { type: [StepCompletionSchema], default: [] },

    // ── Overall Status ────────────────────────────────────────
    status: {
      type: String,
      enum: [
        // Legacy statuses
        "lead", "qualified", "surveyed", "in-progress", "completed", "closed", "cancelled", "on-hold",
        // New ERP Journey Statuses
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
      enum: ["company", "epc-partner", "customer", "none"],
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