import mongoose from 'mongoose';

const billTemplateSchema = new mongoose.Schema({
  discomName: { type: String, required: true, trim: true, unique: true },
  country: { type: String, enum: ['australia', 'india'], required: true },
  isActive: { type: Boolean, default: true },   // false by default ab — sirf approve hone par true hoga
  engineVersion: { type: String, default: 'unknown' },
  anchorKeywords: [{ type: String, required: true }],
  extractionRules: [{
    field: { type: String, required: true },
    regex: { type: String, required: true },
    flags: { type: String, default: 'i' },
    type: { type: String, enum: ['string', 'number', 'date', 'boolean', 'split-currency'], default: 'string' },
    required: { type: Boolean, default: false },
    heading: { type: String, default: '' },
    mainData: { type: String, default: '' },
    trailing: { type: String, default: '' },
    previewValue: { type: String, default: '' }
  }]
}, { timestamps: true });

const BillTemplate = mongoose.model('BillTemplate', billTemplateSchema);
export { BillTemplate };
export default BillTemplate;
