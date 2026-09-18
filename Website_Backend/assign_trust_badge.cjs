const mongoose = require('mongoose');
require('dotenv').config();

const EpcPartner = require('./src/models/EpcPartner.js').default || require('./src/models/EpcPartner.js');

async function assignTrustBadge() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to DB");

  // Find 2 EPCs in UP
  const epcs = await EpcPartner.find({
    state: { $regex: /uttar pradesh|up/i },
    isActive: true
  }).limit(2);

  if (epcs.length === 0) {
    console.log("No EPCs found in UP!");
    process.exit(1);
  }

  for (const epc of epcs) {
    if (!epc.trustBadge) {
      epc.trustBadge = {};
    }
    epc.trustBadge.status = 'Approved';
    epc.trustBadge.leadsBalance = 20;
    epc.trustBadge.rating = 4.8;
    epc.trustBadge.reviews = 15;
    
    // Make sure they have a state if activeDistricts is empty
    if (!epc.activeDistricts || epc.activeDistricts.length === 0) {
        if (epc.district) {
            epc.activeDistricts = [epc.district];
        }
    }

    await EpcPartner.updateOne({ _id: epc._id }, { $set: epc.toObject() });
    console.log(`Updated EPC: ${epc.companyName} (${epc.email}) - Leads Balance: 20`);
  }

  console.log("Trust badge assignment done.");
  process.exit(0);
}

assignTrustBadge();
