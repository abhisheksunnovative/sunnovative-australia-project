import React, { useState, useEffect } from 'react';
import { Award, Plus, Trash2, CheckCircle, Clock } from 'lucide-react';
import { EmptyState } from './CommonUI';

export const EpcRewardsScreen = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [form, setForm] = useState({
    country: 'india',
    contestName: '',
    duration: 'Monthly',
    startDate: '',
    endDate: '',
    performanceCriteria: 'Monthly Installed KW',
    minimumKwTarget: 0,
    rewardType: 'Extra KW Credits',
    rewardValue: 0,
    eligiblePlans: 'Professional,Enterprise',
    autoRewardDistribution: false,
    isActive: true
  });

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const res = await fetch('http://localhost:4005/api/admin/contests');
      const data = await res.json();
      setContests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        eligiblePlans: form.eligiblePlans.split(',').map(s => s.trim())
      };
      
      const res = await fetch('http://localhost:4005/api/admin/contests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setShowForm(false);
        fetchContests();
      } else {
        alert('Failed to create contest');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDistribute = async (id) => {
    if (!window.confirm("Are you sure you want to distribute rewards for this contest?")) return;
    try {
      const res = await fetch(`http://localhost:4005/api/admin/contests/${id}/distribute`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Success! Distributed rewards to ${data.winnersCount} EPCs.`);
        fetchContests();
      } else {
        alert(data.message || 'Failed to distribute');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contest?")) return;
    try {
      await fetch(`http://localhost:4005/api/admin/contests/${id}`, { method: 'DELETE' });
      fetchContests();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-64px)] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Award className="w-7 h-7 text-yellow-500" />
            EPC Rewards & Incentives
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage performance contests and reward distribution for EPC partners.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors"
        >
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4" /> Create New Contest</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Contest Configuration</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Country</label>
              <select className="w-full p-2 border rounded-md" value={form.country} onChange={e => setForm({...form, country: e.target.value})}>
                <option value="india">India</option>
                <option value="australia">Australia</option>
                <option value="new_zealand">New Zealand</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Contest Name</label>
              <input type="text" required className="w-full p-2 border rounded-md" value={form.contestName} onChange={e => setForm({...form, contestName: e.target.value})} placeholder="e.g. Summer Install Bonanza" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Duration Type</label>
              <select className="w-full p-2 border rounded-md" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})}>
                <option>Weekly</option><option>Monthly</option><option>Quarterly</option><option>Custom Date Range</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Start Date</label>
                <input type="date" required className="w-full p-2 border rounded-md" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">End Date</label>
                <input type="date" required className="w-full p-2 border rounded-md" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Performance Criteria</label>
              <select className="w-full p-2 border rounded-md" value={form.performanceCriteria} onChange={e => setForm({...form, performanceCriteria: e.target.value})}>
                <option>Monthly Installed KW</option>
                <option>Projects Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Minimum Target (e.g. KW)</label>
              <input type="number" required className="w-full p-2 border rounded-md" value={form.minimumKwTarget} onChange={e => setForm({...form, minimumKwTarget: Number(e.target.value)})} />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Reward Type</label>
              <select className="w-full p-2 border rounded-md" value={form.rewardType} onChange={e => setForm({...form, rewardType: e.target.value})}>
                <option>Extra KW Credits</option>
                <option>Bonus Wallet Credits</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Reward Value</label>
              <input type="number" required className="w-full p-2 border rounded-md" value={form.rewardValue} onChange={e => setForm({...form, rewardValue: Number(e.target.value)})} />
            </div>

            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">Save Contest</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-xl"></div>
          <div className="h-24 bg-gray-200 rounded-xl"></div>
        </div>
      ) : contests.length === 0 ? (
        <EmptyState title="No Contests Created" description="Create a performance contest to motivate EPCs." />
      ) : (
        <div className="grid gap-4">
          {contests.map(c => {
            const isEnded = new Date(c.endDate) < new Date();
            return (
              <div key={c._id} className={`bg-white rounded-xl border p-5 flex flex-col md:flex-row justify-between gap-4 ${isEnded ? 'border-gray-200' : 'border-blue-200 shadow-sm'}`}>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{c.country}</span>
                    <h3 className="font-bold text-gray-800 text-lg">{c.contestName}</h3>
                    {!isEnded ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3"/> ACTIVE</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">ENDED</span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 mt-3 text-sm">
                    <div><span className="text-gray-500 text-xs">Target:</span> <br/><span className="font-bold">{c.minimumKwTarget} {c.performanceCriteria.includes('KW') ? 'KW' : 'Projects'}</span></div>
                    <div><span className="text-gray-500 text-xs">Reward:</span> <br/><span className="font-bold text-blue-600">{c.rewardValue} {c.rewardType}</span></div>
                    <div><span className="text-gray-500 text-xs">Start Date:</span> <br/><span className="font-semibold">{new Date(c.startDate).toLocaleDateString()}</span></div>
                    <div><span className="text-gray-500 text-xs">End Date:</span> <br/><span className="font-semibold">{new Date(c.endDate).toLocaleDateString()}</span></div>
                  </div>
                </div>
                
                <div className="flex flex-col justify-end gap-2 min-w-[140px]">
                  {isEnded && !c.rewardsDistributedAt && (
                    <button onClick={() => handleDistribute(c._id)} className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors">
                      <Award className="w-4 h-4"/> Distribute
                    </button>
                  )}
                  {c.rewardsDistributedAt && (
                    <div className="flex items-center justify-center gap-1 w-full px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-lg">
                      <CheckCircle className="w-4 h-4"/> Distributed
                    </div>
                  )}
                  <button onClick={() => handleDelete(c._id)} className="flex items-center justify-center gap-2 w-full px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4"/> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
