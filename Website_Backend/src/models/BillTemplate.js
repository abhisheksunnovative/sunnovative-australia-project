import mongoose from 'mongoose';

const billTemplateSchema = new mongoose.Schema({
  discomName: { type: String, required: true, trim: true, unique: true },
  country: { type: String, enum: ['australia', 'india'], required: true },
  isActive: { type: Boolean, default: false },   // false by default ab — sirf approve hone par true hoga
  status: { type: String, enum: ['pending_review', 'approved', 'rejected'], default: 'pending_review' },
  engineVersion: { type: String, default: 'unknown' },
  anchorKeywords: [{ type: String, required: true }],
  extractionRules: [{
    field: { type: String, required: true },
    regex: { type: String, required: true },
    flags: { type: String, default: 'i' },
    type: { type: String, enum: ['string', 'number', 'date', 'boolean'], default: 'string' },
    required: { type: Boolean, default: false }
  }]
}, { timestamps: true });

const BillTemplate = mongoose.model('BillTemplate', billTemplateSchema);
export { BillTemplate };
export default BillTemplate;
