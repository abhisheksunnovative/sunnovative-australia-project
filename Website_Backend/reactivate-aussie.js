import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URL = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";

async function reactivateAussie() {
  try {
    await mongoose.connect(MONGODB_URL);
    const { default: EpcPartner } = await import('./src/models/EpcPartner.js');

    const epcAus = await EpcPartner.findOne({ email: 'auepc3@test.com' });
    if(epcAus && epcAus.trustBadge) {
        epcAus.trustBadge.leadsConsumed = 0;
        epcAus.trustBadge.purchasedLeads = 10;
        epcAus.trustBadge.status = 'Approved';
        await epcAus.save();
        console.log("Successfully reactivated leads for Aussie Power Grid (auepc3@test.com) to 10 active leads!");
    } else {
        console.log("Aussie Power Grid not found.");
    }
    
    mongoose.disconnect();
  } catch(err) {
    console.error(err);
    mongoose.disconnect();
  }
}

reactivateAussie();
