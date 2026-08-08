import mongoose from 'mongoose';

const EpcBulkUploadSettingsSchema = new mongoose.Schema({
  country: { type: String, required: true },
  state: { type: String, default: 'All' },
  district: { type: String, default: 'All' },
  projectType: { type: String, default: 'All' },
  epcCategory: { type: String, default: 'All' },
  fields: [
    {
      fieldName: { type: String, required: true },
      fieldLabel: { type: String, required: true },
      isMandatory: { type: Boolean, default: false },
      dataType: { type: String, enum: ['string', 'number', 'email', 'phone', 'boolean', 'date'], default: 'string' }
    }
  ]
}, { timestamps: true });

// Prevent exact duplicate configurations
EpcBulkUploadSettingsSchema.index({ country: 1, state: 1, district: 1, projectType: 1, epcCategory: 1 }, { unique: true });

export default mongoose.model('EpcBulkUploadSettings', EpcBulkUploadSettingsSchema);
