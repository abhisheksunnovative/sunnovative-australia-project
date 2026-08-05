import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URL || process.env.MONGO_URI || process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const Lead = mongoose.model('Lead', new mongoose.Schema({}, { strict: false }));
  const ProjectOrder = mongoose.model('ProjectOrder', new mongoose.Schema({}, { strict: false }));

  const activePo = await ProjectOrder.findOne({ orderNumber: 'SUN-2026-9313' });
  console.log('Active PO:', activePo?._id, activePo?.orderNumber);

  if (activePo) {
    const leads = await Lead.find({ $or: [{ mobile: '9999999999' }, { name: /jihnathon/i }] });
    console.log(`Found ${leads.length} leads for Jihnathon:`, leads.map(l => ({ id: l._id, name: l.name, convertedProjectId: l.convertedProjectId })));

    if (leads.length > 1) {
      // Keep primary lead and sync convertedProjectId
      const primaryLead = leads.find(l => l.convertedProjectId?.toString() === activePo._id.toString()) || leads[0];
      primaryLead.convertedProjectId = activePo._id;
      primaryLead.status = 'Converted';
      primaryLead.enquiryStatus = activePo.status || 'EPC Accepted';
      await primaryLead.save();

      const deleteRes = await Lead.deleteMany({
        $or: [{ mobile: '9999999999' }, { name: /jihnathon/i }],
        _id: { $ne: primaryLead._id }
      });
      console.log('Deleted duplicate leads:', deleteRes);
    } else if (leads.length === 1) {
      leads[0].convertedProjectId = activePo._id;
      leads[0].status = 'Converted';
      leads[0].enquiryStatus = activePo.status || 'EPC Accepted';
      await leads[0].save();
    }
  }

  console.log('✨ Lead sync complete!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
