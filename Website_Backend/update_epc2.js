import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/sunnovative').then(async () => {
  const { default: EpcPartner } = await import('./src/models/EpcPartner.js');
  let auEpc = await EpcPartner.findOneAndUpdate(
    { companyName: 'Aussie Power Grid' },
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
  process.exit(0);
});
