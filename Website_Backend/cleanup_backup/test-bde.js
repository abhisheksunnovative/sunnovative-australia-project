import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Lead from './src/models/Lead.js';
import { BDE } from './src/models/BDEModel.js';

async function test() {
  await mongoose.connect(process.env.MONGODB_URL);
  
  // Find a lead with a state
  const lead = await Lead.findOne({ state: { $exists: true, $ne: '' } });
  if (!lead) {
    console.log('No lead with state found for testing.');
    process.exit(0);
  }
  
  const leadState = lead.state.trim().toLowerCase();
  const bdes = await BDE.find({
    isActive: true,
    assignedStates: { $regex: new RegExp('^' + leadState + '$', 'i') }
  });
  
  console.log(Lead State: , Found BDEs: );
  process.exit(0);
}
test();
