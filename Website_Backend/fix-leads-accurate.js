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

    const indiaRanges = [
      { minBill: 0,    maxBill: 500,   suggestedKW: 0.5 },
      { minBill: 501,  maxBill: 1000,  suggestedKW: 1 },
      { minBill: 1001, maxBill: 1500,  suggestedKW: 1.5 },
      { minBill: 1501, maxBill: 2500,  suggestedKW: 2 },
      { minBill: 2501, maxBill: 4000,  suggestedKW: 3 },
      { minBill: 4001, maxBill: 6000,  suggestedKW: 4 },
      { minBill: 6001, maxBill: 9000,  suggestedKW: 6 },
      { minBill: 9001, maxBill: 99999, suggestedKW: 10 },
    ];

    for (const lead of leads) {
      if (lead.billAmount && lead.billAmount > 0) {
        let correctKw = 3;
        
        if (lead.country && lead.country.toLowerCase() === 'australia') {
           correctKw = Math.ceil(lead.billAmount / 100);
        } else {
           const matchedRange = indiaRanges.find((r) => lead.billAmount >= r.minBill && lead.billAmount <= r.maxBill);
           correctKw = matchedRange ? matchedRange.suggestedKW : 1;
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
