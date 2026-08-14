import mongoose from 'mongoose';
import EpcPartner from './src/models/EpcPartner.js';
import ProjectPricing from './src/models/ProjectPricing.js';
import Brand from './src/models/Brand.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URL).then(async () => {
  const brandsQuery = ['jinko', 'tesla', 'luminous']; // example
  const state = 'Queensland'; // example
  const brandDocs = await Brand.find({ name: { $in: brandsQuery.map(b => new RegExp('^' + b.trim() + '$', 'i')) } });
  const brandIds = brandDocs.map(b => b._id);
  
  const pricingDocs = await ProjectPricing.find({
    dynamicBrands: { $elemMatch: { brandIds: { $in: brandIds } } }
  });
  console.log("Found pricing docs:", pricingDocs.length);
  
  const epcIdsWithRates = pricingDocs.map(p => p.epcId).filter(id => id);
  console.log("Found EPC IDs with rates:", epcIdsWithRates);
  
  const allEpcs = await EpcPartner.find({ _id: { $in: epcIdsWithRates } });
  console.log("EPCs without state filter:", allEpcs.map(e => ({ name: e.companyName, state: e.state, country: e.country, isVerified: e.isVerified, active: e.activeDistricts, service: e.serviceAreas })));
  
  process.exit();
}).catch(console.error);
