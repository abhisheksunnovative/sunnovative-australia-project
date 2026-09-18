const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URL);
  const Lead = require('./src/models/Lead.js').default;
  const EpcEnquiry = require('./src/models/EpcEnquiry.js').default;
  
  const lead = await Lead.findOne({ mobile: '9876798787' });
  if (lead) {
    lead.state = 'Uttar Pradesh';
    lead.kw = 4;
    await lead.save();
  }
  
  const enquiry = await EpcEnquiry.findOne({ customerMobile: '9876798787' });
  if (enquiry) {
    enquiry.state = 'Uttar Pradesh';
    enquiry.systemCapacityKw = 4;
    await enquiry.save();
  }
  
  process.exit(0);
}
run();
