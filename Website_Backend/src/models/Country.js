import mongoose from 'mongoose';

const countrySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g. 'Australia'
  code: { type: String, required: true, lowercase: true, unique: true }, // e.g. 'australia'
  flagEmoji: { type: String, default: '' }, // e.g. '🇦🇺'
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Country', countrySchema);
