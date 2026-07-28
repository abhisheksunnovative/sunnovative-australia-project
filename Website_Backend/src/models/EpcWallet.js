import mongoose from 'mongoose';

export const PROJECT_TYPES = [
  'Surya Ghar Yojana',
  'Group Solar',
  'Village Solar Campaign',
  'Commercial Solar',
  'Residential Solar',
];

const WalletCreditSchema = new mongoose.Schema({
  district:    { type: String, required: true, default: 'All' },
  projectType: { type: String, enum: PROJECT_TYPES, required: true },
  credits:     { type: Number, default: 0 },
}, { _id: false });

const WalletTransactionSchema = new mongoose.Schema({
  type:        { type: String, enum: ['PURCHASE', 'DEDUCT', 'REFUND', 'TRANSFER'], required: true },
  projectType: { type: String, enum: PROJECT_TYPES, required: true },
  kw:          { type: Number, required: true },
  amount:      { type: Number, default: 0 },
  orderId:     { type: mongoose.Schema.Types.ObjectId, ref: 'EpcOrder', default: null },
  enquiryId:   { type: mongoose.Schema.Types.ObjectId, ref: 'EpcEnquiry', default: null },
  note:        { type: String, default: '' },
  createdAt:   { type: Date, default: Date.now },
}, { _id: true });

const EpcWalletSchema = new mongoose.Schema({
  epcPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'EpcPartner',
    required: true,
    unique: true,
  },
  credits: { type: [WalletCreditSchema], default: () => PROJECT_TYPES.map(pt => ({ district: 'All', projectType: pt, credits: 0 })) },
  freeTrialKwUsed:  { type: Number, default: 0 },
  freeTrialKwLimit: { type: Number, default: 10 },
  transactions: { type: [WalletTransactionSchema], default: [] },
   lastLowBalanceAlertAt: { type: Date, default: null },
}, { timestamps: true });

EpcWalletSchema.methods.getTotalCredits = function() {
  return this.credits.reduce((sum, c) => sum + c.credits, 0);
};

EpcWalletSchema.methods.getCreditsFor = function(projectType, district = 'All') {
  const entry = this.credits.find(c => c.projectType === projectType && c.district === district);
  // Fallback to 'All' if specific district not found
  if (!entry && district !== 'All') {
    const allEntry = this.credits.find(c => c.projectType === projectType && c.district === 'All');
    return allEntry ? allEntry.credits : 0;
  }
  return entry ? entry.credits : 0;
};

EpcWalletSchema.methods.canAcceptOrder = function(projectType, kwRequired, district = 'All') {
  const freeTrialRemaining = Math.max(0, this.freeTrialKwLimit - this.freeTrialKwUsed);
  const paidCredits        = this.getCreditsFor(projectType, district);
  return {
    canAccept:    (freeTrialRemaining + paidCredits) >= kwRequired,
    freeTrialRemaining,
    paidCredits,
    useFreeTrial: freeTrialRemaining > 0,
  };
};

export default mongoose.model('EpcWallet', EpcWalletSchema);