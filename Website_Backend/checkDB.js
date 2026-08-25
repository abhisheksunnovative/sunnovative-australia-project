import mongoose from "mongoose";
import { BDE } from "./src/models/BDEModel.js";
import Lead from "./src/models/Lead.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/emergesun");
    
    const bde = await BDE.findOne({ email: "bde@test.com" });
    if (!bde) {
      console.log("BDE not found");
      process.exit(0);
    }
    
    console.log("BDE ID:", bde._id, "| Type:", bde.bdeType, "| Freelancer?:", bde.bdeType?.toLowerCase().includes('freelance'));
    
    const leads = await Lead.find({ assignedBde: bde._id });
    console.log("Total Leads:", leads.length);
    
    const manualLeads = leads.filter(l => l.history?.some(h => h.action.includes("Manually created by BDE")));
    const websiteLeads = leads.filter(l => !l.history?.some(h => h.action.includes("Manually created by BDE")));
    const prospects = leads.filter(l => l.installDateBooked && !l.tokenPaid);
    
    console.log("Manual (Self-Sourced):", manualLeads.length);
    console.log("Website Enquiries:", websiteLeads.length);
    console.log("Prospects:", prospects.length);
    
    console.log("\nDetails of Website Leads:");
    websiteLeads.forEach(l => {
      console.log(`- ${l.name} (${l.email}) | Status: ${l.status} | Booked: ${l.installDateBooked} | TokenPaid: ${l.tokenPaid}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();
