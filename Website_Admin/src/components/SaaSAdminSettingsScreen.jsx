/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Settings,
  Shield,
  Lock,
  BookOpen,
  DollarSign,
  Download,
  FileBarChart2,
  MapPin,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ToggleSwitch, StatusBadge } from "./CommonUI";

export const SaaSAdminSettingsScreen = ({
  activeSubTab,
  partners,
  projects,
}) => {
  // EPC SETTINGS STATE
  const [autoQualifyActive, setAutoQualifyActive] = useState(true);
  const [termsText, setTermsText] = useState(
    "1. The Accredited Partner agrees to dispatch certified technicians for all projects allocated.\n2. Standard Escrow schedules specify milestone payouts of 30% civil foundation, 40% PV layout delivery, and 30% NOC commission grid synchronization.",
  );
  const [reqDocs, setReqDocs] = useState({
    aadhaar: true,
    wiringLic: true,
    gstCertificate: true,
    gedaSnaRegistration: true,
    panCard: true,
  });

  // ADMIN CREDENTIALS STATE
  const [adminLogo, setAdminLogo] = useState(
    "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=200&auto=format&fit=crop&q=80",
  );
  const [notiNewPartner, setNotiNewPartner] = useState(true);
  const [notiDeposit, setNotiDeposit] = useState(true);
  const [adminEmail, setAdminEmail] = useState("ops@sunnovative.com");

  const handleDocCheckbox = (key) => {
    setReqDocs({ ...reqDocs, [key]: !reqDocs[key] });
  };

  // MOCK ANALTIC CALCULATOR
  const activeSLA = partners.length;
  const commissionedKW = projects
    .filter((p) => p.status === "Completed")
    .reduce((sum, current) => sum + current.kwSize, 0);
  const projectedEscrowPayout = commissionedKW * 120; // Simulated pricing logic of $120/kW

  // Analytics graph values
  const analyticsGraphData = [
    { state: "Maharashtra", kw: 450, partners: 12 },
    { state: "Gujarat", kw: 620, partners: 18 },
    { state: "Karnataka", kw: 300, partners: 9 },
    { state: "Rajasthan", kw: 780, partners: 14 },
    { state: "West Bengal", kw: 210, partners: 5 },
    { state: "Delhi NCR", kw: 190, partners: 4 },
  ];

  // COMMISSIONS FEE LOGS
  const commissionLogs = [
    {
      id: "tx-101",
      partner: "Shakti Solar EPC Jodhpur",
      project: "Jodhpur Residence PV",
      size: "12 kW",
      fee: "$240",
      date: "2026-06-01",
      status: "Paid",
    },
    {
      id: "tx-102",
      partner: "Tata Power Solar Authorized Kolkata",
      project: "Saltlake Commercial Block",
      size: "150 kW",
      fee: "$3,000",
      date: "2026-06-03",
      status: "Paid",
    },
    {
      id: "tx-103",
      partner: "Go Solar India Pune",
      project: "Pune Warehouse Rooftop",
      size: "40 kW",
      fee: "$800",
      date: "2026-06-07",
      status: "Pending",
    },
    {
      id: "tx-104",
      partner: "Waaree Solar Tech Ahmedabad",
      project: "Adani Industrial Ph-II",
      size: "500 kW",
      fee: "$10,000",
      date: "2026-06-08",
      status: "Pending",
    },
  ];

  const handlePrintReports = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left">
      {/* ------------------ EPC PARTNER SYSTEM SETTINGS ------------------ */}
      {activeSubTab === "epc-settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card left: Document registration parameters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4">
            <h4 className="text-sm font-bold text-primary font-display flex items-center gap-2 pb-2.5 border-b">
              <Shield className="w-5 h-5 text-[#22A06B]" />
              Auto-Qualification Checks & Required Documents
            </h4>

            <div className="flex items-center justify-between p-3.5 bg-slate-50/55 rounded-xl border">
              <div>
                <span className="font-bold text-primary block text-xs">
                  Autonomous Matchmaking Engine
                </span>
                <span className="text-slate-400 text-[10px] block mt-0.5">
                  Allows system to bypass admin approval if parameters match
                  perfectly
                </span>
              </div>
              <ToggleSwitch
                checked={autoQualifyActive}
                onChange={setAutoQualifyActive}
              />
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                Required Onboarding Documents checklist
              </span>

              <div className="space-y-2.5 text-xs text-primary font-medium">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reqDocs.aadhaar}
                    onChange={() => handleDocCheckbox("aadhaar")}
                    className="rounded text-accent focus:ring-accent w-4 h-4"
                  />

                  <span>Applicant Aadhaar/UID Identity Proof</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reqDocs.wiringLic}
                    onChange={() => handleDocCheckbox("wiringLic")}
                    className="rounded text-accent w-4 h-4"
                  />

                  <span>
                    Electrical Contractor License Cert (Government Authorized)
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reqDocs.gstCertificate}
                    onChange={() => handleDocCheckbox("gstCertificate")}
                    className="rounded text-accent w-4 h-4"
                  />

                  <span>GSTIN Sales Tax Registration Certificate</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reqDocs.gedaSnaRegistration}
                    onChange={() => handleDocCheckbox("gedaSnaRegistration")}
                    className="rounded text-accent w-4 h-4"
                  />

                  <span>
                    State SNA / GEDA green nodal accredited register logs
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reqDocs.panCard}
                    onChange={() => handleDocCheckbox("panCard")}
                    className="rounded text-accent w-4 h-4"
                  />

                  <span>Company PAN Card Identification</span>
                </label>
              </div>
            </div>
          </div>

          {/* Card right: Terms & conditions editor */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-primary font-display flex items-center gap-2 pb-2 border-b">
                <BookOpen className="w-4.5 h-4.5 text-amber-500" />
                EPC Partner Registration terms of service markup
              </h4>
              <p className="text-xs text-gray-400">
                This legal text is presented physically inside the final
                registration step check during new partner signup flows.
              </p>

              <textarea
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)}
                className="w-full text-xs bg-slate-50 border p-3 rounded-xl min-h-[140px] focus:bg-white font-mono"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() =>
                  alert(
                    "Updated registration terms published onto signup portal!",
                  )
                }
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-[#0c2e42] cursor-pointer"
              >
                Publish Terms Markup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ REPORTS & PERFORMANCE ANALYTICS TAB ------------------ */}
      {activeSubTab === "reports" && (
        <div className="space-y-6">
          {/* Overview Stat Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                <FileBarChart2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">
                  Accredited Enrolled
                </span>
                <strong className="text-primary font-display text-md block">
                  {activeSLA} Active EPCs
                </strong>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
              <div className="p-3 bg-[#22A06B]/10 text-accent rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">
                  Commissioned Yield
                </span>
                <strong className="text-primary font-display text-md block">
                  {commissionedKW} kW Deployed
                </strong>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">
                  Total platform commission
                </span>
                <strong className="text-primary font-display text-md block">
                  ${projectedEscrowPayout.toLocaleString()} USD
                </strong>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase font-mono">
                  Platform operations list
                </span>
                <strong className="text-xs text-primary block mt-1">
                  Live metrics synchronization
                </strong>
              </div>
              <button
                onClick={handlePrintReports}
                className="p-2 border border-sky-100 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg cursor-pointer"
                title="Download PDF Report"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Area Graph Capacity in regions */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100">
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <h5 className="text-xs font-bold text-primary font-display flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#F9B233]" />
                Regional Deployed Capacity Performance Tracking (kW Scale)
              </h5>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                Live from Field Nodes
              </span>
            </div>

            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsGraphData}>
                  <defs>
                    <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0B3A53" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0B3A53" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="state"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    wrapperStyle={{ fontFamily: "Inter", fontSize: "11px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="kw"
                    stroke="#0B3A53"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#solarGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table Commission Logs */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <span className="text-xs font-bold text-primary font-display flex items-center gap-1">
                <DollarSign className="w-4.5 h-4.5 text-[#22A06B]" />
                SaaS Escrow commission Logs & disbursement Payout audit trail
              </span>
              <span className="text-[9px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-xs tracking-wider">
                SECURE ESCROW PAYOUTS
              </span>
            </div>

            <table className="min-w-full divide-y text-xs text-left">
              <thead className="bg-[#0B3A53] text-white">
                <tr>
                  <th className="px-5 py-3 font-bold uppercase">
                    TX Reference ID
                  </th>
                  <th className="px-5 py-3 font-bold uppercase">
                    Assigned EPC Partner
                  </th>
                  <th className="px-5 py-3 font-bold uppercase">
                    Linked Booking
                  </th>
                  <th className="px-5 py-3 font-bold uppercase text-center">
                    Solar Plant Size
                  </th>
                  <th className="px-5 py-3 font-bold uppercase">
                    Calculated Commission fee
                  </th>
                  <th className="px-5 py-3 font-bold uppercase text-center font-sans">
                    Payout Date
                  </th>
                  <th className="px-5 py-3 font-bold uppercase text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {commissionLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 font-mono text-gray-500 font-semibold">
                      {log.id}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-primary">
                      {log.partner}
                    </td>
                    <td className="px-5 py-3.5 text-gray-650">{log.project}</td>
                    <td className="px-5 py-3.5 text-center font-mono font-bold text-slate-700">
                      {log.size}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-emerald-600 font-extrabold">
                      {log.fee}
                    </td>
                    <td className="px-5 py-3.5 text-center text-gray-500 font-mono">
                      {log.date}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <StatusBadge
                        status={
                          log.status === "Paid" ? "In Stock" : "Low Stock"
                        }
                        labelOverride={log.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------ SaaS ADMIN SYSTEM CONFIGS ------------------ */}
      {activeSubTab === "admin-settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left panel: Branding and triggers */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-primary font-display flex items-center gap-2 pb-2.5 border-b">
              <Settings className="w-5 h-5 text-indigo-500" />
              SaaS White-Label Portal & SMTP config
            </h4>

            {/* Logo URL config */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-primary block">
                White-label Logo Branding (image URL) *
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={adminLogo}
                  onChange={(e) => setAdminLogo(e.target.value)}
                  className="w-full text-xs bg-slate-50 border p-2.5 rounded-xl font-mono text-gray-500"
                />

                {adminLogo && (
                  <img
                    src={adminLogo}
                    alt="Branding preview"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=40&auto=format&fit=crop&q=80";
                    }}
                    className="w-10 h-10 object-cover rounded-md border"
                  />
                )}
              </div>
            </div>

            {/* Triggers */}
            <div className="space-y-3 pt-3 border-t">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                Transactional SMTP triggers
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-primary block">
                      Alert on new Partner registration
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      Sends email summary when KYC dossier is uploaded
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={notiNewPartner}
                    onChange={setNotiNewPartner}
                  />
                </div>

                <div className="flex items-center justify-between border-t pt-2 mt-2">
                  <div>
                    <span className="font-bold text-primary block">
                      Alert on Escrow deposit clearances
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      Sends instant ledger notes upon milestones approval
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={notiDeposit}
                    onChange={setNotiDeposit}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Admin security roles */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-primary font-display flex items-center gap-2 pb-2.5 border-b">
                <Lock className="w-4.5 h-4.5 text-rose-500" />
                Access Control & System Roles list
              </h4>

              <div className="p-3.5 bg-rose-50/45 rounded-xl border border-rose-100/50 text-xs text-rose-950 flex items-start gap-2">
                <Shield className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p>
                  Secure login session managed with multi-role access control
                  mechanisms. Developers are assigned Read-Only dashboard
                  screens while administrators can dispatch installers and
                  sign-off KYC approvals.
                </p>
              </div>

              <div className="pt-2 text-xs text-slate-700 space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">
                  Authorized platform Roles:
                </span>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-primary">
                  <div className="p-2 bg-slate-50 border rounded-lg">
                    SYSTEM_ADMIN
                  </div>
                  <div className="p-2 bg-slate-50 border rounded-lg">
                    DISPATCH_MNGR
                  </div>
                  <div className="p-2 bg-slate-50 border rounded-lg">
                    AUDIT_OFFICER
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() =>
                  alert("Access credentials updated in secure session.")
                }
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl cursor-pointer"
              >
                Publish Access Policies
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
