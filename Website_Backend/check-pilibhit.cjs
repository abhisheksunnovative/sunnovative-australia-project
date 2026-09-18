const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URL);
  const Lead = require('./src/models/Lead.js').default;
  
  const leads = await Lead.find({ mobile: { $in: ['9988888811', '7777777771'] } });
  console.log(leads.map(l => ({ name: l.name, district: l.district, city: l.city, address: l.address, state: l.state })));
  
  process.exit(0);
}
run();
