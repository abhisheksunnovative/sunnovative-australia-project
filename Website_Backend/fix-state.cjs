const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URL);
  const Lead = require('./src/models/Lead.js').default;
  const EpcEnquiry = require('./src/models/EpcEnquiry.js').default;
  
  const leads = await Lead.find({ mobile: { $in: ['9988888811', '7777777771'] } });
  console.log('Leads:', leads.map(l => ({ name: l.name, state: l.state, _id: l._id })));
  
  for (let l of leads) {
     l.state = "Uttar Pradesh";
     await l.save();
  }
  
  const enqs = await EpcEnquiry.find({ customerMobile: { $in: ['9988888811', '7777777771'] } });
  console.log('Enquiries:', enqs.map(e => ({ name: e.customerName, state: e.state, _id: e._id })));
  
  for (let e of enqs) {
     e.state = "Uttar Pradesh";
     await e.save();
  }
  
  process.exit(0);
}
run();
