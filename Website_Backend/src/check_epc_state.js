
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URL);
  const EpcPartner = mongoose.models.EpcPartner || mongoose.model("EpcPartner", new mongoose.Schema({}, { strict: false }));
  
  const docs = await EpcPartner.find({});
  console.log("All EPCs:", docs.map(d => ({name: d.companyName, state: d.state})));
  mongoose.disconnect();
}
check();

