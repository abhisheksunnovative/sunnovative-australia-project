import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, './.env') });

import KycRequirement from './src/models/KycRequirement.js';

const seedDocs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    // Clear existing docs
    await KycRequirement.deleteMany({});
    
    const docs = [
      // India - All States
      { country: 'india', state: 'All', documentName: 'Aadhaar Card', description: 'Front and Back of Aadhaar' },
      { country: 'india', state: 'All', documentName: 'PAN Card', description: 'Company or Individual PAN' },
      { country: 'india', state: 'All', documentName: 'GST Certificate', description: 'Valid GST Registration' },
      { country: 'india', state: 'All', documentName: 'Signed Partner Agreement', description: 'Please download, sign, and upload the partner agreement.', templateUrl: '/templates/India_EPC_Agreement.pdf' },
      
      // Australia - All States
      { country: 'australia', state: 'All', documentName: 'CEC Accreditation Certificate', description: 'Clean Energy Council Certificate' },
      { country: 'australia', state: 'All', documentName: 'ABN Certificate', description: 'Australian Business Number Document' },
      { country: 'australia', state: 'All', documentName: 'Signed Partner Agreement', description: 'Please download, sign, and upload the partner agreement.', templateUrl: '/templates/Aus_EPC_Agreement.pdf' }
    ];

    await KycRequirement.insertMany(docs);
    console.log("Seeded KycRequirements successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDocs();
