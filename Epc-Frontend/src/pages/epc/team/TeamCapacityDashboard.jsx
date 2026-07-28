import { useState, useEffect, useMemo } from 'react';
import epcApi from '../../../api/epcApi';

const TeamCapacityDashboard = ({ myPlan }) => {
  const [wallet, setWallet] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [walletRes, enquiriesRes] = await Promise.all([
          epcApi.get('/api/epc/wallet'),
          epcApi.get('/api/epc/enquiries')
        ]);
        setWallet(walletRes.data);
        
        // We only care about active/recently accepted projects for the capacity calculation
        // The backend checks acceptedAt >= 7 days ago.
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const activeProjects = enquiriesRes.data.filter(eq => 
          eq.status !== 'Open For EPC' && 
          eq.status !== 'Bid Running' &&
          eq.acceptedAt && new Date(eq.acceptedAt) >= sevenDaysAgo
        );
        
        setEnquiries(activeProjects);
      } catch (error) {
        console.error('Error fetching capacity dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (myPlan) {
      fetchDashboardData();
    }
  }, [myPlan]);

  // Set default selected district once myPlan is available
  useEffect(() => {
    if (myPlan && !selectedDistrict) {
      if (myPlan.districtCapacities?.length > 0) {
        setSelectedDistrict(myPlan.districtCapacities[0].district);
      } else if (myPlan.activeDistricts?.length > 0) {
        setSelectedDistrict(myPlan.activeDistricts[0]);
      } else {
        setSelectedDistrict('All');
      }
    }
  }, [myPlan, selectedDistrict]);

  const districtStats = useMemo(() => {
    if (!myPlan || !selectedDistrict) return null;
    
    // Total Wallet KW available
    const totalWalletKw = wallet?.credits?.reduce((acc, curr) => acc + curr.credits, 0) || 0;
    
    // Get Weekly Limit for this district
    let districtLimit = 25; // Default plan limit if no overrides
    if (selectedDistrict !== 'All') {
      const cap = myPlan.districtCapacities?.find(d => d.district === selectedDistrict);
      if (cap) districtLimit = cap.weeklyCapacityKw;
    } else {
      // Sum of all capacities
      districtLimit = myPlan.districtCapacities?.reduce((acc, curr) => acc + curr.weeklyCapacityKw, 0) || 25;
    }

    // Projects assigned to this district in last 7 days
    const districtProjects = enquiries.filter(eq => selectedDistrict === 'All' || eq.district === selectedDistrict);
    
    // Total KW consumed by these projects
    const consumedKw = districtProjects.reduce((acc, curr) => acc + (curr.systemCapacityKw || 1), 0);
    
    // Remaining Capacity for the week
    const remainingWeeklyKw = Math.max(0, districtLimit - consumedKw);

    return {
      totalWalletKw,
      districtLimit,
      consumedKw,
      remainingWeeklyKw,
      districtProjects
    };
  }, [myPlan, selectedDistrict, wallet, enquiries]);

  if (loading || !myPlan) {
    return <div className="animate-pulse bg-gray-100 rounded-xl h-48 w-full mb-6 flex items-center justify-center text-gray-400">Loading Capacity Dashboard...</div>;
  }

  return (
    <div className="mb-8 border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
      {/* HEADER: Wallet Summary */}
      <div className="bg-slate-900 p-6 text-white">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Master KW Wallet
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="bg-slate-800 rounded-xl p-4 min-w-[150px] border border-slate-700">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Available KW</p>
            <p className="text-3xl font-black text-white">{districtStats?.totalWalletKw || 0}</p>
          </div>
          
          <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-3">
            {wallet?.credits?.map((c, i) => (
              <div key={i} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <p className="text-[10px] text-slate-400 font-semibold leading-tight mb-1 truncate">{c.projectType}</p>
                <p className="text-sm font-bold text-slate-200">{c.credits} KW</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BODY: District Filter & Weekly Throughput */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-gray-800 font-bold mb-1">Weekly District Throughput</h3>
            <p className="text-xs text-gray-500">Track how much KW your teams have processed in the last 7 days vs your limit.</p>
          </div>
          
          <div className="w-full md:w-64">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Filter by District</label>
            <select 
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="All">All Districts Combined</option>
              {myPlan.districtCapacities?.map(d => (
                <option key={d.district} value={d.district}>{d.district}</option>
              ))}
              {myPlan.activeDistricts?.filter(d => !myPlan.districtCapacities?.find(dc => dc.district === d)).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {districtStats && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Limit Visualizer */}
            <div className="col-span-1 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 font-semibold mb-1">Weekly KW Limit for {selectedDistrict}</p>
                <p className="text-2xl font-black text-gray-800">{districtStats.districtLimit} KW</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">Consumed (Last 7 Days)</p>
                  <p className="text-xl font-bold text-amber-600">{districtStats.consumedKw} KW</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Remaining</p>
                  <p className={`text-xl font-bold ${districtStats.remainingWeeklyKw > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {districtStats.remainingWeeklyKw} KW
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full ${districtStats.consumedKw >= districtStats.districtLimit ? 'bg-red-500' : 'bg-amber-500'}`} 
                  style={{ width: `${Math.min(100, (districtStats.consumedKw / districtStats.districtLimit) * 100)}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-gray-400 text-center">
                {Math.round(Math.min(100, (districtStats.consumedKw / districtStats.districtLimit) * 100))}% of Weekly Capacity Used
              </p>
            </div>

            {/* Active Projects List */}
            <div className="col-span-2">
              <h4 className="text-sm font-bold text-gray-700 mb-3">Projects Currently Consuming Capacity</h4>
              {districtStats.districtProjects.length > 0 ? (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                  {districtStats.districtProjects.map(proj => (
                    <div key={proj._id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-gray-800">{proj.customerName}</p>
                        <p className="text-[10px] text-gray-500">{proj.projectType} • {proj.district}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-md mb-1">
                          {proj.systemCapacityKw || 1} KW
                        </span>
                        <p className="text-[10px] text-gray-400 block">Accepted: {new Date(proj.acceptedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full min-h-[150px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                  <p className="text-sm font-semibold text-gray-500 mb-1">No Active Projects</p>
                  <p className="text-xs text-gray-400">Capacity in {selectedDistrict} is fully available.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamCapacityDashboard;
