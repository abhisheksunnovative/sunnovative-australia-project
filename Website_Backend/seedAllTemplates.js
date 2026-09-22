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
      { field: "monthlyBill", regex: "(?:Net Amount|Bill Amount Payable|Total Amount)[\\s\\S]{0,40}?(?:Rs\\.?|₹|INR)?\\s*([0-9]+(?:\\.[0-9]{1,2})?)", type: "number", required: true },
      { field: "consumerNumber", regex: "CA No\\.?\\s*[:\\-]?\\s*([0-9]{8,12})", type: "string", required: true },
      { field: "fullName", regex: "Name\\s*[:\\-]?\\s*(?:Mr\\.|Ms\\.|Mrs\\.)?\\s*([A-Za-z ]+)(?:\\n|\\r|\\s{2,})", type: "string", required: false },
      { field: "dueDate", regex: "Due Date(?:[\\s\\S]{0,40}?)?([0-9]{2}-[0-9]{2}-[0-9]{4}|[0-9]{2}\\/[0-9]{2}\\/[0-9]{4})", type: "string", required: false }
    ]
  },
  {
    discomName: "PSPCL",
    country: "india",
    anchorKeywords: ["PUNJAB STATE POWER", "PSPCL"],
    extractionRules: [
      { field: "monthlyBill", regex: "(?:Net Bill Amount Payable|Amount Payable)[\\s\\S]{0,40}?Rs\\.?\\s*([0-9]+(?:\\.[0-9]{1,2})?)", type: "number", required: true },
      { field: "consumerNumber", regex: "A\\/C No\\.?\\s*[:\\-]?\\s*([0-9]{9,12})", type: "string", required: true },
      { field: "fullName", regex: "Consumer Name\\s*[:\\-]?\\s*([A-Za-z ]+)(?:\\n|\\r|\\s{2,})", type: "string", required: false },
      { field: "dueDate", regex: "DueDate Cash\\/Online[\\s\\S]{0,40}?([0-9]{2}-[a-zA-Z]{3}-[0-9]{4})", type: "string", required: false }
    ]
  },
  {
    discomName: "MVVNL",
    country: "india",
    anchorKeywords: ["Madhyanchal Vidyut", "MVVNL"],
    extractionRules: [
      { field: "monthlyBill", regex: "Total (?:Due|Amount Due)[\\s\\S]{0,30}?(?:INR|Rs\\.?|₹)?\\s*([0-9.,]+)", type: "number", required: true },
      { field: "consumerNumber", regex: "Account Number\\s*[:\\-]?\\s*([0-9]{8,12})", type: "string", required: true },
      { field: "fullName", regex: "Name\\s*[:\\-]?\\s*([A-Za-z ]+)(?:\\n|\\r|\\s{2,})", type: "string", required: false },
      { field: "dueDate", regex: "Due Date\\s*[:\\-]?\\s*([a-zA-Z]+ [0-9]{1,2},? [0-9]{4})", type: "string", required: false }
    ]
  },
  {
    discomName: "Origin Energy",
    country: "australia",
    anchorKeywords: ["originenergy", "Origin"],
    extractionRules: [
      { field: "monthlyBill", regex: "(?:Amount due|Account balance)[\\s\\S]{0,20}?\\$\\s*([0-9.,]+)", type: "number", required: true },
      { field: "consumerNumber", regex: "Account number[\\s\\S]{0,20}?([A-Z0-9\\-]+)", type: "string", required: true },
      { field: "dueDate", regex: "New charges due[\\s\\S]{0,20}?([0-9]{1,2}\\s+[A-Za-z]+\\s+[0-9]{4})", type: "string", required: false }
    ]
  },
  {
    discomName: "Red Energy",
    country: "australia",
    anchorKeywords: ["Red Energy", "redenergy"],
    extractionRules: [
      { field: "monthlyBill", regex: "(?:TOTAL AMOUNT DUE|ACCOUNT BALANCE)[\\s\\S]{0,30}?\\$\\s*([0-9.,]+)", type: "number", required: true },
      { field: "consumerNumber", regex: "CUSTOMER NUMBER[\\s\\S]{0,20}?([0-9]{6,10})", type: "string", required: true },
      { field: "fullName", regex: "(?:MR|MRS|MS)[\\s\\S]{0,5}?([A-Z &]+)\\n", type: "string", required: false }
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

    console.log("Full OCR Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedTemplates();
