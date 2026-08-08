/**
 * ProjectOrdersScreen — Admin panel tab
 * Order Journey Completion Logic
 * Shows actual customer project instances with live step-by-step progress
 * API: /api/project-orders
 */

import React, { useState, useEffect, useCallback } from "react";
import { SUPPORTED_COUNTRIES, getStatesForCountry, getDistrictsForState } from "../utils/geography";
import {
  GitBranch, Search, RefreshCw, X, MapPin, Phone, Mail,
  CheckCircle, Circle, Clock, AlertCircle, ChevronRight,
  Home, Building2, Users, Zap, Loader2, User, Calendar,
  Upload, ArrowLeft, IndianRupee, TrendingUp, ListFilter,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

// ── Static config ─────────────────────────────────────────────────────────────
const PROJECT_TYPE_ICONS = {
  residential: <Home className="w-4 h-4" />,
  commercial: <Building2 className="w-4 h-4" />,
  group: <Users className="w-4 h-4" />,
  "common-meter": <Zap className="w-4 h-4" />,
};

const STATUS_CONFIG = {
  lead: { label: "Lead", color: "bg-slate-100 text-slate-600 border-slate-200" },
  qualified: { label: "Qualified", color: "bg-blue-100 text-blue-700 border-blue-200" },
  surveyed: { label: "Surveyed", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  "in-progress": { label: "In Progress", color: "bg-amber-100 text-amber-700 border-amber-200" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700 border-green-200" },
  closed: { label: "Closed", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200" },
  "on-hold": { label: "On Hold", color: "bg-orange-100 text-orange-700 border-orange-200" },
};

const ASSIGNED_TO_CONFIG = {
  company: { label: "Sunnovative", color: "text-blue-600 bg-blue-50 border-blue-200" },
  "epc-partner": { label: "EPC Partner", color: "text-purple-600 bg-purple-50 border-purple-200" },
  customer: { label: "Customer", color: "text-green-600 bg-green-50 border-green-200" },
  both: { label: "Company + EPC", color: "text-orange-600 bg-orange-50 border-orange-200" },
};

// ── Progress Ring ─────────────────────────────────────────────────────────────
const ProgressRing = ({ percentage, size = 44 }) => {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e2e8f0" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={percentage === 100 ? "#10b981" : "#facc15"}
          strokeWidth={stroke} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold text-slate-700">{percentage}%</span>
      </div>
    </div>
  );
};

// ── Order Row (list item) ─────────────────────────────────────────────────────
const OrderRow = ({ order, onClick }) => {
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.lead;
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-3.5 bg-white border border-slate-200 rounded-xl hover:border-yellow-300 hover:shadow-sm transition-all text-left"
    >
      <ProgressRing percentage={order.completionPercentage || 0} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm text-slate-800">{order.customerName}</span>
          <span className="text-[11px] font-mono text-slate-400">{order.orderNumber}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            {PROJECT_TYPE_ICONS[order.projectType]}
            {order.projectTypeLabel}
          </span>
          {order.systemSizeKW > 0 && <span>{order.systemSizeKW} kW</span>}
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3" />{order.customerMobile}
          </span>
        </div>
      </div>

      {order.pendingActionAlert && (
        <div className="hidden sm:flex flex-col items-end gap-0.5 max-w-[180px]">
          <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />Pending
          </span>
          <span className="text-[11px] text-slate-500 text-right truncate w-full">{order.pendingActionAlert}</span>
        </div>
      )}

      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
    </button>
  );
};

// ── Step Timeline Item ────────────────────────────────────────────────────────
const StepItem = ({ step, isLast, onComplete, completingId }) => {
  const assignedConfig = ASSIGNED_TO_CONFIG[step.assignedTo] || ASSIGNED_TO_CONFIG.company;
  const isCompleted = step.status === "completed";
  const isCompleting = completingId === step.stepId;
  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");

  return (
    <div className="flex gap-3">
      {/* Timeline marker */}
      <div className="flex flex-col items-center">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
          isCompleted ? "bg-green-500" : "bg-slate-200"
        }`}>
          {isCompleted
            ? <CheckCircle className="w-4 h-4 text-white" />
            : <span className="text-[11px] font-bold text-slate-500">{step.stepNumber}</span>}
        </div>
        {!isLast && <div className={`w-0.5 flex-1 min-h-[24px] ${isCompleted ? "bg-green-300" : "bg-slate-200"}`} />}
      </div>

      {/* Step content */}
      <div className="flex-1 pb-5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className={`text-sm font-semibold ${isCompleted ? "text-slate-700" : "text-slate-500"}`}>
            {step.title}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${assignedConfig.color}`}>
            {assignedConfig.label}
          </span>
        </div>

        {isCompleted ? (
          <div className="mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="text-[11px] text-green-600 flex items-center gap-1 font-semibold mb-1">
              <CheckCircle className="w-3 h-3" />
              Completed on {step.completedAt ? new Date(step.completedAt).toLocaleString("en-IN") : ""}
              {step.completedBy ? ` by ${step.completedBy}` : ""}
            </div>
            {step.evidenceNote && (
              <p className="text-[11px] text-slate-600 mt-1"><span className="font-semibold text-slate-700">Note:</span> {step.evidenceNote}</p>
            )}
            {step.evidenceUrl && (
              <a href={step.evidenceUrl} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 hover:underline mt-1 inline-block font-medium">
                📄 View Attached Document
              </a>
            )}
          </div>
        ) : (
          <div className="mt-2">
            {step.pendingActionAlert && (
              <p className="text-xs text-amber-600 mb-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{step.pendingActionAlert}
              </p>
            )}
            {step.assignedTo === 'company' || step.assignedTo === 'both' ? (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-3">
                <input
                  type="text"
                  placeholder="Add a note (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-yellow-400"
                />
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                />
                <button
                  onClick={() => onComplete(step.stepId, file, note)}
                  disabled={isCompleting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-yellow-900 bg-yellow-400 rounded-lg hover:bg-amber-400 transition disabled:opacity-50"
                >
                  {isCompleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                  {isCompleting ? "Marking..." : "Mark Complete"}
                </button>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-100 text-blue-700 text-[11px] px-3 py-2 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                  <strong>Action Required by {assignedConfig.label}</strong><br/>
                  This step will automatically mark as complete when the {assignedConfig.label} performs their task in their portal.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Order Detail Panel ────────────────────────────────────────────────────────
const OrderDetail = ({ orderId, onBack, onRefreshList }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("journey"); // "journey" or "stc"

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/project-orders/${orderId}`);
      const data = await res.json();
      if (data.success) setOrder(data.data);
    } catch {
      showToast("error", "Order load nahi hua");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const handleCompleteStep = async (stepId, file = null, note = "") => {
    setCompletingId(stepId);
    try {
      let body;
      let headers = {};

      if (file) {
        body = new FormData();
        body.append("stepId", stepId);
        body.append("completedBy", "Admin");
        body.append("note", note);
        body.append("evidence", file);
      } else {
        headers = { "Content-Type": "application/json" };
        body = JSON.stringify({ stepId, completedBy: "Admin", note });
      }

      const res = await fetch(`${API_BASE}/api/project-orders/${orderId}/complete-step`, {
        method: "POST",
        headers,
        body,
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", data.message);
        await fetchOrder();
        onRefreshList?.();
      } else {
        showToast("error", data.message || "Step complete nahi hua");
      }
    } catch {
      showToast("error", "Network error");
    } finally {
      setCompletingId(null);
    }
  };

  const handleStcAction = async (action, amount = null) => {
    try {
      const res = await fetch(`${API_BASE}/api/project-orders/${orderId}/stc-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, amountRecovered: amount }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", data.message);
        fetchOrder();
      } else {
        showToast("error", data.message);
      }
    } catch {
      showToast("error", "Failed to update STC status");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
        <p className="text-sm font-medium">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3 text-red-400">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm font-medium">Order load nahi hua</p>
        <button onClick={onBack} className="text-xs px-4 py-2 bg-slate-100 rounded-xl hover:bg-slate-200">Back to List</button>
      </div>
    );
  }

  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.lead;

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-800">{order.customerName}</h2>
            <p className="text-xs font-mono text-slate-500">#{order.orderNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${status.color}`}>
            {status.label}
          </span>
          <button onClick={fetchOrder} className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SITE LOCATION & ROOFTOP EVIDENCE PANEL (Always Visible) */}
      <div className={`border rounded-2xl p-5 mb-5 shadow-sm ${order.status === "lead" ? "bg-yellow-50 border-yellow-200" : "bg-white border-slate-200"}`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${order.status === "lead" ? "bg-yellow-100 text-yellow-600" : "bg-blue-50 text-blue-600"}`}>
            {order.status === "lead" ? <CheckCircle className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
          </div>
          <div className="flex-1">
            <h3 className={`text-base font-black ${order.status === "lead" ? "text-yellow-900" : "text-slate-800"}`}>
              {order.status === "lead" ? "Admin Review Required" : "Site Location & Rooftop Evidence"}
            </h3>
            <p className={`text-sm mt-1 mb-4 ${order.status === "lead" ? "text-yellow-800" : "text-slate-500"}`}>
              {order.status === "lead" 
                ? "Please verify the customer's rooftop photo and GPS location before qualifying this lead for token payment."
                : "Customer's GPS location and rooftop photo submitted during lead capture."}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className={`p-3 rounded-xl border ${order.status === "lead" ? "bg-white border-yellow-100" : "bg-slate-50 border-slate-100"}`}>
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Rooftop Photo</p>
                {order.rooftopPhoto ? (
                  <img src={order.rooftopPhoto.startsWith('http') ? order.rooftopPhoto : `${API_BASE}/uploads/${order.rooftopPhoto.split('/').pop()}`} alt="Rooftop" className="w-full h-32 object-cover rounded-lg" />
                ) : (
                  <div className="w-full h-32 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs">No photo uploaded</div>
                )}
              </div>
              <div className={`p-3 rounded-xl border ${order.status === "lead" ? "bg-white border-yellow-100" : "bg-slate-50 border-slate-100"}`}>
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">GPS Location</p>
                {order.location?.latitude && order.location?.longitude ? (
                  <div className="h-full flex flex-col justify-center">
                    <p className="font-mono text-sm text-slate-700 font-bold mb-1">Lat: {order.location.latitude.toFixed(6)}</p>
                    <p className="font-mono text-sm text-slate-700 font-bold">Lng: {order.location.longitude.toFixed(6)}</p>
                    <a href={`https://maps.google.com/?q=${order.location.latitude},${order.location.longitude}`} target="_blank" rel="noreferrer" className="mt-3 text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
                      <MapPin className="w-3 h-3"/> View on Maps
                    </a>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">No GPS data</div>
                )}
              </div>
            </div>

            {(order.status === "lead" || order.status === "Enquiry Created") && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={async () => {
                    if(window.confirm("Are you sure you want to Qualify this lead? The customer will be prompted to pay the token amount.")) {
                      try {
                        const res = await fetch(`${API_BASE}/api/project-orders/${orderId}/qualify`, {
                          method: "POST"
                        });
                        const data = await res.json();
                        if(data.success) {
                          showToast("success", data.message);
                          fetchOrder();
                          onRefreshList?.();
                        } else {
                          showToast("error", data.message);
                        }
                      } catch(e) {
                        showToast("error", "Failed to qualify lead.");
                      }
                    }
                  }}
                  className="px-6 py-2.5 bg-yellow-400 text-yellow-900 rounded-xl font-bold text-sm hover:bg-yellow-500 transition shadow-sm"
                >
                  Approve & Qualify Lead
                </button>

                <button 
                  onClick={async () => {
                    if(window.confirm("Are you sure you want to REJECT this lead? This will cancel the project order.")) {
                      try {
                        const res = await fetch(`${API_BASE}/api/project-orders/${orderId}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: "cancelled" })
                        });
                        const data = await res.json();
                        if(data.success) {
                          showToast("success", "Lead has been rejected and cancelled.");
                          fetchOrder();
                          onRefreshList?.();
                        } else {
                          showToast("error", data.message);
                        }
                      } catch(e) {
                        showToast("error", "Failed to reject lead.");
                      }
                    }
                  }}
                  className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100 transition shadow-sm"
                >
                  Reject & Discard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <ProgressRing percentage={order.completionPercentage} size={64} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-800">{order.customerName}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>{status.label}</span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">{order.orderNumber}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{order.customerMobile}</span>
                {order.customerEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{order.customerEmail}</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-slate-400">Current Step</span>
            <span className="text-sm font-bold text-slate-700">{order.currentStepTitle || "—"}</span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Type</p>
            <p className="text-sm font-bold text-slate-700 flex items-center justify-center gap-1 mt-1">
              {PROJECT_TYPE_ICONS[order.projectType]}{order.projectTypeLabel}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">System Size</p>
            <p className="text-sm font-bold text-slate-700 mt-1">{order.systemSizeKW || 0} kW</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Est. Subsidy</p>
            <p className="text-sm font-bold text-green-600 mt-1">₹{(order.estimatedSubsidy || 0).toLocaleString("en-IN")}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">EPC Partner</p>
            <p className="text-sm font-bold text-slate-700 mt-1">{order.assignedEPCName || "Not Assigned"}</p>
          </div>
        </div>

        {/* Location */}
        {order.location?.latitude && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{order.location.address || `${order.location.district || ""}, ${order.location.state || ""}`}</span>
              <span className="font-mono text-slate-400">({order.location.latitude}, {order.location.longitude})</span>
              {order.location.district && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                  {order.location.district}
                </span>
              )}
              {order.location.pincode && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200">
                  PIN: {order.location.pincode}
                </span>
              )}
            </div>

            {/* Embedded free OpenStreetMap — no API key needed */}
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <iframe
                title="Project Location Map"
                width="100%"
                height="220"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${order.location.longitude - 0.01}%2C${order.location.latitude - 0.01}%2C${order.location.longitude + 0.01}%2C${order.location.latitude + 0.01}&layer=mapnik&marker=${order.location.latitude}%2C${order.location.longitude}`}
              />
              <a
                href={`https://www.openstreetmap.org/?mlat=${order.location.latitude}&mlon=${order.location.longitude}#map=16/${order.location.latitude}/${order.location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-[11px] font-semibold text-blue-500 bg-blue-50 py-2 hover:bg-blue-100 transition"
              >
                Full Map mein Khole →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Pending Action Banner */}
      {order.pendingActionAlert && order.status !== "closed" && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <div className="flex-1 text-xs text-amber-700">
            <span className="font-bold">Pending: </span>{order.pendingActionAlert}
            <span className="ml-1 text-amber-500">
              ({ASSIGNED_TO_CONFIG[order.pendingActionFor]?.label || "Company"} ko karna hai)
            </span>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="flex items-center gap-4 border-b border-slate-200 mt-6 mb-4 px-2">
        <button 
          onClick={() => setActiveTab("journey")}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "journey" ? "border-yellow-400 text-yellow-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Journey Timeline
        </button>
        {order.location?.country === "Australia" && (
          <button 
            onClick={() => setActiveTab("stc")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "stc" ? "border-yellow-400 text-yellow-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            STC Tracking
          </button>
        )}
      </div>

      {activeTab === "journey" ? (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <HorizontalStepper 
              steps={(order.steps || []).map(s => s.title)} 
              currentStatus={order.currentStepTitle || order.steps?.find(s => s.status !== "completed")?.title}
              theme="light"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <GitBranch className="w-4 h-4 text-yellow-500" />
            <h3 className="text-sm font-bold text-slate-800">Journey Timeline</h3>
            <span className="text-xs text-slate-400">({order.steps?.filter(s => s.status === "completed").length}/{order.steps?.length} steps)</span>
          </div>

        <div>
          {(order.steps || []).map((step, i) => (
            <StepItem
              key={step.stepId || i}
              step={step}
              isLast={i === order.steps.length - 1}
              onComplete={handleCompleteStep}
              completingId={completingId}
            />
          ))}
        </div>
      </div>
        </>
      ) : (
        {/* STC Tracking Tab */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">STC Calculation Breakdown</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex justify-between"><span className="font-semibold">System Size:</span> <span>{order.stcDetails?.systemSizeKw || 0} kW</span></div>
              <div className="flex justify-between"><span className="font-semibold">Postcode:</span> <span>{order.stcDetails?.postcode || "-"} (Zone {order.stcDetails?.zone || "-"})</span></div>
              <div className="flex justify-between"><span className="font-semibold">Deeming Years:</span> <span>{order.stcDetails?.deemingYears || 0}</span></div>
              <div className="flex justify-between border-t pt-2 mt-2 font-bold text-slate-800">
                <span>Calculated STCs:</span>
                <span>{order.stcDetails?.stcs || 0} STCs</span>
              </div>
              <div className="flex justify-between"><span className="font-semibold">STC Price Used:</span> <span>${order.stcDetails?.stcPriceUsed || 0} AUD</span></div>
              <div className="flex justify-between border-t pt-2 mt-2 font-bold text-green-700">
                <span>STC Rebate Applied:</span>
                <span>${order.stcDetails?.stcRebateAmount || 0} AUD</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">STC Status Tracking</h3>
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">Assignment Form Signed:</span>
                {order.stcStatus?.assignmentFormSigned ? (
                  <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> {new Date(order.stcStatus.assignmentFormSignedAt).toLocaleDateString()}</span>
                ) : <span className="text-xs font-bold text-slate-400">Pending Customer</span>}
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm font-semibold text-slate-600">STCs Created in Registry:</span>
                {order.stcStatus?.stcsCreatedInRegistry ? (
                  <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> {new Date(order.stcStatus.stcsCreatedDate).toLocaleDateString()}</span>
                ) : (
                  <button onClick={() => handleStcAction("mark-stcs-created")} className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded font-bold hover:bg-blue-100">Mark as Created</button>
                )}
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm font-semibold text-slate-600">STCs Traded:</span>
                {order.stcStatus?.stcsTraded ? (
                  <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> {new Date(order.stcStatus.stcsTradedDate).toLocaleDateString()}</span>
                ) : (
                  <button onClick={() => handleStcAction("mark-stcs-traded")} className="text-xs px-3 py-1 bg-purple-50 text-purple-600 rounded font-bold hover:bg-purple-100">Mark as Traded</button>
                )}
              </div>

              {order.stcStatus?.stcsTraded && (
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm font-semibold text-slate-600">Amount Recovered (AUD):</span>
                  {order.stcStatus?.amountRecovered > 0 ? (
                    <span className="text-sm font-bold text-green-700">${order.stcStatus.amountRecovered}</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input type="number" id="tradeAmt" placeholder="Enter Amt" className="w-24 text-xs p-1 border rounded" />
                      <button onClick={() => handleStcAction("update-amount", document.getElementById("tradeAmt").value)} className="text-xs px-2 py-1 bg-green-500 text-white rounded font-bold hover:bg-green-600">Save</button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export const ProjectOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (filterCountry) params.append("country", filterCountry);
      if (filterState) params.append("state", filterState);
      if (filterDistrict) params.append("district", filterDistrict);

      const res = await fetch(`${API_BASE}/api/project-orders?${params}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        setStats(data.stats || {});
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, filterCountry, filterState, filterDistrict]);

  useEffect(() => {
    const debounce = setTimeout(fetchOrders, 300);
    return () => clearTimeout(debounce);
  }, [fetchOrders]);

  if (selectedOrderId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <OrderDetail
          orderId={selectedOrderId}
          onBack={() => setSelectedOrderId(null)}
          onRefreshList={fetchOrders}
        />
      </div>
    );
  }

  const totalOrders = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Project Orders</h1>
            <p className="text-xs text-slate-500">Customer projects ka live journey tracking — {totalOrders} total orders</p>
          </div>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? "" : key)}
            className={`p-2.5 rounded-xl border text-center transition ${
              statusFilter === key ? "border-yellow-400 bg-yellow-50" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <p className="text-lg font-black text-slate-700">{stats[key] || 0}</p>
            <p className="text-[9px] font-semibold text-slate-400 uppercase truncate">{cfg.label}</p>
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Customer name, mobile, ya order number search karo..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
          />
        </div>
        <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40">
          <option value="">All Countries</option>
          <option value="India">India</option>
          <option value="Australia">Australia</option>
          <option value="New Zealand">New Zealand</option>
        </select>
        <input type="text" value={filterState} onChange={e => setFilterState(e.target.value)} placeholder="Filter State"
            className="w-32 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/40" />
        <input type="text" value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} placeholder="Filter District"
            className="w-32 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/40" />
        {(statusFilter || search || filterCountry || filterState || filterDistrict) && (
          <button onClick={() => { setStatusFilter(""); setSearch(""); setFilterCountry(""); setFilterState(""); setFilterDistrict(""); }} className="flex items-center gap-1 px-3 py-2.5 text-xs font-semibold text-red-500 bg-red-50 rounded-xl hover:bg-red-100">
            <X className="w-3.5 h-3.5" /> Clear Filter
          </button>
        )}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin text-yellow-400" />
          <p className="text-sm">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
          <GitBranch className="w-10 h-10 opacity-30" />
          <p className="text-sm font-medium">Koi project order nahi mila</p>
          <p className="text-xs">Naya lead aate hi yahan dikhega</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <OrderRow key={order._id} order={order} onClick={() => setSelectedOrderId(order._id)} />
          ))}
        </div>
      )}
    </div>
  );
};


