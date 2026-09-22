import os

qualification_schema = '''import mongoose from 'mongoose';

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
'''

kyc_requirement_schema = '''import mongoose from 'mongoose';

const KycRequirementSchema = new mongoose.Schema({
  country: { type: String, required: true, lowercase: true },
  state: { type: String, required: true },
  documentName: { type: String, required: true },
  description: { type: String, default: "" },
  isRequired: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('KycRequirement', KycRequirementSchema);
'''

with open('Website_Backend/src/models/QualificationCategory.js', 'w', encoding='utf-8') as f:
    f.write(qualification_schema)

with open('Website_Backend/src/models/KycRequirement.js', 'w', encoding='utf-8') as f:
    f.write(kyc_requirement_schema)

print("Created Qualification and KYC Requirement Schemas")
