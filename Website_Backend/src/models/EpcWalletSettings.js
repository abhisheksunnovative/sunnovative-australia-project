import mongoose from 'mongoose';

const RechargePackageSchema = new mongoose.Schema({
  id:          { type: String, required: true },
  name:        { type: String, required: true },
  kw:          { type: Number, required: true },
  price:       { type: Number, required: true },
  discount:    { type: Number, default: 0 },
  popular:     { type: Boolean, default: false },
  description: { type: String, default: '' },
  enabled:     { type: Boolean, default: true },
}, { _id: false });

// Singleton document — only one settings row ever exists for the whole platform.
const EpcWalletSettingsSchema = new mongoose.Schema({
  singletonKey:       { type: String, default: 'EPC_WALLET_SETTINGS', unique: true },
  pricePerKW:         { type: Number, default: 500 },
  freeTrialKwLimit:   { type: Number, default: 10 },
  minRechargeKW:      { type: Number, default: 5 },
  maxRechargeKW:      { type: Number, default: 1000 },
  lowBalanceAlertKW:  { type: Number, default: 5 },
  autoRefillEnabled:  { type: Boolean, default: false },
  rechargePackages:   {
    type: [RechargePackageSchema],
    default: () => ([
      { id: 'starter', name: 'Starter Pack', kw: 20,  price: 9000,  discount: 10, popular: false, description: 'Small installs ke liye', enabled: true },
      { id: 'popular', name: 'Popular Pack', kw: 50,  price: 20000, discount: 20, popular: true,  description: 'Most preferred by EPC partners', enabled: true },
      { id: 'pro',     name: 'Pro Pack',     kw: 100, price: 35000, discount: 30, popular: false, description: 'High volume installers', enabled: true },
      { id: 'elite',   name: 'Elite Pack',   kw: 250, price: 75000, discount: 40, popular: false, description: 'Enterprise level', enabled: true },
    ]),
  },
}, { timestamps: true });

// Helper — always returns the single settings doc, creating it with defaults if absent.
EpcWalletSettingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ singletonKey: 'EPC_WALLET_SETTINGS' });
  if (!doc) doc = await this.create({ singletonKey: 'EPC_WALLET_SETTINGS' });
  return doc;
};

export default mongoose.model('EpcWalletSettings', EpcWalletSettingsSchema);