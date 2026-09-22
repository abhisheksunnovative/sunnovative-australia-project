import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import BillTemplate from './src/models/BillTemplate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const newRules = [
  { field: "monthlyBill", regex: "Total[\\s\\S]{0,20}?(?:\\$|Rs\\.?|INR)?\\s*([0-9.]+)", type: "number", required: true },
  { field: "consumerNumber", regex: "Account number[\\s\\S]{0,20}?([0-9]{3}\\s?[0-9]{3}\\s?[0-9]{3})", type: "string", required: true },
  { field: "dueDate", regex: "(?:Due date|Date of issue)[\\s\\S]{0,20}?([0-9]{1,2}\\s+[a-zA-Z]+\\s+[0-9]{4})", type: "string", required: false },
  { field: "fullName", regex: "(?:MR|MRS|MS|MISS)[\\s\\S]{0,5}?([A-Z ]+)\\n", type: "string", required: false }
];

async function updateSynergy() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    await BillTemplate.findOneAndUpdate(
      { discomName: "Synergy" },
      { $set: { extractionRules: newRules } }
    );
    console.log("Synergy template updated with non-capturing groups!");
    process.exit(0);
  } catch (err) {
    console.error("Update failed:", err);
    process.exit(1);
  }
}
updateSynergy();
