import mongoose from "mongoose";

const guardrailSchema = new mongoose.Schema({
  projectType: { type: String, required: true },
  minRatePerKw: { type: Number, required: true },
  maxRatePerKw: { type: Number, required: true },
  suggestedRatePerKw: { type: Number, default: 0 }, // shown to EPC as a hint
}, { _id: false });

const epcRateGuardrailSettingsSchema = new mongoose.Schema({
  country: { type: String, required: true, unique: true, default: "australia" },
  guardrails: { type: [guardrailSchema], default: [] },
  enforceGuardrails: { type: Boolean, default: true }, // if true, EPC cannot save outside band
}, { timestamps: true });

export default mongoose.model("EpcRateGuardrailSettings", epcRateGuardrailSettingsSchema);
