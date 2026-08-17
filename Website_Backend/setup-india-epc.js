import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URL = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";

async function setupIndianEPC() {
  try {
    await mongoose.connect(MONGODB_URL);
    const { default: EpcPartner } = await import('./src/models/EpcPartner.js');

    const epcInd = await EpcPartner.findOne({ companyName: /Test Solar Pvt Ltd/i });
    if(epcInd) {
        if(!epcInd.trustBadge) epcInd.trustBadge = {};
        epcInd.trustBadge.status = 'Approved';
        epcInd.trustBadge.purchasedLeads = 10;
        epcInd.trustBadge.leadsConsumed = 0;
        await epcInd.save();
        console.log("Successfully gave 10 leads to Test Solar Pvt Ltd");
    } else {
        console.log("Test Solar Pvt Ltd not found.");
    }
    
    mongoose.disconnect();
  } catch(err) {
    console.error(err);
    mongoose.disconnect();
  }
}

setupIndianEPC();
