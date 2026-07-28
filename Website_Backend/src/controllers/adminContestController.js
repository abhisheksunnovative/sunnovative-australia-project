import EpcContest from '../models/EpcContest.js';
import EpcContestParticipant from '../models/EpcContestParticipant.js';
import EpcWallet from '../models/EpcWallet.js';

// Get all contests
export const getAllContests = async (req, res) => {
  try {
    const contests = await EpcContest.find().sort({ createdAt: -1 });
    res.json(contests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new contest
export const createContest = async (req, res) => {
  try {
    const contest = new EpcContest(req.body);
    await contest.save();
    res.status(201).json(contest);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create contest', error: error.message });
  }
};

// Update contest
export const updateContest = async (req, res) => {
  try {
    const contest = await EpcContest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    res.json(contest);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update contest', error: error.message });
  }
};

// Delete contest
export const deleteContest = async (req, res) => {
  try {
    const contest = await EpcContest.findByIdAndDelete(req.params.id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    
    // Also remove participants
    await EpcContestParticipant.deleteMany({ contestId: req.params.id });
    
    res.json({ message: 'Contest deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete contest', error: error.message });
  }
};

// Manually Distribute Rewards
export const distributeRewards = async (req, res) => {
  try {
    const { id } = req.params; // contestId
    const contest = await EpcContest.findById(id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    
    if (contest.rewardsDistributedAt) {
      return res.status(400).json({ message: 'Rewards have already been distributed for this contest' });
    }

    // Find all participants who met the target
    const eligibleParticipants = await EpcContestParticipant.find({
      contestId: id,
      currentScore: { $gte: contest.minimumKwTarget },
      rewardDistributed: false
    });

    for (const participant of eligibleParticipants) {
      // If reward is KW credits, credit the wallet
      if (contest.rewardType === 'Extra KW Credits' || contest.rewardType === 'Bonus Wallet Credits') {
        const wallet = await EpcWallet.findOne({ epcPartner: participant.epcId });
        if (wallet) {
          // Default to first project type or 'Surya Ghar Yojana'
          const pType = 'Surya Ghar Yojana';
          let creditEntry = wallet.credits.find(c => c.projectType === pType);
          if (creditEntry) {
            creditEntry.credits += contest.rewardValue;
          } else {
            wallet.credits.push({ projectType: pType, credits: contest.rewardValue });
          }
          
          wallet.transactions.push({
            type: 'PURCHASE',
            projectType: pType,
            kw: contest.rewardValue,
            amount: 0,
            note: `Reward for winning contest: ${contest.contestName}`
          });
          
          await wallet.save();
        }
      }
      
      // Mark as distributed
      participant.rewardDistributed = true;
      participant.distributedAt = new Date();
      await participant.save();
    }

    contest.rewardsDistributedAt = new Date();
    await contest.save();

    res.json({ 
      message: `Rewards distributed successfully to ${eligibleParticipants.length} EPC partners.`,
      winnersCount: eligibleParticipants.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to distribute rewards', error: error.message });
  }
};
