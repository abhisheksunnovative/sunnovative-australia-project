import mongoose from 'mongoose';

const EpcContestParticipantSchema = new mongoose.Schema({
  contestId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'EpcContest', 
    required: true 
  },
  epcId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'EpcPartner', 
    required: true 
  },
  currentScore: { 
    type: Number, 
    default: 0 
  }, // e.g. KW installed, or projects completed
  
  rewardDistributed: { 
    type: Boolean, 
    default: false 
  },
  distributedAt: { 
    type: Date, 
    default: null 
  }
}, { timestamps: true });

// Ensure one EPC can only have one participant record per contest
EpcContestParticipantSchema.index({ contestId: 1, epcId: 1 }, { unique: true });

export default mongoose.model('EpcContestParticipant', EpcContestParticipantSchema);
