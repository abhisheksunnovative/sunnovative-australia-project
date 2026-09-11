import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: 'D:/sunnovative-australia-website/Website_Backend/.env' });

const schema = new mongoose.Schema({
  country: { type: String, required: true, lowercase: true },
  district: { type: String, required: true },
  pincodes: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const District = mongoose.model('District', schema);

const seedData = [
  // INDIA
  { country: 'india', district: 'Mumbai', pincodes: ['400001', '400002', '400003', '400004', '400005', '400053'] },
  { country: 'india', district: 'New Delhi', pincodes: ['110001', '110002', '110003', '110011', '110012'] },
  { country: 'india', district: 'Bengaluru', pincodes: ['560001', '560002', '560003', '560010', '560034'] },
  { country: 'india', district: 'Pune', pincodes: ['411001', '411002', '411003', '411004', '411005'] },
  { country: 'india', district: 'Hyderabad', pincodes: ['500001', '500002', '500003', '500004'] },
  { country: 'india', district: 'Chennai', pincodes: ['600001', '600002', '600003', '600004'] },
  { country: 'india', district: 'Ahmedabad', pincodes: ['380001', '380002', '380003', '380004'] },
  { country: 'india', district: 'Kolkata', pincodes: ['700001', '700002', '700003', '700004'] },
  { country: 'india', district: 'Surat', pincodes: ['395001', '395002', '395003'] },
  { country: 'india', district: 'Jaipur', pincodes: ['302001', '302002', '302003'] },

  // AUSTRALIA
  { country: 'australia', district: 'Sydney', pincodes: ['2000', '2001', '2002', '2006', '2010'] },
  { country: 'australia', district: 'Melbourne', pincodes: ['3000', '3001', '3002', '3004', '3006'] },
  { country: 'australia', district: 'Brisbane', pincodes: ['4000', '4001', '4002', '4003', '4005'] },
  { country: 'australia', district: 'Perth', pincodes: ['6000', '6001', '6003', '6004'] },
  { country: 'australia', district: 'Adelaide', pincodes: ['5000', '5001', '5004', '5005'] },
  { country: 'australia', district: 'Gold Coast', pincodes: ['4217', '4218', '4220'] },
  { country: 'australia', district: 'Canberra', pincodes: ['2600', '2601', '2602'] },
  { country: 'australia', district: 'Hobart', pincodes: ['7000', '7001', '7002'] }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to DB');

    // Clear existing to avoid duplicates if they exist
    await District.deleteMany({});
    console.log('Cleared existing districts');

    await District.insertMany(seedData);
    console.log('Successfully seeded districts and pincodes!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
