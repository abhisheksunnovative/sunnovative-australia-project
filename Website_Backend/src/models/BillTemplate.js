import mongoose from 'mongoose';

const BillTemplateSchema = new mongoose.Schema(
  {
    discom_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Discom', required: true },
    consumer_type: { type: String, default: 'Residential' },
    tariff_code: { type: String },
    version: { type: String, required: true },
    effective_from: { type: Date, required: true },
    effective_to: { type: Date },
    active: { type: Boolean, default: true },
    source_document: { type: String },
    sample_file: { type: String },
    OCR_aliases_json: { type: Object, default: {} },
    layout_rules_json: { type: Object, default: {} },
    validation_rules_json: { type: Object, default: {} }
  },
  { timestamps: true }
);

export const BillTemplate = mongoose.model('BillTemplate', BillTemplateSchema);
