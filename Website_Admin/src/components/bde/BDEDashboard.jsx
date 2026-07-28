import React, { useState, useEffect } from "react";
import { Users, CheckCircle, TrendingUp, Calendar, MapPin, PhoneForwarded } from "lucide-react";

export default function BDEDashboard({ bdeId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="space-y-6">
      
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
                      <p className="text-xs text-gray-500">{lead.mobile} • {lead.district}</p>
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
