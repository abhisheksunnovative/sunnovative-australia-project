/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Users,
  FileCheck,
  Sun,
  ShoppingCart,
  Wrench,
  DollarSign,
  FileText,
  Percent,
  Plus,
  Settings,
  TrendingUp,
  MapPin,
  Flame,
  Award,
  CreditCard,
  Zap,
  Filter
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { StatCard } from "./CommonUI";
import axios from "axios";

export const DashboardScreen = ({
  onQuickAction,
  onNavigateTab,
}) => {
  // Master Filters
  const [filterCountry, setFilterCountry] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterProjectType, setFilterProjectType] = useState("");

  const [countries, setCountries] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);

  const [stats, setStats] = useState({
    totalPartners: 0,
    pendingKYC: 0,
    activeProjects: 0,
    newOrdersCount: 0,
    activeInstallers: 0,
    monthlyRevenue: "$0",
    pendingAgreements: 0,
    completedProjects: 0,
    projectCompletionRate: "0%"
  });

  const [loading, setLoading] = useState(true);

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Fetch dashboard data whenever filters change
  useEffect(() => {
    fetchDashboardData();
  }, [filterCountry, filterDistrict, filterProjectType]);

  const fetchFilterOptions = async () => {
    try {
      const [cRes, ptRes] = await Promise.all([
        axios.get("http://localhost:4005/api/countries"),
        axios.get("http://localhost:4005/api/project-types")
      ]);
      setCountries(cRes.data?.data || cRes.data || []);
      setProjectTypes(ptRes.data?.projectTypes || []);
    } catch (err) {
      console.error("Error fetching options", err);
    }
  };

  const fetchDistricts = async (countryName) => {
    if (!countryName) {
      setDistricts([]);
      setFilterDistrict("");
      return;
    }
    try {
      const res = await axios.get(`http://localhost:4005/api/districts?country=${encodeURIComponent(countryName)}`);
      setDistricts(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Error fetching districts", err);
      setDistricts([]);
    }
  };

  const handleCountryChange = (e) => {
    const c = e.target.value;
    setFilterCountry(c);
    fetchDistricts(c);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (filterCountry) params.append("country", filterCountry);
      if (filterDistrict) params.append("district", filterDistrict);
      if (filterProjectType) params.append("projectType", filterProjectType);

      const qs = params.toString() ? `?${params.toString()}` : "";

      // Parallel fetches for live data
      const [partnersRes, projectsRes] = await Promise.all([
        axios.get(`http://localhost:4005/api/admin/epc${qs}`),
        axios.get(`http://localhost:4005/api/project-orders${qs}`)
      ]);

      const partners = (partnersRes.data.success ? partnersRes.data.data : partnersRes.data) || [];
      const projects = (projectsRes.data.success ? projectsRes.data.data : projectsRes.data) || []; // Adjust based on how orders are returned

      const totalPartners = partners.length;
      const pendingKYC = partners.filter(p => p.kycStatus === "Pending" || !p.kycStatus).length;
      
      const activeProjects = projects.filter(p => ["In Progress", "Assigned", "Installation Scheduled"].includes(p.status)).length;
      const newOrdersCount = projects.filter(p => p.status === "New").length;
      const completedProjects = projects.filter(p => p.status === "Completed").length;
      const projectCompletionRate = projects.length > 0 ? `${Math.round((completedProjects / projects.length) * 100)}%` : "0%";

      setStats({
        totalPartners,
        pendingKYC,
        activeProjects,
        newOrdersCount,
        activeInstallers: 0, // Mock for now
        monthlyRevenue: "$128,450", // Mock
        pendingAgreements: partners.filter(p => p.agreementStatus === "Pending").length,
        completedProjects,
        projectCompletionRate
      });
    } catch (e) {
      console.error("Failed to fetch live dashboard data", e);
    }
    setLoading(false);
  };

  // Mock Chart Data for Solar Diagnostics
  const regionChartData = [
    { name: "Western Reg", target: 120, completed: 85 },
    { name: "Southern Reg", target: 90, completed: 78 },
    { name: "Northern Reg", target: 80, completed: 42 },
    { name: "Eastern Reg", target: 50, completed: 30 },
  ];

  const monthlyGrowthData = [
    { month: "Jan", ProjectsOnline: 3, Bookings: 5 },
    { month: "Feb", ProjectsOnline: 6, Bookings: 9 },
    { month: "Mar", ProjectsOnline: 11, Bookings: 14 },
    { month: "Apr", ProjectsOnline: 17, Bookings: 22 },
    { month: "May", ProjectsOnline: 24, Bookings: 31 },
    { month: "Jun", ProjectsOnline: 29, Bookings: 35 },
  ];

  return (
    <div className="space-y-6">
      {/* --- MASTER FILTER BAR --- */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-wrap items-center gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 text-primary font-bold text-sm mr-2">
          <Filter className="w-5 h-5" /> Master Filters
        </div>
        
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Country</label>
          <select value={filterCountry} onChange={handleCountryChange} className="w-full text-sm rounded-lg border-slate-300 focus:ring-secondary focus:border-secondary py-2">
            <option value="">All Countries</option>
            {countries.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">District / Region</label>
          <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} disabled={!filterCountry} className="w-full text-sm rounded-lg border-slate-300 focus:ring-secondary focus:border-secondary py-2 disabled:bg-slate-100 disabled:text-slate-400">
            <option value="">All Districts</option>
            {districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Project Type</label>
          <select value={filterProjectType} onChange={e => setFilterProjectType(e.target.value)} className="w-full text-sm rounded-lg border-slate-300 focus:ring-secondary focus:border-secondary py-2">
            <option value="">All Types</option>
            {projectTypes.map(pt => <option key={pt.projectType} value={pt.projectType}>{pt.projectTypeLabel}</option>)}
          </select>
        </div>
      </div>

      {loading && <div className="py-10 text-center text-slate-500 text-sm font-bold animate-pulse">Syncing Dashboard...</div>}

      <div className={`space-y-8 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        {/* --- BUSINESS OVERVIEW KPIs --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total EPC Partners"
            value={stats.totalPartners}
            icon={<Users className="w-5 h-5" />}
            trend={{ value: "Live Synced", isPositive: true }}
            onClick={() => onNavigateTab("epc-partners")}
          />

          <StatCard
            title="Pending KYC Approvals"
            value={stats.pendingKYC}
            icon={<FileCheck className="w-5 h-5 text-amber-500" />}
            trend={{
              value: `Action Required`,
              isPositive: false,
            }}
            onClick={() => onNavigateTab("kyc-approvals")}
          />

          <StatCard
            title="Active Projects (WIP)"
            value={stats.activeProjects}
            icon={<Sun className="w-5 h-5 text-orange-500" />}
            trend={{ value: `${stats.projectCompletionRate} completed`, isPositive: true }}
            onClick={() => onNavigateTab("projects")}
          />

          <StatCard
            title="New Orders"
            value={stats.newOrdersCount}
            icon={<ShoppingCart className="w-5 h-5 text-emerald-500" />}
            trend={{ value: "Action Required", isPositive: true }}
            onClick={() => onNavigateTab("project-orders")}
          />
        </div>

        {/* --- QUICK ACTION CENTER --- */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
          <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-secondary" /> Quick Launch Actions
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => onQuickAction("add-partner")}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-gray-300 hover:border-secondary hover:bg-orange-50 transition-colors group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-700">Add EPC</span>
            </button>
            
            <button
              onClick={() => onQuickAction("create-plan")}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-700">Manage Plans</span>
            </button>
            
            <button
              onClick={() => onNavigateTab("products")}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 transition-colors group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-700">Products</span>
            </button>
            
            <button
              onClick={() => onNavigateTab("workflow-settings")}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-colors group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <Settings className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-700">System Setup</span>
            </button>
          </div>
        </div>

        {/* --- LIVE CHARTS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
            <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> Live Growth Trajectory
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", fontWeight: "600", paddingTop: "10px" }} />
                  <Line type="monotone" dataKey="Bookings" stroke="#F9B233" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="ProjectsOnline" stroke="#0B3A53" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
            <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" /> Live Regional Targets
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#374151", fontWeight: 600 }} width={90} />
                  <Tooltip cursor={{ fill: "#F3F4F6" }} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", fontWeight: "600" }} />
                  <Bar dataKey="target" fill="#E5E7EB" radius={[0, 4, 4, 0]} barSize={12} name="Target Volume" />
                  <Bar dataKey="completed" fill="#22A06B" radius={[0, 4, 4, 0]} barSize={12} name="Current Volume" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
