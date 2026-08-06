import React, { useState, useEffect } from 'react';
import { Award, Trophy, Target, ArrowUpCircle, Medal, Zap } from 'lucide-react';
import epcApi from '../../../api/epcApi';

const EpcRewardsDashboard = () => {
  const [contestsData, setContestsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const { data } = await epcApi.get('/api/epc/contests/my-contests');
      setContestsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h2 className="text-white text-2xl font-black tracking-tight">Rewards & Incentives</h2>
          <p className="text-slate-400 text-sm mt-1">Compete, achieve, and win exclusive rewards</p>
        </div>
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (contestsData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-white text-2xl font-black tracking-tight">Rewards & Incentives</h2>
              <p className="text-slate-400 text-sm mt-0.5">Compete, achieve, and win exclusive rewards</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-premium p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-100">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-black text-gray-800 mb-2">No Active Contests</h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            There are currently no active performance contests for your account or region. Check back soon!
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>KW Credits</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Medal className="w-4 h-4 text-blue-400" />
              <span>Plan Upgrades</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Cash Rewards</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-white text-2xl font-black tracking-tight">Rewards & Incentives</h2>
              <p className="text-slate-400 text-sm mt-0.5">Compete, achieve targets, and unlock exclusive rewards</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-xl">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-bold text-sm">{contestsData.length} Active Contest{contestsData.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* CONTESTS */}
      <div className="grid gap-6">
        {contestsData.map((data) => {
          const { contest, myParticipant, myRank, leaderboard } = data;
          const progressPercentage = Math.min(100, Math.round((myParticipant.currentScore / contest.minimumKwTarget) * 100));
          const isTargetMet = myParticipant.currentScore >= contest.minimumKwTarget;
          const remaining = contest.minimumKwTarget - myParticipant.currentScore;

          return (
            <div key={contest._id} className="bg-white border border-gray-200 rounded-2xl shadow-premium overflow-hidden">

              {/* Contest Banner */}
              <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                      {contest.duration} Contest
                    </span>
                    <h2 className="text-2xl font-black tracking-tight">{contest.contestName}</h2>
                    <p className="text-blue-200 text-sm mt-1.5 font-medium flex items-center gap-1.5">
                      <span>Ends:</span>
                      <span className="font-black text-white">{new Date(contest.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </p>
                  </div>

                  {/* Reward Badge */}
                  <div className="bg-white/15 backdrop-blur border border-white/30 p-4 rounded-2xl text-center min-w-[160px] shadow-xl">
                    <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Reward</p>
                    <p className="text-2xl font-black text-yellow-300">{contest.rewardValue}</p>
                    <p className="text-sm font-bold text-white/80">{contest.rewardType}</p>
                  </div>
                </div>
              </div>

              {/* Contest Body */}
              <div className="p-6 grid md:grid-cols-5 gap-6">

                {/* Progress - 3 cols */}
                <div className="md:col-span-3 space-y-5">
                  <h3 className="font-black text-gray-800 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-blue-600" />
                    </div>
                    My Progress
                  </h3>

                  <div className={`p-5 rounded-2xl border ${isTargetMet ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className={`text-5xl font-black ${isTargetMet ? 'text-emerald-600' : 'text-blue-600'}`}>
                          {myParticipant.currentScore}
                          <span className="text-xl text-gray-400 font-normal ml-2">/ {contest.minimumKwTarget}</span>
                        </p>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-2">{contest.performanceCriteria}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-3xl font-black ${isTargetMet ? 'text-emerald-600' : 'text-gray-600'}`}>{progressPercentage}%</p>
                        <p className="text-gray-400 text-xs">Complete</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3.5 overflow-hidden">
                      <div
                        className={`h-3.5 rounded-full transition-all duration-1000 ${isTargetMet ? 'bg-gradient-to-r from-emerald-400 to-green-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>

                    {isTargetMet ? (
                      <div className="flex items-center gap-2 mt-4 bg-emerald-100 text-emerald-800 px-4 py-2.5 rounded-xl border border-emerald-200">
                        <Award className="w-4 h-4 flex-shrink-0" />
                        <p className="text-sm font-black">Target Achieved! You are eligible for the reward.</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-gray-500 text-sm">
                          <span className="font-black text-gray-800">{remaining}</span> more KW needed to unlock reward
                        </p>
                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">
                          Keep going!
                        </span>
                      </div>
                    )}
                  </div>

                  {/* My Rank Highlight */}
                  <div className={`flex items-center gap-4 p-4 rounded-2xl border ${myRank <= 3 ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200' : 'bg-indigo-50 border-indigo-200'}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-sm ${
                      myRank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                      myRank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                      myRank === 3 ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white' :
                      'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'
                    }`}>
                      #{myRank}
                    </div>
                    <div>
                      <p className={`font-black text-sm ${myRank <= 3 ? 'text-amber-800' : 'text-indigo-800'}`}>Your Current Rank</p>
                      <p className={`text-xs ${myRank <= 3 ? 'text-amber-600' : 'text-indigo-500'}`}>
                        {myRank === 1 ? 'You are leading! Keep it up.' : myRank <= 3 ? 'Great position! Almost there.' : 'Keep pushing to climb up!'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Leaderboard - 2 cols */}
                <div className="md:col-span-2">
                  <h3 className="font-black text-gray-800 flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <ArrowUpCircle className="w-4 h-4 text-indigo-600" />
                    </div>
                    Top Performers
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    {leaderboard.map((leader, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-3.5 border-b last:border-0 transition-colors ${idx === 0 ? 'bg-gradient-to-r from-amber-50 to-yellow-50' : 'hover:bg-gray-50'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${
                            idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                            idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                            idx === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white' :
                            'bg-blue-50 text-blue-600 border border-blue-200'
                          }`}>
                            {idx + 1}
                          </div>
                          <span className={`text-sm font-bold truncate max-w-[110px] ${idx === 0 ? 'text-amber-800' : 'text-gray-700'}`} title={leader.companyName}>
                            {leader.companyName}
                          </span>
                        </div>
                        <span className={`text-sm font-black tabular-nums ${idx === 0 ? 'text-amber-700' : 'text-gray-900'}`}>
                          {leader.score} KW
                        </span>
                      </div>
                    ))}
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
