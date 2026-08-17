import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/sunnovative').then(async () => {
  const { default: EpcPartner } = await import('./src/models/EpcPartner.js');
  
  // Update one EPC in Australia
  let auEpc = await EpcPartner.findOneAndUpdate(
    { country: 'australia' },
    { 
      $set: { 
        'trustBadge.status': 'Approved', 
        'trustBadge.remainingViews': 50,
        'trustBadge.remainingLeads': 50,
        'trustBadge.assignedCount': 0,
        'trustBadge.skippedCount': 0
      } 
    },
    { new: true }
  );
  if (auEpc) console.log('Approved trust badge for AU EPC:', auEpc.companyName);
  
  // Update one EPC in India
  let inEpc = await EpcPartner.findOneAndUpdate(
    { country: 'india' },
    { 
      $set: { 
        'trustBadge.status': 'Approved', 
        'trustBadge.remainingViews': 50,
        'trustBadge.remainingLeads': 50,
        'trustBadge.assignedCount': 0,
        'trustBadge.skippedCount': 0
      } 
    },
    { new: true }
  );
  if (inEpc) console.log('Approved trust badge for IN EPC:', inEpc.companyName);

  process.exit(0);
});
