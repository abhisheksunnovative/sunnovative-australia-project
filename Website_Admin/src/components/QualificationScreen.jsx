/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Award,
  Plus,
  Sliders,
  MapPin,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { ToggleSwitch, EmptyState } from "./CommonUI";

export const QualificationScreen = ({
  rules,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  // Form Field States
  const [partnerType, setPartnerType] = useState("New EPC Partner");
  const [minExperienceYears, setMinExperienceYears] = useState(1);
  const [projectType, setProjectType] = useState("Residential");
  const [minKW, setMinKW] = useState(1);
  const [maxKW, setMaxKW] = useState(20);
  const [hqLocation, setHqLocation] = useState("All");
  const [state, setState] = useState("All");
  const [district, setDistrict] = useState("All");
  const [cluster, setCluster] = useState("All");
  const [minInstallersRequired, setMinInstallersRequired] = useState(2);
  const [maxProjectsPerMonth, setMaxProjectsPerMonth] = useState(3);
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setPartnerType("New EPC Partner");
    setMinExperienceYears(1);
    setProjectType("Residential");
    setMinKW(1);
    setMaxKW(20);
    setHqLocation("All");
    setState("All");
    setDistrict("All");
    setCluster("All");
    setMinInstallersRequired(2);
    setMaxProjectsPerMonth(3);
    setIsActive(true);
    setEditingRule(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenEdit = (rule) => {
    setEditingRule(rule);
    setPartnerType(rule.partnerType);
    setMinExperienceYears(rule.minExperienceYears);
    setProjectType(rule.projectType);
    setMinKW(rule.minKW);
    setMaxKW(rule.maxKW);
    setHqLocation(rule.hqLocation);
    setState(rule.state);
    setDistrict(rule.district);
    setCluster(rule.cluster);
    setMinInstallersRequired(rule.minInstallersRequired);
    setMaxProjectsPerMonth(rule.maxProjectsPerMonth);
    setIsActive(rule.isActive);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const ruleObj = {
      id: editingRule ? editingRule.id : `rule-${Date.now()}`,
      partnerType,
      minExperienceYears,
      projectType,
      minKW,
      maxKW,
      hqLocation,
      state,
      district,
      cluster,
      minInstallersRequired,
      maxProjectsPerMonth,
      isActive,
    };

    if (editingRule) {
      onUpdateRule(ruleObj);
    } else {
      onAddRule(ruleObj);
    }
    setShowForm(false);
    resetForm();
  };

  const handleToggleActive = (rule) => {
    onUpdateRule({
      ...rule,
      isActive: !rule.isActive,
    });
  };

  return (
    <div className="space-y-6">
      {/* SECTION EXPLANATION BAR */}
      {!showForm && (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="text-sm font-bold text-primary font-display">
              SaaS Dynamic Auto-Qualification Engine
            </h4>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Configure parameters controlling matchmaking. Incoming customer
              solar lead bookings are automatically processed against these
              capacity and location constraints.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-primary text-white hover:bg-[#0d344a] px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer shadow-xs"
          >
            <Plus className="w-4.5 h-4.5 text-secondary" />
            Add Eligibility Rule
          </button>
        </div>
      )}

      {/* --- ELIGIBILITY RULE CREATOR/EDIT FORM --- */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-6">
            <h4 className="text-md font-bold text-primary font-display flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-accent" />
              {editingRule
                ? `Revise Rule: ${partnerType}`
                : "Setup New Qualification Criteria"}
            </h4>
            <button
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Partner Type */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Target EPC Partner Classification *
                </label>
                <select
                  value={partnerType}
                  onChange={(e) => setPartnerType(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3.5 focus:bg-white focus:outline-hidden"
                >
                  <option value="New EPC Partner">New EPC Partner</option>
                  <option value="Experienced EPC Partner">
                    Experienced EPC Partner
                  </option>
                  <option value="Premium EPC Partner">
                    Premium EPC Partner
                  </option>
                  <option value="Regional EPC Partner">
                    Regional EPC Partner
                  </option>
                  <option value="Large Scale EPC Partner">
                    Large Scale EPC Partner
                  </option>
                </select>
              </div>

              {/* Supported Project Type string */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Supported Project Type Scope *
                </label>
                <input
                  type="text"
                  required
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  placeholder="e.g. Residential, Commercial"
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3.5 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Min Experience Years */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Minimum Experience required (Years) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={minExperienceYears}
                  onChange={(e) =>
                    setMinExperienceYears(parseInt(e.target.value) || 0)
                  }
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3.5 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Min Installers Required */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Minimum Field Roster Count Required *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={minInstallersRequired}
                  onChange={(e) =>
                    setMinInstallersRequired(parseInt(e.target.value) || 1)
                  }
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3.5 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Max concurrent projects monthly */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Maximum concurrent projects monthly *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={maxProjectsPerMonth}
                  onChange={(e) =>
                    setMaxProjectsPerMonth(parseInt(e.target.value) || 1)
                  }
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3.5 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Rule Active status toggles */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100/70">
                <div className="text-xs">
                  <span className="font-bold text-primary block">
                    Active Deployment Status
                  </span>
                  <span className="text-gray-400 block text-[10px] mt-0.5">
                    Control matches online instantly
                  </span>
                </div>
                <ToggleSwitch checked={isActive} onChange={setIsActive} />
              </div>
            </div>

            {/* CAPACITY RANGE SLIDERS GRID */}
            <div className="p-4 bg-sky-50/30 rounded-xl border border-sky-100/50 space-y-3">
              <h5 className="text-xs font-bold text-primary font-display flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-primary" />
                KW Grid Range Rule Setup (Allotment capacity limits)
              </h5>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Minimum capacity (kW) Allowed
                  </label>
                  <input
                    type="number"
                    required
                    value={minKW}
                    onChange={(e) => setMinKW(parseInt(e.target.value) || 0)}
                    className="w-full text-xs bg-white border border-gray-150 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Maximum capacity (kW) Allowed
                  </label>
                  <input
                    type="number"
                    required
                    value={maxKW}
                    onChange={(e) => setMaxKW(parseInt(e.target.value) || 0)}
                    className="w-full text-xs bg-white border border-gray-150 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* LOCATION-BASED ELIGIBILITY SETUP */}
            <div className="p-4 bg-emerald-50/20 rounded-xl border border-emerald-100/50 space-y-3">
              <h5 className="text-xs font-bold text-primary font-display flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#22A06B]" />
                Location-Based Eligibility Mapping (Spatial restrictions)
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                    State Scope restrictions
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Maharashtra or All"
                    className="w-full text-xs bg-white border border-gray-150 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                    District constraints
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Mumbai or All"
                    className="w-full text-xs bg-white border border-gray-150 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                    Cluster / Zone target
                  </label>
                  <input
                    type="text"
                    value={cluster}
                    onChange={(e) => setCluster(e.target.value)}
                    placeholder="e.g. Industrial Zones or All"
                    className="w-full text-xs bg-white border border-gray-150 rounded-lg p-2"
                  />
                </div>
              </div>
            </div>

            {/* Form submission controls */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-650 hover:bg-gray-50 border border-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-[#22A06B] hover:bg-[#198154] text-white rounded-xl cursor-pointer"
              >
                {editingRule
                  ? "Save Allocation Changes"
                  : "Publish Eligibility Criteria"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- RULES GRID VIEW CARDS --- */}
      {!showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
          {rules.length > 0 ? (
            rules.map((rule) => (
              <div
                key={rule.id}
                className={`bg-white rounded-2xl border border-gray-100 shadow-xs p-5 relative overflow-hidden transition-all hover:shadow-md hover:border-primary/5 ${
                  !rule.isActive ? "opacity-70 bg-slate-50/50" : ""
                }`}
              >
                {/* Rule badge */}
                <span className="absolute top-0 right-0 px-3 py-1 bg-primary text-white text-[10px] font-mono rounded-bl-xl font-bold uppercase tracking-wider">
                  Engine active status
                </span>

                <div className="flex items-start gap-3">
                  <div className="p-3 bg-secondary rounded-xl text-primary mt-1">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left space-y-1">
                    <h4 className="text-sm font-bold text-primary font-display">
                      {rule.partnerType}
                    </h4>
                    <p className="text-[10px] text-accent font-semibold">
                      {rule.projectType || "All Solar"} Scope
                    </p>
                  </div>
                </div>

                {/* Requirements Grid */}
                <div className="grid grid-cols-2 gap-3 mt-4 text-xs bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold block uppercase">
                      Min Roster crews
                    </span>
                    <strong className="text-slate-700 block mt-0.5">
                      {rule.minInstallersRequired} Active Crew Users
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold block uppercase">
                      Min Experience Required
                    </span>
                    <strong className="text-slate-700 block mt-0.5">
                      {rule.minExperienceYears} Years Minimum
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold block uppercase">
                      KW capacity range
                    </span>
                    <strong className="text-slate-700 block mt-0.5 font-mono">
                      {rule.minKW} - {rule.maxKW} kW
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold block uppercase">
                      Max concurrency limits
                    </span>
                    <strong className="text-[#22A06B] block mt-0.5 font-bold">
                      {rule.maxProjectsPerMonth} projects / month
                    </strong>
                  </div>
                </div>

                {/* Spatial region badge mapping */}
                <div className="mt-3 text-xs flex items-center gap-1.5 text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>
                    HQ Limits:{" "}
                    {rule.state === "All"
                      ? "Nationwide Allowed"
                      : `${rule.state}`}
                  </span>
                </div>

                {/* Action button bar */}
                <div className="flex items-center justify-between border-t border-gray-150 mt-4 pt-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-semibold">
                      Active Status:
                    </span>
                    <ToggleSwitch
                      checked={rule.isActive}
                      onChange={() => handleToggleActive(rule)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(rule)}
                      className="px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-bold rounded-lg cursor-pointer"
                    >
                      Configure Rule
                    </button>
                    <button
                      onClick={() => onDeleteRule(rule.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Delete rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2">
              <EmptyState
                title="No Rules Setup"
                description="Add qualification matchmaking criteria for your Solar EPC SaaS portal."
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
