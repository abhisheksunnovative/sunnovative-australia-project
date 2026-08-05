import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URL || process.env.MONGO_URI || process.env.MONGODB_URI;

async function run() {
  if (!MONGO_URI) {
    console.error('MONGODB_URL not defined in .env');
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB successfully!');

  const Customer = mongoose.model('Customer', new mongoose.Schema({}, { strict: false }));
  const Lead = mongoose.model('Lead', new mongoose.Schema({}, { strict: false }));
  const ProjectOrder = mongoose.model('ProjectOrder', new mongoose.Schema({}, { strict: false }));

  // Find Jihnathon records
  const customers = await Customer.find({ $or: [{ mobile: /99999/ }, { fullName: /jihnathon/i }] });
  console.log('Customers found:', customers.map(c => ({ id: c._id, name: c.fullName, mobile: c.mobile })));

  const leads = await Lead.find({ $or: [{ mobile: /99999/ }, { name: /jihnathon/i }] });
  console.log('Leads found:', leads.map(l => ({ id: l._id, name: l.name, mobile: l.mobile })));

  const orders = await ProjectOrder.find({ $or: [{ customerMobile: /99999/ }, { customerName: /jihnathon/i }] });
  console.log('Orders found:', orders.map(o => ({ id: o._id, name: o.customerName, mobile: o.customerMobile })));

  // Delete dummy 9-digit customer record if 10-digit jihnathon customer exists
  const tenDigitCustomer = await Customer.findOne({ mobile: '9999999999' });
  if (tenDigitCustomer) {
    await Customer.deleteMany({ mobile: '999999999' });
    console.log('Deleted old 9-digit customer record.');
  } else {
    await Customer.updateOne({ mobile: '999999999' }, { $set: { mobile: '9999999999', fullName: 'jihnathon' } });
  }

  // Update Lead mobile to 9999999999
  const leadRes = await Lead.updateMany(
    { $or: [{ mobile: '999999999' }, { name: /jihnathon/i }] },
    { $set: { mobile: '9999999999', name: 'jihnathon' } }
  );
  console.log('Updated Leads:', leadRes);

  // Update ProjectOrder customerMobile to 9999999999
  const poRes = await ProjectOrder.updateMany(
    { $or: [{ customerMobile: '999999999' }, { customerName: /jihnathon/i }] },
    { $set: { customerMobile: '9999999999', customerName: 'jihnathon' } }
  );
  console.log('Updated ProjectOrders:', poRes);

  console.log('✨ All Jihnathon records successfully updated to 10-digit mobile: 9999999999');
  process.exit(0);
}

run().catch(err => {
  console.error('Error updating records:', err);
  process.exit(1);
});
