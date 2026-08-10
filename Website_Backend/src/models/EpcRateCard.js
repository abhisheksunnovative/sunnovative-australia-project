import mongoose from "mongoose";

const rateTierSchema = new mongoose.Schema({
  minKw: { type: Number, required: true },
  maxKw: { type: Number, required: true }, // use 999999 for "and above"
  ratePerKw: { type: Number, required: true }, // AUD per kW at this tier
}, { _id: false });

const epcRateCardSchema = new mongoose.Schema({
  country: { type: String, required: true, default: "australia" }, // hardcode scope check in controller too
  epcPartner: { type: mongoose.Schema.Types.ObjectId, ref: "EpcPartner", required: true },
  projectType: { type: String, required: true }, // must match OrderJourneySettings.journeys[].projectType
  tiers: { type: [rateTierSchema], default: [] }, // EPC-defined tiered rate/kW
  flatRatePerKw: { type: Number, default: 0 }, // used if tiers empty — simple flat rate
  isActive: { type: Boolean, default: true },
  lastUpdatedByEpc: { type: Date, default: Date.now },
}, { timestamps: true });

epcRateCardSchema.index({ country: 1, epcPartner: 1, projectType: 1 }, { unique: true });

export default mongoose.model("EpcRateCard", epcRateCardSchema);
