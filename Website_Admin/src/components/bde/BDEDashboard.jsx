import React, { useState, useEffect } from "react";
import { Users, CheckCircle, TrendingUp, Calendar, MapPin, PhoneForwarded, DollarSign, Building, Zap, Briefcase } from "lucide-react";
import { useAdminSettings } from "../../hooks/useAdminSettings";

export default function BDEDashboard({ bdeId }) {
  const [stats, setStats] = useState(null);
  const [bdeData, setBdeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProjectComm, setSelectedProjectComm] = useState(null);
  
  // Try to use the first assigned country, or default to australia
  const bdeCountry = bdeData?.assignedCountries?.[0] || bdeData?.country || localStorage.getItem('userCountry') || 'india';
  const { projectTypes } = useAdminSettings(bdeCountry);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

  useEffect(() => {
    if (!bdeId) return;
    fetchDashboardStats();
  }, [bdeId]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/bde/${bdeId}/dashboard`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setBdeData(data.bde);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (loading || !stats) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading Dashboard Data...</div>;
  }

  const leadsPct = stats.targetLeads > 0 ? Math.min(100, Math.round((stats.totalAssigned / stats.targetLeads) * 100)) : 0;
  const convPct = stats.targetConversions > 0 ? Math.min(100, Math.round((stats.ordersGenerated / stats.targetConversions) * 100)) : 0;
  const isFreelancer = bdeData?.bdeType === "Freelancer";
  const freelancerSettings = bdeData?.freelancerSettings || { commissionType: "PerKW", commissionAmount: 50, totalEarnings: 1250 };

  const handleProjectClick = async (p) => {
    const rate = freelancerSettings?.commissionAmount || 50;
    const type = freelancerSettings?.commissionType || "Fixed";
    
    setSelectedProjectComm({
      projectType: p.label,
      value: p.value,
      rate,
      type,
      loadingProjects: true,
      projects: []
    });

    try {
      const res = await fetch(`${API_BASE}/api/bde/${bdeId}/projects?projectType=${p.value}`);
      const data = await res.json();
      if (data.success) {
        setSelectedProjectComm(prev => prev ? { ...prev, projects: data.projects, loadingProjects: false } : null);
      } else {
        setSelectedProjectComm(prev => prev ? { ...prev, loadingProjects: false } : null);
      }
    } catch (e) {
      setSelectedProjectComm(prev => prev ? { ...prev, loadingProjects: false } : null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Freelancer vs Company Header Banner */}
      {isFreelancer ? (
        <div className="bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-2xl p-6 text-slate-950 shadow-md flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-950 text-yellow-400 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-xl text-slate-950">Freelancer Commission Accrued</h3>
              <p className="text-sm font-medium text-slate-900">Total Accrued: ${(freelancerSettings.totalEarnings || 0).toLocaleString()}</p>
            </div>
          </div>
          <span className="bg-slate-950 text-yellow-400 text-xs font-black px-4 py-2 rounded-full uppercase tracking-wider">FREELANCER</span>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-md flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-xl text-white">Company BDE</h3>
              <p className="text-blue-100 text-sm">Keep up the great work generating orders!</p>
            </div>
          </div>
        </div>
      )}

      {/* Target Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Leads Target</h3>
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-3xl font-bold text-gray-900">{stats.totalAssigned}</span>
              <span className="text-gray-500 ml-2">/ {stats.targetLeads} acquired</span>
            </div>
            <span className="text-blue-600 font-bold">{leadsPct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${leadsPct}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Conversions Target</h3>
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-3xl font-bold text-gray-900">{stats.ordersGenerated}</span>
              <span className="text-gray-500 ml-2">/ {stats.targetConversions} converted</span>
            </div>
            <span className="text-emerald-500 font-bold">{convPct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${convPct}%` }}></div>
          </div>
        </div>
      </div>

      {/* PROJECT TYPES CARDS (REPLACING ANY OLD METRICS / STC) */}
      <div>
        <h3 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" /> Authorized Project Types
        </h3>
        <p className="text-sm text-slate-500 mb-4">Click a project type to view commission rates.</p>
        
        {selectedProjectComm && (
          <div className="mb-4 bg-white border border-yellow-300 shadow-lg rounded-xl overflow-hidden">
            <div className="bg-yellow-50 text-yellow-900 p-4 flex items-center justify-between border-b border-yellow-200">
              <div>
                <span className="font-black text-lg block">{selectedProjectComm.projectType} Commissions & Converted Leads</span>
                <span className="text-sm">As a Freelancer, you earn a {selectedProjectComm.type === "Fixed" ? "fixed flat-rate" : "per kW rate"} for this project type.</span>
              </div>
              <div className="bg-yellow-200 px-4 py-2 rounded-lg font-black text-xl shadow-sm">
                ${selectedProjectComm.rate} {selectedProjectComm.type === "Fixed" ? "Flat" : "/ kW"}
              </div>
            </div>
            
            <div className="p-4 bg-slate-50">
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Converted Leads for this Project Type
              </h4>
              
              {selectedProjectComm.loadingProjects ? (
                <div className="text-sm text-slate-500 text-center py-4">Loading converted leads...</div>
              ) : selectedProjectComm.projects?.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-2 px-3 pb-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <div className="col-span-3">Customer</div>
                    <div className="col-span-2">System</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-3">Status</div>
                    <div className="col-span-2 text-right">Commission Earned</div>
                  </div>
                  {selectedProjectComm.projects.map(proj => {
                    const commission = selectedProjectComm.type === "Fixed" ? 
                      selectedProjectComm.rate : 
                      (parseFloat(proj.systemSizeKW || 0) * selectedProjectComm.rate);
                    return (
                      <div key={proj._id} className="grid grid-cols-12 gap-2 items-center px-3 py-3 bg-white rounded-lg border border-slate-200 shadow-sm text-sm">
                        <div className="col-span-3 font-semibold text-slate-800 truncate">
                          {proj.customerName}
                          <div className="text-xs text-slate-500 font-normal truncate">{proj.location?.city}</div>
                        </div>
                        <div className="col-span-2 font-medium text-slate-700">
                          {proj.systemSizeKW || '0'} kW
                        </div>
                        <div className="col-span-2 text-slate-600">
                          {new Date(proj.createdAt).toLocaleDateString()}
                        </div>
                        <div className="col-span-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">
                            Converted
                          </span>
                        </div>
                        <div className="col-span-2 text-right font-black text-emerald-600">
                          ${commission.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex justify-between items-center px-3 pt-3 mt-3 border-t border-slate-200">
                    <span className="font-bold text-slate-600">Total Converted: {selectedProjectComm.projects.length}</span>
                    <span className="font-black text-lg text-emerald-600">
                      Total Earned: ${selectedProjectComm.projects.reduce((sum, proj) => sum + (selectedProjectComm.type === "Fixed" ? selectedProjectComm.rate : (parseFloat(proj.systemSizeKW || 0) * selectedProjectComm.rate)), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500 text-center py-6 bg-white rounded-xl border border-dashed border-slate-300">
                  You haven't converted any leads for {selectedProjectComm.projectType} yet.
                </div>
              )}
            </div>
            
            <div className="bg-white p-3 border-t border-slate-200 flex justify-end">
              <button onClick={() => setSelectedProjectComm(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm transition-colors">
                Close Details
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {projectTypes.map((p, idx) => (
            <div 
              key={idx} 
              onClick={() => handleProjectClick(p)}
              className={`bg-white p-5 rounded-2xl border ${isFreelancer ? 'border-slate-200/80 hover:border-blue-500 cursor-pointer' : 'border-slate-200/80 cursor-default'} shadow-sm flex flex-col items-center justify-center text-center transition-all`}
            >
              <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center mb-2 border border-slate-100">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-lg font-black text-slate-900">{p.label}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Project Category</span>
            </div>
          ))}
          {projectTypes.length === 0 && (
            <div className="col-span-full text-center p-8 bg-slate-50 rounded-xl text-slate-500 border border-slate-200">
              No project types configured for this region yet.
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Customers</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.activeCustomers}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Orders Generated</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.ordersGenerated}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Conversion Ratio</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.conversionRatio}%</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Today's Follow-ups</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.todaysFollowups}</h3>
          </div>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Follow-ups */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><PhoneForwarded className="w-4 h-4 text-orange-500"/> Today's Follow-ups</h3>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">{stats.todaysFollowups}</span>
          </div>
          <div className="p-0">
            {stats.followupList?.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No follow-ups scheduled for today.</div>
            ) : (
              <ul className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                {stats.followupList?.map(lead => (
                  <li key={lead._id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-xs text-gray-500">{lead.mobile} {lead.email && <span className="ml-1 bg-gray-100 px-1 rounded">{lead.email}</span>} ? {lead.district}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-md">{lead.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* District-wise Lead Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500"/> Active Leads by District</h3>
          </div>
          <div className="p-4">
            {stats.districtStats?.length === 0 ? (
              <div className="text-center text-gray-500 text-sm p-4">No active leads assigned yet.</div>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {stats.districtStats?.map(dist => (
                  <div key={dist._id} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{dist._id || 'Unknown'}</span>
                    <div className="flex items-center gap-3 w-1/2">
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, (dist.count / stats.totalAssigned) * 100)}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-8 text-right">{dist.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
