import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import BillTemplate from './src/models/BillTemplate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const newOriginRules = [
  { field: "monthlyBill", regex: "(?:Amount due|Account balance)[\\s\\S]{0,40}?(?:\\$|S)?\\s*([0-9]{1,4}\\.[0-9]{2})", type: "number", required: true },
  { field: "consumerNumber", regex: "Account number[\\s\\S]{0,20}?([A-Z0-9\\-]+)", type: "string", required: true },
  { field: "dueDate", regex: "New charges due[\\s\\S]{0,30}?([0-9]{1,2}\\s+[A-Za-z]+\\s+[0-9]{4})", type: "string", required: false }
];

async function updateTemplate() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    await BillTemplate.findOneAndUpdate(
      { discomName: "Origin Energy" },
      { $set: { extractionRules: newOriginRules } }
    );
    console.log("Origin Energy template updated with super loose regex!");
    process.exit(0);
  } catch (err) {
    console.error("Update failed:", err);
    process.exit(1);
  }
}
updateTemplate();
