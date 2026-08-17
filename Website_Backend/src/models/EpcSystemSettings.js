import mongoose from 'mongoose';

const SettingRuleSchema = new mongoose.Schema({
  country: { type: String, required: true },
  state: { type: String, required: true },
  projectType: { type: String, required: true },

  // Section A: Overdue Override Settings
  overdueSettings: {
    limit: { type: Number, default: 3 },
    warningThresholds: { type: Number, default: 1 },
    minimumRatingRequired: { type: Number, default: 3.5 }
  },

  // Section B: Trust Badge Settings (For both FCFS and Customer Select modes)
  trustBadgeSettings: {
    // Shared
    counterEnabled: { type: Boolean, default: true },
    ratePerLead: { type: Number, default: 100 }, // New field for payment gateway

    // FCFS specific
    undertakingText: { type: String, default: 'I agree to maintain a 3.0+ rating and zero overdue projects.' },
    maxLeadsLimit: { type: Number, default: 50 }, // Countdown counter
    priorityLeadAllocationMinutes: { type: Number, default: 60 },
    
    // Customer Select specific
    maxProfileViewsLimit: { type: Number, default: 50 }, // Countdown counter
  },

  // Section C: Customer Selects EPC Display Logic (Advanced Allocation Engine)
  customerSelectEpcSettings: {
    totalEpcCards: { type: Number, default: 5 },
    fairRotationEnabled: { type: Boolean, default: true }
    // Dynamic ratio algorithm is handled in code logic (100%, 50%, 60%, 80%)
  }
}, { _id: false });

const EpcSystemSettingsSchema = new mongoose.Schema({
  singletonKey: { type: String, default: 'EPC_SYSTEM_SETTINGS', unique: true },
  
  // New Array for drill-down settings
  regionRules: [SettingRuleSchema],

  // Fallbacks / Legacy
  trustBadgeSettings: {
    signupFee: { type: Number, default: 5000 },
    validityMonths: { type: Number, default: 12 },
    autoRenewal: { type: Boolean, default: false },
    benefits: { type: [String], default: ["Priority Lead Allocation", "Exclusive Support", "Premium Badge on Customer Portal"] }
  }

}, { timestamps: true });

EpcSystemSettingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ singletonKey: 'EPC_SYSTEM_SETTINGS' });
  if (!doc) doc = await this.create({ singletonKey: 'EPC_SYSTEM_SETTINGS', regionRules: [] });
  return doc;
};

export default mongoose.model('EpcSystemSettings', EpcSystemSettingsSchema);
