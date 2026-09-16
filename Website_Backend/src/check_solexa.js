
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URL);
  const EpcPartner = mongoose.models.EpcPartner || mongoose.model("EpcPartner", new mongoose.Schema({}, { strict: false }));
  
  const docs = await EpcPartner.find({ companyName: /solexa/i });
  console.log("Solexa matches:", docs.map(d => ({name: d.companyName, state: d.state, country: d.country})));
  mongoose.disconnect();
}
check();

