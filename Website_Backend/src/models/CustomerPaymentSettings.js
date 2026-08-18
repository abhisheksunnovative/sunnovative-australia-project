import mongoose from "mongoose";

const customerPaymentStageSchema = new mongoose.Schema({
  stageKey: { type: String, required: true }, // e.g. "stage1", "stage2", etc.
  label: { type: String, required: true }, // e.g. "Deposit / Booking"
  triggerStepId: { type: String, default: "" }, // associated order journey step ID
  valueType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
  defaultValue: { type: Number, default: 0 },
  maxLimit: { type: Number, default: 100 },
  isMandatory: { type: Boolean, default: true },
  epcCanEdit: { type: Boolean, default: true },
  recipientType: { type: String, enum: ["platform", "epc"], default: "epc" },
  gatewayRequired: { type: Boolean, default: true }
}, { _id: false });

const projectTypePaymentConfigSchema = new mongoose.Schema({
  projectType: { type: String, required: true },
  paymentMode: {
    type: String,
    enum: ["ADVANCE_ESCROW", "PAYMENT_LATER"],
    default: "ADVANCE_ESCROW",
  },
  signupToken: {
    tokenType: { type: String, enum: ["none", "fixed", "epc_scope"], default: "none" },
    fixedAmount: { type: Number, default: 0 }
  },
  paymentStages: { type: [customerPaymentStageSchema], default: [] }
}, { _id: false });

const customerPaymentSettingsSchema = new mongoose.Schema({
  country: { type: String, required: true, unique: true, default: "australia" },
  projectConfigs: { type: [projectTypePaymentConfigSchema], default: [] },
}, { timestamps: true });

export default mongoose.model("CustomerPaymentSettings", customerPaymentSettingsSchema);
