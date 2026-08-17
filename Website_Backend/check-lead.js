import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Lead from './src/models/Lead.js';

async function checkLeads() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    const leads = await Lead.find().sort({ createdAt: -1 }).limit(10);
    console.log(leads.map(l => ({ name: l.consumerName || l.fullName, source: l.source, kw: l.kw, bill: l.billAmount, country: l.country })));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
checkLeads();
