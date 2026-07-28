import mongoose from 'mongoose';

const EpcSystemSettingsSchema = new mongoose.Schema({
  singletonKey: { type: String, default: 'EPC_SYSTEM_SETTINGS', unique: true },

  // Phase 1: Overdue Management (Country & Project Type wise)
  overdueSettings: {
    countryRules: [{
      country: String,
      projectType: String,
      limit: Number
    }],
    defaultMaxAllowableOverdueProjects: { type: Number, default: 3 },
    warningThresholds: { type: Number, default: 1 },
    minimumRatingRequired: { type: Number, default: 3.5 }
  },

  // Phase 2: Trust Badge Management
  trustBadgeSettings: {
    signupFee: { type: Number, default: 5000 },
    validityMonths: { type: Number, default: 12 },
    priorityLeadAllocationMinutes: { type: Number, default: 60 },
    autoRenewal: { type: Boolean, default: false },
    benefits: { type: [String], default: ["Priority Lead Allocation", "Exclusive Support", "Premium Badge on Customer Portal"] },
    rules: { type: [String], default: ["Maintain 4.0+ Rating", "0 Overdue Projects", "100% Quality Check Pass"] },
    acceptanceLetterText: { type: String, default: "I hereby agree to the terms and conditions for the Trusted EPC Badge..." }
  }

}, { timestamps: true });

EpcSystemSettingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ singletonKey: 'EPC_SYSTEM_SETTINGS' });
  if (!doc) doc = await this.create({ singletonKey: 'EPC_SYSTEM_SETTINGS' });
  return doc;
};

export default mongoose.model('EpcSystemSettings', EpcSystemSettingsSchema);
