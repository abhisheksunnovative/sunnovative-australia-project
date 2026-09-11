import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const countrySchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  currencySymbol: { type: String, default: '$' },
  phoneCode: { type: String, default: '+1' },
  timezone: { type: String, default: 'UTC' },
  flagEmoji: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
const CountryConfig = mongoose.model('CountryConfig', countrySchema);

const projectTypeSchema = new mongoose.Schema({
  country: { type: String, required: true },
  projectType: { type: String, required: true },
  projectTypeLabel: { type: String },
  isActive: { type: Boolean, default: true },
  availableKw: [{ type: String }]
}, { timestamps: true });
const ProjectType = mongoose.model('ProjectType', projectTypeSchema);

// Replace with your actual MongoDB connection string from .env
const MONGO_URI = process.env.MONGODB_URL;

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');

    const countries = [
      { code: 'IN', name: 'India', flagEmoji: '🇮🇳' },
      { code: 'AU', name: 'Australia', flagEmoji: '🇦🇺' },
      { code: 'NZ', name: 'New Zealand', flagEmoji: '🇳🇿' },
      { code: 'UK', name: 'United Kingdom', flagEmoji: '🇬🇧' },
      { code: 'US', name: 'United States', flagEmoji: '🇺🇸' }
    ];

    for (let c of countries) {
      await CountryConfig.findOneAndUpdate({ code: c.code }, { ...c, isActive: true }, { upsert: true });
    }
    
    // Seed IN project types
    await ProjectType.findOneAndUpdate({ country: 'IN', projectType: 'Residential Solar' }, { projectTypeLabel: 'Residential Solar', availableKw: ['3','5','10'] }, { upsert: true });
    await ProjectType.findOneAndUpdate({ country: 'IN', projectType: 'Commercial Solar' }, { projectTypeLabel: 'Commercial Solar', availableKw: ['10','50','100'] }, { upsert: true });

    // Seed AU project types
    const auTypes = [
      'Residential Solar', 'Commercial Solar', 'Residential Battery', 
      'Commercial Battery', 'Solar and Battery', 'Heat Pump'
    ];
    for (let t of auTypes) {
       await ProjectType.findOneAndUpdate({ country: 'AU', projectType: t }, { projectTypeLabel: t, availableKw: ['6.6','10','13.2'] }, { upsert: true });
    }

    console.log('Seed completed successfully. You can now check the Admin panel.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
