import mongoose from "mongoose";

const demandSupplySettingsSchema = new mongoose.Schema(
  {
    rollingPeriodDays: { type: Number, default: 7 },
    supplyLimitPercentage: { type: Number, default: 30 },
    globalTargetRatio: { type: Number, default: 1.20 },
    globalAlertThreshold: { type: Number, default: 1.00 },
    autoEnableWalletRecharge: { type: Boolean, default: true },
    autoEnableProjectAllocation: { type: Boolean, default: true },
    regions: [
      {
        country: { type: String, required: true },
        state: { type: String, required: true },
        district: { type: String, required: true },
        projectType: { type: String, required: true },
        targetRatio: { type: Number, default: 1.20 },
        alertThreshold: { type: Number, default: 1.00 },
      }
    ]
  },
  { timestamps: true }
);

demandSupplySettingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.model("DemandSupplySettings", demandSupplySettingsSchema);
