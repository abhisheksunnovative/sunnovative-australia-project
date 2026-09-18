
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Discom } from "./models/DiscomModel.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URL || process.env.MONGODB_URI);
  const discoms = await Discom.find().lean();
  console.log("Total Discoms in DB:", discoms.length);
  const names = discoms.map(d => `${d.short_code} (${d.state})`);
  console.log(names.join(", "));
  mongoose.disconnect();
}
run();

