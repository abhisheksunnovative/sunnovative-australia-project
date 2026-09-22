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
    discomName: "AGL Energy",
    country: "australia",
    anchorKeywords: ["AGL", "agl.com.au"],
    extractionRules: [
      { field: "monthlyBill", regex: "Total amount due\\s*\\$\\s*([0-9.]+)", type: "number", required: true },
      { field: "consumerNumber", regex: "Account number\\s*([0-9]{8,12})", type: "string", required: true },
      { field: "dueDate", regex: "Due date\\s*([0-9a-zA-Z]+ [a-zA-Z]+ [0-9]{4})", type: "string", required: false },
      { field: "fullName", regex: "([A-Z][a-z]+ [A-Z][a-z]+)\\n", type: "string", required: false }
    ]
  },
  {
    discomName: "Origin Energy",
    country: "australia",
    anchorKeywords: ["Origin", "originenergy.com.au"],
    extractionRules: [
      { field: "monthlyBill", regex: "Amount to pay\\s*\\$\\s*([0-9.]+)", type: "number", required: true },
      { field: "consumerNumber", regex: "Account number\\s*([0-9]+)", type: "string", required: true }
    ]
  },
  {
    discomName: "PGVCL",
    country: "india",
    anchorKeywords: ["PGVCL", "Paschim Gujarat"],
    extractionRules: [
      { field: "monthlyBill", regex: "Net Amount\\s*(?:Rs\\.?|INR)?\\s*([0-9.]+)", type: "number", required: true },
      { field: "consumerNumber", regex: "Consumer No\\.?\\s*[:\\-]?\\s*([0-9]+)", type: "string", required: true },
      { field: "fullName", regex: "Name\\s*[:\\-]?\\s*([A-Za-z ]+)", type: "string", required: false }
    ]
  }
];

async function seedTemplates() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB...");

    for (let t of templates) {
      await BillTemplate.findOneAndUpdate({ discomName: t.discomName }, t, { upsert: true, new: true });
      console.log(`Upserted template: ${t.discomName}`);
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedTemplates();
