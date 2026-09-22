import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import BillTemplate from './src/models/BillTemplate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const newRedEnergyRules = [
  { field: "monthlyBill", regex: "(?:TOTAL AMOUNT DUE|ACCOUNT BALANCE)[\\s\\S]{0,60}?(?:\\$|S)?\\s*([0-9]{1,4}\\.[0-9]{2})", type: "number", required: true },
  { field: "consumerNumber", regex: "CUSTOMER NUMBER[\\s\\S]{0,20}?([0-9]{6,10})", type: "string", required: true },
  { field: "fullName", regex: "(?:MR|MRS|MS)[\\s\\S]{0,5}?([A-Z &\\n]+?)(?:\\n[0-9]|\\nUNIT|\\nPO BOX)", type: "string", required: false }
];

async function updateTemplate() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    await BillTemplate.findOneAndUpdate(
      { discomName: "Red Energy" },
      { $set: { extractionRules: newRedEnergyRules } }
    );
    console.log("Red Energy template updated with super loose regex!");
    process.exit(0);
  } catch (err) {
    console.error("Update failed:", err);
    process.exit(1);
  }
}
updateTemplate();
