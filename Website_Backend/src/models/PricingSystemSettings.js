import mongoose from "mongoose";

const pricingSystemSettingsSchema = new mongoose.Schema({
  country: { type: String, required: true },
  projectType: { type: String, default: null }, // null = country-wide default
  system: { type: String, enum: ['company', 'epc'], default: 'company' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("PricingSystemSettings", pricingSystemSettingsSchema);
