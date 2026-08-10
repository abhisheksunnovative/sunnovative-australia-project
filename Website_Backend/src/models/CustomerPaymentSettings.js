import mongoose from "mongoose";

const paymentMilestoneSchema = new mongoose.Schema({
  label: { type: String, required: true }, // e.g. "Advance", "On Installation", "Final"
  percentage: { type: Number, required: true }, // must sum to 100 across milestones
}, { _id: false });

const projectTypePaymentConfigSchema = new mongoose.Schema({
  projectType: { type: String, required: true },
  paymentMode: {
    type: String,
    enum: ["ADVANCE_ESCROW", "PAYMENT_LATER"],
    default: "ADVANCE_ESCROW",
  },
  // used only when paymentMode = ADVANCE_ESCROW
  escrow: {
    mode: { type: String, enum: ["TOKEN", "PERCENTAGE", "FULL", "MILESTONES"], default: "PERCENTAGE" },
    tokenAmount: { type: Number, default: 0 },
    percentage: { type: Number, default: 100 }, // used when mode = PERCENTAGE
    milestones: { type: [paymentMilestoneSchema], default: [] }, // used when mode = MILESTONES
    isDummyGateway: { type: Boolean, default: true }, // ALWAYS true for now — real gateway later just flips this
  },
}, { _id: false });

const customerPaymentSettingsSchema = new mongoose.Schema({
  country: { type: String, required: true, unique: true, default: "australia" },
  projectConfigs: { type: [projectTypePaymentConfigSchema], default: [] },
}, { timestamps: true });

export default mongoose.model("CustomerPaymentSettings", customerPaymentSettingsSchema);
