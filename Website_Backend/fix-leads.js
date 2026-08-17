import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Lead from './src/models/Lead.js';

async function fixLeads() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB.");

    const leads = await Lead.find({ uploadSource: 'website' });
    let updatedCount = 0;

    for (const lead of leads) {
      if (lead.billAmount && lead.billAmount > 0) {
        let correctKw = 3;
        
        if (lead.country && lead.country.toLowerCase() === 'australia') {
           correctKw = Math.ceil(lead.billAmount / 100);
        } else {
           correctKw = Math.ceil(lead.billAmount / 700);
        }
        
        correctKw = Math.max(1, Math.min(20, correctKw));

        if (lead.kw !== correctKw.toString()) {
          console.log(`Updating lead ${lead.name} (${lead.country}): ${lead.kw} kW -> ${correctKw} kW (Bill: ${lead.billAmount})`);
          lead.kw = correctKw.toString();
          await lead.save();
          updatedCount++;
        }
      }
    }
    console.log(`Fixed ${updatedCount} leads successfully.`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
fixLeads();
