/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Plus,
  CheckCircle,
  Zap,
  Users,
  ArrowRight,
  Info,
  X,
} from "lucide-react";
import { StatusBadge } from "./CommonUI";

export const SubscriptionScreen = ({
  plans,
  partners,
  onAddPlan,
  onUpdatePlan,
  onUpdatePartner,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // EPC Assignment Section States
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [selectedPlanName, setSelectedPlanName] = useState("Growth Plan");

  // Plan Form Fields
  const [planName, setPlanName] = useState("Starter Plan");
  const [monthlyPrice, setMonthlyPrice] = useState(149);
  const [allowedRegions, setAllowedRegions] = useState(
    "Single State (HQ State)",
  );
  const [projectsAcceptedPerMonth, setProjectsAcceptedPerMonth] = useState(5);
  const [installerLimit, setInstallerLimit] = useState(4);
  const [projectManagementAccess, setProjectManagementAccess] = useState(true);
  const [installerAppAccess, setInstallerAppAccess] = useState(false);
  const [ratingBenefits, setRatingBenefits] = useState(false);
  const [priorityProjectAssignment, setPriorityProjectAssignment] =
    useState(false);
  const [status, setStatus] = useState("Active");

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setPlanName("Starter Plan");
    setMonthlyPrice(149);
    setAllowedRegions("Single State (HQ State)");
    setProjectsAcceptedPerMonth(5);
    setInstallerLimit(10);
    setProjectManagementAccess(true);
    setInstallerAppAccess(false);
    setRatingBenefits(false);
    setPriorityProjectAssignment(false);
    setStatus("Active");
    setShowForm(true);
  };

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    setPlanName(plan.planName);
    setMonthlyPrice(plan.monthlyPrice);
    setAllowedRegions(plan.allowedRegions.join(", "));
    setProjectsAcceptedPerMonth(plan.projectsAcceptedPerMonth);
    setInstallerLimit(plan.installerLimit);
    setProjectManagementAccess(plan.projectManagementAccess);
    setInstallerAppAccess(plan.installerAppAccess);
    setRatingBenefits(plan.ratingBenefits);
    setPriorityProjectAssignment(plan.priorityProjectAssignment);
    setStatus(plan.status);
    setShowForm(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const planObj = {
      id: editingPlan ? editingPlan.id : `plan-${Date.now()}`,
      planName,
      monthlyPrice,
      allowedRegions: [allowedRegions],
      allowedProjectTypes:
        planName === "Enterprise Plan"
          ? ["Residential", "Commercial", "Industrial", "Utility Scale"]
          : ["Residential", "Commercial"],
      projectsAcceptedPerMonth,
      installerLimit,
      projectManagementAccess,
      installerAppAccess,
      ratingBenefits,
      priorityProjectAssignment,
      status,
    };

    if (editingPlan) {
      onUpdatePlan(planObj);
    } else {
      onAddPlan(planObj);
    }
    setShowForm(false);
  };

  const handleAssignPlanToPartner = (e) => {
    e.preventDefault();
    if (!selectedPartnerId) {
      alert("Please select an EPC Partner from the dropdown first.");
      return;
    }
    const partner = partners.find((p) => p.id === selectedPartnerId);
    if (partner) {
      onUpdatePartner({
        ...partner,
        subscriptionPlan: selectedPlanName,
      });
      alert(
        `Successfully assigned ${selectedPlanName} to ${partner.partnerName}!`,
      );
      setSelectedPartnerId("");
    }
  };

  return (
    <div className="space-y-8">
      {/* 2 PANELS GRID: ASSIGNMENT MODULE + OPERATIONS DESCRIPTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PANEL 1: ASSIGN SUBSCRIPTION PLAN TO ACTIVE PARTNER */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-5 shadow-xs text-left">
          <h4 className="text-sm font-bold text-primary font-display flex items-center gap-2 pb-2.5 border-b border-gray-100">
            <Users className="w-5 h-5 text-secondary" />
            EPC Plan Assignment Tool
          </h4>
          <p className="text-xs text-gray-400 mt-2">
            Reassign or update the billing tier for any active partner. They
            will instantly inherit the project acceptance limits and priority
            ranking pool privileges.
          </p>

          <form onSubmit={handleAssignPlanToPartner} className="mt-4 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                Select EPC Partner *
              </label>
              <select
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                className="w-full text-xs font-semibold bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3 focus:bg-white focus:outline-hidden"
              >
                <option value="">-- Choose Partner Name --</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.partnerName} ({p.subscriptionPlan})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                Assign Base Plan Tier *
              </label>
              <select
                value={selectedPlanName}
                onChange={(e) => setSelectedPlanName(e.target.value)}
                className="w-full text-xs font-semibold bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3 focus:bg-white"
              >
                {plans.map((pl) => (
                  <option key={pl.id} value={pl.planName}>
                    {pl.planName} (${pl.monthlyPrice}/mo)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full text-xs font-bold bg-[#0B3A53] hover:bg-[#124b69] text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              Confirm Subscription Update
              <ArrowRight className="w-4 h-4 text-secondary" />
            </button>
          </form>
        </div>

        {/* PANEL 2: INFORMATION ON SYSTEM BENEFITS */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between">
          <div className="text-left space-y-2">
            <h4 className="text-sm font-bold text-primary font-display flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
              SaaS Partner Revenue Metrics
            </h4>
            <p className="text-xs text-gray-55 leading-relaxed">
              Our Sunnovative platform leverages volume pricing models: Premium
              plans feature full Installer App support allowing field
              technicians to complete structure logs offline, accelerating
              approvals with dispatch inspectors.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center mt-4">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[9px] font-bold text-gray-400 block uppercase">
                Active Starter
              </span>
              <strong className="text-primary font-display block text-md mt-1">
                {
                  partners.filter((p) => p.subscriptionPlan === "Starter Plan")
                    .length
                }
              </strong>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[9px] font-bold text-gray-400 block uppercase">
                Active Growth
              </span>
              <strong className="text-primary font-display block text-md mt-1">
                {
                  partners.filter((p) => p.subscriptionPlan === "Growth Plan")
                    .length
                }
              </strong>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[9px] font-bold text-gray-400 block uppercase">
                Premium / Corporate
              </span>
              <strong className="text-accent font-display block text-md mt-1">
                {
                  partners.filter(
                    (p) =>
                      p.subscriptionPlan === "Premium Plan" ||
                      p.subscriptionPlan === "Enterprise Plan",
                  ).length
                }
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* --- SUBSCRIPTION PLANS GRID CARDS --- */}
      {!showForm && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h4 className="text-md font-bold text-primary font-display">
              Active Platform Tiers
            </h4>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1 bg-[#22A06B] text-white hover:bg-[#198154] text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Custom Tier
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
            {plans.map((pl) => (
              <div
                key={pl.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                <div className="space-y-4">
                  {/* Headline */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-md font-display text-primary">
                        {pl.planName}
                      </h4>
                      <span className="text-[10px] text-gray-400 tracking-wider">
                        ANNUAL BILLING STATE
                      </span>
                    </div>
                    <StatusBadge status={pl.status} />
                  </div>

                  {/* Price */}
                  <div className="py-2 border-y border-gray-50 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-[#0B3A53] font-display">
                      ${pl.monthlyPrice}
                    </span>
                    <span className="text-xs text-gray-400">/ per month</span>
                  </div>

                  {/* Features Bullet */}
                  <ul className="space-y-2.5 text-xs text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span>
                        Regions: <strong>{pl.allowedRegions.join(", ")}</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span>
                        Projects Limit:{" "}
                        <strong>
                          {pl.projectsAcceptedPerMonth === 999
                            ? "Unlimited"
                            : `${pl.projectsAcceptedPerMonth} / month`}
                        </strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span>
                        Installer Limit:{" "}
                        <strong>{pl.installerLimit} crews</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle
                        className="w-3.5 h-3.5 text-accent shrink-0"
                        style={{ opacity: pl.installerAppAccess ? 1 : 0.3 }}
                      />
                      <span
                        className={
                          pl.installerAppAccess
                            ? ""
                            : "text-gray-300 line-through"
                        }
                      >
                        Field Installer App Support
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle
                        className="w-3.5 h-3.5 text-accent shrink-0"
                        style={{
                          opacity: pl.priorityProjectAssignment ? 1 : 0.3,
                        }}
                      />
                      <span
                        className={
                          pl.priorityProjectAssignment
                            ? ""
                            : "text-gray-300 line-through"
                        }
                      >
                        Auto priority assign
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-3 border-t border-gray-50 flex justify-end gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(pl)}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Edit Tier Specs
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- PLATFORM FEATURE COMPARISON TABLE --- */}
      {!showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 text-left space-y-4">
          <h4 className="text-sm font-bold text-primary font-display flex items-center gap-2.5">
            <Info className="w-4.5 h-4.5 text-[#2563EB]" />
            Feature Comparison Grid
          </h4>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-105 text-left text-xs">
              <thead className="bg-[#0B3A53] text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold uppercase font-display">
                    Platform Capabilities
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase text-center">
                    Starter Plan
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase text-center">
                    Growth Plan
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase text-center">
                    Premium Plan
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase text-center">
                    Enterprise Plan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-3.5 font-semibold text-primary">
                    Monthly Invoicing Base
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono font-bold">
                    $149 / mo
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono font-bold">
                    $349 / mo
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono font-bold">
                    $699 / mo
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono font-bold">
                    $1299 / mo
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-semibold text-primary">
                    Project size Capacity (KW)
                  </td>
                  <td className="px-4 py-3.5 text-center text-gray-500">
                    Up to 20kW
                  </td>
                  <td className="px-4 py-3.5 text-center text-gray-500">
                    Up to 150kW
                  </td>
                  <td className="px-4 py-3.5 text-center text-gray-500">
                    Up to 500kW
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold text-accent">
                    Unlimited (Large Utility)
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-semibold text-primary">
                    Regional state deployment limits
                  </td>
                  <td className="px-4 py-3.5 text-center text-gray-500">
                    Single State
                  </td>
                  <td className="px-4 py-3.5 text-center text-gray-500">
                    Up to 3 States
                  </td>
                  <td className="px-4 py-3.5 text-center text-accent font-semibold">
                    Nationwide Allowed
                  </td>
                  <td className="px-4 py-3.5 text-center text-accent font-semibold">
                    Nationwide + Priority
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-semibold text-primary">
                    Base Escrow Platform Fee
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-rose-500">
                    5.0% commission
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-gray-500">
                    4.0% commission
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-gray-500">
                    3.0% commission
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-emerald-600 font-bold">
                    2.0% volume tier fee
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-semibold text-primary">
                    On-site Crew Sync API
                  </td>
                  <td className="px-4 py-3.5 text-center text-gray-300">
                    Disabled
                  </td>
                  <td className="px-4 py-3.5 text-center text-[#22A06B]">
                    Included
                  </td>
                  <td className="px-4 py-3.5 text-center text-[#22A06B]">
                    Included
                  </td>
                  <td className="px-4 py-3.5 text-center text-[#22A06B] font-bold">
                    Dedicated Account Manager
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- FORM BOARD: PLAN DETAIL CREATOR --- */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-6">
            <h4 className="text-md font-bold text-primary font-display flex items-center gap-2">
              <Plus className="w-5 h-5 text-accent" />
              Configure Custom SaaS subscription plan tier
            </h4>
            <button
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-150 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Plan Tier Name *
                </label>
                <select
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3.5 focus:bg-white"
                >
                  <option value="Starter Plan">Starter Plan</option>
                  <option value="Growth Plan">Growth Plan</option>
                  <option value="Premium Plan">Premium Plan</option>
                  <option value="Enterprise Plan">Enterprise plan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Monthly Billing Cost ($) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={monthlyPrice}
                  onChange={(e) =>
                    setMonthlyPrice(parseInt(e.target.value) || 0)
                  }
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Region constraints *
                </label>
                <input
                  type="text"
                  required
                  value={allowedRegions}
                  onChange={(e) => setAllowedRegions(e.target.value)}
                  placeholder="e.g. Nationwide or Multi-State"
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Crews installer users Limit *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={installerLimit}
                  onChange={(e) =>
                    setInstallerLimit(parseInt(e.target.value) || 1)
                  }
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Max concurrent projects monthly *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={projectsAcceptedPerMonth}
                  onChange={(e) =>
                    setProjectsAcceptedPerMonth(parseInt(e.target.value) || 1)
                  }
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Plan Deployment Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-100"
                >
                  <option value="Active">Active Subscription offering</option>
                  <option value="Inactive">Arrested / Decommissioned</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3.5 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-primary">
                <input
                  type="checkbox"
                  checked={projectManagementAccess}
                  onChange={(e) => setProjectManagementAccess(e.target.checked)}
                  className="rounded text-accent focus:ring-accent"
                />
                Enable dispatcher module access
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-primary">
                <input
                  type="checkbox"
                  checked={installerAppAccess}
                  onChange={(e) => setInstallerAppAccess(e.target.checked)}
                  className="rounded text-accent"
                />
                Enable field installer App sync
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-primary">
                <input
                  type="checkbox"
                  checked={ratingBenefits}
                  onChange={(e) => setRatingBenefits(e.target.checked)}
                  className="rounded text-accent focus:ring-accent"
                />
                Activate Rating benefits wavers
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-primary">
                <input
                  type="checkbox"
                  checked={priorityProjectAssignment}
                  onChange={(e) =>
                    setPriorityProjectAssignment(e.target.checked)
                  }
                  className="rounded text-accent focus:ring-accent"
                />
                Match priority assign pool
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-650 hover:bg-gray-50 border border-gray-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-[#22A06B] text-white rounded-xl hover:bg-[#198154]"
              >
                {editingPlan
                  ? "Save Subscription specs"
                  : "Confirm Subscription tier"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
