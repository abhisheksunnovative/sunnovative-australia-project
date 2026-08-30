import mongoose from 'mongoose';

const epcEnquirySchema = new mongoose.Schema({
  epcPartner:     { type: mongoose.Schema.Types.ObjectId, ref: 'EpcPartner' },
  customerName:   { type: String, required: true },
  customerMobile: { type: String, required: true },
  customerEmail:  { type: String },
  enquiryType: {
    type: String,
    enum: ['ECommerce', 'Bidding', 'QuoteByEPC'],
    default: 'ECommerce',
  },
  projectType: {
    type: String,
    enum: ['Surya Ghar Yojana', 'Group Solar', 'Village Solar Campaign', 'Commercial Solar', 'Residential Solar'],
    required: true,
  },
  systemCapacityKw: { type: Number },
  state:    { type: String },
  district: { type: String, required: true },
  city:     { type: String },
  address:  { type: String },
  rooftopPhoto: { type: String, default: "" },
  geolocation: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  preferredInstallDate: { type: Date },
  tokenAmount: { type: Number, default: 0 },
  tokenPaid:   { type: Boolean, default: false },
  tokenPaidAt: { type: Date },
  orderNumber: { type: String },
  status: {
    type: String,
    enum: ['Lead', 'Token Paid', 'Order Generated', 'Open For EPC', 'Processing Acceptance', 'Bid Running', 'EPC Accepted', 'Date Confirmed', 'Escrow Paid', 'Customer Selected EPC', 'Converted', 'Expired', 'Rejected'],
    default: 'Lead',
  },
  assignmentType: {
    type: String,
    enum: ['FirstComeFirstServe', 'BidSystem', 'CustomerSelect'],
    default: 'FirstComeFirstServe',
  },
  acceptedAt:    { type: Date },
  acceptanceFee: { type: Number, default: 0 },
  customerSelectionDeadline: { type: Date },
  rejectedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EpcPartner' }],
  customerSelectedAt:        { type: Date },
  convertedToOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'EpcOrder' },
  convertedAt:      { type: Date },
  leadRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
}, { timestamps: true });

export default mongoose.model('EpcEnquiry', epcEnquirySchema);