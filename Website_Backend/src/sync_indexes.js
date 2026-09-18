
import mongoose from "mongoose";
import dotenv from "dotenv";
import EpcPartner from "./models/EpcPartner.js";
import EpcOrder from "./models/EpcOrder.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Syncing indexes");
  try {
    await EpcPartner.syncIndexes();
    await EpcOrder.syncIndexes();
    console.log("Done");
  } catch (e) { console.error(e); }
  mongoose.disconnect();
}
run();

