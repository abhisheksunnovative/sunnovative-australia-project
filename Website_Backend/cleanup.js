import mongoose from 'mongoose';
import Lead from 'file:///D:/frotend-admin-website/Sunnovative_E_Commerce_Project/Website_Backend/src/models/Lead.js';
import Customer from 'file:///D:/frotend-admin-website/Sunnovative_E_Commerce_Project/Website_Backend/src/models/Customer.js';

const MONGODB_URL = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";

async function cleanupDuplicates() {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to DB...");

    // 1. Clean Leads
    const leads = await Lead.find({}).sort({ createdAt: -1 }); // Newest first
    const seenLeadMobiles = new Set();
    let leadsDeleted = 0;

    for (const lead of leads) {
      if (lead.mobile) {
        if (seenLeadMobiles.has(lead.mobile)) {
          await Lead.findByIdAndDelete(lead._id);
          leadsDeleted++;
        } else {
          seenLeadMobiles.add(lead.mobile);
        }
      }
    }
    console.log(`Deleted ${leadsDeleted} duplicate Leads.`);

    // 2. Clean Customers
    const customers = await Customer.find({}).sort({ createdAt: -1 }); // Newest first
    const seenCustomerMobiles = new Set();
    let customersDeleted = 0;

    for (const customer of customers) {
      if (customer.mobile) {
        if (seenCustomerMobiles.has(customer.mobile)) {
          await Customer.findByIdAndDelete(customer._id);
          customersDeleted++;
        } else {
          seenCustomerMobiles.add(customer.mobile);
        }
      }
    }
    console.log(`Deleted ${customersDeleted} duplicate Customers.`);

    console.log("Cleanup complete!");
    process.exit(0);
  } catch (err) {
    console.error("Cleanup Error:", err);
    process.exit(1);
  }
}

cleanupDuplicates();
