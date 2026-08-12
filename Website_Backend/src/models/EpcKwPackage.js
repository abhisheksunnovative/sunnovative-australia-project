import mongoose from 'mongoose';

const epcKwPackageSchema = new mongoose.Schema({
  country: { type: String, required: true },
  name: { type: String, required: true }, // e.g., "Starter Pack", "Elite Pack"
  kwAmount: { type: Number, required: true }, // e.g., 20, 50, 100, 250
  basePrice: { type: Number, required: true },
  discountPercent: { type: Number, default: 0 },
  finalPrice: { type: Number, required: true },
  isPopular: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Ensure unique package name per country
epcKwPackageSchema.index({ country: 1, name: 1 }, { unique: true });

export default mongoose.model('EpcKwPackage', epcKwPackageSchema);
