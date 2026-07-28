/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CalendarRange, Sliders, Sparkles, Plus } from "lucide-react";
import { ToggleSwitch, StatusBadge } from "./CommonUI";

export const WorkflowSettingsScreen = ({
  activeSubTab,
  orderRules,
  processRules,
  ratingRules,
  onUpdateOrderRule,
  onUpdateProcessRule,
  onUpdateRatingRule,
  onAddOrderRule,
  onAddProcessRule,
  onAddRatingRule,
}) => {
  // Toggle states
  const handleToggleOrderRule = (rule) => {
    onUpdateOrderRule({ ...rule, isActive: !rule.isActive });
  };

  const handleToggleProcessRule = (rule) => {
    onUpdateProcessRule({ ...rule, isActive: !rule.isActive });
  };

  const handleToggleRatingRule = (rule) => {
    onUpdateRatingRule({ ...rule, isActive: !rule.isActive });
  };

  // State for rule building modals/forms
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);

  // 1. ORDER RULE FIELD
  const [orderType, setOrderType] = useState("Residential");
  const [minDays, setMinDays] = useState(5);
  const [maxDays, setMaxDays] = useState(15);
  const [rangeDays, setRangeDays] = useState(10);
  const [calendarDesc, setCalendarDesc] = useState(
    "Exclude national holidays. Multi-slot enabled.",
  );
  const [custSelectEnable, setCustSelectEnable] = useState(true);

  const handleCreateOrderRule = (e) => {
    e.preventDefault();
    const complete = {
      id: `pos-${Date.now()}`,
      projectType: orderType,
      minDaysBeforeInstallation: minDays,
      maxDaysBeforeInstallation: maxDays,
      completionDateRangeDays: rangeDays,
      calendarDateSelectionRules: calendarDesc,
      customerDateSelectionEnabled: custSelectEnable,
      isActive: true,
    };
    onAddOrderRule(complete);
    setShowOrderForm(false);
  };

  // 2. PROCESS RULE FIELD
  const [pType, setPType] = useState("Residential");
  const [minKW, setMinKW] = useState(1);
  const [maxKW, setMaxKW] = useState(100);
  const [region, setRegion] = useState("All");
  const [processType, setProcessType] = useState("Bidding Order");
  const [assignType, setAssignType] = useState("Auto Assign");

  const handleCreateProcessRule = (e) => {
    e.preventDefault();
    const complete = {
      id: `ops-${Date.now()}`,
      projectType: pType,
      minKW,
      maxKW,
      region,
      district: "All",
      cluster: "All Clusters",
      orderProcessType: processType,
      eligibleEPCPartnerTypes: [
        "Experienced EPC Partner",
        "Premium EPC Partner",
      ],
      assignmentType: assignType,
      isActive: true,
    };
    onAddProcessRule(complete);
    setShowProcessForm(false);
  };

  // 3. RATING BENEFITS FIELD
  const [ratingRange, setRatingRange] = useState("4.5+");
  const [extraProjects, setExtraProjects] = useState(5);
  const [priority, setPriority] = useState("High");
  const [disBenefit, setDisBenefit] = useState("2% Platform Fee waive");
  const [badge, setBadge] = useState("Solar Master");

  const handleCreateRatingRule = (e) => {
    e.preventDefault();
    const complete = {
      id: `rb-${Date.now()}`,
      ratingRange,
      extraProjectsAllowed: extraProjects,
      priorityLevel: priority,
      discountBenefit: disBenefit,
      badgeName: badge,
      isActive: true,
    };
    onAddRatingRule(complete);
    setShowRatingForm(false);
  };

  return (
    <div className="space-y-6 text-left">
      {/* ------------------ PROJECT ORDER SETTINGS TAB ------------------ */}
      {activeSubTab === "order-settings" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-primary font-display flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-accent" />
                Customer Date Selection & Installation Scheduling rules
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                Configure dispatch timers of calendar slot allocations based on
                solar plant sizing parameters.
              </p>
            </div>

            <button
              onClick={() => setShowOrderForm(true)}
              className="inline-flex items-center gap-1 bg-[#0B3A53] hover:bg-[#154E6F] text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
            >
              <Plus className="w-4 h-4 text-secondary" />
              Add Scheduling Rule
            </button>
          </div>

          {/* BUILDER CREATOR PANEL */}
          {showOrderForm && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md max-w-2xl mx-auto space-y-4">
              <div className="flex justify-between pb-2 border-b">
                <h5 className="font-bold text-primary text-xs">
                  Custom Date Booking configuration
                </h5>
                <button
                  onClick={() => setShowOrderForm(false)}
                  className="text-gray-400 font-bold"
                >
                  &times;
                </button>
              </div>

              <form
                onSubmit={handleCreateOrderRule}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="text-xs text-slate-500 font-medium">
                    Solar Project Class
                  </label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-150 rounded-lg p-2"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Utility Scale">Utility Scale</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-medium">
                    Min Days before installation schedule
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minDays}
                    onChange={(e) => setMinDays(parseInt(e.target.value) || 0)}
                    className="w-full text-xs bg-gray-50 border border-gray-150 p-2"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-medium">
                    Max Days before selection deadline
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={maxDays}
                    onChange={(e) => setMaxDays(parseInt(e.target.value) || 0)}
                    className="w-full text-xs bg-gray-50 border border-gray-150 p-2"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-medium">
                    Target Completion date range (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={rangeDays}
                    onChange={(e) =>
                      setRangeDays(parseInt(e.target.value) || 1)
                    }
                    className="w-full text-xs bg-gray-50 border border-gray-150 p-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs text-slate-500 font-medium">
                    Calendar date rules description text
                  </label>
                  <input
                    type="text"
                    value={calendarDesc}
                    onChange={(e) => setCalendarDesc(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-350 p-2"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={custSelectEnable}
                    onChange={(e) => setCustSelectEnable(e.target.checked)}
                    className="rounded text-accent focus:ring-accent"
                  />

                  <span className="text-xs text-slate-700 font-semibold">
                    Enable consumer calendar slot selector in checkout
                  </span>
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowOrderForm(false)}
                    className="px-3 py-1.5 border rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-accent text-white rounded-lg text-xs"
                  >
                    Add Rule
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ACTIVE ORDER RULES BOARD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orderRules.map((or) => {
              const ruleHighlight =
                or.projectType === "Residential"
                  ? "Customer can select installation date after 5 days and completion date within 15 days."
                  : or.projectType === "Commercial"
                    ? "Customer can select installation date after 10 days and completion date within 30 days."
                    : "Custom schedule timelines managed based on local civil/NOC NOC clearances.";

              return (
                <div
                  key={or.id}
                  className={`bg-white rounded-2xl border border-gray-10 w-full p-5 shadow-xs relative overflow-hidden flex flex-col justify-between ${
                    !or.isActive ? "opacity-75 bg-slate-50/50" : ""
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-primary font-display text-sm">
                        {or.projectType} Solar rules
                      </h5>
                      <StatusBadge
                        status={or.isActive ? "Active" : "Inactive"}
                      />
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                      <p className="font-bold text-primary mb-1">
                        Interactive Case Spec:
                      </p>
                      <p className="text-gray-55 italic">"{ruleHighlight}"</p>
                    </div>

                    <div className="text-xs space-y-1 bg-[#0B3A53]/5 p-3 rounded-xl border border-sky-100 text-primary">
                      <p>
                        · Buffer period:{" "}
                        <strong>
                          {or.minDaysBeforeInstallation} to{" "}
                          {or.maxDaysBeforeInstallation} days
                        </strong>
                      </p>
                      <p>
                        · Completion deadline range:{" "}
                        <strong>
                          Within {or.completionDateRangeDays} days of site
                          delivery
                        </strong>
                      </p>
                      <p>
                        · Rules:{" "}
                        <span className="font-medium text-gray-500">
                          {or.calendarDateSelectionRules}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t mt-4 pt-3 text-xs">
                    <span className="font-semibold text-gray-400">
                      Customer self-scheduling:{" "}
                      {or.customerDateSelectionEnabled ? "ENABLED" : "DISABLED"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-semibold">
                        Active State:
                      </span>
                      <ToggleSwitch
                        checked={or.isActive}
                        onChange={() => handleToggleOrderRule(or)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------ ORDER PROCESS SETTINGS TAB ------------------ */}
      {activeSubTab === "process-settings" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-primary font-display flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-500" />
                KW capacity limits & location-based order routing setup
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                Configure order processing channels (Ecommerce checkout vs Bids
                vs Quotes) based on proposed plant capacities.
              </p>
            </div>

            <button
              onClick={() => setShowProcessForm(true)}
              className="inline-flex items-center gap-1 bg-[#0B3A53] hover:bg-[#154E6F] text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
            >
              <Plus className="w-4 h-4 text-secondary" />
              Add Flow routing
            </button>
          </div>

          {/* PROCESS FLOW FORM */}
          {showProcessForm && (
            <div className="bg-white p-6 rounded-2xl border shadow-md max-w-2xl mx-auto space-y-4">
              <div className="flex justify-between pb-2 border-b">
                <h5 className="font-bold text-primary text-xs">
                  Scale Range Process routing Setup
                </h5>
                <button
                  onClick={() => setShowProcessForm(false)}
                  className="text-gray-400 font-bold"
                >
                  &times;
                </button>
              </div>

              <form
                onSubmit={handleCreateProcessRule}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="text-xs text-slate-500">
                    Project Type Scope
                  </label>
                  <select
                    value={pType}
                    onChange={(e) => setPType(e.target.value)}
                    className="w-full text-xs bg-gray-50 border p-2 rounded-lg"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Utility Scale">Utility Scale</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500">
                    Target Region (District / State limits)
                  </label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g. West, South or All"
                    className="w-full text-xs bg-gray-50 border p-2"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500">
                    Min kW size range
                  </label>
                  <input
                    type="number"
                    value={minKW}
                    onChange={(e) => setMinKW(parseInt(e.target.value) || 1)}
                    className="w-full text-xs bg-gray-50 border p-2"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500">
                    Max kW size range
                  </label>
                  <input
                    type="number"
                    value={maxKW}
                    onChange={(e) => setMaxKW(parseInt(e.target.value) || 500)}
                    className="w-full text-xs bg-gray-50 border p-2"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500">
                    Order Process type
                  </label>
                  <select
                    value={processType}
                    onChange={(e) => setProcessType(e.target.value)}
                    className="w-full text-xs bg-gray-50 border p-2"
                  >
                    <option value="Ecommerce Order">
                      Ecommerce Checkout Order
                    </option>
                    <option value="Bidding Order">
                      Reversed Bid pool bidding
                    </option>
                    <option value="Quote by EPC Order">
                      Quote manual estimations
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500">
                    Crew Assignment routing
                  </label>
                  <select
                    value={assignType}
                    onChange={(e) => setAssignType(e.target.value)}
                    className="w-full text-xs bg-gray-50 border p-2"
                  >
                    <option value="Auto Assign">
                      Autonomous Auto-Qualification dispatch
                    </option>
                    <option value="Manual Assign">
                      Manual Admin dispatch selection
                    </option>
                  </select>
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowProcessForm(false)}
                    className="px-3 py-1.5 border rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-accent text-white rounded-lg text-xs font-semibold"
                  >
                    Deploy routing
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* RENDERING ROUTING RULES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {processRules.map((pr) => (
              <div
                key={pr.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs hover:border-[#22A06B]/20 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] bg-sky-50 text-sky-800 font-extrabold uppercase font-mono px-2 py-0.5 rounded-sm">
                      {pr.orderProcessType}
                    </span>
                    <ToggleSwitch
                      checked={pr.isActive}
                      onChange={() => handleToggleProcessRule(pr)}
                    />
                  </div>

                  <div className="text-left">
                    <h5 className="font-bold text-primary font-display text-sm">
                      {pr.projectType} Solar routing
                    </h5>
                    <p className="text-[11px] text-[#22A06B] font-semibold mt-0.5">
                      KW sizing window: {pr.minKW} - {pr.maxKW} kW
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 border-t pt-2 max-w-full">
                    <p>
                      · Region target:{" "}
                      <strong>
                        {pr.region} (District: {pr.district})
                      </strong>
                    </p>
                    <p>
                      · Assignment:{" "}
                      <strong className="text-primary font-semibold">
                        {pr.assignmentType}
                      </strong>
                    </p>
                    <p className="truncate">
                      · Eligible EPCs:{" "}
                      <span className="font-medium text-gray-500">
                        {pr.eligibleEPCPartnerTypes.join(", ")}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------ RATINGS & BENEFITS SETTINGS TAB ------------------ */}
      {activeSubTab === "ratings-benefits" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-primary font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500 animate-spin-slow" />
                EPC quality Rating rules & Priority Benefit wavers mapping
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                Configure platform fee waivers, extra project allocation limits,
                and priority badges based on average star logs.
              </p>
            </div>

            <button
              onClick={() => setShowRatingForm(true)}
              className="inline-flex items-center gap-1.5 bg-accent hover:bg-[#198154] text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Configure Rating Benefit
            </button>
          </div>

          {/* RATING FORM */}
          {showRatingForm && (
            <div className="bg-white p-6 rounded-2xl border shadow-md max-w-2xl mx-auto space-y-4">
              <div className="flex justify-between pb-2 border-b">
                <h5 className="font-bold text-primary text-xs">
                  Ratings Priority Level config
                </h5>
                <button
                  onClick={() => setShowRatingForm(false)}
                  className="text-gray-440"
                >
                  &times;
                </button>
              </div>

              <form
                onSubmit={handleCreateRatingRule}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="text-xs text-slate-500">
                    Assigned Rating window limit
                  </label>
                  <input
                    type="text"
                    value={ratingRange}
                    onChange={(e) => setRatingRange(e.target.value)}
                    placeholder="e.g. 4.7 - 5.0"
                    className="w-full text-xs bg-gray-50 border p-2"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500">
                    Allowed added concurrent projects per month
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={extraProjects}
                    onChange={(e) =>
                      setExtraProjects(parseInt(e.target.value) || 0)
                    }
                    className="w-full text-xs bg-gray-50 border p-2"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500">
                    Disbursement Fee Discount / Benefit specs
                  </label>
                  <input
                    type="text"
                    value={disBenefit}
                    onChange={(e) => setDisBenefit(e.target.value)}
                    className="w-full text-xs bg-gray-50 border p-2"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500">
                    Grade Badging assigned
                  </label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full text-xs bg-gray-50 border p-2"
                  >
                    <option value="Solar Master">Solar Master badge</option>
                    <option value="Carbon Reducer">Carbon Reducer badge</option>
                    <option value="Certified Pro">Certified Pro badge</option>
                    <option value="Acuity Gold">Acuity Gold badge</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowRatingForm(false)}
                    className="px-3 py-1.5 border rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-accent text-white rounded-lg text-xs font-semibold"
                  >
                    Publish benefit
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* RETAINING BENEFITS CARDS LIST */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ratingRules.map((rr) => (
              <div
                key={rr.id}
                className="bg-[#FFFFFF] border rounded-2xl p-5 shadow-xs flex flex-col justify-between group hover:border-[#F9B233]/20 relative overflow-hidden"
              >
                {/* Badge title banner absolute */}
                <div className="absolute top-0 right-0 py-1 px-3 bg-[#F9B233] text-primary text-[10px] font-bold uppercase rounded-bl-sm">
                  {rr.badgeName}
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] text-gray-400 font-extrabold tracking-wider font-mono uppercase block">
                    RATING WINDOW RANGE:
                  </span>
                  <div className="text-left font-display">
                    <h5 className="text-2xl font-black text-primary">
                      {rr.ratingRange}
                    </h5>
                    <span className="text-xs text-[#22A06B] font-bold block mt-1 tracking-wide uppercase">
                      Allotment extra count: {rr.extraProjectsAllowed} Projects
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 border-t pt-2.5">
                    <p>
                      · Concurr pool:{" "}
                      <strong>
                        +{rr.extraProjectsAllowed} Allowed limit booster
                      </strong>
                    </p>
                    <p>
                      · Discom commission waivers:{" "}
                      <strong className="text-primary">
                        {rr.discountBenefit}
                      </strong>
                    </p>
                    <p>
                      · Priority class ranking:{" "}
                      <strong className="text-[#2563EB]">
                        {rr.priorityLevel} priority Dispatch
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t mt-4 pt-3 text-xs">
                  <span className="text-gray-400 font-semibold">
                    Workflow Sync: ENABLED
                  </span>
                  <ToggleSwitch
                    checked={rr.isActive}
                    onChange={() => handleToggleRatingRule(rr)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
