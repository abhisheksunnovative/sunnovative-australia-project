import mongoose from 'mongoose';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const epcRateCardSchema = new mongoose.Schema({
  epcPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'EpcPartner' },
  projectType: String,
  country: String,
  flatRatePerKw: Number,
  tiers: [{ minKw: Number, maxKw: Number, rate: Number }],
  status: String,
  updatedAt: Date
}, { strict: false });

const EpcRateCard = mongoose.models.EpcRateCard || mongoose.model('EpcRateCard', epcRateCardSchema);

async function exportData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sunnovative');
    console.log('Connected to DB');
    
    const records = await EpcRateCard.find({}).lean();
    console.log('Found ' + records.length + ' records');
    
    if (records.length === 0) {
      console.log('No data to export.');
      fs.writeFileSync('EpcRateCard_export.csv', 'No data');
      process.exit(0);
    }

    let csv = 'epcPartner,projectType,country,flatRatePerKw,status,updatedAt\n';
    records.forEach(r => {
      csv += r.epcPartner + ',' + r.projectType + ',' + r.country + ',' + r.flatRatePerKw + ',' + r.status + ',' + r.updatedAt + '\n';
    });
    
    fs.writeFileSync('EpcRateCard_export.csv', csv);
    console.log('Data exported to EpcRateCard_export.csv');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

exportData();
