import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Country from './src/models/Country.js';
import ProjectType from './src/models/ProjectType.js';
import District from './src/models/District.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URL;

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    // 1. Seed Countries
    const countriesToSeed = [
      { code: 'australia', name: 'Australia', flagEmoji: '🇦🇺' },
      { code: 'india', name: 'India', flagEmoji: '🇮🇳' },
      { code: 'newzealand', name: 'New Zealand', flagEmoji: '🇳🇿' },
      { code: 'us', name: 'United States', flagEmoji: '🇺🇸' },
      { code: 'uk', name: 'United Kingdom', flagEmoji: '🇬🇧' },
    ];

    for (const c of countriesToSeed) {
      await Country.findOneAndUpdate(
        { code: c.code },
        { ...c, isActive: true },
        { upsert: true, new: true }
      );
    }
    console.log('Seeded Countries.');

    // 2. Seed Project Types
    const baseProjectTypes = [
      { label: 'Residential Solar', key: 'residential-solar', kw: [5, 6.6, 10, 15] },
      { label: 'Commercial Solar', key: 'commercial-solar', kw: [30, 50, 100, 200] },
      { label: 'Industrial Solar', key: 'industrial-solar', kw: [500, 1000] },
    ];

    for (const c of countriesToSeed) {
      for (const pt of baseProjectTypes) {
        await ProjectType.findOneAndUpdate(
          { country: c.code, projectType: pt.key },
          {
            country: c.code,
            projectTypeLabel: pt.label,
            projectType: pt.key,
            availableKw: pt.kw,
            isActive: true
          },
          { upsert: true }
        );
      }
    }
    console.log('Seeded Project Types.');

    // 3. Migrate Districts/States
    const countryStatesMap = {
      australia: ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania", "Australian Capital Territory", "Northern Territory"],
      india: ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"],
      us: ["California", "Texas", "Florida", "New York", "Pennsylvania"],
      uk: ["England", "Scotland", "Wales", "Northern Ireland"],
      newzealand: ["Auckland", "Wellington", "Canterbury", "Waikato"]
    };

    for (const [countryKey, states] of Object.entries(countryStatesMap)) {
      for (const stateName of states) {
        await District.findOneAndUpdate(
          { country: countryKey, district: stateName },
          {
            country: countryKey,
            district: stateName,
            isActive: true
          },
          { upsert: true }
        );
      }
    }
    console.log('Migrated legacy States to District model.');

    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
