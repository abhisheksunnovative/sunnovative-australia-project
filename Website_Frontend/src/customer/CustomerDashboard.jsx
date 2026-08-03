/**
 * CustomerDashboard.jsx
 * Customer portal — project tracking, profile, documents
 */
import React, { useState, useEffect } from "react";
import {
  Sun, User, FolderOpen, LogOut, ChevronRight, MapPin,
  Clock, CheckCircle, AlertCircle, Upload, ArrowLeft,
  Phone, Mail, Home, Loader2, FileText,
} from "lucide-react";
import { useCustomerAuth } from "./CustomerAuthContext";

const STATUS_CONFIG = {
  "Lead":        { color: "bg-slate-100 text-slate-600",  icon: <Clock className="w-3.5 h-3.5" /> },
  "Qualified":   { color: "bg-blue-100 text-blue-700",    icon: <CheckCircle className="w-3.5 h-3.5" /> },
  "Site Survey": { color: "bg-yellow-100 text-yellow-700",icon: <MapPin className="w-3.5 h-3.5" /> },
  "Approved":    { color: "bg-green-100 text-green-700",  icon: <CheckCircle className="w-3.5 h-3.5" /> },
  "Installed":   { color: "bg-emerald-100 text-emerald-700",icon: <CheckCircle className="w-3.5 h-3.5 fill-current" /> },
  "Completed":   { color: "bg-purple-100 text-purple-700",icon: <CheckCircle className="w-3.5 h-3.5 fill-current" /> },
};

const statusCfg = (s) => STATUS_CONFIG[s] || { color: "bg-slate-100 text-slate-500", icon: <AlertCircle className="w-3.5 h-3.5" /> };

export default function CustomerDashboard({ onClose }) {
  const { customer, logout, authFetch } = useCustomerAuth();
  const [view, setView]       = useState("home"); // home | projects | project-detail | profile
  const [projects, setProjects] = useState([]);
  const [selProject, setSelProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ ...customer });
  const [saving, setSaving]   = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [completingStep, setCompletingStep] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    const res = await authFetch("/api/customer/projects");
    const d = await res.json();
    if (d.success) setProjects(d.data);
    setLoading(false);
  };

  useEffect(() => { if (view === "projects") fetchProjects(); }, [view]);

  const fetchProject = async (id) => {
    setLoading(true);
    const res = await authFetch(`/api/customer/projects/${id}`);
    const d = await res.json();
    if (d.success) { setSelProject(d.data); setView("project-detail"); }
    setLoading(false);
  };

  const handleCompleteStep = async (stepId, file = null, note = "") => {
    if (!selProject) return;
    setCompletingStep(stepId);
    try {
      let body;
      let headers = {};

      if (file) {
        body = new FormData();
        body.append("stepId", stepId);
        body.append("completedBy", profile?.fullName || "Customer");
        body.append("note", note);
        body.append("evidence", file);
      } else {
        headers = { "Content-Type": "application/json" };
        body = JSON.stringify({ stepId, completedBy: profile?.fullName || "Customer", note });
      }

      const res = await authFetch(`/api/customer/projects/${selProject._id}/complete-step`, {
        method: "POST",
        headers,
        body
      });
      const data = await res.json();
      if (data.success) {
        // Refresh project data
        await fetchProject(selProject._id);
      } else {
        alert(data.message || "Failed to complete step");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setCompletingStep(null);
    }
  };

  const handleSignStc = async () => {
    if (!selProject) return;
    if (!window.confirm("I hereby assign my right to create STCs to the agent/installer for this solar project. Sign STC Assignment Form?")) return;
    
    setLoading(true);
    try {
      const res = await authFetch(`/api/customer/projects/${selProject._id}/sign-stc`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert("STC Assignment Form signed successfully! ✅");
        fetchProject(selProject._id);
      } else {
        alert(data.message || "Failed to sign STC form");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    const res = await authFetch("/api/customer/auth/profile", {
      method: "PUT", body: JSON.stringify(profile),
    });
    const d = await res.json();
    setProfileMsg(d.success ? "Profile saved! ✅" : "Error saving profile");
    setSaving(false);
    setTimeout(() => setProfileMsg(""), 3000);
  };

  const handleLogout = () => { logout(); onClose?.(); };

  // ── Journey Progress Bar ────────────────────────────────────────────────────
  const StepItemCustomer = ({ step, index, onCompleteStep, completingStep }) => {
    const [file, setFile] = useState(null);
    const [note, setNote] = useState("");
    
    return (
      <div className={`flex items-start gap-3 p-3 rounded-xl ${step.status === "completed" ? "bg-green-50 border border-green-100" : step.status === "in-progress" ? "bg-yellow-50 border border-yellow-200" : "bg-slate-50 border border-slate-100"}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step.status === "completed" ? "bg-green-500 text-white" : step.status === "in-progress" ? "bg-yellow-400 text-yellow-900" : "bg-slate-200 text-slate-400"}`}>
          {step.status === "completed" ? "✓" : index + 1}
        </div>
        <div className="flex-1">
          <p className={`text-xs font-bold ${step.status === "pending" ? "text-slate-400" : "text-slate-700"}`}>{step.title}</p>
          {step.completedAt && (
            <div className="mt-1 bg-slate-50 p-2 rounded border border-slate-100">
              <p className="text-[10px] text-green-600 font-medium">Completed on {new Date(step.completedAt).toLocaleString("en-IN")} {step.completedBy ? `by ${step.completedBy}` : ""}</p>
              {step.evidenceNote && <p className="text-[10px] text-slate-500 mt-1"><span className="font-semibold">Note:</span> {step.evidenceNote}</p>}
              {step.evidenceUrl && <a href={step.evidenceUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline mt-1 inline-block">📄 View Document</a>}
            </div>
          )}
          
          {step.status === "in-progress" && step.assignedTo === "customer" && (
            <div className="mt-3 bg-white p-3 rounded-lg border border-slate-200 space-y-3">
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
                onClick={() => onCompleteStep && onCompleteStep(step.stepId, file, note)}
                disabled={completingStep === step.stepId}
                className="w-full sm:w-auto px-4 py-2 bg-solar-gold hover:bg-yellow-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center"
              >
                {completingStep === step.stepId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Complete Action"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const JourneyBar = ({ steps, currentStep, onCompleteStep, completingStep }) => {
    if (!steps?.length) return null;
    return (
      <div className="space-y-2">
        {steps.map((step, i) => (
          <StepItemCustomer 
            key={i} 
            step={step} 
            index={i} 
            onCompleteStep={onCompleteStep} 
            completingStep={completingStep} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-solar-navy to-slate-800 p-5 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {view !== "home" && (
                <button onClick={() => setView("home")} className="p-1.5 hover:bg-white/10 rounded-full transition">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="w-9 h-9 rounded-xl bg-solar-yellow flex items-center justify-center">
                <Sun className="w-5 h-5 text-slate-900 fill-amber-300" />
              </div>
              <div>
                <p className="font-bold text-sm">{customer?.fullName}</p>
                <p className="text-xs text-slate-300">+91 {customer?.mobile}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-xl transition" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition text-xl leading-none font-bold">×</button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5">
          {/* HOME */}
          {view === "home" && (
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4">
                <p className="text-xs text-slate-500 font-medium">Welcome back 👋</p>
                <p className="font-bold text-slate-800 mt-0.5">{customer?.fullName}</p>
                <p className="text-xs text-slate-500">{customer?.city || customer?.state || "Gujarat"}</p>
              </div>

              {[
                { id: "projects", icon: <FolderOpen className="w-5 h-5 text-blue-500" />, label: "My Projects", desc: "Solar orders track karo", color: "bg-blue-50 border-blue-100" },
                { id: "profile",  icon: <User className="w-5 h-5 text-green-500" />,      label: "My Profile",  desc: "Details update karo",   color: "bg-green-50 border-green-100" },
              ].map(item => (
                <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center gap-4 p-4 rounded-2xl border ${item.color} hover:shadow-sm transition text-left`}>
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-white/80">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              ))}
            </div>
          )}

          {/* PROJECTS */}
          {view === "projects" && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm">My Solar Projects</h3>
              {loading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-yellow-400" /></div>}
              {!loading && projects.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                  <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">Koi project nahi abhi tak</p>
                  <p className="text-xs mt-1">Solar ke liye apply karo home page se</p>
                </div>
              )}
              {projects.map(p => {
                const cfg = statusCfg(p.status);
                return (
                  <button key={p._id} onClick={() => fetchProject(p._id)} className="w-full text-left bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-sm transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{p.projectType || "Solar Project"}</p>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{p.address || "Address not set"}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${cfg.color}`}>
                        {cfg.icon}{p.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      {p.kw && <span>⚡ {p.kw} kW</span>}
                      {p.subsidyAmount && <span>💰 ₹{p.subsidyAmount?.toLocaleString("en-IN")} subsidy</span>}
                      <span>{new Date(p.createdAt).toLocaleDateString("en-IN")}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* PROJECT DETAIL */}
          {view === "project-detail" && selProject && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800">{selProject.projectType || "Solar Project"}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{selProject.address}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusCfg(selProject.status).color}`}>
                    {selProject.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "KW", value: selProject.kw ? `${selProject.kw} kW` : "—" },
                    { label: "Cost", value: selProject.estimatedCost ? `₹${(selProject.estimatedCost/1000).toFixed(0)}K` : "—" },
                    { label: "Subsidy", value: selProject.subsidyAmount ? `₹${(selProject.subsidyAmount/1000).toFixed(0)}K` : "—" },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl p-2 border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">{s.label}</p>
                      <p className="text-sm font-black text-slate-700 mt-0.5">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* STC Tracking Section for Australian Projects */}
              {selProject.stcDetails?.stcs > 0 && (
                <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-blue-900 text-sm">STC Rebate Tracking</h4>
                  </div>
                  
                  <div className="space-y-2 text-xs text-slate-600 mb-4 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                    <div className="flex justify-between"><span>Calculated STCs:</span> <span className="font-bold">{selProject.stcDetails.stcs}</span></div>
                    <div className="flex justify-between"><span>Discount Applied:</span> <span className="font-bold text-green-700">${selProject.stcDetails.stcRebateAmount}</span></div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">1. STC Assignment Form</span>
                      {selProject.stcStatus?.assignmentFormSigned ? (
                        <span className="text-[10px] font-bold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
                          <CheckCircle className="w-3 h-3"/> Signed
                        </span>
                      ) : (
                        <button 
                          onClick={handleSignStc}
                          disabled={loading}
                          className="text-[10px] bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
                        >
                          Sign Form Digitally
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">2. STC Registration</span>
                      {selProject.stcStatus?.stcsCreatedInRegistry ? (
                        <span className="text-[10px] font-bold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
                          <CheckCircle className="w-3 h-3"/> Complete
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                          Pending Installer
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Journey Steps */}
              {selProject.steps?.filter(s => s.visibleToCustomer !== false).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project Journey</h4>
                  <JourneyBar 
                      steps={selProject.steps.filter(s => s.visibleToCustomer !== false)} 
                      currentStep={selProject.currentStepNumber}
                      onCompleteStep={handleCompleteStep}
                      completingStep={completingStep}
                    />
                </div>
              )}

              {/* Documents */}
              {selProject.documents?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Documents</h4>
                  <div className="space-y-2">
                    {selProject.documents.map((doc, i) => (
                      <a key={i} href={doc.url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-medium text-slate-700">{doc.type}</span>
                        <span className="ml-auto text-[10px] text-slate-400">{new Date(doc.uploadedAt).toLocaleDateString("en-IN")}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PROFILE */}
          {view === "profile" && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">My Profile</h3>
              {[
                { label: "Full Name", key: "fullName", icon: <User className="w-3.5 h-3.5" />, placeholder: "Your name" },
                { label: "Email", key: "email", icon: <Mail className="w-3.5 h-3.5" />, placeholder: "your@email.com" },
                { label: "City", key: "city", icon: <Home className="w-3.5 h-3.5" />, placeholder: "e.g. Rajkot" },
                { label: "Pincode", key: "pincode", icon: <MapPin className="w-3.5 h-3.5" />, placeholder: "360001" },
                { label: "Address", key: "address", icon: <MapPin className="w-3.5 h-3.5" />, placeholder: "Full address" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">{f.icon}{f.label}</label>
                  <input
                    type="text"
                    value={profile[f.key] || ""}
                    onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1"><Phone className="w-3.5 h-3.5" />Mobile (readonly)</label>
                <input value={`+91 ${customer?.mobile}`} readOnly className="w-full border border-slate-100 rounded-xl px-4 py-2.5 text-sm bg-slate-50 text-slate-400" />
              </div>
              {profileMsg && <p className="text-xs text-green-600 font-medium">{profileMsg}</p>}
              <button onClick={saveProfile} disabled={saving} className="w-full flex items-center justify-center gap-2 py-3 bg-solar-yellow text-slate-900 font-bold text-sm rounded-xl hover:bg-amber-400 transition disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}