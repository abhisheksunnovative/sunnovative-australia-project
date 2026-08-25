/**
 * OrderJourneyScreen — Admin panel tab
 * Task 3: Customer Order Journey Settings
 * Manages project-wise dynamic step workflows
 * API: GET/PUT /api/order-journey-settings
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  GitBranch, Save, RefreshCw, Plus, Trash2,
  ChevronDown, ChevronUp, AlertCircle, CheckCircle,
  Loader2, Info, ToggleLeft, ToggleRight,
  ArrowUp, ArrowDown, Building2, Home, Users, Zap,
  Settings, Bell, Clock, CheckSquare, FileText, CheckCircle2
} from "lucide-react";
import FeatureTrialConnector from "./FeatureTrialConnector";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

const clone = (obj) => JSON.parse(JSON.stringify(obj));

// ── Assigned to badge colors ──────────────────────────────────────────────────
const ASSIGNED_TO_CONFIG = {
  "company": { label: "EmergeSun / Admin", color: "bg-blue-100 text-blue-700 border-blue-200" },
  "epc-partner": { label: "EPC Partner", color: "bg-purple-100 text-purple-700 border-purple-200" },
  "customer": { label: "Customer", color: "bg-green-100 text-green-700 border-green-200" },
  "both": { label: "Company + EPC", color: "bg-orange-100 text-orange-700 border-orange-200" },
};

const PROJECT_TYPE_ICONS = {
  "residential": <Home className="w-4 h-4" />,
  "commercial": <Building2 className="w-4 h-4" />,
  "group": <Users className="w-4 h-4" />,
  "common-meter": <Zap className="w-4 h-4" />,
};

// ── Reusable UI ───────────────────────────────────────────────────────────────
const Toggle = ({ label, checked, onChange, desc }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
    </div>
    <button onClick={() => onChange(!checked)} className="shrink-0 ml-4">
      {checked ? <ToggleRight className="w-8 h-8 text-yellow-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
    </button>
  </div>
);

const Field = ({ label, value, onChange, type = "text", placeholder = "", hint, disabled = false }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
    <input
      type={type}
      className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 disabled:bg-slate-50 disabled:text-slate-400"
      value={value ?? ""}
      onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
    />
    {hint && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
  </div>
);

const ASSIGNED_BORDER_COLORS = {
  "customer": "border-l-4 border-l-blue-500",
  "company": "border-l-4 border-l-green-500",
  "epc-partner": "border-l-4 border-l-orange-500",
  "both": "border-l-4 border-l-yellow-500"
};

// ── Step Card ─────────────────────────────────────────────────────────────────
const StepCard = ({ step, index, totalSteps, onUpdate, onRemove, onMoveUp, onMoveDown, onSaveConfig, isSaving }) => {
  const [expanded, setExpanded] = useState(!step.title); // Auto expand if it's a new step (no title)
  const assignedConfig = ASSIGNED_TO_CONFIG[step.assignedTo] || ASSIGNED_TO_CONFIG["company"];

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${step.enabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"} ${ASSIGNED_BORDER_COLORS[step.assignedTo] || "border-l-4 border-l-yellow-500"}`}>
      {/* Step Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Step Number */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${step.enabled ? "bg-yellow-400 text-yellow-900" : "bg-slate-200 text-slate-500"}`}>
          {step.stepNumber}
        </div>

        {/* Title & Badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-semibold text-sm ${step.enabled ? "text-slate-800" : "text-slate-400 line-through"}`}>
              {step.title || "Untitled Step"}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${assignedConfig.color}`}>
              {assignedConfig.label}
            </span>
            {step.isMandatory && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                Mandatory
              </span>
            )}
            {step.slaDays > 0 && (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" /> SLA: {step.slaDays}d
              </span>
            )}
            {step.requiresDocumentUpload && (
              <span className="text-[10px] text-blue-500 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                <FileText className="w-3 h-3" /> {(step.documentRequirements?.length > 0 ? step.documentRequirements.join(', ') : step.documentName) || "Document"}
              </span>
            )}
            {step.requiresAdminApproval && (
              <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3 h-3" /> Admin Approval
              </span>
            )}
          </div>
          {!expanded && step.description && (
            <p className="text-xs text-slate-400 truncate mt-0.5">{step.description}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition disabled:opacity-20"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMoveDown(index)}
            disabled={index === totalSteps - 1}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition disabled:opacity-20"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onUpdate("enabled", !step.enabled)}
            className={`p-1.5 rounded-lg transition ${step.enabled ? "text-green-500 hover:bg-green-50" : "text-slate-400 hover:bg-slate-100"}`}
            title={step.enabled ? "Disable Step" : "Enable Step"}
          >
            {step.enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onRemove(index)}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-4 space-y-4 bg-slate-50/50">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Step Title"
              value={step.title}
              onChange={(v) => onUpdate("title", v)}
              placeholder="e.g. Site Survey"
            />
            <Field
              label="Action Button Label"
              value={step.actionLabel}
              onChange={(v) => onUpdate("actionLabel", v)}
              placeholder="e.g. Upload Survey Report"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
            <textarea
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 resize-none"
              rows={2}
              value={step.description || ""}
              onChange={(e) => onUpdate("description", e.target.value)}
              placeholder="Detailed description of what happens in this step..."
            />
          </div>

          {/* Allowed Executor Roles (Multi-Select Configuration) */}
          <div className="bg-white p-3 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                ⚡ Allowed Executor Roles (Kaun Kaun Step Execute Kar Sakta Hai)
              </label>
              <span className="text-[10px] text-slate-400 font-bold">Multiple Select Allowed</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Sirf jin roles ko admin allow karega, unhi roles ke portal me button active show hoga aur step execute ho sakega:
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
              {[
                { role: "customer", label: "👤 Customer", desc: "Customer portal se execute kar sakta hai" },
                { role: "epc-partner", label: "⚡ EPC Partner", desc: "EPC Installer execute kar sakta hai" },
                { role: "company", label: "🏢 Admin / Company", desc: "EmergeSun Admin approval/execution" },
                { role: "bde", label: "💼 BDE Executive", desc: "BDE customer ke behalf par execute kar sakta hai" }
              ].map(({ role, label, desc }) => {
                const currentRoles = step.allowedRoles && step.allowedRoles.length > 0 
                  ? step.allowedRoles 
                  : (step.assignedTo === 'customer' ? ['customer', 'bde'] : [step.assignedTo || 'company']);
                const isSelected = currentRoles.includes(role);

                const toggleRole = () => {
                  let updated = [...currentRoles];
                  if (isSelected) {
                    updated = updated.filter(r => r !== role);
                  } else {
                    updated.push(role);
                  }
                  onUpdate("allowedRoles", updated);
                };

                return (
                  <button
                    type="button"
                    key={role}
                    onClick={toggleRole}
                    className={`p-2.5 rounded-xl border text-left transition text-xs font-bold flex flex-col justify-between ${
                      isSelected 
                        ? "bg-amber-50 border-amber-400 text-amber-950 shadow-sm ring-1 ring-amber-300" 
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span>{label}</span>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${isSelected ? "bg-amber-500 text-white border-amber-500" : "border-slate-300"}`}>
                        {isSelected ? "✓" : ""}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal leading-tight">{desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3 border border-slate-200 rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Primary Assigned To</label>
                <select
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 bg-white"
                  value={step.assignedTo}
                  onChange={(e) => onUpdate("assignedTo", e.target.value)}
                >
                  <option value="company">Platform Admin (Company)</option>
                  <option value="epc-partner">EPC Partner</option>
                  <option value="customer">Customer</option>
                  <option value="bde">BDE Executive</option>
                  <option value="both">Company + EPC Both</option>
                </select>
              </div>
              <Field
                label="SLA Days"
                value={step.slaDays !== undefined ? step.slaDays : step.estimatedDays}
                onChange={(v) => onUpdate("slaDays", v)}
                type="number"
                hint="Max time allowed (0 = same day)"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Milestone Type</label>
                <select
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 bg-white"
                  value={step.milestoneType || 'standard'}
                  onChange={(e) => onUpdate("milestoneType", e.target.value)}
                >
                  <option value="standard">Standard Step</option>
                  <option value="customer_payment">Customer Payment</option>
                  <option value="epc_advance">EPC Advance</option>
                  <option value="rating">Customer Rating</option>
                  <option value="stc_minting">STC Minting</option>
                  <option value="doc_upload">Document Upload</option>
                </select>
              </div>
              {step.milestoneType === 'customer_payment' || step.milestoneType === 'epc_advance' ? (
                <Field
                  label="Payment Percentage (%)"
                  value={step.paymentPercentage || 0}
                  onChange={(v) => onUpdate("paymentPercentage", v)}
                  type="number"
                  hint="% of total amount"
                />
              ) : (
                <div className="pt-1">
                  <Toggle
                    label="Mandatory Step"
                    checked={step.isMandatory}
                    onChange={(v) => onUpdate("isMandatory", v)}
                  />
                </div>
              )}
            </div>

            <div className="col-span-1 md:col-span-2 pt-2 flex items-center gap-6 border-t border-slate-100 mt-2">
              <Toggle
                label="Visible to Customer"
                checked={step.visibleToCustomer !== false}
                onChange={(v) => onUpdate("visibleToCustomer", v)}
              />
              <Toggle
                label="Visible to EPC"
                checked={step.visibleToEpc !== false}
                onChange={(v) => onUpdate("visibleToEpc", v)}
              />
              <Toggle
                label="BDE can Complete"
                checked={step.canBeCompletedByBDE || false}
                onChange={(v) => onUpdate("canBeCompletedByBDE", v)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 bg-white p-3 border border-slate-200 rounded-xl">
            {/* Completion Conditions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-blue-500" /> Completion Gates
              </h4>
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Completion Condition</label>
                <select
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 bg-white"
                  value={step.completionCondition || 'manual'}
                  onChange={(e) => onUpdate("completionCondition", e.target.value)}
                >
                  <option value="manual">Manual</option>
                  <option value="document_upload">Document Upload</option>
                  <option value="admin_approval">Admin Approval</option>
                </select>
              </div>
              <Toggle
                label="Boxes for Uploading Documents"
                checked={step.requiresDocumentUpload}
                onChange={(v) => {
                  onUpdate({ requiresDocumentUpload: v, requiresDoc: v });
                }}
                desc="Enable this to require custom file uploads or input fields to complete this step"
              />
              {step.requiresDocumentUpload && (
                <div className="pl-4 border-l-2 border-blue-100 mt-2 space-y-2">
                  <div className="mt-2 pt-2">
                    <label className="text-xs font-black text-slate-700 uppercase block mb-3 tracking-wider flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-yellow-500" /> Configure Step Inputs & Uploads
                    </label>
                    <div className="space-y-3 mb-3">
                      {(step.requiredActions || []).length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                          <p className="text-[11px] text-slate-400 font-medium">No inputs or uploads configured. Click below to add one!</p>
                        </div>
                      ) : (
                        (step.requiredActions || []).map((act, actIdx) => (
                          <div key={actIdx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 shadow-sm space-y-3 transition-all hover:border-slate-300">
                            {/* Input Field Name */}
                            <div className="w-full">
                              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Input Label / Question Text</label>
                              <input 
                                type="text" 
                                value={act.label} 
                                placeholder="e.g., Postcode, Site Assessment Report, Customer Signature"
                                onChange={(e) => {
                                  const updated = [...(step.requiredActions || [])];
                                  updated[actIdx].label = e.target.value;
                                  onUpdate("requiredActions", updated);
                                }}
                                className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 bg-white focus:border-blue-400 outline-none transition"
                              />
                            </div>

                            {/* Type and Controls Row */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/40">
                              {/* Left Side: Type Dropdown */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Type:</span>
                                <select 
                                  value={act.fileType} 
                                  onChange={(e) => {
                                    const updated = [...(step.requiredActions || [])];
                                    updated[actIdx].fileType = e.target.value;
                                    onUpdate("requiredActions", updated);
                                  }}
                                  className="text-xs border border-slate-250 rounded-lg px-2 py-1 bg-white font-bold text-slate-700 outline-none focus:border-blue-400 transition"
                                >
                                  <option value="pdf">📄 PDF Document File</option>
                                  <option value="image">📷 Photo / Image File</option>
                                  <option value="text">✍️ Text / Manual Input</option>
                                </select>
                              </div>

                              {/* Right Side: Mandatory and Delete */}
                              <div className="flex items-center gap-2.5">
                                <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 cursor-pointer select-none">
                                  <input 
                                    type="checkbox" 
                                    checked={act.required !== false} 
                                    onChange={(e) => {
                                      const updated = [...(step.requiredActions || [])];
                                      updated[actIdx].required = e.target.checked;
                                      onUpdate("requiredActions", updated);
                                    }}
                                    className="rounded border-slate-350 text-yellow-500 focus:ring-yellow-400 w-3 h-3"
                                  />
                                  Required
                                </label>
                                
                                <div className="h-3 w-px bg-slate-300" />

                                <button 
                                  type="button" 
                                  onClick={() => {
                                    const updated = (step.requiredActions || []).filter((_, i) => i !== actIdx);
                                    onUpdate("requiredActions", updated);
                                  }} 
                                  className="text-red-500 hover:text-red-650 hover:bg-red-50 p-1 rounded-lg border border-transparent hover:border-red-100 transition flex items-center gap-1 text-[11px] font-black"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="mt-3 bg-white p-3 rounded-xl border border-slate-250/80 shadow-sm space-y-2">
                      <button 
                        type="button"
                        onClick={() => {
                          const updated = [...(step.requiredActions || []), { label: "", fileType: "pdf", required: true }];
                          onUpdate("requiredActions", updated);
                        }}
                        className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 text-xs font-black rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 font-bold" /> Add Custom Input Field / File
                      </button>
                      <p className="text-[10px] text-slate-400 text-center font-medium">Add document uploads or text fields required from customer/installer for this step.</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="pt-2">
                <Toggle
                  label="Require Admin Approval"
                  checked={step.requiresAdminApproval}
                  onChange={(v) => onUpdate("requiresAdminApproval", v)}
                  desc="Platform Admin must verify to proceed"
                />
              </div>
            </div>

            {/* Notification Logic */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-yellow-500" /> Auto Notifications
              </h4>
              <Toggle
                label="Notify Customer"
                checked={step.notifyCustomer}
                onChange={(v) => onUpdate("notifyCustomer", v)}
                desc="Send alert to Customer"
              />
              <Toggle
                label="Notify EPC Partner"
                checked={step.notifyEPC}
                onChange={(v) => onUpdate("notifyEPC", v)}
                desc="Send alert to assigned EPC"
              />
              <Toggle
                label="Notify Platform Admin"
                checked={step.notifyAdmin}
                onChange={(v) => onUpdate("notifyAdmin", v)}
                desc="Send alert to Operations Admin"
              />
              
              <div className="pt-2 border-t border-slate-100 mt-2">
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Notification Mediums</label>
                <div className="flex flex-wrap gap-2">
                  {["in-app", "email", "sms", "whatsapp"].map(med => {
                    const active = step.notificationMedium?.includes(med);
                    return (
                      <button 
                        key={med}
                        onClick={() => {
                          const current = step.notificationMedium || [];
                          if (current.includes(med)) {
                            onUpdate("notificationMedium", current.filter(m => m !== med));
                          } else {
                            onUpdate("notificationMedium", [...current, med]);
                          }
                        }}
                        className={`px-2 py-1 text-xs font-bold rounded-md border ${active ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                      >
                        {med.toUpperCase()}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-xl border border-red-100 mt-4 space-y-4">
            <h4 className="text-xs font-bold text-red-700 uppercase flex items-center gap-1">
              <Clock className="w-4 h-4" /> Overdue & Escalation Settings
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field
                label="Warning Days"
                value={step.warningDays || 0}
                onChange={(v) => onUpdate("warningDays", v)}
                type="number"
                hint="Days before SLA"
              />
              <Field
                label="Critical Alert (Days)"
                value={step.redAlertDays || 0}
                onChange={(v) => onUpdate("redAlertDays", v)}
                type="number"
                hint="Days after SLA"
              />
              <Field
                label="Escalate Admin"
                value={step.escalateToAdminAfterDays || 0}
                onChange={(v) => onUpdate("escalateToAdminAfterDays", v)}
                type="number"
                hint="Days after SLA"
              />
              <div className="pt-2">
                <Toggle
                  label="Auto Notify"
                  checked={step.autoNotifyOverdue || false}
                  onChange={(v) => onUpdate("autoNotifyOverdue", v)}
                  desc="On overdue"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 flex justify-end border-t border-slate-200">
            <button 
              onClick={onSaveConfig} 
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-slate-900 bg-yellow-400 rounded-xl hover:bg-amber-400 transition shadow-sm disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Saving..." : "Save Step"}
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

// ── Journey Card ──────────────────────────────────────────────────────────────
const JourneyCard = ({ journey, journeyIndex, onUpdateJourney, onRemoveJourney, onSaveConfig, isSaving, selectedCountry }) => {
  const [open, setOpen] = useState(false);
  const enabledSteps = (journey.steps || []).filter(s => s.enabled).length;
  const totalSteps = (journey.steps || []).length;

  const updateStep = (stepIndex, fieldOrObj, value) => {
    const newSteps = clone(journey.steps);
    if (typeof fieldOrObj === 'object' && fieldOrObj !== null) {
      Object.entries(fieldOrObj).forEach(([k, v]) => {
        newSteps[stepIndex][k] = v;
      });
    } else {
      newSteps[stepIndex][fieldOrObj] = value;
    }
    onUpdateJourney(journeyIndex, "steps", newSteps);
  };

  const removeStep = (stepIndex) => {
    const newSteps = journey.steps.filter((_, i) => i !== stepIndex);
    // Renumber steps
    newSteps.forEach((s, i) => { s.stepNumber = i + 1; });
    onUpdateJourney(journeyIndex, "steps", newSteps);
  };

  const moveStep = (stepIndex, direction) => {
    const newSteps = clone(journey.steps);
    const targetIndex = stepIndex + direction;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    [newSteps[stepIndex], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[stepIndex]];
    // Renumber
    newSteps.forEach((s, i) => { s.stepNumber = i + 1; });
    onUpdateJourney(journeyIndex, "steps", newSteps);
  };

  const addStep = () => {
    const newSteps = clone(journey.steps);
    newSteps.push({
      id: `step-${Date.now()}`,
      stepNumber: newSteps.length + 1,
      title: "New Step",
      description: "",
      assignedTo: "company",
      enabled: true,
      slaDays: 1,
      milestoneType: "standard",
      paymentPercentage: 0,
      visibleToCustomer: true,
      visibleToEpc: true,
      isMandatory: false,
      requiresDocumentUpload: false,
      requiresAdminApproval: false,
      notifyAdmin: false,
      actionLabel: "",
      notifyCustomer: true,
      notifyEPC: false,
      documentRequirements: [],
      notificationMedium: ["in-app"]
    });
    onUpdateJourney(journeyIndex, "steps", newSteps);
  };

  // Total estimated SLA days
  const totalDays = (journey.steps || [])
    .filter(s => s.enabled)
    .reduce((sum, s) => sum + (s.slaDays !== undefined ? s.slaDays : (s.estimatedDays || 0)), 0);

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${journey.enabled ? "border-slate-200" : "border-slate-100 opacity-70"}`}>
      {/* Journey Header */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${journey.enabled ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-400"}`}>
            {PROJECT_TYPE_ICONS[journey.projectType] || <GitBranch className="w-4 h-4" />}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">{journey.projectTypeLabel}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${journey.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {journey.enabled ? "Active" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-slate-400">{enabledSteps}/{totalSteps} steps active</span>
              {totalDays > 0 && <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />~{totalDays} days SLA</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onUpdateJourney(journeyIndex, "enabled", !journey.enabled); }}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            {journey.enabled
              ? <ToggleRight className="w-6 h-6 text-yellow-500" />
              : <ToggleLeft className="w-6 h-6 text-slate-300" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemoveJourney(journeyIndex); }}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Journey Body */}
      {open && (
        <div className="border-t border-slate-100 px-6 py-5 space-y-4">
          {/* Journey Meta */}
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Project Type Label"
              value={journey.projectTypeLabel}
              onChange={(v) => onUpdateJourney(journeyIndex, "projectTypeLabel", v)}
              placeholder="e.g. Residential Solar"
            />
            <Field
              label="Project Type ID"
              value={journey.projectType}
              onChange={(v) => onUpdateJourney(journeyIndex, "projectType", v)}
              placeholder="e.g. residential"
              hint="lowercase, no spaces — matches project category ID"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Journey Description</label>
            <textarea
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 resize-none"
              rows={2}
              value={journey.description || ""}
              onChange={(e) => onUpdateJourney(journeyIndex, "description", e.target.value)}
              placeholder="Is journey ke baare mein short description..."
            />
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase">1. Order Process Setting</h4>
            
            <div className="grid grid-cols-2 gap-6 items-start">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase block">Customer Signup Cost - Token</label>
                  <FeatureTrialConnector preSelectedCountry={selectedCountry} 
                    featureName={`Customer Token Fee - ${journey.projectType}`} 
                    description="Trial charging a signup token amount to measure drop-off and conversion rates."
                    targetAudience="Customer"
                  />
                </div>
                <div className="bg-white p-3 border border-slate-200 rounded-xl space-y-3">
                  <select
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 bg-white font-semibold"
                    value={journey.signupToken?.tokenType || (journey.signupToken?.enabled ? "fixed" : "none")}
                    onChange={(e) => {
                      const tType = e.target.value;
                      onUpdateJourney(journeyIndex, "signupToken", { 
                        ...journey.signupToken, 
                        tokenType: tType,
                        enabled: tType === 'fixed'
                      });
                    }}
                  >
                    <option value="none">No Token Amount (Free signup)</option>
                    <option value="fixed">Platform Token Amount (Fixed Fee)</option>
                  </select>
                  
                  {(journey.signupToken?.tokenType === "fixed" || (journey.signupToken?.enabled && !journey.signupToken?.tokenType)) && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Token Amount</label>
                      <input
                        type="number"
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
                        value={journey.signupToken?.amount || 0}
                        onChange={(e) => onUpdateJourney(journeyIndex, "signupToken", { ...journey.signupToken, amount: Number(e.target.value) })}
                      />
                    </div>
                  )}
                  
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    {(journey.signupToken?.tokenType === "fixed" || (journey.signupToken?.enabled && !journey.signupToken?.tokenType))
                      ? '✅ Token enabled — Company collects this fixed amount from customer at signup.'
                      : '⭕ Token disabled — Customer signups are free (No token).'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">EPC Selection Type</label>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${journey.epcSelectionType === 'FCFS' || !journey.epcSelectionType ? 'bg-yellow-50 border-yellow-400' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                    <input 
                      type="radio" 
                      name={`epcType-${journeyIndex}`} 
                      checked={journey.epcSelectionType === 'FCFS' || !journey.epcSelectionType}
                      onChange={() => onUpdateJourney(journeyIndex, "epcSelectionType", "FCFS")}
                      className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">First Come First Serve EPC</p>
                      <p className="text-xs text-slate-500">Orders assigned to the first available EPC.</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${journey.epcSelectionType === 'CUSTOMER_SELECT' ? 'bg-yellow-50 border-yellow-400' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                    <input 
                      type="radio" 
                      name={`epcType-${journeyIndex}`} 
                      checked={journey.epcSelectionType === 'CUSTOMER_SELECT'}
                      onChange={() => onUpdateJourney(journeyIndex, "epcSelectionType", "CUSTOMER_SELECT")}
                      className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Customer Selects EPC</p>
                      <p className="text-xs text-slate-500">Customer chooses 1 EPC from options.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between bg-slate-800 text-white p-3 rounded-t-xl">
              <p className="text-xs font-bold uppercase tracking-wider">
                Workflow Stages ({totalSteps} total, {enabledSteps} active)
              </p>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-400" />Admin</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-purple-400" />EPC</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-400" />Customer</span>
              </div>
            </div>

            <div className="space-y-1">
              {(journey.steps || []).map((step, si) => (
                <StepCard
                  key={step.id || si}
                  step={step}
                  index={si}
                  totalSteps={journey.steps.length}
                  onUpdate={(field, value) => updateStep(si, field, value)}
                  onRemove={removeStep}
                  onMoveUp={(i) => moveStep(i, -1)}
                  onMoveDown={(i) => moveStep(i, 1)}
                  onSaveConfig={onSaveConfig}
                  isSaving={isSaving}
                  selectedCountry={selectedCountry}
                />
              ))}
            </div>

            <button
              onClick={addStep}
              className="w-full flex items-center justify-center gap-2 py-3 mt-4 text-xs font-semibold text-yellow-600 border-2 border-dashed border-yellow-300 rounded-xl hover:border-yellow-500 hover:bg-yellow-50 transition"
            >
              <Plus className="w-4 h-4" /> Add New Step to Workflow
            </button>
          </div>

          {/* Journey Flow Preview */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mt-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Journey Flow Preview</p>
            <div className="flex flex-wrap items-center gap-1">
              {(journey.steps || []).filter(s => s.enabled).map((step, i, arr) => (
                <React.Fragment key={step.id || i}>
                  <div className={`px-2 py-1 rounded-lg text-[11px] font-semibold border ${
                    step.assignedTo === "epc-partner" ? "bg-purple-50 text-purple-700 border-purple-200" :
                    step.assignedTo === "customer" ? "bg-green-50 text-green-700 border-green-200" :
                    step.assignedTo === "both" ? "bg-orange-50 text-orange-700 border-orange-200" :
                    "bg-blue-50 text-blue-700 border-blue-200"
                  }`}>
                    {step.title || `Step ${step.stepNumber}`}
                  </div>
                  {i < arr.length - 1 && <span className="text-slate-300 text-xs">→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export const OrderJourneyScreen = ({ selectedCountry: propCountry, readOnly = false }) => {
  const [dbCountries, setDbCountries] = useState([]);
  const [internalCountry, setInternalCountry] = useState("india");
  const selectedCountry = propCountry || internalCountry;

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/countries`);
        const data = await res.json();
        if (data.success) {
          setDbCountries(data.data);
        }
      } catch (err) {
        console.error("Error fetching countries:", err);
      }
    };
    if (!propCountry) fetchCountries();
  }, [propCountry]);

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [selectedState, setSelectedState] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedDiscom, setSelectedDiscom] = useState("all");
  const [discomsList, setDiscomsList] = useState([]);
  const [usingFallback, setUsingFallback] = useState(false);
  
  const [projectTypes, setProjectTypes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNewProjectType, setSelectedNewProjectType] = useState("");

  useEffect(() => {
    const fetchProjectTypes = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/project-types?country=${selectedCountry}`);
        const data = await res.json();
        if (data.success && data.data) {
          setProjectTypes(data.data);
        } else if (Array.isArray(data)) {
          setProjectTypes(data);
        } else {
          setProjectTypes([]);
        }
      } catch (err) {
        console.error("Error fetching project types:", err);
      }
    };
    fetchProjectTypes();
  }, [selectedCountry]);

  // Auto-sync journeys with global project types
  useEffect(() => {
    if (projectTypes.length > 0 && settings && settings.journeys) {
      let changed = false;
      const nextSettings = JSON.parse(JSON.stringify(settings));
      nextSettings.journeys = nextSettings.journeys || [];
      
      // Do NOT auto-add project types. The user can add them manually.
      // projectTypes.forEach(pt => {
      //   const exists = nextSettings.journeys.find(j => j.projectType === pt.projectType);
      //   if (!exists) {
      //     nextSettings.journeys.push({
      //       projectType: pt.projectType,
      //       projectTypeLabel: pt.projectTypeLabel || pt.projectType,
      //       enabled: true,
      //       description: "",
      //       signupToken: { enabled: false, amount: 0 },
      //       epcSelectionType: "FCFS",
      //       steps: []
      //     });
      //     changed = true;
      //   }
      // });

      // Do NOT automatically remove orphaned journeys. 
      // If a project type is deleted, the journey should still remain so we don't lose step data silently.
      // const originalLength = nextSettings.journeys.length;
      // nextSettings.journeys = nextSettings.journeys.filter(j => 
      //   projectTypes.some(pt => pt.projectType === j.projectType)
      // );
      // if (nextSettings.journeys.length !== originalLength) changed = true;

      if (changed) {
        setSettings(nextSettings);
      }
    }
  }, [projectTypes, settings]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    // Fetch all discoms for the selected country to populate state/district/discom dropdowns
    const fetchDiscoms = async () => {
      try {
        let url = `${API_BASE}/api/discoms?country=${selectedCountry}`;
        
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setDiscomsList(data.data);
        }
      } catch (err) {
        console.error("Error fetching discoms:", err);
      }
    };
    fetchDiscoms();
  }, [selectedCountry]);

  // Predefined states for various countries
  const countryStatesMap = {
    india: [
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
      "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
      "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
      "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir"
    ],
    australia: [
      "New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania", "Australian Capital Territory", "Northern Territory"
    ],
    newzealand: [
      "Northland", "Auckland", "Waikato", "Bay of Plenty", "Gisborne", "Hawke's Bay", "Taranaki", "Manawatu-Whanganui", "Wellington", "Tasman", "Nelson", "Marlborough", "West Coast", "Canterbury", "Otago", "Southland"
    ],
    uk: [
      "England", "Scotland", "Wales", "Northern Ireland"
    ],
    usa: [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
    ]
  };

  const allStates = countryStatesMap[selectedCountry] || [];

  // Derive available options from the fetched discoms list
  const availableDistricts = [...new Set(discomsList
    .filter(d => selectedState === "all" || d.state === selectedState)
    .flatMap(d => d.districts || [])
    .filter(Boolean)
  )];
  const availableDiscoms = discomsList.filter(d => 
    (selectedState === "all" || d.state === selectedState) &&
    (selectedDistrict === "all" || d.districts?.includes(selectedDistrict))
  );

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/order-journey-settings?country=${selectedCountry}`, {
        headers: { 
          'x-country': selectedCountry,
          'x-state': selectedState,
          'x-district': selectedDistrict,
          'x-discom': selectedDiscom
        }
      });
      const data = await res.json();
      if (data.success) { setSettings(data.data); setUsingFallback(false); }
      else { setUsingFallback(true); }
    } catch {
      setUsingFallback(true);
    } finally { setLoading(false); }
  }, [selectedCountry, selectedState, selectedDistrict, selectedDiscom]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const updateJourney = (journeyIndex, field, value) => {
    setSettings((prev) => {
      const next = clone(prev);
      next.journeys[journeyIndex][field] = value;
      return next;
    });
  };

  const removeJourney = (journeyIndex) => {
    if (!window.confirm("Is journey ko delete karna chahte ho?")) return;
    setSettings((prev) => {
      const next = clone(prev);
      next.journeys.splice(journeyIndex, 1);
      return next;
    });
  };

  const addJourney = () => {
    setShowAddModal(true);
    setSelectedNewProjectType("");
  };

  const handleAddJourneyConfirm = () => {
    if (!selectedNewProjectType) return;
    const pt = projectTypes.find(p => p.projectType === selectedNewProjectType);
    if (!pt) return;

    setSettings((prev) => {
      const next = clone(prev);
      next.journeys.push({
        projectType: pt.projectType,
        projectTypeLabel: pt.projectTypeLabel,
        enabled: true,
        description: pt.description || "",
        signupToken: { enabled: false, amount: 0 },
        epcSelectionType: "FCFS",
        steps: [
          {
            id: `step-${Date.now()}`,
            stepNumber: 1,
            title: "Lead Captured",
            description: "",
            assignedTo: "company",
            enabled: true,
            slaDays: 0,
            milestoneType: "standard",
            paymentPercentage: 0,
            visibleToCustomer: true,
            visibleToEpc: true,
            isMandatory: true,
            requiresDocumentUpload: false,
            requiresAdminApproval: false,
            actionLabel: "Verify Lead",
            notifyCustomer: true,
            notifyEPC: false,
            notifyAdmin: false
          }
        ],
      });
      return next;
    });
    setShowAddModal(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/order-journey-settings`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          'x-country': selectedCountry,
          'x-state': selectedState,
          'x-district': selectedDistrict,
          'x-discom': selectedDiscom
        },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) { showToast("success", "Order journey settings saved!"); setUsingFallback(false); }
      else showToast("error", "Save failed");
    } catch { showToast("error", "Backend not connected. Saved locally."); }
    finally { setSaving(false); }
  };

  const handleReset = async () => {
    if (!window.confirm(`Kya aap ${selectedCountry} ki saari journeys ko default pe reset karna chahte ho?`)) return;
    setResetting(true);
    try {
      const res = await fetch(`${API_BASE}/api/order-journey-settings/reset?country=${selectedCountry}`, { 
        method: "POST",
        headers: {
          'x-country': selectedCountry,
          'x-state': selectedState,
          'x-district': selectedDistrict,
          'x-discom': selectedDiscom
        }
      });
      const data = await res.json();
      if (data.success) { setSettings(data.data); showToast("success", `Reset ${selectedCountry} defaults!`); }
      else showToast("error", "Reset failed");
    } catch { showToast("error", "Network error"); }
    finally { setResetting(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      <p className="text-sm font-medium">Loading {selectedCountry.toUpperCase()} order journey settings...</p>
    </div>
  );

  if (!settings) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4 text-red-500">
      <AlertCircle className="w-8 h-8" />
      <p className="text-sm font-medium">Could not load settings. Backend check karo.</p>
      <button onClick={fetchSettings} className="text-xs px-4 py-2 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition">Retry</button>
    </div>
  );

  const totalJourneys = settings.journeys?.length || 0;
  const activeJourneys = (settings.journeys || []).filter(j => j.enabled).length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-50 border border-yellow-200 flex items-center justify-center shrink-0">
            <GitBranch className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Dynamic Project Journeys</h1>
            <p className="text-sm text-slate-500 mt-1">Configure workflow steps, SLAs, and approval gates for each country.</p>
          </div>
        </div>
        
        {/* Main Actions */}
        <div className="flex items-center gap-3">
          <FeatureTrialConnector preSelectedCountry={selectedCountry} 
            featureName="Custom Order Journey" 
            description="Trial custom project steps for a specific location before rolling out country-wide."
            targetAudience="Both"
          />
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-slate-900 bg-yellow-400 rounded-xl hover:bg-amber-400 transition shadow-sm disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Config"}
          </button>
        </div>
      </div>

      {/* ── Country / Region Filters ── */}
      <div className="bg-slate-800 p-4 rounded-2xl shadow-inner flex gap-6 overflow-x-auto items-end">
        {!propCountry && (
          <div className="flex flex-col flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Global Market / Country</label>
            <select 
              value={internalCountry} 
              onChange={(e) => setInternalCountry(e.target.value)}
              className="text-sm font-bold text-white border-2 border-slate-600 rounded-xl px-4 py-2.5 bg-slate-700 focus:outline-none focus:border-yellow-400 focus:bg-slate-800 transition"
            >
              <option value="india">🇮🇳 India</option>
              <option value="australia">🇦🇺 Australia</option>
              <option value="newzealand">🇳🇿 New Zealand</option>
              <option value="uk">🇬🇧 UK</option>
              <option value="usa">🇺🇸 USA</option>
            </select>
          </div>
        )}
        <div className="flex flex-col flex-1 min-w-[150px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">State (Optional)</label>
          <select value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict("all"); setSelectedDiscom("all"); }}
            className="text-sm font-semibold text-white border border-slate-600 rounded-xl px-4 py-2.5 bg-slate-700 focus:outline-none focus:border-yellow-400">
            <option value="all">Select State</option>
            {allStates.length > 0 ? allStates.map(state => (
              <option key={state} value={state}>{state}</option>
            )) : (
              <option value="all">All States</option>
            )}
          </select>
        </div>
        <div className="flex flex-col flex-1 min-w-[150px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">District / Area</label>
          <select value={selectedDistrict} onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedDiscom("all"); }}
            className="text-sm font-semibold text-white border border-slate-600 rounded-xl px-4 py-2.5 bg-slate-700 focus:outline-none focus:border-yellow-400">
            <option value="all">Select District</option>
            {availableDistricts.map(dist => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col flex-1 min-w-[150px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Discom (Electricity Board)</label>
          <select value={selectedDiscom} onChange={(e) => setSelectedDiscom(e.target.value)}
            className="text-sm font-semibold text-white border border-slate-600 rounded-xl px-4 py-2.5 bg-slate-700 focus:outline-none focus:border-yellow-400">
            <option value="all">Select Discom</option>
            {availableDiscoms.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
        <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
        <span>
          You are editing workflows for <strong>{selectedCountry.toUpperCase()}</strong>. Each stage can be customized with specific SLA timelines, mandatory document uploads, and Admin approval gates.
        </span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Configured Workflows", value: totalJourneys, color: "text-slate-700" },
          { label: "Active Workflows", value: activeJourneys, color: "text-green-600" },
          { label: "Total Stages Configured", value: (settings.journeys || []).reduce((sum, j) => sum + (j.steps?.length || 0), 0), color: "text-blue-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-black mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-sm font-bold text-white transition-all transform animate-in slide-in-from-bottom-4 ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
          {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      {/* ── Global Settings ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <Settings className="w-4 h-4 text-yellow-500" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Global Configuration ({selectedCountry.toUpperCase()})</h3>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          <Toggle
            label="Auto Progress on Completion"
            checked={settings.globalSettings?.autoProgressOnCompletion}
            onChange={(v) => setSettings(prev => { const next = clone(prev); next.globalSettings.autoProgressOnCompletion = v; return next; })}
            desc="Step complete hone pe auto next step pe move karo"
          />
          <Toggle
            label="Require Evidence at Each Step"
            checked={settings.globalSettings?.requireEvidenceAtEachStep}
            onChange={(v) => setSettings(prev => { const next = clone(prev); next.globalSettings.requireEvidenceAtEachStep = v; return next; })}
            desc="Har step pe photo/document upload mandatory (Global)"
          />
          <Toggle
            label="Send SMS Notifications"
            checked={settings.globalSettings?.sendSMSNotifications}
            onChange={(v) => setSettings(prev => { const next = clone(prev); next.globalSettings.sendSMSNotifications = v; return next; })}
            desc="Customer ko SMS alerts bhejo"
          />
          <Toggle
            label="Send Email Notifications"
            checked={settings.globalSettings?.sendEmailNotifications}
            onChange={(v) => setSettings(prev => { const next = clone(prev); next.globalSettings.sendEmailNotifications = v; return next; })}
            desc="Customer ko email updates bhejo"
          />
          <Toggle
            label="Allow EPC to Update Steps"
            checked={settings.globalSettings?.allowEPCToUpdateSteps}
            onChange={(v) => setSettings(prev => { const next = clone(prev); next.globalSettings.allowEPCToUpdateSteps = v; return next; })}
            desc="EPC partner apne assigned steps update kar sake"
          />
          <Toggle
            label="Customer Portal Visible"
            checked={settings.globalSettings?.customerPortalVisible}
            onChange={(v) => setSettings(prev => { const next = clone(prev); next.globalSettings.customerPortalVisible = v; return next; })}
            desc="Customer apna project journey track kar sake"
          />
        </div>
      </div>

      {/* ── Journey Cards ── */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-base font-black text-slate-800 tracking-tight">Project Workflows</h3>
          <button
            onClick={addJourney}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-yellow-700 border-2 border-yellow-300 bg-yellow-50 rounded-xl hover:bg-yellow-400 hover:text-yellow-900 transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create New Project Type
          </button>
        </div>

        {(settings.journeys || []).map((journey, ji) => (
          <JourneyCard
            key={journey.projectType + ji}
            journey={journey}
            journeyIndex={ji}
            onUpdateJourney={updateJourney}
            onRemoveJourney={removeJourney}
            onSaveConfig={handleSave}
            isSaving={saving}
            selectedCountry={selectedCountry}
          />
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800">Add New Journey Workflow</h3>
            <p className="text-sm text-slate-500">Select a project type to create its order workflow.</p>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Project Type</label>
              <select
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
                value={selectedNewProjectType}
                onChange={(e) => setSelectedNewProjectType(e.target.value)}
              >
                <option value="">-- Select Project Type --</option>
                {projectTypes.filter(pt => !(settings.journeys || []).some(j => j.projectType === pt.id)).map(pt => (
                  <option key={pt.id} value={pt.id}>{pt.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-bold text-slate-900 bg-yellow-400 rounded-xl hover:bg-yellow-500 transition shadow-sm disabled:opacity-50"
                onClick={handleAddJourneyConfirm}
                disabled={!selectedNewProjectType}
              >
                Add Journey
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderJourneyScreen;
