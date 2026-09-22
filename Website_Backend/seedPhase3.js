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
    discomName: "BSES Yamuna",
    country: "india",
    anchorKeywords: ["BSES Yamuna", "bypl.customercare"],
    extractionRules: [
      { field: "monthlyBill", regex: "Bill Amount Payable[\\s\\S]{0,40}?(?:Rs\\.?|₹|INR)?\\s*([0-9]+(?:\\.[0-9]{1,2})?)", type: "number", required: true },
      { field: "consumerNumber", regex: "CA No\\.?\\s*[:\\-]?\\s*([0-9]{8,12})", type: "string", required: true },
      { field: "fullName", regex: "Name\\s*[:\\-]?\\s*(?:Mr\\.|Ms\\.|Mrs\\.)?\\s*([A-Za-z ]+)(?:\\n|\\r|\\s{2,})", type: "string", required: false },
      { field: "dueDate", regex: "Due Date(?:[\\s\\S]{0,40}?)?([0-9]{2}-[0-9]{2}-[0-9]{4}|[0-9]{2}\\/[0-9]{2}\\/[0-9]{4})", type: "string", required: false }
    ]
  },
  {
    discomName: "Puducherry Electricity",
    country: "india",
    anchorKeywords: ["Puducherry", "State Bank Collect"],
    extractionRules: [
      { field: "monthlyBill", regex: "Total amount due \\(in Rs\\)[\\s\\S]{0,20}?([0-9]+(?:\\.[0-9]{1,2})?)", type: "number", required: true },
      { field: "consumerNumber", regex: "Policy Number[\\s\\S]{0,20}?([A-Z0-9]+)", type: "string", required: false },
      { field: "fullName", regex: "Consumer Name[\\s\\S]{0,20}?([A-Z ]+)", type: "string", required: false },
      { field: "tariffCategory", regex: "Consumer Category[\\s\\S]{0,20}?([A-Z0-9]+)", type: "string", required: false }
    ]
  }
];

async function seedPhase3() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    for (let t of templates) {
      await BillTemplate.findOneAndUpdate({ discomName: t.discomName }, t, { upsert: true });
    }
    console.log("Phase 3 templates added!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
seedPhase3();
