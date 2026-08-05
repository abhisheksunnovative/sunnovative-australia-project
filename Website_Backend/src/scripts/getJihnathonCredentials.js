import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URL || process.env.MONGO_URI || process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const Customer = mongoose.model('Customer', new mongoose.Schema({}, { strict: false }));
  const Notification = mongoose.model('Notification', new mongoose.Schema({}, { strict: false }));
  const ProjectOrder = mongoose.model('ProjectOrder', new mongoose.Schema({}, { strict: false }));

  const customer = await Customer.findOne({ $or: [{ mobile: '9999999999' }, { fullName: /jihnathon/i }] });
  console.log('\n--- CUSTOMER RECORD ---');
  console.log('ID:', customer?._id);
  console.log('Name:', customer?.fullName);
  console.log('Mobile:', customer?.mobile);
  console.log('PIN Set?:', customer?.pinSet);
  console.log('Country:', customer?.country);

  const po = await ProjectOrder.findOne({ orderNumber: 'SUN-2026-9313' });
  console.log('\n--- PROJECT ORDER ---');
  console.log('Order Number:', po?.orderNumber);
  console.log('Status:', po?.status);
  console.log('Assigned EPC:', po?.assignedEPCName);
  console.log('Is Install Date Fixed?:', po?.isInstallDateFixed);
  console.log('Preferred Install Date:', po?.preferredInstallDate);

  const notifs = await Notification.find({ recipientId: customer?._id?.toString() });
  console.log('\n--- CUSTOMER NOTIFICATIONS ---');
  console.log(`Found ${notifs.length} notifications:`);
  notifs.forEach(n => console.log(`- Title: "${n.title}" | Message: "${n.message}" | Read: ${n.read}`));

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
