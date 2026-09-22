import mongoose from 'mongoose';

const QualificationCategorySchema = new mongoose.Schema({
  country: { type: String, required: true, lowercase: true },
  state: { type: String, required: true },
  partnerType: { type: String, default: "New EPC Partner" },
  minExperienceYears: { type: Number, default: 0 },
  projectType: { type: String, default: "Residential" },
  minKW: { type: Number, default: 1 },
  maxKW: { type: Number, default: 10 },
  minInstallersRequired: { type: Number, default: 1 },
  maxProjectsPerMonth: { type: Number, default: 5 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('QualificationCategory', QualificationCategorySchema);
