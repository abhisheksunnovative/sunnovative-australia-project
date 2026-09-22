import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import BillTemplate from './src/models/BillTemplate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const newRules = [
  { field: "monthlyBill", regex: "Total\\s*(?:\\$)?\\s*([0-9.]+)", type: "number", required: false },
  { field: "consumerNumber", regex: "(?:Account number|mater number:)[\\s\\S]{0,20}?([0-9]{5,12})", type: "string", required: true },
  { field: "dueDate", regex: "(?:Due date|Date of issue)[\\s\\S]{0,20}?([0-9]{1,2}\\s+[a-zA-Z]+\\s+[0-9]{4})", type: "string", required: false },
  { field: "fullName", regex: "(?:MR|MRS|MS|MISS)\\s+([A-Z ]+)", type: "string", required: false },
  { field: "tariffCategory", regex: "([A-Za-z ]+\\([A-Z0-9]+\\)\\s*tariff)", type: "string", required: false },
  { field: "meterTypeInfo", regex: "(?:meter|mater) number:\\s*([0-9]+)", type: "string", required: false },
  { field: "state", regex: "\\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\\b", type: "string", required: false },
  { field: "postcode", regex: "\\b([0-9]{4})\\b", type: "string", required: false },
  { field: "quarterlyKwh", regex: "Resubential Anytime conmumplon\\s*([0-9.]+)", type: "number", required: false }
];

async function updateSynergy() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    await BillTemplate.findOneAndUpdate(
      { discomName: "Synergy" },
      { $set: { extractionRules: newRules } }
    );
    console.log("Synergy template regex matched exactly to the OCR anomalies!");
    process.exit(0);
  } catch (err) {
    console.error("Update failed:", err);
    process.exit(1);
  }
}
updateSynergy();
