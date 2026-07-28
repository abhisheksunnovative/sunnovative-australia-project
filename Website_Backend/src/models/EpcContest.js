import mongoose from 'mongoose';

const EpcContestSchema = new mongoose.Schema({
  country: { type: String, default: 'india', required: true },
  contestName: { type: String, required: true },
  duration: { 
    type: String, 
    enum: ['Weekly', 'Monthly', 'Quarterly', 'Custom Date Range'], 
    default: 'Monthly' 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  
  performanceCriteria: { 
    type: String, 
    enum: ['Monthly Installed KW', 'Projects Completed', 'Customer Ratings', 'On-time Completion', 'Customer Satisfaction Score'],
    default: 'Monthly Installed KW'
  },
  minimumKwTarget: { type: Number, required: true, default: 0 },
  
  rewardType: { 
    type: String, 
    enum: ['Extra KW Credits', 'Bonus Wallet Credits', 'Free Subscription Days', 'Verified Badge Benefits', 'Featured EPC Listing'],
    default: 'Extra KW Credits'
  },
  rewardValue: { type: Number, required: true, default: 0 },
  
  eligiblePlans: [{ type: String }],
  autoRewardDistribution: { type: Boolean, default: false },
  
  isActive: { type: Boolean, default: true },
  
  // Track if rewards have been processed manually by Admin
  rewardsDistributedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('EpcContest', EpcContestSchema);
