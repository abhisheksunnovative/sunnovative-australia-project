
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function update() {
  await mongoose.connect(process.env.MONGODB_URL);
  const EpcPartner = mongoose.models.EpcPartner || mongoose.model("EpcPartner", new mongoose.Schema({}, { strict: false }));
  
  const companyNames = [
    "solexa services private limited",
    "Solexa Services Pvt Ltd",
    "Ayodhya Solar Solutions",
    "SOLAR udaiYUG ENERGY",
    "SKY LIGHT SOLAR POWER"
  ];
  
  const result = await EpcPartner.updateMany(
    { companyName: { $in: companyNames.map(n => new RegExp(`^${n}$`, "i")) } },
    { $set: { state: "Uttar Pradesh", country: "India" } }
  );
  
  console.log("Updated docs:", result.modifiedCount);
  mongoose.disconnect();
}
update();

