import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://sunnovative:iMhM2n4Vf8o5Y0xS@cluster0.pif7r.mongodb.net/sunnovativedb?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB.");
    
    const projectSchema = new mongoose.Schema({}, { strict: false });
    const Project = mongoose.model('ProjectOrder', projectSchema, 'projectorders');
    
    const enquirySchema = new mongoose.Schema({}, { strict: false });
    const EpcEnquiry = mongoose.model('EpcEnquiry', enquirySchema, 'epcenquiries');

    const res1 = await Project.deleteMany({ orderNumber: 'SUN-2026-5400' });
    console.log("Deleted projects:", res1.deletedCount);
    
    const res2 = await EpcEnquiry.deleteMany({ orderNumber: 'SUN-2026-5400' });
    console.log("Deleted enquiries:", res2.deletedCount);
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
