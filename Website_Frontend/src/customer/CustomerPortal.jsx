/**
 * CustomerPortal.jsx — Premium Solar Customer Portal
 * Full-page portal with: Dashboard • My Projects • Apply • EPC Partners • Documents • Profile
 */
import React, { useState, useEffect, useRef } from "react";
import {
  Sun, ArrowLeft, User, FolderOpen, LayoutDashboard, LogOut,
  ChevronRight, ChevronDown, ChevronUp, MapPin, Clock, CheckCircle2,
  AlertCircle, Upload, FileText, Loader2, Plus, Phone, Mail, Home,
  Shield, Zap, IndianRupee, TrendingUp, Bell, CheckCheck, Circle,
  Timer, XCircle, Calendar, Building, Users, Star, Award,
  Package, Sparkles, ArrowRight, Camera, X, Info, Search,
  Filter, SlidersHorizontal, BarChart3, Leaf, Wallet, Check, CreditCard, Trash2, CheckSquare, Square,
} from "lucide-react";
import { useCustomerAuth } from "./CustomerAuthContext";
import { useCountry } from "../context/CountryContext";
import { generateDynamicEligibility } from "../data/mockConsumers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4005";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => n ? `₹${Number(n).toLocaleString("en-IN")}` : "—";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtShort = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—";

const STATUS = {
  lead:         { label: "Lead Captured",  color: "bg-slate-100 text-slate-600", dot: "bg-slate-400",   icon: <Clock className="w-3.5 h-3.5" />, pct: 10 },
  qualified:    { label: "Qualified",      color: "bg-blue-100 text-blue-700",   dot: "bg-blue-500",    icon: <CheckCircle2 className="w-3.5 h-3.5" />, pct: 25 },
  surveyed:     { label: "Site Surveyed",  color: "bg-yellow-100 text-yellow-700",dot:"bg-yellow-500",  icon: <MapPin className="w-3.5 h-3.5" />, pct: 45 },
  "in-progress":{ label: "Installing",     color: "bg-orange-100 text-orange-700",dot:"bg-orange-500",  icon: <TrendingUp className="w-3.5 h-3.5" />, pct: 70 },
  completed:    { label: "Completed",      color: "bg-green-100 text-green-700",  dot: "bg-green-500",  icon: <CheckCheck className="w-3.5 h-3.5" />, pct: 95 },
  closed:       { label: "Subsidy Credited",color:"bg-purple-100 text-purple-700",dot:"bg-purple-500",  icon: <Award className="w-3.5 h-3.5" />, pct: 100 },
  cancelled:    { label: "Cancelled",      color: "bg-red-100 text-red-600",      dot: "bg-red-400",    icon: <XCircle className="w-3.5 h-3.5" />, pct: 0 },
  "on-hold":    { label: "On Hold",        color: "bg-slate-100 text-slate-500",  dot: "bg-slate-400",  icon: <Timer className="w-3.5 h-3.5" />, pct: 0 },
};
const sCfg = (s) => STATUS[s] || STATUS.lead;

// ── Reusable Components ───────────────────────────────────────────────────────

function Badge({ status }) {
  const c = sCfg(status);
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${c.color} border-current/20`}>
      {c.icon}{c.label}
    </span>
  );
}


const MultiSelectDropdown = ({ options, selectedIds, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOptions = options.filter(o => selectedIds.includes(o._id));
  const displayText = selectedOptions.length > 0 ? selectedOptions.map(o => o.name).join(', ') : placeholder;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className="border border-slate-200 hover:border-yellow-400 rounded-lg p-3 bg-white cursor-pointer flex justify-between items-center transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-bold text-slate-700 truncate">{displayText}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {options.map(o => {
            const isSelected = selectedIds.includes(o._id);
            return (
              <div 
                key={o._id} 
                className={`flex items-center p-3 cursor-pointer border-b border-slate-50 last:border-b-0 transition ${isSelected ? 'bg-yellow-50/50' : 'hover:bg-slate-50'}`}
                onClick={() => {
                  if (isSelected) onChange(selectedIds.filter(id => id !== o._id));
                  else onChange([...selectedIds, o._id]);
                }}
              >
                <div className={`w-4 h-4 border rounded mr-3 flex items-center justify-center transition ${isSelected ? 'bg-yellow-500 border-yellow-500' : 'border-slate-300'}`}>
                  {isSelected && <span className="text-white text-[10px] font-black leading-none">✓</span>}
                </div>
                <span className={`text-sm ${isSelected ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>{o.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function StarRating({ rating, count }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}`} />
      ))}
      <span className="text-[11px] text-slate-500 font-medium ml-0.5">{rating?.toFixed(1) || "New"} {count ? `(${count})` : ""}</span>
    </div>
  );
}

function ProgressTracker({ status, pct }) {
  // Ultra-thin & compact line tracker UI matching screenshot
  
  const getActiveIndex = (s) => {
    switch (s) {
      case 'lead': return 0; 
      case 'document-upload': return 2;
      case 'epc-assigned': return 8;
      case 'site-survey': return 9;
      case 'proposal': return 10;
      case 'mnre-registration': return 11;
      case 'installation': return 11;
      case 'inspection': return 12;
      case 'net-metering': return 13;
      case 'subsidy': return 14;
      case 'completed': return 15;
      default: return 0;
    }
  };
  
  const activeIndex = getActiveIndex(status);

  return (
    <div className="w-full bg-white/90 backdrop-blur-md border border-white/20 rounded-xl p-2 shadow-sm overflow-x-auto scrollbar-hide">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-wider">PROJECT JOURNEY TIMELINE</h3>
        <Badge status={status} />
      </div>

      <div className="min-w-[680px] flex items-start justify-between relative px-2 py-0.5">
        {/* Connecting track line */}
        <div className="absolute left-5 right-5 top-3 h-0.5 bg-slate-200 -z-10" />

        {["Lead...", "Submit...", "Upload...", "Verify...", "Docum...", "Select...", "Payment", "Allocat...", "Accept...", "Site...", "Proposal", "Installation", "Upload...", "Net...", "Subsid...", "Progres..."].map((title, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          return (
            <div key={i} className="flex flex-col items-center flex-1 relative group cursor-pointer">
              {i > 0 && (done || active) && (
                <div className={`absolute right-[50%] left-[-50%] top-3 h-0.5 -z-10 transition-all ${done ? 'bg-orange-500' : 'bg-amber-400'}`} />
              )}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black ring-2 ring-white mb-0.5 transition-all ${
                done ? "bg-orange-500 text-white shadow-sm" : 
                active ? "bg-amber-400 text-white shadow-md ring-amber-100 animate-pulse" : 
                "bg-slate-200 text-slate-500"
              }`}>
                {done ? <CheckCircle2 className="w-3 h-3" /> : (i + 1)}
              </div>
              <p className={`text-[8px] text-center font-bold px-0.5 line-clamp-1 max-w-[65px] ${
                done ? "text-slate-800" : active ? "text-amber-700 font-extrabold" : "text-slate-400"
              }`}>
                {title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectJourneyTracker({ steps, projectId, onRefresh }) {
  const [expandedStep, setExpandedStep] = useState(null);
  const [evidenceNote, setEvidenceNote] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [actionInputs, setActionInputs] = useState({});
  const [stageLoading, setStageLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = async (stepId, slotLabel, file) => {
    if (!file) return;
    const token = localStorage.getItem("customer_token");
    const fd = new FormData();
    fd.append("file", file);
    
    setActionInputs(prev => ({
      ...prev,
      [stepId]: {
        ...(prev[stepId] || {}),
        [`${slotLabel}_uploading`]: true
      }
    }));

    try {
      const res = await fetch(`${API}/api/upload-file`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        setActionInputs(prev => ({
          ...prev,
          [stepId]: {
            ...(prev[stepId] || {}),
            [slotLabel]: data.fileUrl,
            [`${slotLabel}_uploading`]: false
          }
        }));
      } else {
        alert(data.message || "File upload failed");
        setActionInputs(prev => ({
          ...prev,
          [stepId]: {
            ...(prev[stepId] || {}),
            [`${slotLabel}_uploading`]: false
          }
        }));
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
      setActionInputs(prev => ({
        ...prev,
        [stepId]: {
          ...(prev[stepId] || {}),
          [`${slotLabel}_uploading`]: false
        }
      }));
    }
  };

  const handleTextChange = (stepId, slotLabel, val) => {
    setActionInputs(prev => ({
      ...prev,
      [stepId]: {
        ...(prev[stepId] || {}),
        [slotLabel]: val
      }
    }));
  };

  const completeStep = async (stepId) => {
    if (!window.confirm("Mark this step as complete?")) return;
    setStageLoading(true);
    setErrorMsg("");
    try {
      const fd = new FormData();
      fd.append("stepId", stepId);
      if (evidenceNote) fd.append("note", evidenceNote);
      if (uploadFile) fd.append("evidence", uploadFile);

      const step = displaySteps.find(s => (s.id || s.stepId) === stepId);
      const reqActions = step?.requiredActions || [];
      const uploadedActions = [];

      for (const act of reqActions) {
        const val = actionInputs[stepId]?.[act.label] || "";
        if (act.required && !val) {
          alert(`Please fill/upload required field: ${act.label}`);
          setStageLoading(false);
          return;
        }
        uploadedActions.push({
          label: act.label,
          fileType: act.fileType,
          value: val
        });
      }

      if (uploadedActions.length > 0) {
        fd.append("uploadedActions", JSON.stringify(uploadedActions));
      }

      const token = localStorage.getItem("customer_token");
      const res = await fetch(`${API}/api/customer/projects/${projectId}/complete-step`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const d = await res.json();
      if (d.success) {
        setUploadFile(null);
        setEvidenceNote("");
        if (onRefresh) onRefresh();
      } else {
        setErrorMsg(d.message || "Step completion failed");
      }
    } catch (err) {
      setErrorMsg("Network error completing step");
    } finally {
      setStageLoading(false);
    }
  };

  const displaySteps = steps?.length > 0 ? steps : [
    { stepNumber: 1, title: 'Lead Captured', status: 'completed' },
    { stepNumber: 2, title: 'EPC Assigned', status: 'pending' },
    { stepNumber: 3, title: 'Site Survey', status: 'pending' },
    { stepNumber: 4, title: 'Installation', status: 'pending' },
    { stepNumber: 5, title: 'Completed', status: 'pending' }
  ];

  return (
    <div className="w-full space-y-3 mt-4">
      {displaySteps.map((step, i) => {
        const done = step.status === "completed";
        const blocked = step.status === "blocked";
        const isAwaitingApproval = step.status === "awaiting-approval";
        const active = step.status === "in-progress" || isAwaitingApproval || (step.status === "pending" && (i === 0 || displaySteps[i-1]?.status === "completed"));
        const isExpanded = expandedStep === i;

        // Check if all previous steps in the journey are completed or skipped
        const previousStepsCompleted = displaySteps.slice(0, i).every(s => s.status === "completed" || s.status === "skipped");

        // Role-based colors
        let roleColor = "bg-slate-100 text-slate-600";
        let roleLabel = "Admin";
        if (step.assignedTo === "bde") {
          roleColor = "bg-blue-100 text-blue-700";
          roleLabel = "BDE";
        } else if (step.assignedTo === "epc-partner") {
          roleColor = "bg-orange-100 text-orange-700";
          roleLabel = "EPC";
        } else if (step.assignedTo === "company") {
          roleColor = "bg-red-100 text-red-700";
          roleLabel = "Admin";
        } else if (step.assignedTo === "customer") {
          roleColor = "bg-green-100 text-green-700";
          roleLabel = "Aap (Customer)";
        }

        const isCustomer = step.assignedTo === "customer";
        const isActive = step.status === "in-progress" || (step.status === "pending" && (i === 0 || displaySteps[i-1]?.status === "completed"));
        const requiresDoc = step.requiresDocumentUpload || (step.documentRequirements && step.documentRequirements.length > 0);

        return (
          <div key={i} className={`border rounded-lg transition-all ${isAwaitingApproval ? 'border-yellow-400 bg-yellow-50/70 shadow-sm' : active ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200/80 bg-white'}`}>
            <div 
              className="flex items-center justify-between py-1.5 px-3 cursor-pointer hover:bg-slate-50 rounded-lg"
              onClick={() => {
                setExpandedStep(isExpanded ? null : i);
                setErrorMsg("");
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                  done ? "bg-green-500 text-white" : 
                  blocked ? "bg-red-500 text-white" :
                  isAwaitingApproval ? "bg-yellow-400 text-yellow-950 ring-2 ring-yellow-200 animate-pulse" :
                  active ? "bg-amber-400 text-white ring-2 ring-amber-100 animate-pulse" : 
                  "bg-slate-100 text-slate-500"
                }`}>
                  {done ? <Check className="w-3.5 h-3.5" /> : 
                   blocked ? <XCircle className="w-3.5 h-3.5" /> : 
                   isAwaitingApproval ? <Clock className="w-3.5 h-3.5 text-yellow-950" /> :
                   <span>{step.stepNumber || (i+1)}</span>}
                </div>
                <div>
                  <h4 className={`font-bold text-xs ${done ? 'text-slate-800' : isAwaitingApproval ? 'text-yellow-900 font-black' : active ? 'text-amber-800 font-extrabold' : 'text-slate-600'}`}>
                    {step.title}
                  </h4>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isAwaitingApproval && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-yellow-400 text-yellow-950 border border-yellow-500 flex items-center gap-1 shadow-sm">
                    ⏳ Admin Approval Pending
                  </span>
                )}
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${roleColor}`}>
                  {roleLabel}
                </span>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
                <p className="text-xs text-slate-600 mb-3">{step.description || "No description provided for this step."}</p>
                
                {step.pendingActionAlert && active && (
                  <div className="p-2 mb-3 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {step.pendingActionAlert}
                  </div>
                )}

                {(step.uploadedActions && step.uploadedActions.length > 0) ? (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 mt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Completed Action Fields</p>
                    {step.uploadedActions.map((act, actIdx) => (
                      <div key={actIdx} className="flex justify-between items-center text-xs border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                        <span className="font-semibold text-slate-600">{act.label}:</span>
                        {act.fileType === "text" ? (
                          <span className="text-slate-800 font-medium">{act.value || "—"}</span>
                        ) : (
                          act.value ? (
                            <a href={`${API}${act.value}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-bold">
                              <FileText className="w-3.5 h-3.5" /> View File
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">No file uploaded</span>
                          )
                        )}
                      </div>
                    ))}
                    {step.evidenceNote && (
                      <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 italic mt-2">"{step.evidenceNote}"</p>
                    )}
                  </div>
                ) : (step.evidenceUrl || step.evidenceNote) ? (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 mt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Completion Details</p>
                    {step.evidenceUrl && (
                      <a href={step.evidenceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-blue-600 hover:underline mb-2 font-medium">
                        <FileText className="w-4 h-4" /> View Document / Evidence
                      </a>
                    )}
                    {step.evidenceNote && (
                      <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 italic">"{step.evidenceNote}"</p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic mt-2">No attachments or notes yet.</p>
                )}

                {isActive && isCustomer && (
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <p className="text-xs font-semibold text-amber-900 mb-2">
                      {step.actionLabel || `Complete this step: ${step.title}`}
                    </p>
                    {!previousStepsCompleted ? (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        Pehle isse pichle saare steps complete hone chahiye. / Please complete all previous steps first.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {step.requiredActions && step.requiredActions.length > 0 ? (
                          <div className="space-y-3 p-3 bg-white border border-slate-200 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Input Fields</p>
                            {step.requiredActions.map((act, actIdx) => {
                              const stepId = step.id || step.stepId;
                              const value = actionInputs[stepId]?.[act.label] || "";
                              const uploading = actionInputs[stepId]?.[`${act.label}_uploading`];

                              return (
                                <div key={actIdx} className="flex flex-col gap-1.5">
                                  <label className="text-xs font-bold text-slate-700">
                                    {act.label} {act.required !== false && <span className="text-red-500">*</span>}
                                  </label>
                                  {act.fileType === "text" ? (
                                    <input 
                                      type="text" 
                                      value={value} 
                                      onChange={(e) => handleTextChange(stepId, act.label, e.target.value)}
                                      placeholder={`Enter ${act.label}...`}
                                      className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-amber-500 bg-white focus:outline-none"
                                    />
                                  ) : (
                                    <div className="flex items-center gap-3">
                                      <input 
                                        type="file" 
                                        onChange={(e) => handleFileChange(stepId, act.label, e.target.files?.[0])}
                                        className="text-xs text-slate-500"
                                      />
                                      {uploading ? (
                                        <span className="text-xs text-amber-600 font-bold animate-pulse">Uploading...</span>
                                      ) : value ? (
                                        <span className="text-xs text-green-600 font-bold flex items-center gap-1">✓ Uploaded</span>
                                      ) : (
                                        <span className="text-xs text-slate-400">No file</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : requiresDoc ? (
                          <div className="flex flex-col gap-1.5 p-3 bg-white border border-slate-200 rounded-xl">
                            <span className="text-xs font-bold text-slate-700">
                              Required Document: {step.documentRequirements?.join(", ") || step.documentName || "Document"}
                            </span>
                            <input 
                              type="file" 
                              onChange={e => setUploadFile(e.target.files?.[0])}
                              className="text-xs text-slate-500"
                            />
                          </div>
                        ) : null}

                        <input 
                          type="text" 
                          placeholder="Add a note (optional)..."
                          className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-amber-500 bg-white focus:outline-none"
                          value={evidenceNote}
                          onChange={e => setEvidenceNote(e.target.value)}
                        />

                        <div className="flex items-center justify-end">
                          <button 
                            onClick={() => completeStep(step.id || step.stepId)}
                            disabled={stageLoading}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                          >
                            {stageLoading ? 'Saving...' : 'Submit & Complete'}
                          </button>
                        </div>
                        {errorMsg && (
                          <p className="text-xs text-red-600 font-bold mt-1">⚠️ {errorMsg}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


// ── All Indian States + Union Territories ─────────────────────────────────────
const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  // Union Territories
  "Andaman & Nicobar Islands", "Chandigarh", "Dadra & Nagar Haveli and Daman & Diu",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const AUSTRALIA_STATES = [
  "New South Wales", "Victoria", "Queensland", "Western Australia",
  "South Australia", "Tasmania", "Australian Capital Territory", "Northern Territory"
];

// ── SOLAR PACKAGES ────────────────────────────────────────────────────────────
function SolarPackages({ onApply, preselectedType }) {
  const [packages, setPackages] = useState([]);
  const [stateOverrides, setStateOverrides] = useState({});
  const [loading, setLoading] = useState(true);
  const [minBookingDays, setMinBookingDays] = useState(5);
  const { country } = useCountry();
  const getCountryCode = () => { if (country === "AU") return "australia"; if (country === "NZ") return "new_zealand"; return "india"; };
  
  const [selectedState, setSelectedState] = useState(country === "AU" ? AUSTRALIA_STATES[0] : "Gujarat");

  useEffect(() => {
    setSelectedState(country === "AU" ? AUSTRALIA_STATES[0] : "Gujarat");
  }, [country]);

  useEffect(() => {
    fetch(`${API}/api/customer/public/solar-packages`, { headers: { "x-country": getCountryCode() } })
      .then(r => r.json())
      .then(d => { if (d.success) { setPackages(d.packages); setStateOverrides(d.stateOverrides || {}); setMinBookingDays(d.minBookingDays || 5); } })
      .finally(() => setLoading(false));
  }, [country]);

  const stateSubsidy = stateOverrides[selectedState] || 0;

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-yellow-400" /></div>;

  const isIndia = country === "IN" || !country;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-black text-slate-800 text-lg">Solar System Packages</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isIndia ? "Apni zaroorat ke hisaab se package chunko" : "Choose a solar package that suits your property"}
          </p>
        </div>
        {/* State selector — India: subsidy preview, AU: region info */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
            className="text-xs font-bold text-slate-700 focus:outline-none bg-transparent max-w-[160px]"
          >
            {(isIndia ? INDIA_STATES : AUSTRALIA_STATES).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {isIndia && stateSubsidy > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl">
          <Leaf className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-xs font-bold text-green-700">
            {selectedState} state bonus subsidy: +{fmt(stateSubsidy)} central subsidy ke upar milega!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {packages.map(pkg => {
          const total = pkg.centralSubsidy + stateSubsidy;
          const net = Math.max(0, pkg.installCost - total);
          const roi = pkg.installCost > 0 ? Math.round(net / (pkg.kw * pkg.units * 7.5 * 12) * 12) : 0;
          const isPopular = pkg.badge === "Popular";
          const isMaxSub = pkg.badge === "Max Subsidy";

          return (
            <div key={pkg.id} className={`relative rounded-2xl border p-5 flex flex-col gap-4 transition-all hover:shadow-lg ${
              isPopular ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-md shadow-yellow-100" :
              isMaxSub ? "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50" :
              "border-slate-200 bg-white hover:border-yellow-200"
            }`}>
              {pkg.badge && (
                <div className={`absolute -top-2.5 left-4 text-[10px] font-black px-3 py-0.5 rounded-full ${
                  isPopular ? "bg-yellow-400 text-yellow-900" :
                  isMaxSub ? "bg-green-500 text-white" :
                  "bg-blue-500 text-white"
                }`}>{pkg.badge}</div>
              )}

              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{pkg.kw} kW System</p>
                    <h3 className="font-black text-slate-800 text-base mt-0.5">{pkg.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{pkg.desc}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center shrink-0 ml-2">
                    <Sun className="w-6 h-6 text-yellow-600 fill-yellow-300" />
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Monthly Units", value: `~${pkg.units} kWh`, color: "text-blue-600" },
                  { label: "Install Cost", value: fmt(pkg.installCost), color: "text-slate-700" },
                  { label: "ROI", value: pkg.centralSubsidy > 0 ? `~${roi} yrs` : "Ask us", color: "text-green-600" },
                ].map(s => (
                  <div key={s.label} className="bg-white/80 rounded-xl p-2 text-center border border-white/40">
                    <p className="text-[9px] text-slate-400 font-semibold uppercase leading-tight">{s.label}</p>
                    <p className={`text-xs font-black mt-0.5 ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Subsidy / Cost breakdown */}
              {pkg.centralSubsidy > 0 ? (
                <div className="bg-white rounded-xl border border-slate-100 p-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Install Cost</span>
                    <span className="font-bold text-slate-700">{fmt(pkg.installCost)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-600">− Central Subsidy</span>
                    <span className="font-bold text-blue-600">−{fmt(pkg.centralSubsidy)}</span>
                  </div>
                  {isIndia && stateSubsidy > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-green-600">− {selectedState} State</span>
                      <span className="font-bold text-green-600">−{fmt(stateSubsidy)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-100 pt-1.5 flex justify-between">
                    <span className="text-xs font-black text-slate-800">You Pay</span>
                    <span className="text-sm font-black text-yellow-600">{fmt(net)}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Estimated Cost</span>
                    <span className="font-bold text-slate-700">{fmt(pkg.installCost)}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-1.5">
                    <p className="text-[10px] text-slate-400 text-center">
                      {isIndia ? "Subsidy applicable nahi — custom quote ke liye apply karo" : "Feed-in tariff eligible · No upfront government subsidy"}
                    </p>
                  </div>
                </div>
              )}

              <button onClick={() => onApply(pkg, selectedState, stateSubsidy, minBookingDays)}
                className={`w-full py-3 text-sm font-black rounded-xl flex items-center justify-center gap-2 transition-all ${
                  isPopular ? "bg-yellow-400 hover:bg-amber-400 text-yellow-900 shadow-md" :
                  "bg-[#28377f] hover:bg-slate-700 text-white"
                }`}>
                Apply Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── EPC PARTNERS ──────────────────────────────────────────────────────────────
function EpcDirectory() {
  const [epcs, setEpcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const { country } = useCountry();
  const getCountryCode = () => { if (country === "AU") return "australia"; if (country === "NZ") return "new_zealand"; return "india"; };

  useEffect(() => {
    fetch(`${API}/api/customer/public/epc-partners`, { headers: { "x-country": getCountryCode() } })
      .then(r => r.json())
      .then(d => { if (d.success) setEpcs(d.data); })
      .finally(() => setLoading(false));
  }, [country]);

  // Use the customer's state or district to show nearby installers
  const { customer } = useCustomerAuth();
  
  const filtered = epcs.filter(e => {
    if (search && !e.city?.toLowerCase().includes(search.toLowerCase()) && !e.state?.toLowerCase().includes(search.toLowerCase())) return false;
    
    // Auto filter by customer location if no search is provided
    if (!search && customer?.district) {
       return e.activeDistricts?.includes(customer.district) || e.city === customer.district || e.state === customer.state;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-black text-slate-800 text-lg">Verified Solar Installers</h2>
        <p className="text-xs text-slate-500 mt-0.5">Aapke area me available highly rated installation partners</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by city or state..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50" />
      </div>

      {loading && <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-yellow-400" /></div>}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Building className="w-10 h-10 mx-auto mb-2 text-slate-200" />
          <p className="text-sm font-bold text-slate-500">Abhi koi active EPC partner nahi</p>
          <p className="text-xs text-slate-400 mt-1">EmergeSun directly assign karega aapke project ke liye</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((epc, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-sm hover:border-yellow-200 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center font-black text-yellow-700 text-sm shrink-0 border border-yellow-200">
                <Building className="w-5 h-5 text-yellow-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Certified Solar Installer</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />Available in {epc.city || epc.district || epc.state || "your area"}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 bg-green-100 text-green-700`}>
                    Verified
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-3 flex-wrap">
                  <StarRating rating={epc.rating} count={epc.totalRatings} />
                  {epc.onTimeCompletionPercent > 0 && (
                    <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
                      <CheckCheck className="w-3 h-3" />{epc.onTimeCompletionPercent}% on-time
                    </span>
                  )}
                  {epc.yearsOfExperience > 0 && (
                    <span className="text-[10px] text-slate-500">{epc.yearsOfExperience} yrs exp</span>
                  )}
                </div>

                {epc.qualifiedProjectTypes?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {epc.qualifiedProjectTypes.map(t => (
                      <span key={t} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-medium">{t}</span>
                    ))}
                  </div>
                )}

                {epc.activeDistricts?.length > 0 && (
                  <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" />Serves: {epc.activeDistricts.slice(0,4).join(", ")}{epc.activeDistricts.length > 4 ? ` +${epc.activeDistricts.length-4} more` : ""}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-blue-700">Installer Selection Process</p>
          <p className="text-xs text-blue-600 mt-0.5">Aapke project apply karne ke baad, EmergeSun aapke district ke hisaab se best rated solar installer automatically assign karega ya aapko select karne ka option dega.</p>
        </div>
      </div>
    </div>
  );
}

// ── PROJECT DETAIL ────────────────────────────────────────────────────────────
function ProjectDetail({ projectId, onBack, authFetch }) {
  const { country } = useCountry();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const fileRef = useRef();

  useEffect(() => {
    fetchProject();
    const interval = setInterval(() => {
      authFetch(`/api/customer/projects/${projectId}`)
        .then(r => r.json())
        .then(d => { if (d.success) setProject(d.data); });
    }, 8000);
    return () => clearInterval(interval);
  }, [projectId]);

  const fetchProject = () => {
    setLoading(true);
    authFetch(`/api/customer/projects/${projectId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setProject(d.data); })
      .finally(() => setLoading(false));
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", uploadFile);
    fd.append("documentType", "customer_upload");
    const token = localStorage.getItem("customer_token");
    const res = await fetch(`${API}/api/customer/projects/${projectId}/documents`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd,
    });
    const d = await res.json();
    setUploadMsg(d.success ? "✅ Document uploaded!" : "❌ Upload failed");
    setUploading(false);
    setUploadFile(null);
    if (d.success) {
      setTimeout(() => {
        setProject(prev => ({
          ...prev,
          documents: [...(prev.documents || []), { type: "customer_upload", url: d.fileUrl, uploadedAt: new Date() }]
        }));
        setUploadMsg("");
      }, 2000);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-yellow-400" /></div>;
  if (!project) return <div className="text-center py-16 text-slate-400"><AlertCircle className="w-8 h-8 mx-auto mb-2" /><p className="text-sm">Project nahi mila</p></div>;

  const isAU = country === "AU";

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-70px)] overflow-hidden -mt-2">
      {/* Top Fixed Area */}
      <div className="shrink-0 space-y-1.5 pb-1">
        {/* Ultra-Thin Hero Card with Back Button Inside Top Left */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-3 text-white relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button 
                onClick={onBack} 
                className="p-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition border border-white/10 flex items-center gap-1 shadow-sm"
                title="Go Back"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">Back</span>
              </button>
              <span className="text-[11px] font-bold text-slate-300 tracking-wider font-mono ml-1">{project.orderNumber}</span>
            </div>
            <Badge status={project.status} />
          </div>

          {/* Slim Progress Tracker Line */}
          <div className="relative z-10 mb-2">
            <ProgressTracker status={project.status} pct={project.completionPercentage} />
          </div>

          {/* 3 Compact Metric Badges */}
          <div className="grid grid-cols-3 gap-2 relative z-10">
            {[
              { l: "SYSTEM", v: project.systemSizeKW ? `${project.systemSizeKW} kW` : "—" },
              { l: (project.country === "australia" || country === "AU") ? "TOTAL COST" : "TOTAL COST", v: project.totalProjectCost ? `${(project.country === "australia" || country === "AU") ? "$" : "₹"}${project.totalProjectCost.toLocaleString((project.country === "australia" || country === "AU") ? 'en-US' : 'en-IN')}` : "—" },
              { l: (project.country === "australia" || country === "AU") ? "STC REBATE" : "SUBSIDY", v: project.estimatedSubsidy ? `${(project.country === "australia" || country === "AU") ? "$" : "₹"}${project.estimatedSubsidy.toLocaleString((project.country === "australia" || country === "AU") ? 'en-US' : 'en-IN')}` : "—" },
            ].map(s => (
              <div key={s.l} className="bg-slate-950/70 rounded-lg py-1.5 px-2 text-center backdrop-blur-md border border-white/10 shadow-sm">
                <p className="text-[8px] text-slate-400 uppercase font-black tracking-wider">{s.l}</p>
                <p className="text-xs font-black text-white mt-0.5">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Bottom Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-2 pb-16 hide-scrollbar">
        
        {/* === UNIFIED FULL-SCREEN PAYMENT BLOCKER === */}
        {(project.tokenData?.isPending || (project.paymentBlockActive && project.activePaymentStage && project.stagePayments)) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden text-center animate-in fade-in zoom-in duration-300">
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-rose-50 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-pink-50 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <CreditCard className="w-10 h-10 text-rose-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Payment Required</h2>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  Aapka project aage badhane ke liye ek payment pending hai. Kripya details verify karein aur secure payment complete karein.
                </p>
                
                <div className="bg-white p-4 rounded-2xl mb-6 border border-slate-200 text-left shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Purpose</p>
                  <p className="text-sm font-black text-slate-800 mb-4">
                    {project.tokenData?.isPending 
                      ? "Platform Signup Token" 
                      : (project.stagePayments?.find(s => s.stageKey === project.activePaymentStage)?.label || "Milestone Payment")}
                  </p>
                  
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Amount to Pay</p>
                  <p className="text-3xl font-black text-rose-600">
                    {isAU ? "$" : "₹"}
                    {project.tokenData?.isPending 
                      ? project.tokenData.amount.toLocaleString('en-IN')
                      : (project.stagePayments?.find(s => s.stageKey === project.activePaymentStage)?.amount || 0).toLocaleString('en-IN')}
                  </p>
                </div>

                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    
                    if (project.tokenData?.isPending) {
                      // Token Payment
                      try {
                        const res = await authFetch(`/api/customer/projects/${project._id}/pay-token`, { method: "POST" });
                        const data = await res.json();
                        if (data.success) {
                          alert("Payment verified successfully! Journey unlocked.");
                          fetchProjects();
                        } else {
                          alert(data.message || "Payment failed");
                        }
                      } catch (err) {
                        alert("An error occurred during payment.");
                      }
                    } else {
                      // Milestone Payment
                      try {
                        const stageKey = project.activePaymentStage;
                        const res = await fetch(`${API}/api/payments/create-stage-order`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ projectId: project._id, stage: stageKey })
                        });
                        const data = await res.json();
                        
                        if (data.success) {
                           if (data.alreadyPaid) {
                               alert("This stage is already paid!");
                               fetchProjects();
                               return;
                           }
                           if (data.isSimulated) {
                              const vRes = await fetch(`${API}/api/payments/verify-stage-payment`, {
                                 method: 'POST', 
                                 headers: { 'Content-Type': 'application/json' }, 
                                 body: JSON.stringify({ projectId: project._id, stage: stageKey, razorpay_signature: "simulated_signature", razorpay_order_id: data.data.id })
                              });
                              if ((await vRes.json()).success) { 
                                  alert("Payment verified successfully! Journey unlocked."); 
                                  fetchProjects(); 
                              }
                           } else {
                              const options = {
                                key: data.key_id,
                                amount: data.data.amount,
                                currency: data.data.currency,
                                order_id: data.data.id,
                                handler: async (resp) => {
                                   const vRes = await fetch(`${API}/api/payments/verify-stage-payment`, {
                                     method: 'POST', 
                                     headers: { 'Content-Type': 'application/json' }, 
                                     body: JSON.stringify({ ...resp, projectId: project._id, stage: stageKey })
                                   });
                                   if ((await vRes.json()).success) { 
                                       alert("Payment verified successfully! Journey unlocked."); 
                                       fetchProjects(); 
                                   } else {
                                       alert("Payment verification failed.");
                                   }
                                }
                              };
                              const rzp = new window.Razorpay(options);
                              rzp.open();
                           }
                        } else {
                           alert("Error: " + data.message);
                        }
                      } catch(err) {
                        alert("Error initiating payment");
                      }
                    }
                  }}
                  className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl font-black text-[15px] hover:from-rose-700 hover:to-pink-700 transition shadow-lg flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" /> Proceed to Pay Securely
                </button>
              </div>
            </div>
          </div>
        )}

   {/* 🎯 YOUR TURN BANNER (When customer action is required) */}
        {project.pendingActionFor === "customer" && (
          <div 
            onClick={() => setTab("select-installer")}
            className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white rounded-2xl p-4 shadow-md flex items-center justify-between gap-4 animate-pulse cursor-pointer hover:shadow-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-lg shadow-inner">
                🎯
              </div>
              <div>
                <p className="font-black text-sm uppercase tracking-wider">YOUR TURN / AAPKA TURN</p>
                <p className="text-xs text-green-100 font-bold mt-0.5">
                  {project.bdeRecommendationStatus === "recommended" || project.recommendedEpcs?.length > 0
                    ? "Go to My Installer to accept EPC of your choice"
                    : (project.pendingActionAlert || "Please complete your pending step below.")}
                </p>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setTab("select-installer"); }}
              className="text-[11px] font-black bg-white text-green-900 px-3.5 py-1.5 rounded-xl uppercase shadow-sm hover:bg-green-50 transition cursor-pointer"
            >
              Go to My Installer →
            </button>
          </div>
        )}

        {/* ── PROGRESS TRACKER (VERTICAL) ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-yellow-500" />
            <h3 className="font-black text-slate-800">Installation Journey</h3>
          </div>
          
          {project.status === "awaiting-admin-confirmation" ? (
            <div className="relative">
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[6px] rounded-xl">
                <div className="bg-red-50 text-red-700 border border-red-200 px-6 py-4 rounded-xl shadow-lg text-center max-w-sm mx-auto">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2 animate-pulse" />
                  <p className="font-bold text-sm">Waiting for Final Confirmation</p>
                  <p className="text-[10px] mt-1.5 opacity-90 leading-tight">Please wait until your BDE locks the final installation date and our Admin confirms your order. Your step-by-step journey will be visible here once confirmed.</p>
                </div>
              </div>
              <div className="opacity-20 pointer-events-none select-none">
                <ProjectJourneyTracker steps={project.steps} projectId={project._id} onRefresh={fetchProject} />
              </div>
            </div>
          ) : (
            <ProjectJourneyTracker steps={project.steps} projectId={project._id} onRefresh={fetchProject} />
          )}
        </div>

        {/* EPC Partner */}
        {project.assignedEPCName && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Your Solar Installation Partner</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center text-yellow-700 font-black text-lg border border-yellow-200">
                <Building className="w-6 h-6 text-yellow-700" />
              </div>
              <div className="flex-1">
                <p className="font-black text-slate-800">{project.assignedEPCName}</p>
                <p className="text-xs text-slate-500">Verified Installation Partner</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Shield className="w-2.5 h-2.5" />Verified
                  </span>
                  <span className="text-[10px] bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5" />Assigned
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="font-black text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-yellow-500" />Documents
          </p>

          {project.documents?.length > 0 ? (
            <div className="space-y-2 mb-4">
              {project.documents.map((doc, i) => (
                <a key={i} href={doc.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-700 capitalize">{doc.type?.replace(/_/g, " ")}</p>
                    <p className="text-[10px] text-slate-400">{fmtDate(doc.uploadedAt)}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 mb-4">Abhi koi document nahi. Neeche upload karo.</p>
          )}

          {/* Upload */}
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-yellow-300 hover:bg-yellow-50/30 transition"
            onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
              onChange={e => setUploadFile(e.target.files?.[0])} />
            {uploadFile ? (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700">📎 {uploadFile.name}</p>
                <button onClick={e => { e.stopPropagation(); handleUpload(); }} disabled={uploading}
                  className="px-6 py-2 bg-yellow-400 text-yellow-900 font-black text-xs rounded-xl hover:bg-amber-400 transition flex items-center gap-2 mx-auto">
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  {uploading ? "Uploading..." : "Upload Karo"}
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
                <p className="text-xs font-bold text-slate-500">Document Upload Karo</p>
                <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, PDF • Max 8MB</p>
              </div>
            )}
          </div>
          {uploadMsg && <p className="text-xs font-medium text-center mt-2">{uploadMsg}</p>}
        </div>
      </div>
    </div>
  );
}

// ── APPLY MODAL ───────────────────────────────────────────────────────────────
function ApplyModal({ pkg, selectedState, stateSubsidy, minBookingDays, customer, country, authFetch, customerLead, paymentSettings, onClose, onSuccess }) {
  const isAU = country === "AU" || customerLead?.country === "australia";

  const [form, setForm] = useState({
    address: customerLead?.address || customer?.address || "",
    city: customerLead?.district || customerLead?.city || customer?.city || "",
    pincode: customerLead?.postcode || customerLead?.pincode || customer?.pincode || "",
    applicantName: (customerLead?.name || customer?.fullName || "").split("\n")[0].trim(),
    customerCategory: customerLead?.solarType?.includes("commercial") ? "Commercial" : "Residential",
    preferredInstallDate: ""
  });
  const [consumerNumber, setConsumerNumber] = useState(customerLead?.consumerNumber || customerLead?.nmi || "");
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [rooftopPhoto, setRooftopPhoto] = useState(null);
  const [applyUploadFile, setApplyUploadFile] = useState(null);
  const [geo, setGeo] = useState({ lat: null, lng: null });
  const [geoError, setGeoError] = useState("");

  // For CUSTOMER_SELECT
  const [modalStep, setModalStep] = useState(1);
  const [epcSelectionMode, setEpcSelectionMode] = useState(false);
  const [availableEpcs, setAvailableEpcs] = useState([]);
  const [selectedEpc, setSelectedEpc] = useState(null);

  // Multi-step additions
  const [availableCapacities, setAvailableCapacities] = useState([]);
  const [selectedCapacity, setSelectedCapacity] = useState(null);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [fetchingEpcs, setFetchingEpcs] = useState(false);

  const calculateSTC = (kw) => {
    // Realistic STC calculation for Australia (2026 deeming period = 5 years, Zone 3 rating = 1.382, Price = $38)
    return Math.round(kw * 1.382 * 5 * 38);
  };

  useEffect(() => {
    const fetchCapacities = async () => {
      try {
        const resolvedCountry = country === "AU" ? "australia" : country === "NZ" ? "new_zealand" : "india";
        const res = await fetch(`${API}/api/project-pricing/capacities?country=${resolvedCountry}`);
        const data = await res.json();
        if (data.success) {
          const uniqueCaps = [];
          const seen = new Set();
          for (const item of data.data) {
            if (!seen.has(item.systemSizeKW)) {
              seen.add(item.systemSizeKW);
              uniqueCaps.push(item);
            }
          }
          uniqueCaps.sort((a, b) => a.systemSizeKW - b.systemSizeKW);
          setAvailableCapacities(uniqueCaps);
          if (uniqueCaps.length > 0) {
            const leadKwVal = Number(customerLead?.kw || 0);
            const matched = uniqueCaps.find(c => Number(c.systemSizeKW) === leadKwVal);
            if (matched) {
              setSelectedCapacity(matched);
            } else {
              const defaultCap = uniqueCaps.find(c => Number(c.systemSizeKW) === 6.6) || uniqueCaps[0];
              setSelectedCapacity(defaultCap);
            }
          }
        }
      } catch (err) {}
    };

    const fetchBrands = async () => {
      try {
        const resolvedCountry = country === "AU" ? "australia" : country === "NZ" ? "new_zealand" : "india";
        const pType = pkg?.projectType || "Residential";
        const res = await fetch(`${API}/api/brands?country=${resolvedCountry}&projectType=${pType}`);
        const data = await res.json();
        if (data.success) {
          setAvailableBrands(data.data);
        }
      } catch (err) {}
    };

    const fetchProductConfigs = async () => {
      try {
        const resolvedCountry = country === "AU" ? "australia" : country === "NZ" ? "new_zealand" : "india";
        const pType = pkg?.projectType || "Residential Solar";
        const res = await fetch(`${API}/api/product-configs?country=${resolvedCountry}&projectType=${pType}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const uniqueCategories = [...new Set(data.map(item => item.productCategory))];
          setProductCategories(uniqueCategories);
        }
      } catch (err) {}
    };

    if (modalStep === 1) {
      if (isAU) fetchCapacities();
    }
    if (modalStep === 2) {
      fetchBrands();
      fetchProductConfigs();
    }
    
    if (modalStep === 4 && isAU) {
      const fetchEpcs = async () => {
        setFetchingEpcs(true);
        try {
          const brandQuery = selectedBrands.map(b => b.name).join(',');
          const queryState = customer?.state || selectedState;
          const queryDistrict = customer?.district || customer?.city || '';
          
          console.log("=== DEBUG EPC FETCH ===");
          console.log("Selected Brands:", selectedBrands);
          console.log("Brand Query:", brandQuery);
          console.log("State:", queryState, "District:", queryDistrict);
          
          const resolvedProjectType = pkg?.projectType || "residential";
          const resolvedKw = selectedCapacity ? selectedCapacity.systemSizeKW : (pkg?.kw || "6.6");
          let epcUrl = `/api/customer/epcs?state=${queryState}&country=australia&brands=${brandQuery}&projectType=${resolvedProjectType}&kw=${resolvedKw}`;
          if (queryDistrict) {
            epcUrl += `&district=${queryDistrict}`;
          }
          console.log("Final URL:", epcUrl);
          
          const res = await authFetch(epcUrl);
          const data = await res.json();
          console.log("API Response:", data);
          
          if (data.success) {
             setAvailableEpcs(data.data);
          } else {
             console.error("API returned success: false");
             setAvailableEpcs([]);
          }
        } catch (err) {
          console.error("Error fetching EPCs:", err);
          setAvailableEpcs([]);
        }
        setFetchingEpcs(false);
      };
      fetchEpcs();
    }
  }, [isAU, modalStep, selectedState, country, selectedBrands, pkg?.projectType, selectedCapacity]);

  const token = localStorage.getItem("customer_token");
  const total = pkg.centralSubsidy + stateSubsidy;

  const displayKw = customerLead?.kw || pkg.kw || (isAU ? "6.6" : "3");
  const displayCost = isAU ? `$${customerLead?.billAmount ? (customerLead.billAmount * 2.5).toFixed(0) : "3,500"} AUD` : fmt(pkg.installCost);
  const displaySubsidy = isAU ? "$3,200 AUD (STC Rebate)" : fmt(total);

  const getMinDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() + (minBookingDays || 5));
    return d.toISOString().split("T")[0];
  };

  const handleCheckEligibility = () => {
    if (!consumerNumber) return setError("Consumer Number required");
    setError("");
    const dynamicSet = generateDynamicEligibility(consumerNumber.replace(/\s+/g, ""), 2500); 
    setEligibilityResult(dynamicSet);
  };

  const handleApplyUploadFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setApplyUploadFile(file);
      setGeoError("");
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setGeo({ lat, lng });

            // Reverse Geocoding
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
              const data = await res.json();
              if (data && data.address) {
                const fetchedAddress = data.display_name || "";
                const fetchedCity = data.address.city || data.address.town || data.address.village || "";
                const fetchedPincode = data.address.postcode || "";
                setForm(p => ({ ...p, address: fetchedAddress, city: fetchedCity, pincode: fetchedPincode }));
              }
            } catch (err) {
              console.error("Reverse geocoding failed", err);
            }
          },
          (err) => setGeoError("Location access denied. Please allow location to proceed.")
        );
      } else {
        setGeoError("Geolocation is not supported by your browser.");
      }
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setRooftopPhoto(file);
      setGeoError("");
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setGeo({ lat, lng });

            // Reverse Geocoding
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
              const data = await res.json();
              if (data && data.address) {
                const fetchedAddress = data.display_name || "";
                const fetchedCity = data.address.city || data.address.town || data.address.village || "";
                const fetchedPincode = data.address.postcode || "";
                setForm(p => ({ ...p, address: fetchedAddress, city: fetchedCity, pincode: fetchedPincode }));
              }
            } catch (err) {
              console.error("Reverse geocoding failed", err);
            }
          },
          (err) => setGeoError("Location access denied. Please allow location to proceed.")
        );
      } else {
        setGeoError("Geolocation is not supported by your browser.");
      }
    }
  };

  const submit = async () => {
    const activeAddress = form.address || (isAU ? (customerLead?.address || customerLead?.district || customerLead?.city || "Victoria") : "");
    const activeCity = form.city || (isAU ? (customerLead?.city || customerLead?.district || "Melbourne") : "");

    if (!activeAddress || !activeCity) return setError("Address aur city required hain");
    if (!isAU && !rooftopPhoto) return setError("Rooftop photo upload karna zaroori hai");
    if (isAU && !applyUploadFile && !customerLead?.billUrl) return setError("Utility Bill/Site Document zaroori hai");
    if (!geo.lat && (!isAU || applyUploadFile)) return setError("Location capture nahi hui. Photo upload retry karein aur location allow karein.");
    if (!form.preferredInstallDate) return setError("Install date select karein");

    setSubmitting(true);
    const fd = new FormData();
    const payload = {
        projectType: pkg.projectType || pkg.suitable?.[0]?.toLowerCase().replace(" solar","").replace(/[\s/]/g,"-").replace("+-","") || "residential",
        projectTypeLabel: pkg.name,
        systemSizeKW: isAU && selectedCapacity ? selectedCapacity.systemSizeKW : pkg.kw,
        monthlyBillAmount: 0,
        estimatedSubsidy: isAU && selectedCapacity ? selectedCapacity.estimatedSubsidy : total,
        totalProjectCost: pkg.installCost,
        state: selectedState,
        location: { address: activeAddress, city: activeCity, pincode: form.pincode || customerLead?.postcode || "", state: selectedState },
        customerMobile: customerLead?.mobile || customer?.mobile || "",
        preferredInstallDate: form.preferredInstallDate,
        latitude: geo.lat || null,
        longitude: geo.lng || null,
        selectedBrands: selectedBrands.map(b => b._id || b.id || b.name)
    };
    if (selectedEpc) {
      payload.selectedEpcId = selectedEpc._id;
      payload.selectedEpcName = selectedEpc.companyName;
    }
    
    if (isAU && !applyUploadFile && customerLead?.billUrl) {
      payload.existingBillUrl = customerLead.billUrl;
    }

    fd.append("payload", JSON.stringify(payload));
    if (applyUploadFile) {
      fd.append("rooftopPhoto", applyUploadFile);
    } else if (rooftopPhoto) {
      fd.append("rooftopPhoto", rooftopPhoto);
    }

    try {
      const res = await fetch(`${API}/api/customer/projects`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const d = await res.json();
      if (d.success) {
        if (d.requiresEpcSelection) {
          setAvailableEpcs(d.availableEpcs);
          setEpcSelectionMode(true);
          setSubmitting(false);
          return;
        }

        if (d.requiresPayment) {
          // Initialize Razorpay
          const options = {
            key: d.key_id,
            amount: d.amount * 100,
            currency: d.currency || "INR",
            name: "EmergeSun Solar",
            description: "Project Application Signup Token",
            order_id: d.razorpayOrderId,
            handler: async function (response) {
              try {
                const verifyRes = await fetch(`${API}/api/payments/verify`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    projectId: d.data._id
                  })
                });
                const verifyData = await verifyRes.json();
                if (verifyData.success) {
                  onSuccess(d.data);
                } else {
                  setError("Payment verification failed. Please contact support.");
                }
              } catch (err) {
                setError("Payment verification error.");
              }
            },
            prefill: {
              name: customer?.fullName || "",
              contact: customer?.mobile || "",
            },
            theme: { color: "#EAB308" }
          };
          const rzp1 = new window.Razorpay(options);
          rzp1.on("payment.failed", function (response) {
            setError("Payment Failed: " + response.error.description);
          });
          rzp1.open();
        } else {
          onSuccess(d.data);
        }
      } else {
        setError(d.message || "Error aayi, try again");
      }
    } catch (e) {
      setError("Network error");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:pl-64">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col">
        <div className="bg-[#28377f] rounded-t-3xl p-5 border-b border-slate-800 shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-black text-2xl text-white">{pkg.name}</h3>
              <p className="text-sm font-bold text-amber-400 mt-0.5">{displayKw} KW System</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-800 text-slate-400 rounded-xl transition"><X className="w-5 h-5" /></button>
          </div>
          <div className={`mt-5 grid ${isAU ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
            <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Project Type</p><p className="text-base font-black text-white">{pkg.suitable?.[0]?.replace(" Solar","") || "Residential"}</p></div>
            <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">KW Capacity</p><p className="text-base font-black text-white">{displayKw} KW</p></div>
            {!isAU && (
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Payment</p>
                <p className="text-base font-black text-white">{displayCost}</p>
              </div>
            )}
          </div>
          <p className="text-[10px] text-amber-400 font-bold mt-3 bg-amber-950/80 border border-amber-800/60 p-2 rounded-lg block leading-relaxed">
            {isAU 
              ? `* Note: Australian Govt STC Rebate of ${displaySubsidy} will be applied. Final EPC pricing will be shown in your dashboard after selection.`
              : `* Note: Aapko upfront ${displayCost} pay karna hoga. Subsidy of ${displaySubsidy} project complete hone ke baad seedha aapke bank account mein aayegi.`
            }
          </p>

          {/* Applicable Payment Options */}
          {paymentSettings && paymentSettings.projectConfigs && paymentSettings.projectConfigs.find(c => c.projectType.toLowerCase() === (pkg.suitable?.[0]?.replace(" Solar","").toLowerCase() || "residential"))?.options.length > 0 && (
            <div className="mt-3 bg-white/10 border border-white/20 p-3 rounded-lg">
              <p className="text-xs text-blue-100 font-bold uppercase tracking-wider mb-2">Applicable Payment Options</p>
              <div className="flex flex-wrap gap-2">
                {paymentSettings.projectConfigs.find(c => c.projectType.toLowerCase() === (pkg.suitable?.[0]?.replace(" Solar","").toLowerCase() || "residential")).options.map((opt, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-100 rounded border border-blue-500/30">
                    {opt.method} {opt.provider ? `via ${opt.provider}` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {modalStep === 1 && isAU ? (
            <div>
              <h4 className="text-sm font-black text-slate-700 mb-3 border-b border-slate-100 pb-1">Step 1: Select System Capacity</h4>
              <p className="text-xs text-slate-500 mb-4">Choose your recommended system size based on your requirements.</p>
              <div className="space-y-3">
                {availableCapacities.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400 mb-2"/> Fetching options...</p>
                ) : (
                  availableCapacities.map(cap => (
                    <div key={cap._id} onClick={() => setSelectedCapacity(cap)}
                      className={`border p-3 rounded-xl cursor-pointer transition ${selectedCapacity?._id === cap._id ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200 hover:border-yellow-200'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{cap.systemSizeKW} kW System</p>
                          <p className="text-[10px] text-slate-500">Estimated STC Rebate: ${cap.estimatedSubsidy || calculateSTC(cap.systemSizeKW)}</p>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center">
                          {selectedCapacity?._id === cap._id && <div className="w-2 h-2 bg-yellow-500 rounded-full" />}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : modalStep === 2 ? (
            <div>
              <h4 className="text-sm font-black text-slate-700 mb-3 border-b border-slate-100 pb-1">Step 2: Select Preferred Brands</h4>
              <p className="text-xs text-slate-500 mb-4">Select the Solar Panels and Inverters you prefer.</p>
              <div className="space-y-4">
                {availableBrands.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400 mb-2"/> Fetching brands...</p>
                ) : (
                  (productCategories.length > 0 ? productCategories : ['Solar Panel', 'Inverter', 'Battery']).map(type => {
                    const typeBrands = availableBrands.filter(b => b.products && b.products.includes(type));
                    if (typeBrands.length === 0) return null;
                    return (
                      <div key={type}>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{type} Brands</p>
                        <MultiSelectDropdown 
                          options={typeBrands}
                          selectedIds={selectedBrands.filter(sb => typeBrands.some(tb => tb._id === sb._id)).map(sb => sb._id)}
                          onChange={(newIds) => {
                            setSelectedBrands(prev => {
                              const filtered = prev.filter(sb => !typeBrands.some(tb => tb._id === sb._id));
                              const newSelected = typeBrands.filter(b => newIds.includes(b._id));
                              return [...filtered, ...newSelected];
                            });
                          }}
                          placeholder={`Select ${type} Brands...`}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : modalStep === 3 && isAU ? (
            <div>
                <h4 className="text-sm font-black text-slate-700 mb-3 border-b border-slate-100 pb-1">Step 3: Application Details & Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Applicant's Name *</label>
                    <input type="text" value={form.applicantName} onChange={e => setForm(p => ({ ...p, applicantName: e.target.value }))}
                      placeholder="Full Name"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400/50" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Customer Category *</label>
                    <select value={form.customerCategory} onChange={e => setForm(p => ({ ...p, customerCategory: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400/50">
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Preferred Installation Date *</label>
                  <input type="date" value={form.preferredInstallDate} min={getMinDateString()} onChange={e => setForm(p => ({ ...p, preferredInstallDate: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50" />
                </div>
                <div className="mb-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Utility Bill / Site Document (Required) *</label>
                  <div className={`border-2 border-dashed rounded-xl p-3 text-center transition ${applyUploadFile || customerLead?.billUrl ? "border-green-300 bg-green-50" : "border-slate-200 hover:border-slate-300 cursor-pointer"}`}
                    onClick={(e) => {
                      if (e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON') {
                        if (!customerLead?.billUrl || applyUploadFile) document.getElementById('apply-upload-file').click();
                      }
                    }}>
                    <input id="apply-upload-file" type="file" accept="image/*,application/pdf" className="hidden" onChange={handleApplyUploadFileChange} />
                    {applyUploadFile ? (
                      <div>
                        <p className="text-xs font-bold text-green-700">📄 {applyUploadFile.name}</p>
                        {geo.lat && <p className="text-[10px] text-green-600 font-bold mt-1">📍 Auto-fetched location ({geo.lat.toFixed(4)}, {geo.lng.toFixed(4)})</p>}
                        <p className="text-[10px] text-slate-500 mt-1 cursor-pointer underline" onClick={(e) => { e.stopPropagation(); document.getElementById('apply-upload-file').click(); }}>Click to change</p>
                      </div>
                    ) : customerLead?.billUrl ? (
                      <div className="flex flex-col items-center bg-white p-3 rounded-lg border border-green-100 shadow-sm w-full">
                        <p className="text-xs font-black text-green-700 flex items-center justify-center gap-1 mb-2">
                          <CheckCircle2 className="w-4 h-4" /> Your Uploaded Bill
                        </p>
                        {customerLead.billUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                          <img src={`${import.meta.env.VITE_API_URL || "http://localhost:4005"}${customerLead.billUrl}`} alt="Your Uploaded Bill" className="h-20 w-auto object-contain rounded-md border border-slate-200 mb-2" />
                        ) : null}
                        <div className="flex items-center justify-center gap-3 mt-1">
                          <a href={`${import.meta.env.VITE_API_URL || "http://localhost:4005"}${customerLead.billUrl}`} target="_blank" rel="noreferrer" 
                             className="text-[11px] px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-bold flex items-center gap-1 transition-all"
                             onClick={(e) => e.stopPropagation()}>
                            View
                          </a>
                          <button type="button"
                             className="text-[11px] px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md font-bold flex items-center gap-1 transition-all"
                             onClick={(e) => { e.stopPropagation(); document.getElementById('apply-upload-file').click(); }}>
                            Change
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
                        <Camera className="w-4 h-4" /> Tap to upload utility bill or site document
                      </p>
                    )}
                  </div>
                  {geoError && <p className="text-[10px] text-red-500 mt-1">{geoError}</p>}
                </div>
            </div>
          ) : (modalStep === 4 && isAU) || (modalStep === 3 && !isAU && epcSelectionMode) ? (
            <div className="flex flex-col h-full">
              <h4 className="text-sm font-black text-slate-700 mb-3 border-b border-slate-100 pb-1">Step {isAU ? 4 : 3}: Select Your Solar Installer (EPC)</h4>
              <p className="text-xs text-slate-500 mb-4">Aapke area ke mutabiq available certified installers ki list. (Filtered by your preferred brands)</p>
              <div className="space-y-3 flex-1">
                {fetchingEpcs ? (
                  <p className="text-xs text-slate-500 text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400 mb-2"/> Fetching EPCs...</p>
                ) : availableEpcs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm font-bold text-slate-700">No EPCs found</p>
                    <p className="text-xs text-slate-500 mt-1">Try selecting different brands or modifying your location.</p>
                  </div>
                ) : (
                  availableEpcs.map(epc => (
                    <div key={epc._id} onClick={() => setSelectedEpc(epc)}
                      className={`border p-3 rounded-xl cursor-pointer transition ${selectedEpc?._id === epc._id ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200 hover:border-yellow-200'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-800 text-sm">{epc.companyName}</p>
                            {epc.trustBadge?.status === 'Approved' && <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Trusted</span>}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">Contact: {epc.contactPerson}</p>
                          {epc.projectPrice ? (
                            <p className="text-xs font-black text-emerald-600 mt-1">
                              Price: {isAU ? `$${epc.projectPrice.toLocaleString()} AUD` : `₹${epc.projectPrice.toLocaleString()}`}
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-400 italic mt-1">Pricing: Contact for Quote</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-yellow-600">⭐ {epc.rating || "New"}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{epc.totalInstallations || 0} Installs</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <>
              <div>
                <h4 className="text-sm font-black text-slate-700 mb-3 border-b border-slate-100 pb-1">Application Details</h4>
            
            {/* Eligibility Check - India Only */}
            {!isAU && (
              <div className="mb-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Consumer Number *</label>
                <div className="flex gap-2">
                  <input type="text" value={consumerNumber} onChange={e => setConsumerNumber(e.target.value)}
                    placeholder="e.g. 1234567890"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400/50" />
                  <button type="button" onClick={handleCheckEligibility} className="px-5 py-2.5 bg-[#28377f] text-white rounded-xl font-bold text-xs whitespace-nowrap hover:bg-slate-800 transition">
                    Verify
                  </button>
                </div>
                {eligibilityResult && (
                  <div className="mt-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs font-bold text-green-700 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Verified: {eligibilityResult.consumerName}</p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Applicant's Name *</label>
                <input type="text" value={form.applicantName || customer?.fullName || ""} onChange={e => setForm(p => ({ ...p, applicantName: e.target.value }))}
                  placeholder="Full Name"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400/50" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Customer Category *</label>
                <select value={form.customerCategory} onChange={e => setForm(p => ({ ...p, customerCategory: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400/50">
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>
            </div>

            {!isAU && (
              <div className="mb-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Date *</label>
                <input type="date" value={form.preferredInstallDate} min={getMinDateString()} onChange={e => setForm(p => ({ ...p, preferredInstallDate: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50" />
                <p className="text-[9px] text-amber-600 mt-1 font-medium bg-amber-50 p-1.5 rounded border border-amber-100">
                  ⚠️ Note: The final installation date will be fixed by the EPC partner within 5 days of your selected date.
                </p>
              </div>
            )}

            {/* Geo-tag & Photo / Utility Bill */}
            <div className="mb-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Rooftop Photo *
              </label>
              <div className={`border-2 border-dashed rounded-xl p-3 text-center transition ${rooftopPhoto || customerLead?.billUrl ? "border-green-300 bg-green-50" : "border-slate-200 hover:border-slate-300 cursor-pointer"}`}
                onClick={(e) => {
                  if (e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON') {
                    if (!customerLead?.billUrl || rooftopPhoto) fileRef.current?.click();
                  }
                }}>
                <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handlePhotoChange} />
                {rooftopPhoto ? (
                  <div>
                    <p className="text-xs font-bold text-green-700">📎 {rooftopPhoto.name}</p>
                    {geo.lat && <p className="text-[10px] text-green-600 font-bold mt-1">📍 Auto-fetched location ({geo.lat.toFixed(4)}, {geo.lng.toFixed(4)})</p>}
                    <p className="text-[10px] text-slate-500 mt-1 cursor-pointer underline" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>Click to change</p>
                  </div>
                ) : customerLead?.billUrl ? (
                  <div className="flex flex-col items-center bg-white p-3 rounded-lg border border-green-100 shadow-sm w-full">
                    <p className="text-xs font-black text-green-700 flex items-center justify-center gap-1 mb-2">
                      <CheckCircle2 className="w-4 h-4" /> Your Uploaded Bill
                    </p>
                    {customerLead.billUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                      <img src={`${import.meta.env.VITE_API_URL || "http://localhost:4005"}${customerLead.billUrl}`} alt="Your Uploaded Bill" className="h-20 w-auto object-contain rounded-md border border-slate-200 mb-2" />
                    ) : null}
                    <div className="flex items-center justify-center gap-3 mt-1">
                      <a href={`${import.meta.env.VITE_API_URL || "http://localhost:4005"}${customerLead.billUrl}`} target="_blank" rel="noreferrer" 
                         className="text-[11px] px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-bold flex items-center gap-1 transition-all"
                         onClick={(e) => e.stopPropagation()}>
                        View
                      </a>
                      <button type="button"
                         className="text-[11px] px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md font-bold flex items-center gap-1 transition-all"
                         onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                        Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
                    <Camera className="w-4 h-4" /> Tap to upload terrace photo
                  </p>
                )}
              </div>
              {geoError && <p className="text-[10px] text-red-500 mt-1">{geoError}</p>}
            </div>
          </div>
          </>
          )}

            {error && <p className="text-xs text-red-500 font-bold mb-3 bg-red-50 p-2 rounded-lg">{error}</p>}

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3">
              <button onClick={onClose} disabled={submitting} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition w-full sm:w-auto">Cancel</button>
              <div className="w-full sm:w-auto">
                {modalStep < (isAU ? 4 : 3) ? (
                  <button onClick={() => setModalStep(s => s + 1)} 
                    disabled={
                      (modalStep === 1 && isAU && !selectedCapacity) ||
                      (modalStep === 2 && selectedBrands.length === 0) ||
                      (modalStep === 3 && isAU && ((!applyUploadFile && !customerLead?.billUrl) || !form.preferredInstallDate))
                    }
                    className="w-full py-3.5 px-8 bg-yellow-400 text-yellow-900 font-black text-sm rounded-xl hover:bg-amber-400 transition flex items-center justify-center gap-2 disabled:opacity-50">
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={submit} disabled={submitting || (isAU && !selectedEpc) || (!isAU && epcSelectionMode && !selectedEpc)}
                    className="w-full py-3.5 px-8 bg-yellow-400 text-yellow-900 font-black text-sm rounded-xl hover:bg-amber-400 transition flex items-center justify-center gap-2 disabled:opacity-50">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    {submitting ? "Processing..." : (isAU ? "Confirm & Place Order" : (epcSelectionMode ? "Confirm EPC & Pay" : "Submit Application"))}
                  </button>
                )}
                
                {modalStep > 1 && (
                  <button onClick={() => setModalStep(s => s - 1)} className="w-full mt-2 py-2 text-slate-500 text-xs font-bold hover:bg-slate-50 rounded-xl transition">
                    Go Back
                  </button>
                )}
                {isAU && modalStep === 2 && !epcSelectionMode && (
                  <button onClick={() => setModalStep(1)} className="w-full mt-2 py-2 text-slate-500 text-xs font-bold hover:bg-slate-50 rounded-xl transition">
                    Back to EPC Selection
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

// ── MAIN PORTAL ───────────────────────────────────────────────────────────────
export default function CustomerPortal({ onClose }) {
  const { customer, logout, authFetch } = useCustomerAuth();
  const [tab, setTab] = useState("home");
  const [projectView, setProjectView] = useState("list");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projLoading, setProjLoading] = useState(false);
  const [profile, setProfile] = useState({ ...customer });
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [applyData, setApplyData] = useState(null);
  const [appliedProject, setAppliedProject] = useState(null);
  const { country } = useCountry();
  const getCountryCode = () => { if (country === "AU") return "australia"; if (country === "NZ") return "new_zealand"; return "india"; };
  const [journeySettings, setJourneySettings] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [eligibilityCategories, setEligibilityCategories] = useState([]);
  const [customerLead, setCustomerLead] = useState(null);
  const [backendNotifications, setBackendNotifications] = useState([]);
  const [selectedNotifIds, setSelectedNotifIds] = useState([]);
  
  const isAU = country === "AU" || customer?.country === "australia" || customer?.country === "AU";

  // Date negotiation states
  const [installStatus, setInstallStatus] = useState('accepted');
  const [installNote, setInstallNote] = useState('');
  const [installAlternateDate, setInstallAlternateDate] = useState('');
  const [isSubmittingInstallResponse, setIsSubmittingInstallResponse] = useState(false);

  const toggleSelectNotif = (id) => {
    setSelectedNotifIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllNotifs = () => {
    const dbNotifs = backendNotifications.map(n => n._id);
    if (selectedNotifIds.length === dbNotifs.length) {
      setSelectedNotifIds([]);
    } else {
      setSelectedNotifIds(dbNotifs);
    }
  };

  const handleDeleteSelectedNotifs = async () => {
    if (selectedNotifIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedNotifIds.length} selected notifications?`)) return;
    try {
      await authFetch("/api/notifications/delete-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedNotifIds })
      });
      setSelectedNotifIds([]);
      fetchBackendNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedNotifIds.length === 0) return;
    try {
      await authFetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedNotifIds })
      });
      setSelectedNotifIds([]);
      fetchBackendNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSingleNotif = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await authFetch(`/api/notifications/${id}`, { method: "DELETE" });
      setSelectedNotifIds(prev => prev.filter(x => x !== id));
      fetchBackendNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkSingleAsRead = async (id) => {
    try {
      await authFetch(`/api/notifications/${id}/read`, { method: "PUT" });
      fetchBackendNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      const ids = backendNotifications.filter(n => !n.isRead).map(n => n._id);
      if (ids.length === 0) return;
      await authFetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids })
      });
      fetchBackendNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = backendNotifications.filter(n => !n.isRead).length;

  const fetchBackendNotifications = async () => {
    try {
      const res = await authFetch("/api/customer/notifications");
      const d = await res.json();
      if (d.success && Array.isArray(d.data)) {
        setBackendNotifications(d.data);
      }
    } catch (e) {
      console.error("fetchBackendNotifications error:", e);
    }
  };

  useEffect(() => {
    fetchBackendNotifications();
  }, [tab]);

  // Use latestLead returned by getMe (auth/me) — already has billUrl, address, kw etc.
  useEffect(() => {
    if (customer?.latestLead) {
      setCustomerLead(customer.latestLead);
    }
  }, [customer]);

  // Active Project Detail for EPC Partner / Select Installer tabs
  const [activeProjectDetail, setActiveProjectDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Installer Rating States
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [reviewCommentText, setReviewCommentText] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState("");

  const fetchActiveProjectDetail = async (id) => {
    if (!id) return;
    setLoadingDetail(true);
    try {
      const res = await authFetch(`/api/customer/projects/${id}`);
      const d = await res.json();
      if (d.success) {
        setActiveProjectDetail(d.data);
      }
    } catch (e) {
      console.error("Error fetching active project detail:", e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleRespondInstallDate = async (projectId) => {
    setIsSubmittingInstallResponse(true);
    try {
      const res = await authFetch(`/api/project-orders/${projectId}/install-date/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "customer",
          status: installStatus,
          note: installNote,
          alternateDate: installStatus === "rejected" ? installAlternateDate : null
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Installation date response sent!");
        fetchActiveProjectDetail(projectId);
      } else {
        toast.error("Failed: " + (data.message || "Unknown error"));
      }
    } catch (e) {
      console.error(e);
      toast.error("Error sending response");
    } finally {
      setIsSubmittingInstallResponse(false);
    }
  };

  const fetchJourneyAndPayment = async () => {
    try {
      const code = getCountryCode();
      const res = await fetch(`${API}/api/order-journey/${code}`);
      if(res.ok) {
        const d = await res.json();
        setJourneySettings(d);
      }
      const payRes = await fetch(`${API}/api/admin/payment-settings/payment-settings?country=${code}`);
      if(payRes.ok) {
        const p = await payRes.json();
        setPaymentSettings(p);
      }
      const eligRes = await fetch(`${API}/api/eligibility-settings`, { headers: { "country": getCountryCode() } });
      if(eligRes.ok) {
        const e = await eligRes.json();
        if (e.success && e.data?.projectCategories) setEligibilityCategories(e.data.projectCategories);
      }
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchJourneyAndPayment(); }, [country]);

  const fetchProjects = async () => {
    setProjLoading(true);
    try {
      const res = await authFetch("/api/customer/projects");
      const d = await res.json();
      if (d.success) {
        setProjects(d.data);
        if (d.data.length === 0) {
          setTab("new-project");
        } else {
          setTab("home");
        }
      }
    } catch {}
    setProjLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const saveProfile = async () => {
    setSaving(true);
    const res = await authFetch("/api/customer/auth/profile", { method: "PUT", body: JSON.stringify(profile) });
    const d = await res.json();
    setProfileMsg(d.success ? "✅ Profile saved!" : "❌ Error saving");
    setSaving(false);
    setTimeout(() => setProfileMsg(""), 3000);
  };

  const handleApply = (pkg, state, stateSubsidy, minBookingDays) => {
    const isAU = country === "AU" || customer?.country === "australia";
    const leadTypeSlug = customer?.latestLead?.solarType || "";
    const leadKw = Number(customer?.latestLead?.kw || 0);
    
    // Only block if they are trying to apply for a DIFFERENT project type
    if (leadTypeSlug && pkg.projectType !== leadTypeSlug) {
      // Find limits for the selected project type
      const elig = eligibilityCategories?.find(c => c.id === pkg.projectType || c.name?.toLowerCase() === pkg.projectType.toLowerCase());
      const cfg = journeySettings?.projectTypes?.find(c => c.projectType === pkg.projectType); // From order journey
      const minKW = elig?.minKW || 1;
      const maxKW = elig?.maxKW || cfg?.maxKwLimit || (isAU ? 20 : 10);
      
      if (leadKw > 0 && (leadKw < minKW || leadKw > maxKW)) {
        const newKw = prompt(`Your lead was submitted for ${leadKw} kW, which is not eligible for ${pkg.name || pkg.projectType}.\n\nThe allowed range for this project is ${minKW} kW to ${maxKW} kW.\n\nTo proceed, please enter a new valid kW size:`);
        if (!newKw || isNaN(newKw) || Number(newKw) < minKW || Number(newKw) > maxKW) {
          alert(`Application cancelled. You must provide a valid kW between ${minKW} and ${maxKW}.`);
          return;
        } else {
          // If valid, temporarily override customer lead kW for this session
          if (customer && customer.latestLead) {
             customer.latestLead.kw = Number(newKw);
          }
        }
      }
    }
    
    setApplyData({ pkg, state, stateSubsidy, minBookingDays });
  };

  const handleApplySuccess = (newProj) => {
    setApplyData(null);
    fetchProjects();
    if (newProj && newProj._id) {
      setSelectedProjectId(newProj._id);
      setProjectView("detail");
      setTab("projects");
    } else {
      setTab("projects");
      setProjectView("list");
    }
  };

  const active = projects.filter(p => !["completed","closed","cancelled"].includes(p.status));
  const done = projects.filter(p => ["completed","closed"].includes(p.status));

  useEffect(() => {
    const targetId = selectedProjectId || active[0]?._id;
    if (targetId) {
      fetchActiveProjectDetail(targetId);
    } else {
      setActiveProjectDetail(null);
    }
  }, [selectedProjectId, projects]);

  // Rating prompt toast interval (every 2 minutes)
  const triggerRatingToastPrompt = () => {
    const targetProject = activeProjectDetail || active[0];
    if (!targetProject) return;

    const isCompleted = ["completed", "closed", "Project Completed", "Warranty Activated", "Installation Completed"].includes(targetProject.status) || targetProject.completionPercentage >= 90;
    const hasNotRated = !targetProject.customerRating || targetProject.customerRating === 0;

    if (isCompleted && hasNotRated) {
      toast.success("Please rate your installer in the 'My Installer' tab! 🌟", {
        position: "top-right",
        autoClose: 8000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {
          backgroundColor: '#10B981',
          color: '#FFFFFF',
          fontWeight: 'bold',
          borderRadius: '12px',
          fontFamily: 'sans-serif'
        }
      });
    }
  };

  useEffect(() => {
    // Show immediate prompt after 3 seconds if conditions met
    const timer = setTimeout(() => {
      triggerRatingToastPrompt();
    }, 3000);

    const interval = setInterval(() => {
      triggerRatingToastPrompt();
    }, 120000); // 2 minutes

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [projects, activeProjectDetail]);

  const unratedCompletedProject = projects.find(p => 
    (["completed", "closed", "Project Completed", "Warranty Activated", "Installation Completed"].includes(p.status) || p.completionPercentage >= 90) && 
    (!p.customerRating || p.customerRating === 0)
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col md:flex-row">
      <ToastContainer />
      
      {/* 🌟 PERSISTENT RATING MODAL 🌟 */}
      {unratedCompletedProject && (tab !== "epc-details" || activeProjectDetail?._id !== unratedCompletedProject._id) && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden animate-fadeIn">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-amber-500"></div>
            <div className="w-16 h-16 bg-amber-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 fill-yellow-400" />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2">Rate Your Experience!</h2>
            <p className="text-sm text-slate-600 mb-6">Your solar installation for Order #{unratedCompletedProject.orderNumber} is complete. Please take a moment to rate your EPC Partner. This helps us maintain quality!</p>
            <button 
              onClick={() => {
                setTab("epc-details");
                setProjectView("detail");
                setSelectedProjectId(unratedCompletedProject._id);
              }}
              className="w-full py-3 bg-yellow-400 text-yellow-950 font-black text-sm rounded-xl hover:bg-amber-400 transition"
            >
              Rate Now
            </button>
          </div>
        </div>
      )}
      
      {/* Sidebar */}
      <div className="md:w-64 bg-[#28377f] shrink-0 flex flex-col md:h-full overflow-y-auto hide-scrollbar">
        
        {/* Brand */}
        <div className="px-4 py-4 flex items-center justify-between md:justify-center">
          <button onClick={onClose} className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition text-white/70 hover:text-white md:hidden">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img src="/logo-white.png" alt="EmergeSun" className="w-28 h-auto object-contain" />
          <div className="w-9 md:hidden"></div> {/* Spacer for centering on mobile */}
        </div>

        {/* Dynamic Sidebar Nav */}
        <div className="flex-1 py-4 md:py-6 overflow-x-auto overflow-y-hidden md:overflow-y-auto md:overflow-x-hidden px-3 sm:px-4 flex md:flex-col gap-2 sm:gap-3 hide-scrollbar">
          
          {/* Dashboard Home Tab */}
          <button onClick={() => { setTab("home"); setProjectView("list"); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all whitespace-nowrap md:whitespace-normal text-left ${tab === "home" ? "bg-yellow-400 text-yellow-950 shadow-md font-bold" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold text-sm leading-tight">Dashboard Home</p>
              <p className="text-[10px] opacity-80">Overview & Documents</p>
            </div>
          </button>

          <p className="text-[10px] font-black uppercase text-white/40 tracking-wider mb-2 mt-4 hidden md:block px-3">Active Projects</p>
          {active.length > 0 ? (
            active.map(p => (
              <button key={p._id} onClick={() => { setTab("projects"); setProjectView("detail"); setSelectedProjectId(p._id); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all whitespace-nowrap md:whitespace-normal text-left ${tab === "projects" && selectedProjectId === p._id ? "bg-yellow-400 text-yellow-900 shadow-md shadow-yellow-400/20" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
                <Sun className={`w-5 h-5 shrink-0 ${tab === "projects" && selectedProjectId === p._id ? "fill-yellow-600 text-yellow-600" : ""}`} />
                <div>
                  <p className="font-bold text-sm leading-tight">{p.projectTypeLabel || p.projectType}</p>
                  <p className="text-[10px] opacity-80">{p.orderNumber}</p>
                </div>
              </button>
            ))
          ) : (
             <p className="text-xs text-white/30 italic px-3 hidden md:block mb-4">No active projects</p>
          )}

          {done.length > 0 && (
            <>
              <p className="text-[10px] font-black uppercase text-white/40 tracking-wider mb-2 mt-4 hidden md:block px-3">Completed Projects</p>
              {done.map(p => (
                <button key={p._id} onClick={() => { setTab("projects"); setProjectView("detail"); setSelectedProjectId(p._id); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all whitespace-nowrap md:whitespace-normal text-left ${tab === "projects" && selectedProjectId === p._id ? "bg-yellow-400 text-yellow-900 shadow-md shadow-yellow-400/20" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
                  <CheckCircle2 className={`w-5 h-5 shrink-0 ${tab === "projects" && selectedProjectId === p._id ? "text-yellow-700" : "text-slate-500"}`} />
                  <div>
                    <p className="font-bold text-sm leading-tight">{p.projectTypeLabel || p.projectType}</p>
                    <p className="text-[10px] opacity-80">{p.orderNumber}</p>
                  </div>
                </button>
              ))}
            </>
          )}

          <div className="hidden md:block my-2 border-t border-white/10" />

          {/* Notifications Center Tab */}
          <button onClick={() => { setTab("notifications"); setProjectView("list"); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all whitespace-nowrap md:whitespace-normal text-left ${tab === "notifications" ? "bg-amber-400 text-yellow-950 shadow-md font-bold" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
            <div className="relative shrink-0">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[9px] font-black text-white ring-2 ring-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Notifications</p>
              <p className="text-[10px] opacity-80">Activity & Updates</p>
            </div>
          </button>

          {/* Create First Project / Start Another Project Tab */}
          <button onClick={() => { setTab("new-project"); setProjectView("list"); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all whitespace-nowrap md:whitespace-normal text-left ${tab === "new-project" ? "bg-yellow-400 text-yellow-950 shadow-md font-bold" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
            <Plus className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold text-sm leading-tight">
                {projects.length === 0 ? "Create First Project" : "Start Another Project"}
              </p>
              <p className="text-[10px] opacity-80">
                {projects.length === 0 ? "Apply for Solar" : "New Application"}
              </p>
            </div>
          </button>

          {/* Installer Tab */}
          <button onClick={() => { setTab("epc-details"); setProjectView("list"); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all whitespace-nowrap md:whitespace-normal text-left ${tab === "epc-details" ? "bg-white/20 text-white shadow-md" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
            <Building className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold text-sm leading-tight">My Installer</p>
              <p className="text-[10px] opacity-80">Solar Installer</p>
            </div>
          </button>

          <div className="md:mt-auto border-l md:border-l-0 md:border-t border-white/10 ml-2 pl-2 md:ml-0 md:pl-0 md:pt-4" />
          
          <button onClick={() => { setTab("profile"); setProjectView("list"); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all whitespace-nowrap md:whitespace-normal ${tab === "profile" ? "bg-white/20 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
            <User className="w-5 h-5 shrink-0" />
            <span className="font-bold text-sm">Profile</span>
          </button>
        </div>

        <div className="p-4 hidden md:block">
          <button onClick={() => { logout(); onClose?.(); }} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm text-slate-400 hover:bg-white/5 hover:text-white transition">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 bg-slate-50 flex flex-col h-full ${(tab === "projects" && projectView === "detail") ? "overflow-hidden" : "overflow-y-auto"}`}>
        <div className={`max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full ${(tab === "projects" && projectView === "detail") ? "h-full flex flex-col overflow-hidden pb-4" : "pb-24 md:pb-12"}`}>

          {/* ── HIGH-FIDELITY HOME DASHBOARD ── */}
          {tab === "home" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Welcome Header */}
              <div className="bg-gradient-to-br from-[#28377f] to-[#1e2a5f] rounded-3xl p-5 md:p-6 text-white shadow-xl relative overflow-hidden border border-blue-900 text-left">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-yellow-400 tracking-widest bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/20">
                      Welcome Back / Swagat Hai
                    </span>
                    <h2 className="text-xl md:text-2xl font-black">{customer?.fullName || "Solar Partner"}</h2>
                    <p className="text-xs text-blue-100">EmergeSun energy ecosystem dashboard. Track, manage and monitor your solar installation.</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl p-3 md:min-w-[240px]">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-400 flex items-center justify-center text-yellow-950 font-black text-lg">
                      {customer?.fullName?.charAt(0).toUpperCase() || "S"}
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-orange-100 font-bold uppercase tracking-wider">Registered Profile</p>
                      <p className="text-xs font-bold text-white truncate max-w-[170px]">{customer?.mobile}</p>
                      <p className="text-[10px] text-orange-100 truncate max-w-[170px]">{customer?.email || "No Email Provided"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Notification Banner / Subsidy Tips */}
              <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-start gap-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-yellow-400/20 flex items-center justify-center shrink-0 border border-yellow-500/30">
                  <Leaf className="w-5 h-5 text-yellow-600 fill-yellow-500/20" />
                </div>
                <div>
                  <p className="text-xs font-black text-amber-900">
                    {country === "AU" ? "Australian Solar Incentives" : "PM Surya Ghar Yojana (Subsidy Scheme)"}
                  </p>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-normal">
                    {country === "AU" 
                      ? "Small-scale Technology Certificates (STC) apply directly at point-of-sale to save you thousands upfront. Ensure all CEC forms are signed in the tracker." 
                      : "Central ₹78,000 + Gujarat state ₹40,000 = total ₹1,18,000 tak ki direct subsidy milti hai 3kW system par. Direct Benefit Transfer (DBT) is processed post net-metering."}
                  </p>
                </div>
              </div>

              {/* Ongoing Projects Section */}
              <div className="text-left">
                <h3 className="font-black text-slate-800 text-sm md:text-base mb-3 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-yellow-500" /> Active Solar Projects ({active.length})
                </h3>
                
                {active.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {active.map(p => {
                      const currentStep = p.steps?.find(s => s.status === 'in-progress' || s.status === 'pending') || p.steps?.[0];
                      const installDate = p.preferredInstallDate || p.scheduledInstallDate;
                      return (
                        <div key={p._id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-black text-slate-800 text-sm">{p.projectTypeLabel || p.projectType} Solar</h4>
                              <p className="text-[10px] font-mono text-slate-400 font-bold uppercase mt-0.5">{p.orderNumber}</p>
                            </div>
                            <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
                              {p.status}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500">
                              <span>Overall Progress</span>
                              <span>{p.completionPercentage || 0}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-amber-400 h-full transition-all" style={{ width: `${p.completionPercentage || 0}%` }} />
                            </div>
                          </div>

                          {/* Status and Dates */}
                          <div className="grid grid-cols-2 gap-2 text-left bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-[11px]">
                            <div>
                              <span className="text-slate-450 font-medium block">Current Step</span>
                              <span className="font-bold text-slate-700 truncate block">
                                {currentStep ? `#${currentStep.stepNumber}: ${currentStep.title}` : "—"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-450 font-medium block">Installation Date</span>
                              <span className="font-bold text-slate-700 block">
                                {installDate ? new Date(installDate).toLocaleDateString() : "To be scheduled"}
                              </span>
                            </div>
                          </div>

                          {/* Action Button to Detail */}
                          <button 
                            onClick={() => { setTab("projects"); setProjectView("detail"); setSelectedProjectId(p._id); }}
                            className="w-full py-2 bg-yellow-400 hover:bg-amber-400 text-yellow-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                          >
                            Track Installation Journey <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-sm">
                    <Sun className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-bold">No active solar projects found.</p>
                    <button 
                      onClick={() => setTab("new-project")}
                      className="mt-3 px-4 py-2 bg-yellow-400 hover:bg-amber-400 text-yellow-950 font-black text-xs rounded-xl transition shadow-sm cursor-pointer"
                    >
                      Apply For Solar Now
                    </button>
                  </div>
                )}
              </div>

              {/* Lead Recommendations Section */}
              {projects.length > 0 && (
                <div className="text-left">
                  <h3 className="font-black text-slate-800 text-sm md:text-base mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" /> Lead Recommendations (Calculated Options)
                  </h3>
                  <div className="space-y-3">
                    {projects.map(p => {
                      const isAU = p.country === "australia" || country === "AU";
                      const size = p.systemSizeKW || (isAU ? 6.6 : 3);
                      const cost = p.totalProjectCost || (isAU ? 6800 : 120000);
                      const subsidy = p.estimatedSubsidy || (isAU ? 3200 : 78000);
                      const netPayable = Math.max(0, cost - subsidy);
                      const panelsCount = Math.round(size * 1000 / 440); // 440W panels
                      const monthlyGen = Math.round(size * 120); // 120 kWh per kW per month
                      const savings = isAU ? monthlyGen * 0.30 : monthlyGen * 8; // $0.30/kWh vs ₹8/unit

                      return (
                        <div key={p._id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 text-left">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <div>
                              <span className="text-[10px] text-slate-450 font-bold uppercase">Project Link</span>
                              <h4 className="font-black text-slate-800 text-xs truncate max-w-[200px]">{p.projectTypeLabel || p.projectType} Solar ({p.orderNumber})</h4>
                            </div>
                            <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-150">
                              Calculated Options
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                              <p className="text-[9px] font-black uppercase text-slate-450">Capacity</p>
                              <p className="text-sm font-black text-slate-800 mt-0.5">{size} kW</p>
                              <p className="text-[9px] text-slate-500 font-bold mt-0.5">~{panelsCount} Panels</p>
                            </div>
                            {isAU && !p.assignedEPCName ? (
                              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-center col-span-1 sm:col-span-3 flex flex-col justify-center items-center">
                                <p className="text-[10px] font-black uppercase text-amber-600">Pending Selection</p>
                                <p className="text-xs text-amber-700 mt-0.5 font-medium leading-tight">Final cost & STC details will appear once an installer is selected.</p>
                              </div>
                            ) : (
                              <>
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                                  <p className="text-[9px] font-black uppercase text-slate-450">Total Value</p>
                                  <p className="text-sm font-black text-slate-800 mt-0.5">{isAU ? "$" : "₹"}{cost.toLocaleString()}</p>
                                  <p className="text-[9px] text-slate-500 font-bold mt-0.5">Project Cost</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                                  <p className="text-[9px] font-black uppercase text-slate-450">{isAU ? "STC Rebate" : "Govt Subsidy"}</p>
                                  <p className="text-sm font-black text-green-600 mt-0.5">-{isAU ? "$" : "₹"}{subsidy.toLocaleString()}</p>
                                  <p className="text-[9px] text-slate-500 font-bold mt-0.5 font-sans">Upfront discount</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                                  <p className="text-[9px] font-black uppercase text-slate-450">Net Cost</p>
                                  <p className="text-sm font-black text-blue-600 mt-0.5">{isAU ? "$" : "₹"}{netPayable.toLocaleString()}</p>
                                  <p className="text-[9px] text-slate-500 font-bold mt-0.5">Payable amount</p>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-800">
                            <span className="font-bold flex items-center gap-1">🌿 Estimated Environmental & Bills Savings:</span>
                            <span className="font-black text-emerald-950 bg-emerald-100 px-3 py-1 rounded-xl">
                              ~{isAU ? "$" : "₹"}{Math.round(savings).toLocaleString()} / Month
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Uploaded Documents Repository */}
              <div className="text-left">
                <h3 className="font-black text-slate-800 text-sm md:text-base mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-yellow-500" /> Dynamic Document Repository
                </h3>
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  {(() => {
                    const allDocs = [];
                    projects.forEach(p => {
                      if (p.documents && p.documents.length > 0) {
                        p.documents.forEach(d => {
                          allDocs.push({
                            name: d.type?.replace(/_/g, " ") || "Uploaded Document",
                            project: `${p.projectTypeLabel || p.projectType} (${p.orderNumber})`,
                            uploadedBy: "Customer",
                            uploadedAt: d.uploadedAt || p.updatedAt,
                            url: d.url
                          });
                        });
                      }
                      if (p.steps && p.steps.length > 0) {
                        p.steps.forEach(s => {
                          if (s.evidenceUrl) {
                            allDocs.push({
                              name: s.title || "Evidence Document",
                              project: `${p.projectTypeLabel || p.projectType} (${p.orderNumber})`,
                              uploadedBy: s.completedBy || "EPC / Customer",
                              uploadedAt: s.completedAt || p.updatedAt,
                              url: s.evidenceUrl
                            });
                          }
                        });
                      }
                    });

                    if (allDocs.length === 0) {
                      return (
                        <div className="p-6 text-center">
                          <p className="text-xs text-slate-400 italic">No document uploads captured yet. Documents will appear here once uploaded in the journey tracker.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-black uppercase text-slate-450 tracking-wider">
                              <th className="p-3">File / Document Name</th>
                              <th className="p-3">Project Link</th>
                              <th className="p-3">Uploaded By</th>
                              <th className="p-3">Upload Date</th>
                              <th className="p-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allDocs.map((doc, idx) => (
                              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="p-3 font-bold text-slate-800 capitalize flex items-center gap-1.5">
                                  <FileText className="w-4 h-4 text-slate-400" /> {doc.name}
                                </td>
                                <td className="p-3 text-slate-500 font-bold">{doc.project}</td>
                                <td className="p-3 text-slate-500 font-medium">{doc.uploadedBy}</td>
                                <td className="p-3 text-slate-400 font-bold">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                                <td className="p-3 text-right">
                                  <a 
                                    href={doc.url.startsWith("/") ? `${API}${doc.url}` : doc.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="px-2.5 py-1 bg-blue-50 text-blue-650 hover:bg-blue-100 border border-blue-200 rounded-lg text-[10px] font-black transition inline-block uppercase tracking-wider"
                                  >
                                    View / Open
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Portal Directory / Tour Section */}
              <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 text-left space-y-4">
                <div>
                  <h4 className="text-slate-800 font-black text-sm">💡 Quick Guide: Portal Tour</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5 font-bold">Need help navigating the portal? Here is where each section belongs:</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-150 space-y-1">
                    <p className="font-bold text-slate-800 text-xs flex items-center gap-1">
                      <LayoutDashboard className="w-4 h-4 text-yellow-500" /> Dashboard Home
                    </p>
                    <p className="text-[10px] text-slate-500 leading-normal font-sans">
                      Presents an overview of your active solar projects, dynamically calculated bill savings, recommendation details, and acts as your complete document locker.
                    </p>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-150 space-y-1">
                    <p className="font-bold text-slate-800 text-xs flex items-center gap-1">
                      <Sun className="w-4 h-4 text-amber-500" /> Active Projects
                    </p>
                    <p className="text-[10px] text-slate-500 leading-normal font-sans">
                      Watch your solar array build live! Click on any active project on the sidebar to interact with active steps (upload signatures, upload light bills, submit site reports).
                    </p>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-150 space-y-1">
                    <p className="font-bold text-slate-800 text-xs flex items-center gap-1">
                      <Bell className="w-4 h-4 text-blue-500" /> Notifications Center
                    </p>
                    <p className="text-[10px] text-slate-500 leading-normal font-sans">
                      A central hub for real-time status updates, grid connection approvals, payment milestones, and important alerts from the EmergeSun operations desk.
                    </p>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-150 space-y-1">
                    <p className="font-bold text-slate-800 text-xs flex items-center gap-1">
                      <Building className="w-4 h-4 text-emerald-500" /> My Installer
                    </p>
                    <p className="text-[10px] text-slate-500 leading-normal font-sans">
                      View details of your assigned Solar Accreditation Australia (SAA) certified installer. Rate and review their work once installation is complete!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS CENTER ── */}
          {tab === "notifications" && (
            <div className="space-y-6 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-black text-slate-800 text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-500" /> Notifications & Activity Log
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time status updates, payment confirmations, and admin notices</p>
                </div>
                <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
                  LIVE HUB
                </span>
              </div>

              {/* Batch Actions for Database Notifications */}
              {backendNotifications.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-550/30 border border-slate-200 rounded-2xl text-xs text-slate-700 gap-3 animate-fadeIn">
                  <button 
                    onClick={handleSelectAllNotifs}
                    className="font-bold hover:text-slate-900 flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    {selectedNotifIds.length === backendNotifications.length ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                    Select All Database Alerts
                  </button>

                  <div className="flex gap-4">
                    {selectedNotifIds.length > 0 ? (
                      <>
                        <button 
                          onClick={handleMarkSelectedAsRead}
                          className="text-blue-600 font-bold hover:underline cursor-pointer"
                        >
                          Mark Read
                        </button>
                        <button 
                          onClick={handleDeleteSelectedNotifs}
                          className="text-red-500 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedNotifIds.length})
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={markAllAsRead}
                        className="text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>
              )}

              {projects.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                  <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-200 shadow-sm">
                    <Bell className="w-7 h-7 animate-bounce" />
                  </div>
                  <h3 className="text-base font-black text-slate-800">👋 Welcome to EmergeSun Solar!</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                    Aapne abhi tak koi rooftop solar project apply nahi kiya hai. Apne pehle solar system ke liye <strong>"Create First Project"</strong> tab par click karein aur govt rebate claim karein!
                  </p>
                  <button onClick={() => { setTab("new-project"); setProjectView("list"); }}
                    className="mt-4 px-6 py-2.5 bg-yellow-400 text-yellow-950 font-black text-xs rounded-xl hover:bg-amber-400 transition inline-flex items-center gap-2 shadow-sm">
                    <Plus className="w-4 h-4" /> Go to Create First Project
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    const constructedLogs = projects.flatMap(p => {
                      const logs = [];
                      // Add project creation notification
                      logs.push({
                        id: `${p._id}-created`,
                        title: `Project Registered: ${p.projectTypeLabel || p.projectType} Solar`,
                        desc: `Order #${p.orderNumber} successfully captured. System size: ${p.systemSizeKW || 1} kW.`,
                        time: p.createdAt ? new Date(p.createdAt).toLocaleString("en-IN") : "Recent",
                        type: "success",
                        orderId: p._id,
                        orderNumber: p.orderNumber
                      });

                      // Add pending action notice if exists
                      if (p.pendingActionAlert) {
                        logs.push({
                          id: `${p._id}-action`,
                          title: p.isInstallDateFixed ? `🎉 Order #${p.orderNumber} Date Confirmed & Locked!` : `⚠️ Action Required on Order #${p.orderNumber}`,
                          desc: p.pendingActionAlert,
                          time: p.isInstallDateFixed ? "Date Locked" : "Action Pending",
                          type: p.isInstallDateFixed ? "success" : "warning",
                          orderId: p._id,
                          orderNumber: p.orderNumber
                        });
                      }

                      // Add step completion logs
                      (p.steps || []).filter(s => s.status === "completed").forEach(s => {
                        logs.push({
                          id: `${p._id}-${s.stepId || s.stepNumber}`,
                          title: `✓ Step Completed: ${s.title}`,
                          desc: `Step #${s.stepNumber} was completed by ${s.completedBy || "System"}.`,
                          time: s.completedAt ? new Date(s.completedAt).toLocaleString("en-IN") : "Completed",
                          type: "info",
                          orderId: p._id,
                          orderNumber: p.orderNumber
                        });
                      });

                      return logs;
                    });

                    const dbLogs = backendNotifications.map(n => ({
                      id: n._id,
                      title: n.title,
                      desc: n.message,
                      time: n.createdAt ? new Date(n.createdAt).toLocaleString("en-IN") : "Recent",
                      type: n.title?.includes("Confirmed") || n.title?.includes("Fixed") ? "success" : "warning",
                      orderId: n.projectId,
                      orderNumber: projects.find(p => p._id === n.projectId)?.orderNumber || "SUN-2026-9313"
                    }));

                    // Deduplicate by title & orderNumber
                    const combined = [...dbLogs, ...constructedLogs];
                    const uniqueLogs = [];
                    const seen = new Set();
                    for (const item of combined) {
                      const key = `${item.title}-${item.orderNumber}`;
                      if (!seen.has(key)) {
                        seen.add(key);
                        uniqueLogs.push(item);
                      }
                    }
                    return uniqueLogs;
                  })().map(item => {
                    const isDbNotif = backendNotifications.some(n => n._id === item.id);
                    const isSelected = selectedNotifIds.includes(item.id);
                    const dbNotifObject = isDbNotif ? backendNotifications.find(n => n._id === item.id) : null;
                    const isRead = dbNotifObject ? dbNotifObject.isRead : true;

                    return (
                      <div 
                        key={item.id}
                        onClick={() => { 
                          if (item.title?.toLowerCase().includes("installer") || item.desc?.toLowerCase().includes("installer") || item.desc?.toLowerCase().includes("bde")) {
                            setTab("select-installer");
                            if (item.orderId) {
                              setSelectedProjectId(item.orderId);
                              fetchActiveProjectDetail(item.orderId);
                            }
                          } else {
                            setProjectView("detail"); 
                            setSelectedProjectId(item.orderId); 
                            setTab("projects"); 
                          }
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md flex items-start gap-3.5 relative ${
                          item.type === "warning" ? "bg-amber-50/60 border-amber-200 hover:border-amber-400" :
                          item.type === "success" ? "bg-emerald-50/50 border-emerald-200 hover:border-emerald-400" :
                          "bg-white border-slate-200 hover:border-yellow-300"
                        } ${isDbNotif && !isRead ? "ring-2 ring-blue-500/20" : ""}`}
                      >
                        {/* Checkbox (Only for database alerts) */}
                        {isDbNotif && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectNotif(item.id);
                            }}
                            className="mt-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {isSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                          </button>
                        )}

                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                          item.type === "warning" ? "bg-amber-400 text-yellow-950" :
                          item.type === "success" ? "bg-emerald-500 text-white" :
                          "bg-blue-500 text-white"
                        }`}>
                          {item.type === "warning" ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-black text-slate-800 truncate flex items-center gap-1.5">
                              {item.title}
                              {isDbNotif && !isRead && (
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" title="New Alert" />
                              )}
                            </h4>
                            <span className="text-[10px] text-slate-400 shrink-0 font-medium">{item.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
                          <p className="text-[10px] font-bold text-yellow-600 mt-1 flex items-center gap-1 hover:underline">
                            {item.title?.toLowerCase().includes("installer") ? "Go to My Installer to Accept →" : `View Project Details #${item.orderNumber} →`}
                          </p>
                        </div>

                        {/* Deletion & Read Actions (Only for DB alerts) */}
                        {isDbNotif && (
                          <div className="flex items-center gap-1 ml-2 self-center shrink-0">
                            {!isRead && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkSingleAsRead(item.id);
                                }}
                                className="p-1.5 hover:bg-slate-100 rounded text-emerald-600 cursor-pointer"
                                title="Mark as Read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSingleNotif(item.id);
                              }}
                              className="p-1.5 hover:bg-slate-100 rounded text-red-500 cursor-pointer"
                              title="Delete Alert"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── APPLY ── */}
          {tab === "apply" && <SolarPackages onApply={handleApply} />}

          {/* ── CREATE FIRST PROJECT / START ANOTHER PROJECT ── */}
          {tab === "new-project" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-black text-slate-800 text-lg">
                  {projects.length === 0 ? "Create First Project" : "Start Another Project"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Select a project type to start a new solar journey</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {journeySettings?.projectTypes?.filter(pt => pt.enabled).map((pt) => {
                  const isComm = pt.projectType === "commercial";
                  const pkg = {
                    name: pt.projectTypeLabel || pt.projectType,
                    projectType: pt.projectType,
                    kw: isComm ? 10 : 3,
                    installCost: isComm ? 500000 : 180000,
                    centralSubsidy: isComm ? 0 : 78000,
                    suitable: [pt.projectTypeLabel || pt.projectType]
                  };
                  const isAU = country === "AU" || customer?.country === "australia";
                  const defaultState = isAU ? (customer?.state || "Victoria") : "Gujarat";
                  const defaultSubsidy = isAU ? 0 : 40000;
                  const minDays = journeySettings?.globalSettings?.minBookingDays || 5;

                  const isRecommended = customer?.latestLead?.solarType === pt.projectType;

                  return (
                    <div 
                      key={pt.projectType}
                      onClick={() => handleApply(pkg, defaultState, defaultSubsidy, minDays)}
                      className={`relative bg-white border ${isRecommended ? 'border-yellow-400 ring-4 ring-yellow-400/20 scale-[1.02]' : 'border-slate-200'} rounded-2xl p-5 hover:shadow-lg hover:border-yellow-400 cursor-pointer transition duration-300 flex flex-col justify-between gap-4 group`}
                    >
                      {isRecommended && (
                        <div className="absolute -top-3 right-4 bg-yellow-400 text-yellow-900 text-[10px] font-black px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Recommended
                        </div>
                      )}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Application</p>
                          <h3 className="font-black text-slate-800 text-lg group-hover:text-yellow-600 transition">{pt.projectTypeLabel || pt.projectType}</h3>
                          <p className="text-xs text-slate-500 mt-1">Tap to fill form and request installer details.</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition shrink-0 ${isRecommended ? 'bg-yellow-100 scale-110' : 'bg-yellow-50 group-hover:scale-110'}`}>
                          <Plus className={`w-6 h-6 ${isRecommended ? 'text-yellow-700' : 'text-yellow-600'}`} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-600 group-hover:underline">
                        Apply Now <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── SELECT INSTALLER (AUSTRALIA) ── */}
          {tab === "select-installer" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-black text-slate-800 text-lg">Select Your Installer</h2>
                <p className="text-xs text-slate-500 mt-0.5">CEC-approved installation partners recommended for your project</p>
              </div>

              {loadingDetail ? (
                <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-yellow-500" /></div>
              ) : !activeProjectDetail ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                  <Building className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                  <p className="text-sm font-bold text-slate-500">No active project found</p>
                </div>
              ) : activeProjectDetail.assignedEPCName ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Your Solar Installation Partner</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center text-yellow-700 font-black text-lg border border-yellow-200">
                      <Building className="w-6 h-6 text-yellow-700" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-slate-800">{activeProjectDetail.assignedEPCName}</h4>
                      <p className="text-xs text-slate-500">Verified Installation Partner</p>
                      
                      {activeProjectDetail.epcDetails ? (
                        <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
                          <p className="text-xs text-slate-600 flex items-center gap-2"><strong>Contact Person:</strong> {activeProjectDetail.epcDetails.contactPerson || activeProjectDetail.epcDetails.ownerName || "David Miller"}</p>
                          <p className="text-xs text-slate-600 flex items-center gap-2"><strong>Phone:</strong> {activeProjectDetail.epcDetails.contactPersonMobile || activeProjectDetail.epcDetails.mobile || activeProjectDetail.epcDetails.phone || "0412345671"}</p>
                          <p className="text-xs text-slate-600 flex items-center gap-2"><strong>Email:</strong> {activeProjectDetail.epcDetails.contactPersonEmail || activeProjectDetail.epcDetails.email || "epc@emergesun.com"}</p>
                          <p className="text-xs text-slate-600 flex items-center gap-2"><strong>Location:</strong> {activeProjectDetail.epcDetails.address || [activeProjectDetail.epcDetails.city, activeProjectDetail.epcDetails.state].filter(Boolean).join(", ") || "Sydney, NSW"}</p>
                          {activeProjectDetail.epcDetails.kycDocuments?.cecAccreditationNumber && (
                            <p className="text-xs text-blue-700 font-bold flex items-center gap-2"><strong>CEC License:</strong> {activeProjectDetail.epcDetails.kycDocuments.cecAccreditationNumber}</p>
                          )}
                        </div>
                      ) : (
                        <div className="mt-2 text-xs text-slate-400 italic">Contact details will be visible shortly.</div>
                      )}
                    </div>
                  </div>

                  {/* Rating Section (Visible when project is completed) */}
                  {(() => {
                    const isCompleted = ["completed", "closed", "Project Completed", "Warranty Activated", "Installation Completed"].includes(activeProjectDetail.status) || activeProjectDetail.completionPercentage >= 90;
                    if (!isCompleted) return null;

                    return (
                      <div className="border-t border-slate-100 pt-4 mt-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Rate Your Installation Experience</h4>
                        
                        {activeProjectDetail.customerRating > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-bold">Aapki Rating:</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`w-5 h-5 ${star <= activeProjectDetail.customerRating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}`} 
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-slate-700 ml-1">({activeProjectDetail.customerRating}.0 Stars)</span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-xs text-slate-600">Installation complete ho chuki hai! Kripya apne installer ko rate karein:</p>
                            <div className="flex items-center gap-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  onClick={() => setRatingValue(star)}
                                  onMouseEnter={() => setRatingHover(star)}
                                  onMouseLeave={() => setRatingHover(0)}
                                  className={`w-6 h-6 cursor-pointer transition ${
                                    star <= (ratingHover || ratingValue) 
                                      ? "fill-yellow-400 text-yellow-400 scale-110" 
                                      : "text-slate-300 hover:scale-105"
                                  }`} 
                                />
                              ))}
                            </div>

                            <textarea 
                              placeholder="Kaisa laga installer ka kaam? Likhein apne shabdo me (e.g. Great quality installation, fast service)..."
                              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-yellow-400 bg-white"
                              rows={2}
                              value={reviewCommentText}
                              onChange={(e) => setReviewCommentText(e.target.value)}
                            />

                            {ratingError && <p className="text-xs text-red-500 font-bold">{ratingError}</p>}

                            <button 
                              onClick={async () => {
                                if (ratingValue === 0) return setRatingError("Kripya kam se kam 1 star select karein.");
                                setSubmittingRating(true);
                                setRatingError("");
                                try {
                                  const res = await authFetch(`/api/customer/projects/${activeProjectDetail._id}/rate-epc`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ rating: ratingValue, reviewComment: reviewCommentText })
                                  });
                                  const d = await res.json();
                                  if (d.success) {
                                    alert("Thank you for your feedback! 🌟");
                                    fetchProjects();
                                    fetchActiveProjectDetail(activeProjectDetail._id);
                                  } else {
                                    setRatingError(d.message || "Rating save failed");
                                  }
                                } catch (e) {
                                  setRatingError("Failed to submit rating");
                                } finally {
                                  setSubmittingRating(false);
                                }
                              }}
                              disabled={submittingRating}
                              className="px-4 py-2 bg-yellow-400 hover:bg-amber-400 text-yellow-900 font-black text-xs rounded-xl transition flex items-center gap-2 disabled:opacity-50"
                            >
                              {submittingRating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              Submit Rating
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
                  <Clock className="w-8 h-8 text-slate-355 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm font-bold text-slate-700">Curating Best Installers...</p>
                  <p className="text-xs text-slate-500 mt-1">Your BDE is curating the best CEC-approved installers for your property. They will appear here shortly.</p>
                </div>
              )}
            </div>
          )}

          {/* ── EPC PARTNER DETAILS (INDIA) ── */}
          {tab === "epc-details" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-black text-slate-800 text-lg">Your EPC Partner</h2>
                <p className="text-xs text-slate-500 mt-0.5">Details of the certified solar installation partner assigned to you</p>
              </div>

              {loadingDetail ? (
                <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-yellow-500" /></div>
              ) : !activeProjectDetail ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                  <Building className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                  <p className="text-sm font-bold text-slate-500">No active project found</p>
                </div>
              ) : activeProjectDetail.assignedEPCName ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center text-yellow-700 font-black text-xl border border-yellow-200 shrink-0">
                      <Building className="w-7 h-7 text-yellow-700" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-lg">{activeProjectDetail.assignedEPCName}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">EmergeSun Empanelled Installation Partner</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" />Verified Partner
                        </span>
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-0.5">
                          ⭐ {activeProjectDetail.epcDetails?.rating || "New"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Contact & Office Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Contact Person</p>
                        <p className="text-sm font-bold text-slate-700 mt-0.5">{activeProjectDetail.epcDetails?.contactPerson || "Not Shared"}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Mobile Number</p>
                        <p className="text-sm font-bold text-slate-700 mt-0.5">{activeProjectDetail.epcDetails?.contactPersonMobile || "Not Shared"}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Email Address</p>
                        <p className="text-sm font-bold text-slate-700 mt-0.5">{activeProjectDetail.epcDetails?.contactPersonEmail || "Not Shared"}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Operating Location</p>
                        <p className="text-sm font-bold text-slate-700 mt-0.5">{activeProjectDetail.epcDetails?.city}, {activeProjectDetail.epcDetails?.state}</p>
                      </div>
                    </div>
                  </div>

                  {/* Installation Date Negotiation UI */}
                  {activeProjectDetail.installDateNegotiation && activeProjectDetail.installDateNegotiation.proposedDateByBde && (
                    <div className="border-t border-slate-100 pt-4 mt-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" /> Installation Date
                      </h4>

                      {activeProjectDetail.isInstallDateFixed ? (
                        /* ── Final Date Fixed ── */
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
                          <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1">✅ Date Confirmed</p>
                          <p className="text-base font-black text-green-900 leading-snug">
                            {new Date(
                              activeProjectDetail.installDateNegotiation.finalInstallationDate ||
                              activeProjectDetail.preferredInstallDate
                            ).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-[10px] text-green-600 mt-1">Your installation is scheduled. We'll see you then!</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Proposed Date Pill */}
                          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-0.5">Proposed Date</p>
                            <p className="text-sm font-black text-amber-900">
                              {new Date(activeProjectDetail.installDateNegotiation.proposedDateByBde).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>

                          {activeProjectDetail.installDateNegotiation.customerStatus !== 'pending' ? (
                            /* ── Already Responded ── */
                            <div className={`rounded-2xl p-4 border text-sm ${
                              activeProjectDetail.installDateNegotiation.customerStatus === 'accepted'
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-orange-50 border-orange-200 text-orange-800'
                            }`}>
                              <p className="font-bold text-sm mb-1">
                                {activeProjectDetail.installDateNegotiation.customerStatus === 'accepted'
                                  ? '✅ You accepted this date'
                                  : '📅 You suggested a new date'}
                              </p>
                              {activeProjectDetail.installDateNegotiation.customerNote && (
                                <p className="text-xs opacity-80 mt-1">Note: "{activeProjectDetail.installDateNegotiation.customerNote}"</p>
                              )}
                              {activeProjectDetail.installDateNegotiation.customerProposedAlternateDate && (
                                <p className="text-xs font-semibold mt-1">
                                  Alt Date: {new Date(activeProjectDetail.installDateNegotiation.customerProposedAlternateDate).toLocaleDateString()}
                                </p>
                              )}
                              <p className="text-[10px] font-bold mt-2 opacity-60">Waiting for final confirmation from your account manager.</p>
                            </div>
                          ) : (
                            /* ── Response Form ── */
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Response</p>

                              {/* Pill Radio Buttons */}
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  { val: 'accepted', label: '✅ Accept Date', active: 'bg-green-500 text-white border-green-500', inactive: 'bg-white text-slate-500 border-slate-200' },
                                  { val: 'rejected', label: '📅 New Date', active: 'bg-orange-500 text-white border-orange-500', inactive: 'bg-white text-slate-500 border-slate-200' }
                                ].map(opt => (
                                  <label key={opt.val} className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 cursor-pointer text-xs font-black transition-all active:scale-95 ${
                                    installStatus === opt.val ? opt.active : opt.inactive
                                  }`}>
                                    <input type="radio" name="customerInstallStatus" value={opt.val}
                                      checked={installStatus === opt.val}
                                      onChange={() => setInstallStatus(opt.val)}
                                      className="hidden" />
                                    {opt.label}
                                  </label>
                                ))}
                              </div>

                              {installStatus === 'rejected' && (
                                <div>
                                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Your Preferred Date</label>
                                  <input
                                    type="date"
                                    value={installAlternateDate}
                                    onChange={e => setInstallAlternateDate(e.target.value)}
                                    className="border border-slate-200 bg-white px-3 py-2.5 rounded-xl text-sm w-full focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition"
                                  />
                                </div>
                              )}

                              <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                                  Note <span className="font-normal text-slate-400">(optional)</span>
                                </label>
                                <input
                                  type="text"
                                  value={installNote}
                                  onChange={e => setInstallNote(e.target.value)}
                                  placeholder="e.g. I'm only available after 2 PM"
                                  className="border border-slate-200 bg-white px-3 py-2.5 rounded-xl text-sm w-full focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition"
                                />
                              </div>

                              <button
                                onClick={() => handleRespondInstallDate(activeProjectDetail._id)}
                                disabled={isSubmittingInstallResponse || (installStatus === 'rejected' && !installAlternateDate)}
                                className="w-full bg-amber-400 hover:bg-amber-500 active:scale-95 disabled:opacity-50 text-amber-950 font-black py-3 rounded-xl text-sm transition-all"
                              >
                                {isSubmittingInstallResponse ? (
                                  <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-amber-900 border-t-transparent rounded-full animate-spin" />
                                    Sending...
                                  </span>
                                ) : 'Send Response'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}


                  {/* Rating Section (Visible when project is completed) */}
                  {(() => {
                    const isCompleted = ["completed", "closed", "Project Completed", "Warranty Activated", "Installation Completed"].includes(activeProjectDetail.status) || activeProjectDetail.completionPercentage >= 90;
                    if (!isCompleted) return null;

                    return (
                      <div className="border-t border-slate-100 pt-4 mt-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Rate Your Installation Experience</h4>
                        
                        {activeProjectDetail.customerRating > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-bold">Aapki Rating:</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`w-5 h-5 ${star <= activeProjectDetail.customerRating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}`} 
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-slate-700 ml-1">({activeProjectDetail.customerRating}.0 Stars)</span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-xs text-slate-600">Installation complete ho chuki hai! Kripya apne installer ko rate karein:</p>
                            <div className="flex items-center gap-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  onClick={() => setRatingValue(star)}
                                  onMouseEnter={() => setRatingHover(star)}
                                  onMouseLeave={() => setRatingHover(0)}
                                  className={`w-6 h-6 cursor-pointer transition ${
                                    star <= (ratingHover || ratingValue) 
                                      ? "fill-yellow-400 text-yellow-400 scale-110" 
                                      : "text-slate-300 hover:scale-105"
                                  }`} 
                                />
                              ))}
                            </div>

                            {ratingError && <p className="text-xs text-red-500 font-bold">{ratingError}</p>}

                            <button 
                              onClick={async () => {
                                if (ratingValue === 0) return setRatingError("Kripya kam se kam 1 star select karein.");
                                setSubmittingRating(true);
                                setRatingError("");
                                try {
                                  const res = await authFetch(`/api/customer/projects/${activeProjectDetail._id}/rate-epc`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ rating: ratingValue })
                                  });
                                  const d = await res.json();
                                  if (d.success) {
                                    alert("Thank you for your feedback! 🌟");
                                    fetchProjects();
                                    fetchActiveProjectDetail(activeProjectDetail._id);
                                  } else {
                                    setRatingError(d.message || "Rating save failed");
                                  }
                                } catch (e) {
                                  setRatingError("Failed to submit rating");
                                } finally {
                                  setSubmittingRating(false);
                                }
                              }}
                              disabled={submittingRating}
                              className="px-4 py-2 bg-yellow-400 hover:bg-amber-400 text-yellow-900 font-black text-xs rounded-xl transition flex items-center gap-2 disabled:opacity-50"
                            >
                              {submittingRating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              Submit Rating
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
                  <Clock className="w-8 h-8 text-slate-350 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm font-bold text-slate-700">Assigning Partner Soon...</p>
                  <p className="text-xs text-slate-500 mt-1">Your Solar Partner is being assigned by EmergeSun. Once finalized, their contact details will appear here.</p>
                </div>
              )}
            </div>
          )}

          {/* ── PROJECTS ── */}
          {tab === "projects" && (
            <div className={`space-y-4 ${(tab === "projects" && projectView === "detail") ? "h-full flex flex-col overflow-hidden" : ""}`}>
              {projectView === "list" ? (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="font-black text-slate-800 text-lg">My Projects</h2>
                    <button onClick={() => setTab("apply")} className="flex items-center gap-1.5 text-xs font-bold text-yellow-600 px-3 py-2 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition border border-yellow-200">
                      <Plus className="w-3.5 h-3.5" />New
                    </button>
                  </div>

                  {projLoading && <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-yellow-400" /></div>}

                  {!projLoading && projects.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                        <Sun className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="font-bold text-slate-600">Koi project nahi abhi tak</p>
                      <p className="text-xs text-slate-400 mt-1">Solar system ke liye apply karo</p>
                      <button onClick={() => setTab("apply")} className="mt-4 px-6 py-2.5 bg-yellow-400 text-yellow-900 font-black text-xs rounded-xl hover:bg-amber-400 transition flex items-center gap-2 mx-auto">
                        <Plus className="w-3.5 h-3.5" />Apply Now
                      </button>
                    </div>
                  )}

                  {active.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Active ({active.length})</p>
                      {active.map(p => {
                        const isComm = p.projectType?.toLowerCase().includes("commercial") || p.projectType?.toLowerCase().includes("industrial");
                        const isAgri = p.projectType?.toLowerCase().includes("agri");
                        const isOffGrid = p.projectType?.toLowerCase().includes("off-grid") || p.projectType?.toLowerCase().includes("off grid");
                        const cardBg = isComm ? "bg-orange-50/30 border-orange-200" : isAgri ? "bg-green-50/30 border-green-200" : isOffGrid ? "bg-purple-50/30 border-purple-200" : "bg-white border-slate-200";
                        const headerCol = isComm ? "text-orange-900" : isAgri ? "text-green-900" : isOffGrid ? "text-purple-900" : "text-slate-800";
                        
                        return (
                        <div key={p._id} className={`${cardBg} border rounded-2xl p-5 cursor-pointer hover:shadow-md hover:border-yellow-300 transition-all`}
                          onClick={() => { setProjectView("detail"); setSelectedProjectId(p._id); }}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-[11px] font-bold text-slate-400">{p.orderNumber}</p>
                              <p className={`font-black ${headerCol} mt-0.5`}>{p.projectTypeLabel || p.projectType} Solar</p>
                              {p.location?.city && <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{p.location.city}</p>}
                            </div>
                            <Badge status={p.status} />
                          </div>
                          <div className="mb-3">
                            <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
                              <span>Installation Progress</span>
                              <span className="font-bold text-slate-700">{p.completionPercentage || sCfg(p.status).pct}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all" style={{ width: `${p.completionPercentage || sCfg(p.status).pct}%` }} />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { l: "System", v: p.systemSizeKW ? `${p.systemSizeKW} kW` : "—" },
                              { l: "Subsidy", v: p.estimatedSubsidy ? `₹${(p.estimatedSubsidy/1000).toFixed(0)}K` : "—" },
                              { l: "Applied", v: fmtShort(p.createdAt) },
                            ].map(s => (
                              <div key={s.l} className="bg-slate-50 rounded-xl p-2 text-center">
                                <p className="text-[9px] text-slate-400 uppercase font-bold">{s.l}</p>
                                <p className="text-xs font-black text-slate-700 mt-0.5">{s.v}</p>
                              </div>
                            ))}
                          </div>
                          {p.pendingActionAlert && p.pendingActionFor === "customer" && (
                            <div className="mt-3 flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                              <Bell className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <p className="text-[11px] text-amber-700 font-bold">{p.pendingActionAlert}</p>
                            </div>
                          )}
                          {p.assignedEPCName && (
                            <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500" />Installer Assigned</p>
                          )}
                        </div>
                      );
                      })}
                    </div>
                  )}

                  {done.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Completed ({done.length})</p>
                      {done.map(p => {
                        const isComm = p.projectType?.toLowerCase().includes("commercial") || p.projectType?.toLowerCase().includes("industrial");
                        const isAgri = p.projectType?.toLowerCase().includes("agri");
                        const isOffGrid = p.projectType?.toLowerCase().includes("off-grid") || p.projectType?.toLowerCase().includes("off grid");
                        const cardBg = isComm ? "bg-orange-50 border-orange-200" : isAgri ? "bg-green-50 border-green-200" : isOffGrid ? "bg-purple-50 border-purple-200" : "bg-white border-green-100";
                        const textColor = isComm ? "text-orange-900" : isAgri ? "text-green-900" : isOffGrid ? "text-purple-900" : "text-slate-700";
                        const subTextColor = isComm ? "text-orange-700" : isAgri ? "text-green-700" : isOffGrid ? "text-purple-700" : "text-green-600";
                        
                        return (
                          <div key={p._id} className={`${cardBg} border rounded-2xl p-4 cursor-pointer hover:shadow-sm transition-all`}
                            onClick={() => { setProjectView("detail"); setSelectedProjectId(p._id); }}>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-[11px] text-slate-400">{p.orderNumber}</p>
                                <p className={`font-bold ${textColor} text-sm`}>{p.projectTypeLabel || p.projectType} Solar</p>
                              </div>
                              <Badge status={p.status} />
                            </div>
                            <p className={`text-xs ${subTextColor} font-bold mt-2 flex items-center gap-1`}>
                              <Award className="w-3 h-3" />Subsidy: {p.estimatedSubsidy ? fmt(p.estimatedSubsidy) : "—"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <ProjectDetail projectId={selectedProjectId} onBack={() => setProjectView("list")} authFetch={authFetch} />
              )}
            </div>
          )}

          {/* ── EPC ── */}
          {tab === "epc" && <EpcDirectory />}

          {/* ── PROFILE ── */}
          {tab === "profile" && (
            <div className="space-y-4">
              <h2 className="font-black text-slate-800 text-lg">My Profile</h2>

              <div className="bg-gradient-to-br from-solar-navy to-slate-800 rounded-2xl p-5 flex items-center gap-4 text-white">
                <div className="w-14 h-14 rounded-2xl bg-yellow-400 flex items-center justify-center font-black text-2xl text-yellow-900 shrink-0">
                  {customer?.fullName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-lg">{customer?.fullName}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{isAU ? "+61" : "+91"} {customer?.mobile}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Member since {fmtDate(customer?.createdAt)}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                {[
                  { label: "Full Name", key: "fullName", icon: <User className="w-3.5 h-3.5" />, placeholder: "Aapka naam" },
                  { label: "Email", key: "email", icon: <Mail className="w-3.5 h-3.5" />, placeholder: "your@email.com", type: "email" },
                  { label: "City", key: "city", icon: <Home className="w-3.5 h-3.5" />, placeholder: "e.g. Rajkot" },
                  { label: "Pincode", key: "pincode", icon: <MapPin className="w-3.5 h-3.5" />, placeholder: "360001" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">{f.icon}{f.label}</label>
                    <input type={f.type || "text"} value={profile[f.key] || ""} onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <MapPin className="w-3.5 h-3.5" />Address
                  </label>
                  <textarea rows={2} value={profile.address || ""} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))}
                    placeholder="Full installation address"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 resize-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5"><Phone className="w-3.5 h-3.5" />Mobile (Read Only)</label>
                  <input value={`${isAU ? "+61" : "+91"} ${customer?.mobile}`} readOnly className="w-full border border-slate-100 rounded-xl px-4 py-2.5 text-sm bg-slate-50 text-slate-400 cursor-not-allowed" />
                </div>
              </div>

              {profileMsg && <p className={`text-sm font-bold text-center ${profileMsg.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>{profileMsg}</p>}

              <button onClick={saveProfile} disabled={saving}
                className="w-full py-3.5 bg-yellow-400 text-yellow-900 font-black text-sm rounded-2xl hover:bg-amber-400 transition flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Profile"}
              </button>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5">
                {[
                  { l: "Mobile Verified", v: <span className="text-green-600 font-bold flex items-center gap-1"><CheckCheck className="w-3 h-3" />Yes</span> },
                  { l: "Total Projects", v: <span className="font-bold">{projects.length}</span> },
                  { l: "Active Projects", v: <span className="font-bold text-blue-600">{active.length}</span> },
                  { l: "Total Subsidy Earned", v: <span className="font-bold text-green-600">{fmt(projects.reduce((acc, p) => acc + (p.estimatedSubsidy || 0), 0))}</span> },
                ].map(row => (
                  <div key={row.l} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{row.l}</span>
                    {row.v}
                  </div>
                ))}
              </div>

              {/* My Applications / Project Form Details Section */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-yellow-500" />
                  My Project Applications (Submitted Forms)
                </h3>

                {projects.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No submitted applications found.</p>
                ) : (
                  <div className="space-y-4">
                    {projects.map((proj) => (
                      <ProjectFormEditor 
                        key={proj._id} 
                        proj={proj} 
                        authFetch={authFetch}
                        fetchProjects={fetchProjects}
                      />
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => { logout(); onClose?.(); }}
                className="w-full py-3 bg-red-50 text-red-600 font-black text-sm rounded-2xl border border-red-200 hover:bg-red-100 transition flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" />Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {applyData && (
        <ApplyModal
          pkg={applyData.pkg}
          selectedState={applyData.state}
          stateSubsidy={applyData.stateSubsidy}
          minBookingDays={applyData.minBookingDays}
          customer={customer}
          country={country}
          authFetch={authFetch}
          customerLead={customerLead}
          onClose={() => setApplyData(null)}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
}

// ── PROJECT FORM EDITOR SUB-COMPONENT ──────────────────────────────────────────
function ProjectFormEditor({ proj, authFetch, fetchProjects }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    address: proj.location?.address || "",
    city: proj.location?.city || "",
    pincode: proj.location?.pincode || "",
    preferredInstallDate: proj.preferredInstallDate ? proj.preferredInstallDate.split("T")[0] : ""
  });
  const [rooftopPhoto, setRooftopPhoto] = useState(null);
  const [geo, setGeo] = useState({ lat: proj.latitude || null, lng: proj.longitude || null });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef();

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setRooftopPhoto(file);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setGeo({ lat, lng });

            // Reverse Geocoding
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
              const data = await res.json();
              if (data && data.address) {
                const fetchedAddress = data.display_name || "";
                const fetchedCity = data.address.city || data.address.town || data.address.village || "";
                const fetchedPincode = data.address.postcode || "";
                setForm(p => ({ ...p, address: fetchedAddress, city: fetchedCity, pincode: fetchedPincode }));
              }
            } catch (err) {
              console.error("Reverse geocoding failed", err);
            }
          },
          (err) => console.error("Location access denied")
        );
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("address", form.address);
      fd.append("city", form.city);
      fd.append("pincode", form.pincode);
      fd.append("preferredInstallDate", form.preferredInstallDate);
      if (geo.lat) fd.append("latitude", geo.lat);
      if (geo.lng) fd.append("longitude", geo.lng);
      if (rooftopPhoto) {
        fd.append("rooftopPhoto", rooftopPhoto);
      }

      const token = localStorage.getItem("customer_token");
      const res = await fetch(`${API}/api/customer/projects/${proj._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const d = await res.json();
      if (d.success) {
        setMsg("✅ Application updated successfully!");
        setTimeout(() => {
          setEditing(false);
          setMsg("");
        }, 1500);
        fetchProjects();
      } else {
        setMsg(`❌ ${d.message || "Failed to save"}`);
      }
    } catch (e) {
      setMsg("❌ Network error saving changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 space-y-3 text-left">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-xs font-black text-slate-700">{proj.projectTypeLabel || proj.projectType} Solar</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{proj.orderNumber}</p>
        </div>
        <button 
          onClick={() => { setEditing(!editing); setMsg(""); }}
          className="text-[10px] font-black uppercase text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition"
        >
          {editing ? "Cancel" : "Edit Details"}
        </button>
      </div>

      {!editing ? (
        <div className="space-y-2 text-xs text-slate-650">
          <p><strong>Address:</strong> {proj.location?.address || "—"}</p>
          <p><strong>City:</strong> {proj.location?.city || "—"} ({proj.location?.pincode || "—"})</p>
          <p><strong>Preferred Install Date:</strong> {proj.preferredInstallDate ? new Date(proj.preferredInstallDate).toLocaleDateString("en-IN") : "—"}</p>
          {proj.rooftopPhoto && (
            <div className="mt-2">
              <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rooftop Photo:</span>
              <img 
                src={`${API}${proj.rooftopPhoto}`} 
                alt="Rooftop" 
                className="w-24 h-16 object-cover rounded-lg border border-slate-200 hover:scale-105 transition cursor-pointer"
                onClick={() => window.open(`${API}${proj.rooftopPhoto}`, "_blank")}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1">Address</label>
            <textarea 
              rows={2}
              value={form.address}
              onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400 resize-none bg-white text-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1">City</label>
              <input 
                type="text"
                value={form.city}
                onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400 bg-white text-slate-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1">Pincode</label>
              <input 
                type="text"
                value={form.pincode}
                onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400 bg-white text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1">Preferred Install Date</label>
            <input 
              type="date"
              value={form.preferredInstallDate}
              onChange={e => setForm(p => ({ ...p, preferredInstallDate: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400 bg-white text-slate-700"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1">Rooftop Photo</label>
            <input 
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={handlePhotoChange}
              className="hidden"
            />
            <div 
              onClick={() => fileRef.current?.click()}
              className="border border-dashed border-slate-300 rounded-xl p-3 text-center cursor-pointer hover:bg-slate-100/50 transition bg-white"
            >
              {rooftopPhoto ? (
                <span className="text-xs font-bold text-slate-600">📎 {rooftopPhoto.name}</span>
              ) : (
                <span className="text-xs text-slate-400">Change Photo (Geotags automatically capture)</span>
              )}
            </div>
          </div>

          {msg && <p className={`text-xs font-bold ${msg.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>{msg}</p>}

          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2 bg-yellow-400 text-yellow-900 font-black text-xs rounded-xl hover:bg-amber-400 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}