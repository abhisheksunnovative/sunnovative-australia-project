import mongoose from 'mongoose';

const epcInstallerConfigSchema = new mongoose.Schema({
  country: { type: String, required: true, unique: true },
  baseInstallersIncluded: { type: Number, default: 1 },
  weeklyKwCapacityPerInstaller: { type: Number, default: 25 },
  extraInstallerPrice: { type: Number, default: 500 },
}, { timestamps: true });

export default mongoose.model('EpcInstallerConfig', epcInstallerConfigSchema);
