import React, { useState, useEffect } from "react";
import { Users, FileCheck, DollarSign, Activity, AlertTriangle, ShieldCheck, Sun, CheckCircle, TrendingUp, MapPin, Award, Zap, Briefcase } from "lucide-react";
import { useAdminSettings } from "../../hooks/useAdminSettings";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Australian Regional BDE Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track your Leads, Orders, and Performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-sm text-slate-700">Monthly Leads Target</h3>
            <span className="text-xs font-bold text-slate-400">{leadsPct}% Achieved</span>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-black text-slate-900">{stats.leadsTarget.totalAssigned}</span>
            <span className="text-sm font-medium text-slate-500 mb-1">/ {stats.leadsTarget.targetLeads} leads</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${leadsPct}%` }}></div>
          </div>
        </div>

        {/* FREELANCER EARNINGS CARD (HIDDEN FOR COMPANY BDE) */}
        {stats.isFreelancer ? (
          <div className="bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-2xl p-5 text-slate-950 shadow-md flex flex-col justify-center">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-slate-950 text-yellow-400 flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-950">Freelancer Commission Accrued</h3>
                </div>
              </div>
              <span className="bg-slate-950 text-yellow-400 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">AUSTRALIA</span>
            </div>
            <div className="bg-slate-950/20 rounded-xl p-3 text-center border border-slate-950/30">
              <p className="text-[10px] font-black uppercase text-slate-900">Total Accrued (AUD)</p>
              <p className="text-2xl font-black text-slate-950 mt-0.5">${(stats.freelancerSettings.totalEarnings || 1250).toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl p-5 text-white shadow-md flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
              <Building className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-black text-lg">Company BDE</h3>
            <p className="text-blue-100 text-sm mt-1">Keep up the great work generating orders!</p>
          </div>
        )}
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Customers</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{stats.activeCustomers}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Orders Generated</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{stats.ordersGenerated}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversion Ratio</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{stats.conversionRatio}%</h3>
          </div>
        </div>
      </div>

      {/* PROJECT TYPES CARDS REPLACING STC */}
      <div>
        <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">
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

    </div>
  );
}
