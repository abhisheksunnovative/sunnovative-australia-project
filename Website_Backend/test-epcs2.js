import mongoose from 'mongoose';
import EpcPartner from './src/models/EpcPartner.js';
import ProjectPricing from './src/models/ProjectPricing.js';
import Brand from './src/models/Brand.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URL).then(async () => {
  const allPricing = await ProjectPricing.find({ country: 'australia' });
  console.log("All pricing docs for AU:", allPricing.length);
  const epcIds = [...new Set(allPricing.map(p => p.epcId?.toString()))];
  console.log("EPCs who submitted rates:", epcIds);
  
  const epcs = await EpcPartner.find({ _id: { $in: epcIds } });
  console.log("EPC details:", epcs.map(e => ({ name: e.companyName, state: e.state, country: e.country, active: e.activeDistricts, service: e.serviceAreas })));
  
  process.exit();
}).catch(console.error);
