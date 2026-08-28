import React, { useState, useEffect } from "react";
import { Users, CheckCircle, TrendingUp, Calendar, MapPin, PhoneForwarded, DollarSign, Building, Zap, Briefcase } from "lucide-react";
import { useAdminSettings } from "../../hooks/useAdminSettings";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function BDEDashboard({ bdeId, bdeType }) {
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

      {/* Header Row: Title LEFT + Banner RIGHT */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Title */}
        <div className="flex-1">
          <h2 className="text-2xl font-black text-slate-800 capitalize">
            {(bdeData?.country || 'India').charAt(0).toUpperCase() + (bdeData?.country || 'India').slice(1)} Regional BDE Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Track your Leads, Orders, and Performance</p>
        </div>

        {/* Banner (right side) */}
        {isFreelancer ? (
          <div className="bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-2xl px-6 py-4 text-slate-950 shadow-md flex items-center gap-4 min-w-0 md:max-w-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-yellow-400 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-base text-slate-950 truncate">Freelancer Commission</h3>
              <p className="text-xs font-medium text-slate-900">Total Accrued: ${(freelancerSettings.totalEarnings || 0).toLocaleString()}</p>
            </div>
            <span className="bg-slate-950 text-yellow-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shrink-0">FREELANCER</span>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl px-6 py-4 text-white shadow-md flex items-center gap-4 min-w-0 md:max-w-sm">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">Company BDE</h3>
              <p className="text-blue-100 text-xs">Keep up the great work generating orders!</p>
            </div>
          </div>
        )}
      </div>


      {/* ── 9 METRICS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* 1. New Leads */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-400 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isFreelancer ? 'New (Last 30 Days)' : 'New Leads (Pool)'}</p>
            <h3 className="text-3xl font-black text-slate-900">{stats?.newLeadsAvailable ?? 0}</h3>
          </div>
        </div>

        {/* 2. Qualified Leads */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 hover:border-indigo-400 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Qualified Leads</p>
            <h3 className="text-3xl font-black text-slate-900">{stats?.qualifiedLeads ?? 0}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Date Fixed</p>
          </div>
        </div>

        {/* 3. My Prospects */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 hover:border-violet-400 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Prospects</p>
            <h3 className="text-3xl font-black text-slate-900">{stats?.myProspects ?? 0}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Active claimed leads</p>
          </div>
        </div>

        {/* 4. Token Pending */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm flex items-center gap-4 hover:border-amber-400 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Token Pending</p>
            <h3 className="text-3xl font-black text-slate-900">{stats?.tokenPending ?? 0}</h3>
            <p className="text-[10px] text-amber-400 mt-0.5">Awaiting payment</p>
          </div>
        </div>

        {/* 5. EPC Selection Pending */}
        <div className="bg-white rounded-2xl p-5 border border-orange-200 shadow-sm flex items-center gap-4 hover:border-orange-400 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-orange-500 uppercase tracking-wider">EPC Selection Pending</p>
            <h3 className="text-3xl font-black text-slate-900">{stats?.epcPending ?? 0}</h3>
            <p className="text-[10px] text-orange-400 mt-0.5">Token paid, no EPC yet</p>
          </div>
        </div>

        {/* 6. Orders Created */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm flex items-center gap-4 hover:border-emerald-500 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Orders Created</p>
            <h3 className="text-3xl font-black text-slate-900">{stats?.ordersCreated ?? 0}</h3>
            <p className="text-[10px] text-emerald-400 mt-0.5">Fully converted</p>
          </div>
        </div>

        {/* 7. Lead-to-Prospect % */}
        <div className="bg-gradient-to-br from-sky-50 to-white rounded-2xl p-5 border border-sky-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-sky-600 uppercase tracking-wider">Lead → Prospect</p>
            <span className="text-2xl font-black text-sky-700">{stats?.leadToProspectPct ?? 0}%</span>
          </div>
          <div className="w-full bg-sky-100 rounded-full h-2">
            <div className="bg-sky-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, stats?.leadToProspectPct ?? 0)}%` }}></div>
          </div>
          <p className="text-[10px] text-sky-400 mt-1.5">Conversion Rate</p>
        </div>

        {/* 8. Prospect-to-Order % */}
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-5 border border-purple-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Prospect → Order</p>
            <span className="text-2xl font-black text-purple-700">{stats?.prospectToOrderPct ?? 0}%</span>
          </div>
          <div className="w-full bg-purple-100 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, stats?.prospectToOrderPct ?? 0)}%` }}></div>
          </div>
          <p className="text-[10px] text-purple-400 mt-1.5">Conversion Rate</p>
        </div>

        {/* 9. Total Converted KW */}
        <div className="bg-gradient-to-br from-yellow-50 to-white rounded-2xl p-5 border border-yellow-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Total KW Converted</p>
            <h3 className="text-3xl font-black text-slate-900">{stats?.totalConvertedKW ?? 0} <span className="text-lg font-bold text-slate-400">kW</span></h3>
          </div>
        </div>

      </div>

      {/* Target Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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
      {isFreelancer && (
      <div>
        <h3 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" /> Commission Per Lead
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

            )}

      
      
      {/* 7 Days Performance Graph */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mt-6 mb-6">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Last 7 Days Performance
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={[
                { name: "Last 7 Days", Leads: stats.last7Days?.leads || 0, Conversions: stats.last7Days?.conversions || 0 }
              ]} 
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} />
              <Bar dataKey="Conversions" fill="#10b981" radius={[4, 4, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
  
      {/* Detailed Sections with Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Today's Follow-ups */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><PhoneForwarded className="w-4 h-4 text-orange-500"/> Today's Follow-ups</h3>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">{stats.todaysFollowups || 0}</span>
          </div>
          <div className="p-0">
            {!stats.followupList || stats.followupList.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No follow-ups scheduled for today.</div>
            ) : (
              <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {stats.followupList.map(lead => (
                  <li key={lead._id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-xs text-gray-500">{lead.mobile} {lead.email && <span className="ml-1 bg-gray-100 px-1 rounded">{lead.email}</span>} - {lead.district || lead.suburb}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-md">{lead.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* District-wise Lead Status Graph */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500"/> Active Leads by Region (Graph)</h3>
          </div>
          <div className="p-4 flex-1 min-h-[300px]">
            {!stats.districtStats || stats.districtStats.length === 0 ? (
              <div className="text-center text-gray-500 text-sm p-4 h-full flex items-center justify-center">No regional lead data available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.districtStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} name="Active Leads" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
  
    </div>
  );
}