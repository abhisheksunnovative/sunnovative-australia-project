import mongoose from 'mongoose';

const epcPlanSchema = new mongoose.Schema({
  name: { type: String, enum: ['Standard', 'Professional', 'Enterprise'], required: true, unique: true },
  minYearsExperience: { type: Number, required: true },
  loginScope: { type: String, enum: ['District', 'Cluster', 'State'], required: true },
  maxDistricts:      { type: Number, default: 1 },
  maxOrdersPerMonth: { type: Number, default: 10 },
  acceptanceFees: [{ projectType: String, fee: { type: Number, default: 0 } }],
  monthlyFee:  { type: Number, default: 0 },
  annualFee:   { type: Number, default: 0 },
  features:    [{ type: String }],
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('EpcPlan', epcPlanSchema);