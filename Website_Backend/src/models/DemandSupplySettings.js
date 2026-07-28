import mongoose from "mongoose";

const regionalConfigSchema = new mongoose.Schema({
  country: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  projectType: { type: String, default: 'All' },
  isAcceptancePaused: { type: Boolean, default: false }, // Admin override
  supplyLimitPercentageOverride: { type: Number, default: null }, // Regional override
}, { timestamps: true });

// A singleton to hold all global configs and regional configs in one document
const demandSupplySettingsSchema = new mongoose.Schema({
  singletonKey: { type: String, default: "DEMAND_SUPPLY_SETTINGS", unique: true },
  rollingPeriodDays: { type: Number, default: 7 }, // Number of Days to Track Demand & Supply
  supplyLimitPercentage: { type: Number, default: 90 }, // Replace targetMatchPercentage
  autoEnableWalletRecharge: { type: Boolean, default: true },
  autoEnableProjectAllocation: { type: Boolean, default: true },
  regions: { type: [regionalConfigSchema], default: [] }
}, { timestamps: true });

demandSupplySettingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ singletonKey: "DEMAND_SUPPLY_SETTINGS" });
  if (!doc) doc = await this.create({ singletonKey: "DEMAND_SUPPLY_SETTINGS" });
  return doc;
};

export default mongoose.model("DemandSupplySettings", demandSupplySettingsSchema);
