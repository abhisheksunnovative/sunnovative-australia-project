const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URL);
  const EpcPartner = require('./src/models/EpcPartner.js').default;
  
  await EpcPartner.updateMany(
    { email: { $in: ['info@solexaservices.com', 'ayodhyasolarsolutions@gmail.com'] } },
    { $set: { 
        'trustBadge.remainingLeads': 20,
        'trustBadge.remainingViews': 100 
      } 
    }
  );
  
  console.log('Fixed trust badge leads!');
  
  process.exit(0);
}
run();
