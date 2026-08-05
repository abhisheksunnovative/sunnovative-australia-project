import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URL || process.env.MONGO_URI || process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const Customer = mongoose.model('Customer', new mongoose.Schema({}, { strict: false }));
  const Notification = mongoose.model('Notification', new mongoose.Schema({}, { strict: false }));
  const ProjectOrder = mongoose.model('ProjectOrder', new mongoose.Schema({}, { strict: false }));

  const customer = await Customer.findOne({ mobile: '9999999999' });
  if (!customer) {
    console.error('Customer 9999999999 not found');
    process.exit(1);
  }

  // Set known PIN '1234' for fast login
  const hashedPin = await bcrypt.hash('1234', 10);
  customer.loginPin = hashedPin;
  customer.pinSet = true;
  await customer.save();
  console.log(`Updated PIN for ${customer.fullName} (${customer.mobile}) to 1234`);

  // Link customerId on ProjectOrder
  const po = await ProjectOrder.findOne({ orderNumber: 'SUN-2026-9313' });
  if (po) {
    po.customerId = customer._id.toString();
    po.customerMobile = customer.mobile;
    po.customerName = customer.fullName;
    await po.save();
    console.log(`Updated ProjectOrder ${po.orderNumber} with customerId: ${customer._id.toString()}`);
  }

  // Create/Update Notification for Customer
  await Notification.deleteMany({ recipientId: customer._id.toString() });
  const notif = await Notification.create({
    role: 'Customer',
    recipientId: customer._id.toString(),
    title: '🎉 Solar Installation Date Confirmed & Fixed!',
    message: `Your solar installation for project SUN-2026-9313 has been officially confirmed for 12/08/2026 with Ausgrid Solar Solutions.`,
    projectId: po?._id,
    read: false,
    createdAt: new Date()
  });

  console.log('Created Notification for Jihnathon:', notif);
  console.log('✨ Fix complete!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
