import React, { useState, useEffect } from "react";
import { Users, FileCheck, DollarSign, Activity, AlertTriangle, ShieldCheck, Sun } from "lucide-react";

export default function BDEAustDashboard({ bdeId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulated Data Fetching for Australian BDE metrics
  useEffect(() => {
    if (!bdeId) return;
    
    // Simulate API call for Australia specific metrics
    setTimeout(() => {
      setStats({
        stcPipeline: { total: 42, approved: 12, pending: 25, rejected: 5 },
        revenue: { generated: 145000, target: 200000 },
        activeProjects: { residential: 28, commercial: 4 },
        leadsTarget: { totalAssigned: 150, targetLeads: 200 },
        recentApprovals: [
          { id: "STC-0912", name: "Smith Residence", status: "Approved", kw: 6.6, value: 3200 },
          { id: "STC-0913", name: "Jones Family", status: "Pending", kw: 10, value: 4800 },
          { id: "STC-0914", name: "Alpha Co.", status: "Rejected", kw: 20, value: 9600 }
        ]
      });
      setLoading(false);
    }, 800);
  }, [bdeId]);

  if (loading || !stats) {
    return <div className="p-8 text-center text-gray-500 font-medium animate-pulse">Loading Australian BDE Dashboard...</div>;
  }

  const leadsPct = Math.min(100, Math.round((stats.leadsTarget.totalAssigned / stats.leadsTarget.targetLeads) * 100));
  const revPct = Math.min(100, Math.round((stats.revenue.generated / stats.revenue.target) * 100));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Australian Regional Dashboard</h2>
          <p className="text-sm text-gray-500">Track STC Approvals, Pipeline and Revenue targets</p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg text-sm font-semibold border border-emerald-100 flex items-center gap-2">
          <Sun className="w-4 h-4" /> Zone 3 & 4 Active
        </div>
      </div>

      {/* Target Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Leads Pipeline Target</h3>
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-3xl font-bold text-gray-900">{stats.leadsTarget.totalAssigned}</span>
              <span className="text-gray-500 ml-2">/ {stats.leadsTarget.targetLeads} leads</span>
            </div>
            <span className="text-blue-600 font-bold">{leadsPct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${leadsPct}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Revenue Generated (AUD)</h3>
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-3xl font-bold text-gray-900">${stats.revenue.generated.toLocaleString()}</span>
              <span className="text-gray-500 ml-2">/ ${stats.revenue.target.toLocaleString()}</span>
            </div>
            <span className="text-emerald-600 font-bold">{revPct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${revPct}%` }}></div>
          </div>
        </div>
      </div>

      {/* STC Tracking Cards */}
      <h3 className="text-lg font-bold text-gray-800 mt-8 mb-2">STC Approvals & Pipeline</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
            <FileCheck className="w-5 h-5" />
          </div>
          <span className="text-3xl font-bold text-gray-800">{stats.stcPipeline.total}</span>
          <span className="text-xs text-gray-500 font-medium uppercase mt-1">Total STC Cases</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-3xl font-bold text-emerald-600">{stats.stcPipeline.approved}</span>
          <span className="text-xs text-emerald-600/70 font-medium uppercase mt-1">Approved & Minted</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-3">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-3xl font-bold text-amber-600">{stats.stcPipeline.pending}</span>
          <span className="text-xs text-amber-600/70 font-medium uppercase mt-1">Pending Review</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span className="text-3xl font-bold text-rose-600">{stats.stcPipeline.rejected}</span>
          <span className="text-xs text-rose-600/70 font-medium uppercase mt-1">Action Required</span>
        </div>
      </div>

      {/* Recent Approvals List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-6 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-800">Recent STC Submissions</h3>
          <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">View All</button>
        </div>
        <div className="divide-y divide-gray-100">
          {stats.recentApprovals.map((app, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-10 rounded-full ${
                  app.status === 'Approved' ? 'bg-emerald-500' :
                  app.status === 'Pending' ? 'bg-amber-400' : 'bg-rose-500'
                }`}></div>
                <div>
                  <p className="font-semibold text-gray-800">{app.name}</p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{app.id} • {app.kw}kW System</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">${app.value.toLocaleString()}</p>
                <span className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                  app.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  app.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
