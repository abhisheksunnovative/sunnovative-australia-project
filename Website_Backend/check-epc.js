import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URL = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";

async function checkEPC() {
  try {
    await mongoose.connect(MONGODB_URL);
    const { default: EpcPartner } = await import('./src/models/EpcPartner.js');

    const epcAus = await EpcPartner.findOne({ email: 'auepc3@test.com' }).lean();
    console.log(epcAus.trustBadge);
    
    mongoose.disconnect();
  } catch(err) {
    console.error(err);
    mongoose.disconnect();
  }
}

checkEPC();
