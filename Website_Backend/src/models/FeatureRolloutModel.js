import mongoose from "mongoose";

const featureRolloutSchema = new mongoose.Schema({
  featureName: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['Trial', 'Business', 'Stopped'], default: 'Trial' },
  activeLocations: [{
    country: String,
    projectType: String,
    state: String,
    district: String
  }],
  targetAudience: { type: String, enum: ['Customer', 'EPC', 'Both'], default: 'Both' },
  impactTarget: { type: String, enum: ['Customer Conversion', 'EPC Engagement', 'Internal Operations', 'Customers Gained', 'EPCs Gained', 'Overdue Management'], default: 'Customer Conversion' },
  trialDuration: { type: String, enum: ['1 Week', '1 Month', '3 Months', '1 Year', 'Ongoing'], default: 'Ongoing' },
  scopeLevel: { type: String, enum: ['District', 'State', 'Country'], default: 'District' }, // NEW
  metrics: {
    customersCount: { type: Number, default: 0 },
    epcsCount: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 }, // Overall clicks
    clicksHistory: [{ date: String, count: Number }], // NEW: Daily click usage
    ordersAttributed: { type: Number, default: 0 }, // NEW: Total Orders from this feature
    kwAttributed: { type: Number, default: 0 }, // NEW: Total kW from this feature (Orders or Recharges)
    rechargesAttributed: { type: Number, default: 0 }, // NEW: EPC recharges from this feature
    ordersGenerated: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    projectKW: { type: Number, default: 0 },
    successStatus: { type: String, enum: ['Evaluating', 'Success', 'Failure'], default: 'Evaluating' },
    customerResponse: { type: String, default: 'Neutral' }, // e.g. Positive, Negative, Neutral
    epcResponse: { type: String, default: 'Neutral' }
  },
  settings: mongoose.Schema.Types.Mixed,
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date }
}, { timestamps: true });

export const FeatureRollout = mongoose.model("FeatureRollout", featureRolloutSchema);
