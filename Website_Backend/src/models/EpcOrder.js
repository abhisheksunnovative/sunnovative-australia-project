import mongoose from 'mongoose';

const epcOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  epcPartner:  { type: mongoose.Schema.Types.ObjectId, ref: 'EpcPartner', required: true },
  enquiry:     { type: mongoose.Schema.Types.ObjectId, ref: 'EpcEnquiry' },
  customerName:   { type: String, required: true },
  customerMobile: { type: String, required: true },
  customerEmail:  { type: String },
  projectType: {
    type: String,
    enum: ['Surya Ghar Yojana', 'Group Solar', 'Village Solar Campaign', 'Commercial Solar', 'Residential Solar'],
    required: true,
  },
  systemCapacityKw: { type: Number },
  country:  { type: String, default: 'India' },
  state:    { type: String },
  district: { type: String },
  city:     { type: String },
  address:  { type: String },
  totalProjectValue: { type: Number, default: 0 },
  epcSubmittedPrice: { type: Number, default: null },
  epcPriceSubmittedAt: { type: Date, default: null },
  payment90: {
    amount:     { type: Number, default: 0 },
    status:     { type: String, enum: ['Pending', 'Released'], default: 'Pending' },
    releasedAt: { type: Date },
    receipt:    { type: String },
  },
  payment10: {
    amount:     { type: Number, default: 0 },
    status:     { type: String, enum: ['Pending', 'Released'], default: 'Pending' },
    releasedAt: { type: Date },
  },
  stage: {
    type: String,
    enum: [
      'Registration Started',
      'Material Delivered',
      'Installation In Progress',
      'Installation Completed',
      'QC Verification',
      '90% Payment Released',
      'Customer Approval',
      '10% Payment Released',
      'Project Closed',
    ],
    default: 'Registration Started',
  },
  status: {
    type: String,
    enum: ['New', 'Ongoing', 'Overdue', 'Completed', 'Cancelled'],
    default: 'New',
  },
  scheduledInstallDate:  { type: Date },
  installCompletedAt:    { type: Date },
  dueDateForCompletion:  { type: Date }, // EPC fixed install date
  customerProposedDate:  { type: Date }, // Date selected by customer
  isOverdue:             { type: Boolean, default: false },
  customerRating:   { type: Number, min: 1, max: 5 },
  customerFeedback: { type: String },
  ratedAt:          { type: Date },
  registrationDocs: [{
    docName:    { type: String },
    fileUrl:    { type: String },
    uploadedAt: { type: Date, default: Date.now },
  }],
  installationPhotos: [{
    caption:    { type: String },
    fileUrl:    { type: String },
    uploadedAt: { type: Date, default: Date.now },
  }],
  netMeteringDoc: { type: String },
  pcrReport:     { type: String },
  pcrUploadedAt: { type: Date },
  completionChecklist: {
    installPhotosUploaded:  { type: Boolean, default: false },
    gpsPhotosUploaded:      { type: Boolean, default: false },
    netMeteringDone:        { type: Boolean, default: false },
    mnreDocsUploaded:       { type: Boolean, default: false },
    pcrGenerated:           { type: Boolean, default: false },
  },
  warrantyActivated:   { type: Boolean, default: false },
  warrantyActivatedAt: { type: Date },
  // STC Tracking (Australia Specific)
  stcDetails: {
    systemSizeKw: { type: Number, default: 0 },
    postcode: { type: String, default: "" },
    zone: { type: Number, default: 0 },
    deemingYears: { type: Number, default: 0 },
    stcs: { type: Number, default: 0 },
    stcPriceUsed: { type: Number, default: 0 },
    stcRebateAmount: { type: Number, default: 0 },
  },
  stcStatus: {
    assignmentFormSigned: { type: Boolean, default: false },
    assignmentFormSignedAt: Date,
    customerSignatureUrl: String,
    stcsCreatedInRegistry: { type: Boolean, default: false },
    stcsTraded: { type: Boolean, default: false },
    amountRecovered: { type: Number, default: 0 }
  }
}, { timestamps: true });

epcOrderSchema.pre('validate', async function () {
  if (!this.orderNumber) {
    const count = await mongoose.model('EpcOrder').countDocuments();
    this.orderNumber = `SUN-ORD-${String(count + 1).padStart(6, '0')}`;
  }
});

export default mongoose.model('EpcOrder', epcOrderSchema);