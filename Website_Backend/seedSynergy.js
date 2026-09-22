import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import BillTemplate from './src/models/BillTemplate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const templates = [
  {
    discomName: "Synergy",
    country: "australia",
    anchorKeywords: ["synergy", "synergy.net.au"],
    extractionRules: [
      { field: "monthlyBill", regex: "Total\\s*\\$?([0-9.]+)", type: "number", required: true },
      { field: "consumerNumber", regex: "Account number\\s*([0-9 ]{9,12})", type: "string", required: true },
      { field: "dueDate", regex: "Due date|Date of issue\\s*([0-9a-zA-Z]+ [a-zA-Z]+ [0-9]{4})", type: "string", required: false },
      { field: "fullName", regex: "([A-Z][a-z]+ [A-Z][a-z]+)\\n", type: "string", required: false }
    ]
  }
];

async function seedTemplates() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    for (let t of templates) {
      await BillTemplate.findOneAndUpdate({ discomName: t.discomName }, t, { upsert: true, new: true });
      console.log(`Upserted template: ${t.discomName}`);
    }
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}
seedTemplates();
