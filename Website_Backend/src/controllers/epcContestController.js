import EpcContest from '../models/EpcContest.js';
import EpcContestParticipant from '../models/EpcContestParticipant.js';
import EpcPartner from '../models/EpcPartner.js';
import EpcEnquiry from '../models/EpcEnquiry.js';

// Helper: Calculate current score (e.g. Monthly Installed KW) for a contest
const calculateScore = async (epcId, contest) => {
  if (contest.performanceCriteria === 'Monthly Installed KW' || contest.performanceCriteria === 'Projects Completed') {
    // For simplicity, let's use accepted enquiries within the date range
    const enquiries = await EpcEnquiry.find({
      epcPartner: epcId,
      acceptedAt: { $gte: contest.startDate, $lte: contest.endDate }
    });
    
    if (contest.performanceCriteria === 'Monthly Installed KW') {
      return enquiries.reduce((acc, curr) => acc + (curr.systemCapacityKw || 1), 0);
    } else {
      return enquiries.length;
    }
  }
  return 0; // Default for others (Ratings, etc. need different logic)
};

export const getMyContests = async (req, res) => {
  try {
    const epcId = req.epc._id;
    const epc = await EpcPartner.findById(epcId);
    
    if (!epc) return res.status(404).json({ message: 'EPC not found' });

    // Fetch active contests matching EPC country
    const now = new Date();
    const contests = await EpcContest.find({
      country: epc.country || 'india',
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    const responseData = [];

    for (const contest of contests) {
      // Check if plan matches
      if (contest.eligiblePlans && contest.eligiblePlans.length > 0) {
        if (!contest.eligiblePlans.includes(epc.plan)) continue;
      }

      // Find or create participant
      let participant = await EpcContestParticipant.findOne({ contestId: contest._id, epcId });
      
      // Calculate real-time score
      const realTimeScore = await calculateScore(epcId, contest);
      
      if (!participant) {
        participant = new EpcContestParticipant({
          contestId: contest._id,
          epcId,
          currentScore: realTimeScore
        });
        await participant.save();
      } else if (participant.currentScore !== realTimeScore) {
        participant.currentScore = realTimeScore;
        await participant.save();
      }

      // Get leaderboard (Top 5)
      const topParticipants = await EpcContestParticipant.find({ contestId: contest._id })
        .sort({ currentScore: -1 })
        .limit(5)
        .populate('epcId', 'companyName'); // User requested to show company names for healthy competition
      
      const leaderboard = topParticipants.map(p => ({
        companyName: p.epcId ? p.epcId.companyName : 'Unknown',
        score: p.currentScore
      }));

      // Find my rank
      const allParticipants = await EpcContestParticipant.find({ contestId: contest._id }).sort({ currentScore: -1 });
      const myRank = allParticipants.findIndex(p => p.epcId.toString() === epcId.toString()) + 1;

      responseData.push({
        contest,
        myParticipant: participant,
        myRank: myRank > 0 ? myRank : '-',
        leaderboard
      });
    }

    res.json(responseData);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
