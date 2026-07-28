/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { StatCard } from "./CommonUI";

export const DashboardScreen = ({
  partners,
  projects,
  installers,
  onQuickAction,
  onNavigateTab,
}) => {
  // 1. Calculate Summary Stats Based on Real Mock State Array
  const totalPartners = partners.length;
  const pendingKYC = partners.filter((p) => p.kycStatus === "Pending").length;
  const activeProjects = projects.filter((p) =>
    ["In Progress", "Assigned", "Installation Scheduled"].includes(p.status),
  ).length;
  const newOrdersCount = projects.filter((p) => p.status === "New").length;
  const activeInstallers = installers.filter(
    (i) =>
      i.availabilityStatus === "Available" ||
      i.availabilityStatus === "On Field",
  ).length;
  // Simulated monthly metrics
  const monthlyRevenue = "$128,450";
  const pendingAgreements = partners.filter(
    (p) => p.agreementStatus === "Pending",
  ).length;
  const completedProjects = projects.filter(
    (p) => p.status === "Completed",
  ).length;
  const projectCompletionRate =
    projects.length > 0
      ? `${Math.round((completedProjects / projects.length) * 100)}%`
      : "80%";

  // 2. Mock Chart Data for Solar Diagnostics
  const regionChartData = [
    { name: "Western Reg", target: 120, completed: 85 },
    { name: "Southern Reg", target: 90, completed: 78 },
    { name: "Northern Reg", target: 80, completed: 42 },
    { name: "Eastern Reg", target: 50, completed: 30 },
  ];

  const projectTypeData = [
    {
      name: "Residential",
      value:
        projects.filter((p) => p.projectType === "Residential").length || 4,
      color: "#F9B233",
    },
    {
      name: "Commercial",
      value: projects.filter((p) => p.projectType === "Commercial").length || 3,
      color: "#0B3A53",
    },
    {
      name: "Industrial",
      value: projects.filter((p) => p.projectType === "Industrial").length || 2,
      color: "#22A06B",
    },
    {
      name: "Utility Scale",
      value:
        projects.filter((p) => p.projectType === "Utility Scale").length || 1,
      color: "#2563EB",
    },
  ];

  const partnerRatingData = [
    { range: "4.8+", count: partners.filter((p) => p.rating >= 4.8).length },
    {
      range: "4.5 - 4.7",
      count: partners.filter((p) => p.rating >= 4.5 && p.rating < 4.8).length,
    },
    {
      range: "4.0 - 4.4",
      count: partners.filter((p) => p.rating >= 4.0 && p.rating < 4.5).length,
    },
    {
      range: "Below 4.0",
      count: partners.filter((p) => p.rating < 4.0).length,
    },
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
    <div className="space-y-8">
      {/* --- BUSINESS OVERVIEW KPIs --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total EPC Partners"
          value={totalPartners}
          icon={<Users className="w-5 h-5" />}
          trend={{ value: "+14% starting Q2", isPositive: true }}
          onClick={() => onNavigateTab("epc-partners")}
        />

        <StatCard
          title="Pending KYC Approvals"
          value={pendingKYC}
          icon={<FileCheck className="w-5 h-5 text-amber-500" />}
          trend={{
            value: `${partners.filter((p) => p.kycStatus === "Approved").length} verified`,
            isPositive: true,
          }}
          subtitle="Requires attention"
          onClick={() => onNavigateTab("kyc-agreement")}
        />

        <StatCard
          title="Active Solar Projects"
          value={activeProjects}
          icon={<Sun className="w-5 h-5 text-sky-500" />}
          trend={{ value: "85% active trackers", isPositive: true }}
          onClick={() => onNavigateTab("projects")}
        />

        <StatCard
          title="Unassigned Bookings"
          value={newOrdersCount}
          icon={<ShoppingCart className="w-5 h-5 text-indigo-500" />}
          trend={{ value: "Awaiting auto qualification", isPositive: false }}
          onClick={() => onNavigateTab("projects")}
        />

        <StatCard
          title="Active Installer Crew"
          value={activeInstallers}
          icon={<Wrench className="w-5 h-5 text-emerald-500" />}
          trend={{ value: "92% roster availability", isPositive: true }}
        />

        <StatCard
          title="Monthly SaaS Revenue"
          value={monthlyRevenue}
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          trend={{ value: "+8% Month-on-Month", isPositive: true }}
        />

        <StatCard
          title="Pending Agreements"
          value={pendingAgreements}
          icon={<FileText className="w-5 h-5 text-rose-500" />}
          trend={{ value: "Needs manual e-sign follow", isPositive: false }}
          onClick={() => onNavigateTab("kyc-agreement")}
        />

        <StatCard
          title="Project Success Rate"
          value={projectCompletionRate}
          icon={<Percent className="w-5 h-5 text-amber-500" />}
          trend={{ value: "Target setting 95%", isPositive: true }}
        />
      </div>

      {/* --- QUICK ACTION CENTER --- */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <h3 className="text-md font-bold text-primary font-display mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-secondary" />
          EPC Quick Operator Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onQuickAction("add-partner")}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-gray-100 hover:border-primary/20 hover:bg-gray-50 transition-all text-center gap-2 group cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-primary leading-tight">
              Add EPC Partner
            </span>
          </button>

          <button
            onClick={() => onQuickAction("add-project")}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-gray-100 hover:border-primary/20 hover:bg-gray-50 transition-all text-center gap-2 group cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-yellow-50 text-yellow-700 group-hover:scale-110 transition-transform">
              <Sun className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-primary leading-tight">
              Add Project
            </span>
          </button>

          <button
            onClick={() => onQuickAction("add-product")}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-gray-100 hover:border-primary/20 hover:bg-gray-50 transition-all text-center gap-2 group cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-primary leading-tight">
              Add Product
            </span>
          </button>

          <button
            onClick={() => onNavigateTab("kyc-agreement")}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-gray-100 hover:border-primary/20 hover:bg-gray-50 transition-all text-center gap-2 group cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 group-hover:scale-110 transition-transform">
              <FileCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-primary leading-tight">
              Review KYC
            </span>
          </button>

          <button
            onClick={() => onQuickAction("create-plan")}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-gray-100 hover:border-primary/20 hover:bg-gray-50 transition-all text-center gap-2 group cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-primary leading-tight">
              Create Plan
            </span>
          </button>

          <button
            onClick={() => onNavigateTab("order-settings")}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-gray-100 hover:border-primary/20 hover:bg-gray-50 transition-all text-center gap-2 group cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 group-hover:scale-110 transition-transform">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-primary leading-tight">
              Order Rules
            </span>
          </button>
        </div>
      </div>

      {/* --- BUSINESS INTELLIGENCE DASHBOARD CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Projects by Region */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-primary text-sm font-display tracking-tight flex items-center gap-2">
              <MapPin className="w-4.5 h-4.5 text-accent" />
              Projects Capacity Growth by Region
            </h4>
            <span className="text-[10px] text-gray-400 font-semibold font-mono border px-2 py-0.5 rounded-md">
              KW Targets vs Done
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={regionChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  dataKey="name"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
                <Bar
                  dataKey="target"
                  name="Target Allotment (kW)"
                  fill="#0B3A53"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="completed"
                  name="Commissioned (kW)"
                  fill="#22A06B"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Solar Projects Growth */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-primary text-sm font-display tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-blue-600" />
              SaaS Growth Trajectory (Grid Commissionings)
            </h4>
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-sm">
              Monthly Increment
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyGrowthData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  dataKey="month"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
                <Line
                  type="monotone"
                  dataKey="Bookings"
                  name="Total Customer Bookings"
                  stroke="#F9B233"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="ProjectsOnline"
                  name="Grid Connections Online"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Orders by Project Type */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <h4 className="font-bold text-primary text-sm font-display tracking-tight mb-4 flex items-center gap-2">
            <Sun className="w-4.5 h-4.5 text-yellow-500 animate-spin-slow" />
            Grid Orders Distribution by Type
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {projectTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom visual legend */}
            <div className="space-y-2 px-4">
              {projectTypeData.map((type, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-xs font-medium text-gray-700">
                      {type.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-primary">
                    {type.value} Projects
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 4: EPC Partner Rating Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-primary text-sm font-display tracking-tight flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-purple-600" />
              EPC Partner Star rating distribution
            </h4>
            <span className="text-xs text-gray-400 font-mono">
              Total Roster Quality
            </span>
          </div>
          <div className="h-52 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={partnerRatingData}
                layout="vertical"
                margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  type="number"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  dataKey="range"
                  type="category"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  name="Qualified Partners Count"
                  fill="#F9B233"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
