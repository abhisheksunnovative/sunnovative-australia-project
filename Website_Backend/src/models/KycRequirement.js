import mongoose from 'mongoose';

const KycRequirementSchema = new mongoose.Schema({
  country: { type: String, required: true, lowercase: true },
  state: { type: String, required: true },
  documentName: { type: String, required: true },
  description: { type: String, default: "" },
  templateUrl: { type: String, default: "" }, // URL for downloadable template
  isRequired: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('KycRequirement', KycRequirementSchema);
