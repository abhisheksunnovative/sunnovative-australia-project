import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Customer from './src/models/Customer.js';

async function checkLeads() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    const leads = await Customer.find().sort({ createdAt: -1 }).limit(10);
    console.log(leads.map(l => ({ name: l.consumerName, source: l.source, kw: l.kw, bill: l.billAmount, country: l.country })));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
checkLeads();
