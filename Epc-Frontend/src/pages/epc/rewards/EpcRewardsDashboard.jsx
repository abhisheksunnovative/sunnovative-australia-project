import React, { useState, useEffect } from 'react';
import { Award, Trophy, Target, ArrowUpCircle } from 'lucide-react';
import axios from 'axios';

const EpcRewardsDashboard = () => {
  const [contestsData, setContestsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const token = localStorage.getItem('epcToken');
      const res = await axios.get('http://localhost:4005/api/epc/contests/my-contests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContestsData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading Rewards...</div>;

  if (contestsData.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
        <Award className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700">No Active Contests</h2>
        <p className="text-gray-500 mt-2">There are currently no active performance contests for your account or region.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Performance Rewards & Incentives
        </h1>
        <p className="text-gray-600 mt-2">Compete with other EPCs, achieve your targets, and unlock exclusive rewards.</p>
      </div>

      <div className="grid gap-8">
        {contestsData.map((data) => {
          const { contest, myParticipant, myRank, leaderboard } = data;
          const progressPercentage = Math.min(100, Math.round((myParticipant.currentScore / contest.minimumKwTarget) * 100));
          const isTargetMet = myParticipant.currentScore >= contest.minimumKwTarget;

          return (
            <div key={contest._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                    {contest.duration} Contest
                  </span>
                  <h2 className="text-2xl font-bold">{contest.contestName}</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Ends on {new Date(contest.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl text-center min-w-[150px]">
                  <p className="text-sm font-semibold text-blue-100">Reward</p>
                  <p className="text-xl font-black text-yellow-300">{contest.rewardValue} {contest.rewardType}</p>
                </div>
              </div>

              <div className="p-6 grid md:grid-cols-3 gap-8">
                {/* My Progress */}
                <div className="md:col-span-2 space-y-6">
                  <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" /> My Progress
                  </h3>
                  
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 relative">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <p className="text-4xl font-black text-blue-600">
                          {myParticipant.currentScore} <span className="text-lg text-gray-500 font-normal">/ {contest.minimumKwTarget}</span>
                        </p>
                        <p className="text-sm font-semibold text-gray-500 uppercase mt-1">{contest.performanceCriteria}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-gray-800">{progressPercentage}%</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-4 mt-4 overflow-hidden">
                      <div 
                        className={`h-4 rounded-full transition-all duration-1000 ${isTargetMet ? 'bg-green-500' : 'bg-blue-600'}`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>

                    {isTargetMet ? (
                      <p className="text-sm text-green-600 font-bold mt-4 flex items-center gap-1">
                        <Award className="w-4 h-4"/> Target Achieved! You are eligible for the reward.
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 mt-4">
                        You need {contest.minimumKwTarget - myParticipant.currentScore} more to unlock the reward.
                      </p>
                    )}
                  </div>
                </div>

                {/* Leaderboard */}
                <div>
                  <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2 mb-4">
                    <ArrowUpCircle className="w-5 h-5 text-indigo-600" /> Top Performers
                  </h3>
                  <div className="bg-white border rounded-xl overflow-hidden">
                    {leaderboard.map((leader, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 border-b last:border-0 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-200 text-gray-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'}`}>
                            {idx + 1}
                          </span>
                          <span className="text-sm font-semibold text-gray-700 truncate max-w-[120px]" title={leader.companyName}>
                            {leader.companyName}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{leader.score}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-center border border-indigo-100">
                    <p className="text-sm text-indigo-800">
                      Your Current Rank: <span className="font-black text-lg">{myRank}</span>
                    </p>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EpcRewardsDashboard;
