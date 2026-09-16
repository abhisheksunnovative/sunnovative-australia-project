
import mongoose from "mongoose";
import { Discom } from "./models/DiscomModel.js";
import District from "./models/District.js";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URL || process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const discomsList = [
    { state: "Chhattisgarh", discoms: ["CSPDCL"] },
    { state: "Punjab", discoms: ["PSPCL"] },
    { state: "Madhya Pradesh", discoms: ["MPPKVVCL (West)", "MPMKVVCL (Central)", "MPPKVVCL (East)"] },
    { state: "Odisha", discoms: ["TPCODL", "TPNODL", "TPSODL", "TPWODL"] },
    { state: "Maharashtra", discoms: ["MSEDCL", "Adani Electricity", "BEST", "Tata Power Mumbai"] },
    { state: "Gujarat", discoms: ["DGVCL", "MGVCL", "PGVCL", "UGVCL", "Torrent Power"] },
    { state: "Rajasthan", discoms: ["JVVNL", "AVVNL", "JdVVNL"] },
    { state: "Tamil Nadu", discoms: ["TANGEDCO"] },
    { state: "Karnataka", discoms: ["BESCOM", "MESCOM", "CHESCOM", "HESCOM", "GESCOM"] },
    { state: "Telangana", discoms: ["TSSPDCL", "TSNPDCL"] },
    { state: "Uttar Pradesh", discoms: ["UPPCL", "MVVNL", "PVVNL", "DVVNL", "PuVVNL", "Torrent Power Agra"] },
    { state: "Haryana", discoms: ["DHBVN", "UHBVN"] },
    { state: "Bihar", discoms: ["NBPDCL", "SBPDCL"] },
    { state: "West Bengal", discoms: ["WBSEDCL", "CESC"] },
    { state: "Delhi", discoms: ["BRPL", "BYPL", "TPDDL", "NDMC"] },
    { state: "Assam", discoms: ["APDCL"] },
    { state: "Jharkhand", discoms: ["JBVNL"] },
    { state: "Uttarakhand", discoms: ["UPCL"] },
    { state: "Himachal Pradesh", discoms: ["HPSEB"] },
    { state: "Goa", discoms: ["Electricity Department Goa"] },
    { state: "Jammu and Kashmir", discoms: ["JKPDD"] },
    { state: "Tripura", discoms: ["TSECL"] },
    { state: "Meghalaya", discoms: ["MePDCL"] }
  ];

  for (const item of discomsList) {
    const { state, discoms } = item;
    
    // Ensure state exists in District collection so it appears in state dropdowns
    const stateExists = await District.findOne({ country: { $in: ["india", "India"] }, state: new RegExp(`^${state}$`, "i") });
    if (!stateExists) {
      await District.create({ country: "India", state: state, district: "Capital", pincodes: [], isActive: true });
      console.log(`Added state to Districts: ${state}`);
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

  console.log("Finished seeding Discoms");
  await mongoose.disconnect();
}

run();

