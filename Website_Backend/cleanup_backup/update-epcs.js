import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URL = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";

async function updateEPCs() {
  try {
    await mongoose.connect(MONGODB_URL);
    const { default: EpcPartner } = await import('./src/models/EpcPartner.js');

    let epcIndia = await EpcPartner.findOne({ companyName: /test/i, country: 'india' });
    if(epcIndia) {
       epcIndia.trustBadge = { status: 'Approved', purchasedLeads: 10, leadsConsumed: 0 };
       await epcIndia.save();
    }

    let epcAus = await EpcPartner.findOne({ companyName: /aussie power grid/i });
    if(epcAus) {
       epcAus.trustBadge = { status: 'Approved', purchasedLeads: 10, leadsConsumed: 0 };
       await epcAus.save();
    }

    console.log('Fixed schema and updated DB with leads!');
    mongoose.disconnect();
  } catch(err) {
    console.error(err);
    mongoose.disconnect();
  }
}

updateEPCs();
