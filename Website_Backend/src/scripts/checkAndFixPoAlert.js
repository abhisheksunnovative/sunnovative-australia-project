import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URL || process.env.MONGO_URI || process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const ProjectOrder = mongoose.model('ProjectOrder', new mongoose.Schema({}, { strict: false }));
  const po = await ProjectOrder.findOne({ orderNumber: 'SUN-2026-9313' });

  console.log('\n--- SUN-2026-9313 DATABASE RECORD ---');
  console.log('orderNumber:', po?.orderNumber);
  console.log('status:', po?.status);
  console.log('assignedEPCName:', po?.assignedEPCName);
  console.log('isInstallDateFixed:', po?.isInstallDateFixed);
  console.log('preferredInstallDate:', po?.preferredInstallDate);
  console.log('pendingActionAlert:', po?.pendingActionAlert);
  console.log('pendingActionFor:', po?.pendingActionFor);

  // Update pendingActionAlert to Confirmed text
  if (po) {
    po.pendingActionAlert = `🎉 Final Installation Date Confirmed & Locked for ${new Date(po.preferredInstallDate || Date.now()).toLocaleDateString("en-IN")} with ${po.assignedEPCName || 'Ausgrid Solar Solutions'}!`;
    po.pendingActionFor = 'none';
    po.isInstallDateFixed = true;
    await po.save();
    console.log('\nUpdated SUN-2026-9313 pendingActionAlert to Confirmed text!');
  }

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
