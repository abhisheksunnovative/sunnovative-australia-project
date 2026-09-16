
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URL);
  const EpcPartner = mongoose.models.EpcPartner || mongoose.model("EpcPartner", new mongoose.Schema({}, { strict: false }));
  
  const state = "Uttar Pradesh";
  const country = "India";
  
  const query = {};
  query.country = { $regex: new RegExp(`^${country.trim()}$`, "i") };
  
  const stateRegex = new RegExp(`^${state.trim()}$`, "i");
  query.$or = [
    { state: stateRegex },
    { activeDistricts: stateRegex },
    { "serviceAreas.state": stateRegex },
    { state: { $regex: /^all$/i } }
  ];
  
  const docs = await EpcPartner.find(query).select("companyName email state country").limit(10);
  console.log("Docs found:", docs.length);
  console.log(docs);
  mongoose.disconnect();
}
check();

