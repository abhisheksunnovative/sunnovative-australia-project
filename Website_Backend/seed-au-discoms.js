import mongoose from "mongoose";
import dotenv from "dotenv";
import { Discom } from "./src/models/DiscomModel.js";

dotenv.config();

const auDiscoms = [
  { name: "Ausgrid", country: "australia", state: "New South Wales", districts: [] },
  { name: "Endeavour Energy", country: "australia", state: "New South Wales", districts: [] },
  { name: "Essential Energy", country: "australia", state: "New South Wales", districts: [] },
  { name: "Energex", country: "australia", state: "Queensland", districts: [] },
  { name: "Ergon Energy", country: "australia", state: "Queensland", districts: [] },
  { name: "AusNet Services", country: "australia", state: "Victoria", districts: [] },
  { name: "Jemena", country: "australia", state: "Victoria", districts: [] },
  { name: "United Energy", country: "australia", state: "Victoria", districts: [] },
  { name: "CitiPower", country: "australia", state: "Victoria", districts: [] },
  { name: "Powercor", country: "australia", state: "Victoria", districts: [] },
  { name: "Western Power", country: "australia", state: "Western Australia", districts: [] },
  { name: "Horizon Power", country: "australia", state: "Western Australia", districts: [] },
  { name: "SA Power Networks", country: "australia", state: "South Australia", districts: [] },
  { name: "TasNetworks", country: "australia", state: "Tasmania", districts: [] }
];

const MONGO_URI = process.env.MONGODB_URL;

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    
    // Check if they exist to avoid duplication
    for (const d of auDiscoms) {
      const exists = await Discom.findOne({ name: d.name, country: "australia" });
      if (!exists) {
        await Discom.create(d);
        console.log(`Inserted: ${d.name}`);
      } else {
        console.log(`Already exists: ${d.name}`);
      }
    }
    
    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

seed();
