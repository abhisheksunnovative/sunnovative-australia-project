const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URL);
  const EpcPartner = require('./src/models/EpcPartner.js').default;
  
  const epc = await EpcPartner.findOne({ email: 'ayodhyasolarsolutions@gmail.com' });
  console.log('EPC:', epc ? { state: epc.state, isFrozen: epc.isFrozen, trustBadge: epc.trustBadge } : 'Not found');
  
  process.exit(0);
}
run();
