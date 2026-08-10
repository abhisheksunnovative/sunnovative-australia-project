import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    mobile: { type: String, required: [true, 'Mobile number is required'], unique: true, trim: true },
    whatsapp: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },

    // Location — simple strings (no ObjectId refs needed in this project)
    country: { type: String, trim: true, default: 'India' },
    state: { type: String, trim: true },
    district: { type: String, trim: true },
    city: { type: String, trim: true },
    pincode: { type: String, trim: true },
    address: { type: String, trim: true },

    // Solar info
    solarType: {
      type: String,
      default: 'general',
      enum: ['surya-ghar', 'group-solar', 'rwa-society', 'commercial', 'village', 'msme', 'general', 'residential', 'au-small-home', 'au-standard-family', 'au-large-home', 'au-ev-owners', 'au-solar-battery', 'other'],
    },
    kw: { type: String, default: '0' },
    billAmount: { type: Number, default: 0 },
    consumerNumber: { type: String, trim: true },
    discom: { type: String, trim: true },
    tariff: { type: String, trim: true },
    meterCategory: { type: String, trim: true },
    preferredSolarBrand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    preferredInverterBrand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    sourceOfMedia: { type: String },
    uploadSource: { type: String, enum: ['website', 'bde_manual'], default: 'website' },
    hasLoggedIn: { type: Boolean, default: false },
    profession: { type: String },
    notes: { type: String, trim: true },

    // Status
    status: {
      type: String,
      enum: ['New', 'Called', 'Interested', 'Not Interested', 'Follow Up', 'Converted', 'Junk', 'Contacted'],
      default: 'New',
    },

    // Assignment
    assignedTo: { type: String, default: null }, // admin name string
    assignedBde: { type: mongoose.Schema.Types.ObjectId, ref: 'BDE', default: null },
    convertedProjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectOrder', default: null },
    isInstallDateFixed: { type: Boolean, default: false },
    nextFollowUp: { type: Date, default: null },
    preferredInstallDate: { type: Date, default: null },

    // History log
    history: [
      {
        action: String,
        date: { type: Date, default: Date.now },
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

leadSchema.index({ isActive: 1 });
leadSchema.index({ solarType: 1, isActive: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });

export default mongoose.model('Lead', leadSchema);
