import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import BillTemplate from './src/models/BillTemplate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const kwhRules = [
  { discomName: "BSES Yamuna", rule: { field: "monthlyUnits", regex: "Unit(?:\\s*|\\n)([0-9]+(?:\\.[0-9]+)?)", type: "number", required: false } },
  { discomName: "PSPCL", rule: { field: "monthlyUnits", regex: "Total Units Consumed \\(kWh\\):\\s*([0-9]+(?:\\.[0-9]+)?)", type: "number", required: false } },
  { discomName: "MVVNL", rule: { field: "monthlyUnits", regex: "Total Usage:\\s*([0-9]+(?:\\.[0-9]+)?)\\s*kWh", type: "number", required: false } },
  { discomName: "Origin Energy", rule: { field: "quarterlyKwh", regex: "Total kWh[\\s\\S]{0,40}?([0-9]+(?:\\.[0-9]+)?)", type: "number", required: false } },
  { discomName: "Red Energy", rule: { field: "quarterlyKwh", regex: "Average daily usage[\\s\\S]{0,30}?\\:\\s*([0-9.]+)\\s*kWh", type: "number", required: false } },
  { discomName: "Synergy", rule: { field: "quarterlyKwh", regex: "Your average daily usage\\s*([0-9.]+)\\s*units", type: "number", required: false } }
];

async function updateKwh() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    for (let {discomName, rule} of kwhRules) {
      await BillTemplate.findOneAndUpdate(
        { discomName },
        { $push: { extractionRules: rule } }
      );
    }
    console.log("kWh rules added!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
updateKwh();
