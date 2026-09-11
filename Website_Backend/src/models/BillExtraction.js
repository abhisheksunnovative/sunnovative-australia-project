import mongoose from 'mongoose';

const BillExtractionSchema = new mongoose.Schema(
  {
    job_id: { type: String, required: true, unique: true },
    status: { type: String, enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
    bill_document_uri: { type: String },
    mime_type: { type: String },
    template_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BillTemplate' },
    normalized_data_json: { type: Object, default: {} },
    confidence: { type: Number },
    validation_results_json: { type: Object, default: {} },
    raw_text: { type: String },
    error_message: { type: String }
  },
  { timestamps: true }
);

export const BillExtraction = mongoose.model('BillExtraction', BillExtractionSchema);
