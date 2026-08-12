import mongoose from 'mongoose';

const epcPlanSchema = new mongoose.Schema({
  country: { type: String, required: true },
  name: { type: String, required: true },
  minYearsExperience: { type: Number, required: true },
  maxDistricts: { type: Number, default: 1 },
  maxOrdersPerMonth: { type: Number, default: 10 },
  monthlyPrice: { type: Number, default: 0 },
  annualPrice: { type: Number, default: 0 },
  features: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Ensure unique plan name per country
epcPlanSchema.index({ country: 1, name: 1 }, { unique: true });

export default mongoose.model('EpcPlan', epcPlanSchema);