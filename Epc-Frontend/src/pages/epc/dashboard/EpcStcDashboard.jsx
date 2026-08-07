import { useState, useEffect } from 'react';
import { useEpcAuth } from '../../../context/EpcAuthContext';
import epcApi from '../../../api/epcApi';
import { Leaf, DollarSign, Activity, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EpcStcDashboard = () => {
  const { epc } = useEpcAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStcs: 0,
    estimatedRebate: 0,
    pendingStcs: 0,
    completedProjects: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);

  useEffect(() => {
    // Strict isolation: only for Australia
    if (epc?.country !== 'australia') {
      navigate('/epc/dashboard');
      return;
    }

    const fetchStcData = async () => {
      try {
        const { data } = await epcApi.get('/api/epc/orders');
        const projects = data.orders || data;

        let totalStcs = 0;
        let estimatedRebate = 0;
        let pendingStcs = 0;
        let completedProjects = 0;

        const stcProjects = projects.filter(p => p.estimatedSubsidy && p.estimatedSubsidy > 0);

        stcProjects.forEach(p => {
          const stcs = p.stcDetails?.stcCount || Math.floor((p.estimatedSubsidy || 0) / 38);
          
          if (p.status === 'completed') {
            totalStcs += stcs;
            estimatedRebate += p.estimatedSubsidy;
            completedProjects++;
          } else {
            pendingStcs += stcs;
          }
        });

        setStats({ totalStcs, estimatedRebate, pendingStcs, completedProjects });
        setRecentProjects(stcProjects.slice(0, 10)); // recent 10
      } catch (err) {
        console.error('Failed to fetch STC data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStcData();
  }, [epc, navigate]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-white text-2xl font-black tracking-tight">STC Dashboard</h2>
          <p className="text-slate-400 text-sm mt-1">Track your Small-scale Technology Certificates (STCs) & Rebates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total STCs */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-green-800 text-xs font-bold uppercase tracking-wider">Total Generated STCs</p>
            <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-green-700">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <p className="text-green-900 text-3xl font-black">{stats.totalStcs.toLocaleString()}</p>
          <p className="text-green-600 text-xs font-medium mt-1">From {stats.completedProjects} completed projects</p>
        </div>

        {/* Total Rebate */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-blue-800 text-xs font-bold uppercase tracking-wider">Estimated Total Rebate</p>
            <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-blue-900 text-3xl font-black">${stats.estimatedRebate.toLocaleString()}</p>
          <p className="text-blue-600 text-xs font-medium mt-1">Applied as point-of-sale discounts</p>
        </div>

        {/* Pending STCs */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-amber-800 text-xs font-bold uppercase tracking-wider">Pending/Active STCs</p>
            <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-700">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-amber-900 text-3xl font-black">{stats.pendingStcs.toLocaleString()}</p>
          <p className="text-amber-600 text-xs font-medium mt-1">Projects in progress</p>
        </div>

        {/* Status */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-center">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                 <AlertCircle className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-gray-800 font-bold">Registry Sync</p>
                <p className="text-gray-500 text-xs">Updated just now</p>
              </div>
           </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm overflow-hidden">
        <h3 className="text-gray-800 text-lg font-black mb-4">Recent STC Projects</h3>
        {recentProjects.length === 0 ? (
           <p className="text-sm text-gray-500 py-4 text-center border-t border-dashed">No projects with STC data found yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50/50">
                  <th className="py-3 px-4 font-bold text-gray-500 uppercase tracking-wider text-xs rounded-tl-xl">Order #</th>
                  <th className="py-3 px-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Customer</th>
                  <th className="py-3 px-4 font-bold text-gray-500 uppercase tracking-wider text-xs">System</th>
                  <th className="py-3 px-4 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">STC Count</th>
                  <th className="py-3 px-4 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Rebate Value</th>
                  <th className="py-3 px-4 font-bold text-gray-500 uppercase tracking-wider text-xs rounded-tr-xl">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map(p => {
                  const stcs = p.stcDetails?.stcCount || Math.floor((p.estimatedSubsidy || 0) / 38);
                  return (
                    <tr key={p._id} className="border-b border-gray-50 hover:bg-slate-50 transition cursor-pointer" onClick={() => navigate(`/epc/projects/${p._id}`)}>
                      <td className="py-3 px-4 font-medium text-gray-900">{p.orderNumber}</td>
                      <td className="py-3 px-4 font-medium text-gray-700">{p.customerName}</td>
                      <td className="py-3 px-4 text-gray-500">{p.systemSizeKW} kW • Zone {p.stcDetails?.zoneRating ? p.stcDetails.zoneRating : 3}</td>
                      <td className="py-3 px-4 font-bold text-green-600 text-right">{stcs}</td>
                      <td className="py-3 px-4 font-bold text-gray-900 text-right">${p.estimatedSubsidy?.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                          p.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EpcStcDashboard;
