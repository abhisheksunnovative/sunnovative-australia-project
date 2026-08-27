import mongoose from 'mongoose';

const MONGO_URI = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const leadsCol = db.collection('leads');

  // Find all leads with billAmount > 0 but isEligibleForInstallation not true
  const stuckLeads = await leadsCol.find({ 
    billAmount: { $gt: 0 }, 
    isEligibleForInstallation: { $ne: true },
    status: { $nin: ['Converted', 'Not Interested', 'Lost'] }
  }).toArray();

  console.log(`\nFound ${stuckLeads.length} stuck leads with bill but NOT eligible:`);
  stuckLeads.forEach(l => {
    console.log(`  - "${l.name}" | _id: ${l._id} | bill: $${l.billAmount} | isEligible: ${l.isEligibleForInstallation}`);
  });

  if (stuckLeads.length > 0) {
    const ids = stuckLeads.map(l => l._id);
    const result = await leadsCol.updateMany(
      { _id: { $in: ids } },
      { $set: { isEligibleForInstallation: true } }
    );
    console.log(`\n✅ Fixed ${result.modifiedCount} leads — set isEligibleForInstallation: true`);
  } else {
    console.log("No stuck leads found to fix.");
  }

  // Verify Test New Lead 1
  const testLead = await leadsCol.findOne({ name: "Test New Lead 1" });
  if (testLead) {
    console.log(`\nTest New Lead 1 after fix: isEligibleForInstallation = ${testLead.isEligibleForInstallation}`);
  }

  await mongoose.disconnect();
  console.log("\nDone. Refresh the BDE portal now.");
}

run().catch(e => { console.error(e); process.exit(1); });
