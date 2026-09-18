
import mongoose from "mongoose";
import dotenv from "dotenv";
import { BillTemplate } from "./models/BillTemplate.js";
import { Discom } from "./models/DiscomModel.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URL || process.env.MONGODB_URI);
  const templates = await BillTemplate.find({}).populate("discom_id").lean();
  
  const stateWise = {};
  for (const t of templates) {
    if (t.discom_id && t.discom_id.state) {
      if (!stateWise[t.discom_id.state]) {
        stateWise[t.discom_id.state] = new Set();
      }
      const val = t.discom_id.short_code || t.discom_id.name || "Unknown";
      stateWise[t.discom_id.state].add(val);
    }
  }

  console.log("=== State-wise Uploaded Bills (Templates) ===");
  for (const [state, discoms] of Object.entries(stateWise)) {
    console.log(`- ${state}: ${Array.from(discoms).join(", ")}`);
  }
  mongoose.disconnect();
}
run();

