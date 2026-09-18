const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URL);
  const Lead = require('./src/models/Lead.js').default;
  const EpcEnquiry = require('./src/models/EpcEnquiry.js').default;
  
  const leads = await Lead.find({ district: { $regex: /kanpur/i } });
  
  for (const lead of leads) {
    if (lead.installDateBooked) {
      let enquiry = await EpcEnquiry.findOne({ customerMobile: lead.mobile });
      if (!enquiry) {
        const kw = parseFloat(lead.kw) || 1;
        enquiry = new EpcEnquiry({
          customerName: lead.name,
          customerMobile: lead.mobile,
          customerEmail: lead.email || "",
          enquiryType: 'ECommerce',
          projectType: 'Residential Solar', // fallback
          systemCapacityKw: kw,
          state: lead.state || "",
          district: lead.district || lead.city || "",
          city: lead.city || lead.district || "",
          address: lead.address || "",
          rooftopPhoto: lead.rooftopPhoto || "",
          preferredInstallDate: lead.preferredInstallDate,
          status: 'Open For EPC',
          assignmentType: 'FirstComeFirstServe'
        });
        await enquiry.save();
        console.log(`Created enquiry for ${lead.name}`);
      } else {
        console.log(`Enquiry already exists for ${lead.name}`);
      }
    }
  }
  
  process.exit(0);
}
run();
