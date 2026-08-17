import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URL)
  .then(async () => {
    const Lead = mongoose.model('Lead', new mongoose.Schema({}, { strict: false, collection: 'leads' }));
    const ProjectOrder = mongoose.model('ProjectOrder', new mongoose.Schema({}, { strict: false, collection: 'projectorders' }));
    const EpcEnquiry = mongoose.model('EpcEnquiry', new mongoose.Schema({}, { strict: false, collection: 'epcenquiries' }));

    const lead = await Lead.findOne({ name: /abcdefgh/i });
    if (!lead) {
      console.log('Lead abcdefgh not found');
      process.exit(0);
    }
    console.log('Found lead:', lead.name, 'Status:', lead.status, 'convertedProjectId:', lead.convertedProjectId);
    
    let deletedProjects = 0;
    if (lead.convertedProjectId) {
       const po = await ProjectOrder.findById(lead.convertedProjectId);
       if (po) {
         await EpcEnquiry.deleteMany({ orderNumber: po.orderNumber });
         await ProjectOrder.deleteOne({ _id: po._id });
         deletedProjects++;
       }
    }
    await ProjectOrder.deleteMany({ customerMobile: lead.mobile });

    await Lead.updateOne({ _id: lead._id }, { 
       $unset: { convertedProjectId: 1 }, 
       $set: { status: 'Converted' } 
    });

    console.log('Reverted lead successfully. Deleted Projects:', deletedProjects);
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
