import os

new_code = '''import React, { useState, useEffect } from "react";
import {
  Users, UserPlus, MonitorSmartphone, Globe, LogIn, LineChart, Building, ClipboardList, MapPin
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

export const PlatformAnalyticsScreen = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0, customerUsers: 0, epcUsers: 0, loginCount: 0,
    customerSignups: 0, epcSignups: 0, customerLeads: 0, projectOrders: 0
  });
  const [deviceData, setDeviceData] = useState([]);
  const [platformData, setPlatformData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    userType: "All",
    platform: "All",
    device: "All",
    country: "All",
    state: "All"
  });

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/admin/analytics/metrics?${query}`);
      const data = await res.json();
      if(data.metrics) setMetrics(data.metrics);
      
      const COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#6366f1'];
      if(data.devices) {
        setDeviceData(data.devices.map((d, i) => ({ name: d._id || 'Unknown', value: d.count, color: COLORS[i%4] })));
      }
      if(data.platforms) {
        setPlatformData(data.platforms.map((p, i) => ({ name: p._id || 'Unknown', value: p.count, color: COLORS[i%4] })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [filters]);

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Platform Analytics Dashboard</h2>
          <p className="text-sm text-slate-500">Track Web App and Website usage geographically.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">User Type</label>
          <select value={filters.userType} onChange={e=>setFilters({...filters, userType: e.target.value})} className="w-full text-sm border p-2 rounded-lg">
            <option>All</option><option>Customer</option><option>EPC</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Platform</label>
          <select value={filters.platform} onChange={e=>setFilters({...filters, platform: e.target.value})} className="w-full text-sm border p-2 rounded-lg">
            <option>All</option><option>Customer Web App</option><option>EPC Web App</option><option>Customer Website</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Device</label>
          <select value={filters.device} onChange={e=>setFilters({...filters, device: e.target.value})} className="w-full text-sm border p-2 rounded-lg">
            <option>All</option><option>Desktop</option><option>Mobile</option><option>Tablet</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
          <select value={filters.country} onChange={e=>setFilters({...filters, country: e.target.value})} className="w-full text-sm border p-2 rounded-lg">
            <option>All</option><option>Australia</option><option>India</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
          <select value={filters.state} onChange={e=>setFilters({...filters, state: e.target.value})} className="w-full text-sm border p-2 rounded-lg">
            <option>All</option><option>NSW</option><option>VIC</option><option>Delhi</option><option>Maharashtra</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-medium">Loading Analytics...</div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Users" value={metrics.totalUsers} icon={<Users className="w-6 h-6 text-blue-600"/>} color="bg-blue-100" />
            <StatCard title="Customer Users" value={metrics.customerUsers} icon={<UserPlus className="w-6 h-6 text-indigo-600"/>} color="bg-indigo-100" />
            <StatCard title="EPC Users" value={metrics.epcUsers} icon={<Building className="w-6 h-6 text-orange-600"/>} color="bg-orange-100" />
            <StatCard title="Total Logins" value={metrics.loginCount} icon={<LogIn className="w-6 h-6 text-emerald-600"/>} color="bg-emerald-100" />
            <StatCard title="Customer Leads" value={metrics.customerLeads} icon={<ClipboardList className="w-6 h-6 text-purple-600"/>} color="bg-purple-100" />
            <StatCard title="Project Orders" value={metrics.projectOrders} icon={<LineChart className="w-6 h-6 text-pink-600"/>} color="bg-pink-100" />
            <StatCard title="Customer Signups" value={metrics.customerSignups} icon={<UserPlus className="w-6 h-6 text-cyan-600"/>} color="bg-cyan-100" />
            <StatCard title="EPC Signups" value={metrics.epcSignups} icon={<Building className="w-6 h-6 text-amber-600"/>} color="bg-amber-100" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><MonitorSmartphone className="w-5 h-5"/> Device Breakdown</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deviceData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {deviceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Globe className="w-5 h-5"/> Platform Usage</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 10}} />
                    <YAxis tick={{fontSize: 12}} />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default PlatformAnalyticsScreen;
'''

with open('Website_Admin/src/components/PlatformAnalyticsScreen.jsx', 'w', encoding='utf-8') as f:
    f.write(new_code)

print("PlatformAnalyticsScreen Replaced with Detailed Dashboard")
