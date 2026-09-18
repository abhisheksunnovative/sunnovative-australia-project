
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Discom } from "./models/DiscomModel.js";
import District from "./models/District.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URL || process.env.MONGODB_URI);
  console.log("Connected to MongoDB for missing discoms");

  const missingList = [
    { state: "Arunachal Pradesh", discoms: ["DoP Arunachal"] },
    { state: "Manipur", discoms: ["MSPDCL"] },
    { state: "Mizoram", discoms: ["P&E Mizoram"] },
    { state: "Nagaland", discoms: ["DoP Nagaland"] },
    { state: "Sikkim", discoms: ["E&P Sikkim"] },
    { state: "Uttar Pradesh", discoms: ["KESCO", "NPCL"] },
    { state: "Jharkhand", discoms: ["TSUISL", "DVC"] },
    { state: "West Bengal", discoms: ["IPCL", "DVC"] },
    { state: "Karnataka", discoms: ["HRECS"] },
    { state: "Kerala", discoms: ["TCED"] },
    { state: "Tamil Nadu", discoms: ["TNPDCL"] },
    { state: "Jammu and Kashmir", discoms: ["JPDCL", "KPDCL"] },
    { state: "Chandigarh", discoms: ["CPDL"] },
    { state: "Ladakh", discoms: ["PDD Ladakh"] },
    { state: "Andaman and Nicobar Islands", discoms: ["A&N ED"] },
    { state: "Puducherry", discoms: ["PED"] },
    { state: "Lakshadweep", discoms: ["Lakshadweep ED"] },
    { state: "Dadra and Nagar Haveli and Daman and Diu", discoms: ["DNHDDPDCL"] }
  ];

  for (const item of missingList) {
    const { state, discoms } = item;
    
    // Ensure state exists in District collection
    const stateExists = await District.findOne({ country: { $in: ["india", "India"] }, state: new RegExp(`^${state.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")}$`, "i") });
    if (!stateExists) {
      await District.create({ country: "India", state: state, district: "Capital", pincodes: [], isActive: true });
      console.log(`Added UT/State to Districts: ${state}`);
    }

    for (const d of discoms) {
      const exists = await Discom.findOne({ short_code: d, state: state });
      if (!exists) {
        await Discom.create({
          name: d,
          short_code: d,
          state: state,
          country: "India"
        });
        console.log(`Added Discom: ${d} for ${state}`);
      }
    }
  }

  console.log("Finished seeding missing Discoms");
  await mongoose.disconnect();
}

run();

