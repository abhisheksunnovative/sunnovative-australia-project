import React, { useState, useEffect } from "react";
import { Users, FileCheck, DollarSign, Activity, AlertTriangle, ShieldCheck, Sun, CheckCircle, TrendingUp, MapPin, Award, Zap, Briefcase } from "lucide-react";
import { useAdminSettings } from "../../hooks/useAdminSettings";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function BDEAustDashboard({ bdeId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProjectComm, setSelectedProjectComm] = useState(null);
  
  const [bdeCountry, setBdeCountry] = useState(null);
  const { projectTypes } = useAdminSettings(bdeCountry);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

  useEffect(() => {
    if (!bdeId) return;
    fetchAustralianStats();
  }, [bdeId]);

  const fetchAustralianStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/bde/${bdeId}/dashboard`);
      const data = await res.json();
      if (data.success) {
        setBdeCountry(data.bde?.assignedCountries?.[0] || 'australia');
        setStats({
          leadsTarget: { 
            totalAssigned: data.stats.totalAssigned || 150, 
            targetLeads: data.stats.targetLeads || 200
          },
          districtStats: data.stats.districtStats || [],
          followupList: data.stats.followupList || [],
          todaysFollowups: data.stats.todaysFollowups || 0,
          last7Days: data.stats.last7Days || { leads: 0, conversions: 0 },
          activeCustomers: data.stats.activeCustomers || 0,
          ordersGenerated: data.stats.ordersGenerated || 2,
          conversionRatio: data.stats.conversionRatio || "40.00",
          isFreelancer: data.bde?.bdeType === "Freelancer",
          freelancerSettings: data.bde?.freelancerSettings || { commissionType: "PerKW", commissionAmount: 50, totalEarnings: 1250 }
        });
      } else {
        // Fallback mock for testing if api fails
        setStats({
          leadsTarget: { totalAssigned: 150, targetLeads: 200 },
          activeCustomers: 0,
          ordersGenerated: 2,
          conversionRatio: "40.00",
          districtStats: [],
          followupList: [],
          todaysFollowups: 0,
          last7Days: { leads: 0, conversions: 0 },
          isFreelancer: true,
          freelancerSettings: { commissionType: "PerKW", commissionAmount: 50, totalEarnings: 1250 }
        });
      }
    } catch(e) {
      setStats({
        leadsTarget: { totalAssigned: 150, targetLeads: 200 },
        activeCustomers: 0,
        ordersGenerated: 2,
        conversionRatio: "40.00",
          districtStats: [],
          followupList: [],
          todaysFollowups: 0,
          last7Days: { leads: 0, conversions: 0 },
          isFreelancer: true,
        freelancerSettings: { commissionType: "PerKW", commissionAmount: 50, totalEarnings: 1250 }
      });
    }
    setLoading(false);
  };

  if (loading || !stats) {
    return <div className="p-8 text-center text-gray-500 font-medium animate-pulse">Loading Australian BDE Dashboard...</div>;
  }

  const leadsPct = Math.min(100, Math.round((stats.leadsTarget.totalAssigned / stats.leadsTarget.targetLeads) * 100));

  const handleProjectClick = async (p) => {
    // In a real system, the BDE's specific commission for this project type would be fetched.
    // Here we simulate fetching the specific flat-rate commission for this project type.
    const rate = stats?.freelancerSettings?.commissionAmount || 50;
    const type = stats?.freelancerSettings?.commissionType || "Fixed";
    
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

  
  const isFreelancer = stats?.isFreelancer;
  // removed trueLeads for Aust Dashboard since leads are not fetched here directly

  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Australian Regional BDE Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track your Leads, Orders, and Performance</p>
        </div>
      </div>

      {/* Freelancer vs Company Header Banner */}
      {stats.isFreelancer ? (
        <div className="bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-2xl p-6 text-slate-950 shadow-md flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-950 text-yellow-400 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-xl text-slate-950">Freelancer Commission Accrued</h3>
              <p className="text-sm font-medium text-slate-900">Total Accrued: ${(stats.freelancerSettings?.totalEarnings || 0).toLocaleString()}</p>
            </div>
          </div>
          <span className="bg-slate-950 text-yellow-400 text-xs font-black px-4 py-2 rounded-full uppercase tracking-wider">AUSTRALIA</span>
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

      {/* TOP 4 METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 shadow-sm border border-indigo-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operating Country</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5 uppercase">AUSTRALIA</h3>
          </div>
        </div>

        <div onClick={() => typeof onTabChange !== 'undefined' && onTabChange("bde-leads")} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4 hover:border-blue-500 cursor-pointer transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Leads</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{stats?.leadsTarget?.totalAssigned || 0}</h3>
          </div>
        </div>

        <div onClick={() => typeof onTabChange !== 'undefined' && onTabChange("bde-projects")} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4 hover:border-emerald-500 cursor-pointer transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Journey</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{stats?.leadsTarget?.ordersGenerated || 0}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversion Ratio</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{stats?.leadsTarget?.targetConversions > 0 ? Math.round((stats.leadsTarget.ordersGenerated / stats.leadsTarget.targetConversions)*100) : 0}%</h3>
          </div>
        </div>
      </div>

      {/* Target Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Leads Target</h3>
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-3xl font-bold text-gray-900">{stats.leadsTarget?.totalAssigned || 0}</span>
              <span className="text-gray-500 ml-2">/ {stats.leadsTarget?.targetLeads || 0} acquired</span>
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
              <span className="text-3xl font-bold text-gray-900">{stats.leadsTarget?.ordersGenerated || 0}</span>
              <span className="text-gray-500 ml-2">/ {stats.leadsTarget?.targetConversions || 0} converted</span>
            </div>
            <span className="text-emerald-500 font-bold">{stats.leadsTarget?.targetConversions > 0 ? Math.min(100, Math.round((stats.leadsTarget.ordersGenerated / stats.leadsTarget.targetConversions) * 100)) : 0}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${stats.leadsTarget?.targetConversions > 0 ? Math.min(100, Math.round((stats.leadsTarget.ordersGenerated / stats.leadsTarget.targetConversions) * 100)) : 0}%` }}></div>
          </div>
        </div>
      </div>

      {/* PROJECT TYPES CARDS REPLACING STC */}
      <div>
        <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">
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
              className={`bg-white p-5 rounded-2xl border ${stats.isFreelancer ? 'border-slate-200/80 hover:border-blue-500 cursor-pointer' : 'border-slate-200/80 cursor-default'} shadow-sm flex flex-col items-center justify-center text-center transition-all`}
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
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/><polyline points="14 1 20 7 14 13"/><line x1="10" y1="14" x2="20" y2="7"/></svg>
              Today's Follow-ups
            </h3>
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
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Active Leads by Region (Graph)
            </h3>
          </div>
          <div className="p-4 flex-1 min-h-[300px]">
            {!stats.districtStats || stats.districtStats.length === 0 ? (
              <div className="text-center text-gray-500 text-sm p-4 h-full flex items-center justify-center">No regional lead data available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
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
