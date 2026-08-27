import mongoose from 'mongoose';
const MONGODB_URI = "mongodb+srv://sunnovative:iMhM2n4Vf8o5Y0xS@cluster0.pif7r.mongodb.net/sunnovativedb?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const Lead = mongoose.model('Lead', new mongoose.Schema({}, { strict: false }), 'leads');
    const leads = await Lead.find({ mobile: { $in: ['9000999976', '9999997777'] } });
    console.log(leads.map(l => ({ mobile: l.mobile, status: l.status, convertedProjectId: !!l.convertedProjectId })));
    process.exit(0);
  });
