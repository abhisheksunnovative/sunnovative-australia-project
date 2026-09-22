import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import BillTemplate from './src/models/BillTemplate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const newRedEnergyRules = [
  { field: "monthlyBill", regex: "(?:TOTAL AMOUNT DUE|ACCOUNT\\s*BALANCE)[\\s\\S]{0,60}?(?:\\$|S)?\\s*([0-9]{1,4}\\.[0-9]{2})", type: "number", required: true },
  { field: "consumerNumber", regex: "CUSTOMER NUMBER[\\s\\S]{0,20}?([0-9]{6,10})", type: "string", required: true },
  { field: "fullName", regex: "(?:MR|MRS|MS)[\\s\\S]{0,5}?([A-Z &\\n]+?)(?:\\n[0-9]|\\nUNIT|\\nPO BOX|\\nNATIONAL)", type: "string", required: false },
  { field: "dueDate", regex: "DUE DATE[\\s\\S]{0,30}?([0-9]{1,2}\\s+[A-Za-z]+\\s+[0-9]{2,4})", type: "string", required: false },
  { field: "tariffCategory", regex: "(?:Your Plan|Tariff Description)[\\s\\S]{0,20}?([A-Za-z ]+ Rate)", type: "string", required: false },
  { field: "meterTypeInfo", regex: "Meter Number[\\s\\S]{0,20}?([0-9:\\-]+)", type: "string", required: false },
  { field: "state", regex: "\\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\\b", type: "string", required: false },
  { field: "postcode", regex: "\\b([0-9]{4})\\b", type: "string", required: false }
];

async function updateTemplate() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    await BillTemplate.findOneAndUpdate(
      { discomName: "Red Energy" },
      { $set: { extractionRules: newRedEnergyRules } }
    );
    console.log("Red Energy template updated for Table-Aware formatting!");
    process.exit(0);
  } catch (err) {
    console.error("Update failed:", err);
    process.exit(1);
  }
}
updateTemplate();
