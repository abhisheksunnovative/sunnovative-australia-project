
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Discom } from "./models/DiscomModel.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URL || process.env.MONGODB_URI);
  const discoms = await Discom.find({ short_code: { $exists: true, $ne: null } }).lean();
  const dbCodes = discoms.map(d => d.short_code);
  console.log("DB Codes:", dbCodes);
  mongoose.disconnect();
}
run();

