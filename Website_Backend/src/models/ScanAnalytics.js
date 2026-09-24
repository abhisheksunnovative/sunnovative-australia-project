import mongoose from 'mongoose';

const scanAnalyticsSchema = new mongoose.Schema({
    engineUsed: {
        type: String,
        enum: ['in-house', 'gemini-fallback', 'in-house-failed'],
        required: true
    },
    geminiEstimatedCost: {
        type: Number,
        default: 0
    },
    fallbackReason: {
        type: String,
        default: null
    },
    country: {
        type: String,
        required: true
    },
    needsTemplateCreation: {
        type: Boolean,
        default: false
    },
    resolvedTemplateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BillTemplate',
        default: null
    },
    rawText: {
        type: String,
        default: ""
    },
    geminiResult: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
}, { timestamps: true });

export default mongoose.models.ScanAnalytics || mongoose.model('ScanAnalytics', scanAnalyticsSchema);
