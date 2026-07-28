import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const EpcPartnerSchema = new mongoose.Schema({
  companyName:           { type: String, required: true, trim: true },
  ownerName:             { type: String, required: true, trim: true },
  email:                 { type: String, required: true, unique: true, lowercase: true },
  mobile:                { type: String, required: true, unique: true },
  password:              { type: String },
  loginPin:              { type: String, default: null },
  country:               { type: String, default: 'india' },
  state:                 { type: String, default: '' },
  district:              { type: String, default: '' },
  city:                  { type: String, default: '' },
  pincode:               { type: String, default: '' },
  address:               { type: String, default: '' },
  hqLocation:            { type: String, default: '' },
  yearsOfExperience:     { type: Number, default: 0 },
  qualifiedProjectTypes: [{ type: String }],
  plan: {
    type:    String,
    enum:    ['Free', '1 Installer Plan', '2 Installer Plan', '3 Installer Plan', 'Standard', 'Professional', 'Enterprise'],
    default: 'Standard',
  },
  districtCapacities: [{
    district: { type: String, required: true },
    installerCount: { type: Number, default: 1 },
    weeklyCapacityKw: { type: Number, default: 25 }
  }],
  activeDistricts: [{ type: String }],
  onboardingStatus: {
    type:    String,
    enum:    ['Pending', 'KYC Submitted', 'Verified', 'Rejected', 'Active'],
    default: 'Pending',
  },
  kycDocuments: {
    gstNumber:         { type: String, default: '' },
    panNumber:         { type: String, default: '' },
    aadhaarNumber:     { type: String, default: '' },
    bankAccountNumber: { type: String, default: '' },
    ifscCode:          { type: String, default: '' },
    agreementSigned:   { type: Boolean, default: false },
    // Australia specific
    abn:               { type: String, default: '' },
    cecAccreditationNumber: { type: String, default: '' },
  },
  rating:                   { type: Number, default: 0 },
  totalRatings:              { type: Number, default: 0 },
  onTimeCompletionPercent:   { type: Number, default: 0 },
  isActive:              { type: Boolean, default: false },
  deactivationReason:    { type: String, default: '' },
  warnings:              [{ type: String }],
  
  // Overdue and freeze mechanics
  overdueCount:          { type: Number, default: 0 },
  isFrozen:              { type: Boolean, default: false },
  frozenAt:              { type: Date, default: null },
  freezeClearanceDays:   { type: Number, default: 5 }, // Default limit set by admin individually
  
  // Red Alert & Deactivation
  isRedAlert:            { type: Boolean, default: false },
  ratingWarnings:        { type: Number, default: 0 },
  
  // Trusted Badge Workflow
  trustBadge: {
    status:      { type: String, enum: ['None', 'Pending', 'Approved', 'Rejected', 'Expired'], default: 'None' },
    documentUrl: { type: String, default: '' },
    appliedAt:   { type: Date, default: null },
    expiresAt:   { type: Date, default: null },
  },
  
}, { timestamps: true });

EpcPartnerSchema.pre('save', async function() {
  if (this.isModified('password') && this.password) {
    const salt    = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

EpcPartnerSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('EpcPartner', EpcPartnerSchema);