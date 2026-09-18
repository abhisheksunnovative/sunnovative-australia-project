const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URL);
  const Lead = require('./src/models/Lead.js').default;
  const EpcEnquiry = require('./src/models/EpcEnquiry.js').default;
  
  const lead = await Lead.findOne({ mobile: '8765423123' });
  console.log('Lead:', lead ? { kw: lead.kw, state: lead.state } : 'Not found');
  
  if (lead) {
    lead.state = 'Uttar Pradesh';
    lead.kw = 4; // Fix it to 4 if it was 3
    await lead.save();
    console.log('Fixed lead state to UP and kw to 4');
  }
  
  const enquiry = await EpcEnquiry.findOne({ customerMobile: '8765423123' });
  console.log('Enquiry:', enquiry ? { kw: enquiry.systemCapacityKw, state: enquiry.state } : 'Not found');
  
  if (enquiry) {
    enquiry.state = 'Uttar Pradesh';
    enquiry.systemCapacityKw = 4;
    await enquiry.save();
    console.log('Fixed enquiry state to UP and kw to 4');
  }
  
  process.exit(0);
}
run();
