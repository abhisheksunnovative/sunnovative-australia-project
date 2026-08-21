import React, { useState, useEffect } from "react";
import {
  Globe, ChevronRight, FileText, CheckCircle2,
  Building2, MapPin, X, Save, Plus, Trash2, ArrowLeft,
  Users, Briefcase, ClipboardList, AlertCircle, Settings,
  Clock, ExternalLink, ThumbsUp, ThumbsDown
} from "lucide-react";
import { useGeography } from "../hooks/useGeography";
import { useAdminSettings } from "../hooks/useAdminSettings";
import DocViewerModal from "./shared/DocViewerModal";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

const DEFAULT_REQUIRED_DOCS = [
  { id: "Aadhar Card",            required: true  },
  { id: "PAN Card",               required: true  },
  { id: "Bank Passbook / Cheque", required: true  },
  { id: "Passport Photo",         required: true  },
  { id: "Freelancer Agreement",   required: false },
  { id: "GST Certificate",        required: false },
];

// ─── Document Settings Panel ─────────────────────────────────────────────────
function OnboardingSettingsPanel({ countryCode, countryName, onClose }) {
  const [docs, setDocs] = useState(DEFAULT_REQUIRED_DOCS);
  const [newDocLabel, setNewDocLabel] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`bde_onboarding_docs_${countryCode}`);
    if (stored) setDocs(JSON.parse(stored));
  }, [countryCode]);

  const saveSettings = () => {
    localStorage.setItem(`bde_onboarding_docs_${countryCode}`, JSON.stringify(docs));
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };
  const toggleRequired = (id) => setDocs(docs.map(d => d.id === id ? { ...d, required: !d.required } : d));
  const removeDoc = (id) => setDocs(docs.filter(d => d.id !== id));
  const addDoc = () => {
    if (!newDocLabel.trim()) return;
    setDocs([...docs, { id: newDocLabel.trim(), required: false }]);
    setNewDocLabel("");
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-slate-800">Document Settings</h3>
            <p className="text-sm text-slate-500 mt-0.5">{countryName} — Required documents for all BDEs</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400"/>
                <span className="font-semibold text-slate-700 text-sm">{doc.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleRequired(doc.id)} className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${doc.required ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                  {doc.required ? "Required" : "Optional"}
                </button>
                <button onClick={() => removeDoc(doc.id)} className="text-rose-400 hover:text-rose-600"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-5 border-t border-slate-100 space-y-3">
          <div className="flex gap-2">
            <input type="text" placeholder="Add new document type..." value={newDocLabel}
              onChange={e => setNewDocLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && addDoc()}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40"/>
            <button onClick={addDoc} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition"><Plus className="w-4 h-4"/></button>
          </div>
          <button onClick={saveSettings} className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${saved ? "bg-emerald-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
            {saved ? <><CheckCircle2 className="w-4 h-4"/> Saved!</> : <><Save className="w-4 h-4"/> Save Settings</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BDE Document Card (Admin View with Approve) ─────────────────────────────
function BDEOnboardingCard({ bde, requiredDocs, onApproved }) {
  const [localDocs, setLocalDocs] = useState(bde.onboardingDocs || []);
  const [approving, setApproving] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);

  const getDoc = (docName) => localDocs.find(d => d.docName === docName);

  const handleApprove = async (docName, approved) => {
    setApproving(docName);
    try {
      const encodedDocName = encodeURIComponent(docName);
      const res = await fetch(`${API_BASE}/api/bde/${bde._id}/onboarding-docs/${encodedDocName}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved })
      });
      const data = await res.json();
      if (data.success) {
        setLocalDocs(data.onboardingDocs);
        onApproved && onApproved();
      }
    } catch (e) { console.error(e); }
    setApproving(null);
  };

  const uploadedCount = requiredDocs.filter(d => getDoc(d.id)).length;
  const approvedCount = requiredDocs.filter(d => getDoc(d.id)?.verified).length;
  const isFullyApproved = approvedCount === requiredDocs.length && requiredDocs.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${(bde.bdeType || '').toLowerCase() === "freelancer" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
            {(bde.name || "?")[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800">{bde.name}</h3>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${(bde.bdeType || '').toLowerCase() === "freelancer" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                {bde.bdeType || "Employee"}
              </span>
            </div>
            <p className="text-xs text-slate-400">{bde.email} • {bde.mobile}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-xs font-black uppercase px-3 py-1 rounded-full ${isFullyApproved ? "bg-emerald-100 text-emerald-700" : uploadedCount > 0 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"}`}>
            {isFullyApproved ? "✓ All Approved" : `${uploadedCount}/${requiredDocs.length} Uploaded`}
          </div>
          {!isFullyApproved && uploadedCount > 0 && (
            <p className="text-[10px] text-slate-400 mt-0.5">{approvedCount}/{uploadedCount} approved</p>
          )}
        </div>
      </div>

      {/* Doc List */}
      <div className="p-4 space-y-2.5">
        {requiredDocs.map(doc => {
          const uploaded = getDoc(doc.id);
          const isApproving = approving === doc.id;

          return (
            <div key={doc.id} className={`p-3 rounded-xl border transition-all ${uploaded?.verified ? 'bg-emerald-50 border-emerald-200' : uploaded ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-dashed border-slate-200'}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {uploaded?.verified
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0"/>
                    : uploaded
                    ? <Clock className="w-4 h-4 text-blue-400 shrink-0"/>
                    : <AlertCircle className="w-4 h-4 text-slate-300 shrink-0"/>}
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-slate-700">{doc.id}</span>
                    {doc.required && <span className="ml-1 text-[9px] text-red-500 font-bold uppercase">Required</span>}
                    {uploaded && <p className="text-[10px] text-slate-400 truncate">{uploaded.fileUrl?.split('/').pop()}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {uploaded?.fileUrl && (
                    <button onClick={() => setViewingDoc(uploaded)}
                      className="p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-lg transition text-xs font-bold flex items-center gap-1">
                      <ExternalLink className="w-3.5 h-3.5"/> View
                    </button>
                  )}
                  {uploaded && !uploaded.verified && (
                    <button onClick={() => handleApprove(doc.id, true)} disabled={isApproving}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition disabled:opacity-50">
                      <ThumbsUp className="w-3.5 h-3.5"/> {isApproving ? '...' : 'Approve'}
                    </button>
                  )}
                  {uploaded?.verified && (
                    <button onClick={() => handleApprove(doc.id, false)} disabled={isApproving}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition disabled:opacity-50">
                      <ThumbsDown className="w-3.5 h-3.5"/> {isApproving ? '...' : 'Revoke'}
                    </button>
                  )}
                  {!uploaded && <span className="text-xs text-slate-300 italic">Not uploaded</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {viewingDoc && <DocViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />}
    </div>
  );
}

// ─── Main BDE Onboarding Screen ───────────────────────────────────────────────
export default function BDEOnboardingScreen() {
  const [countries, setCountries] = useState([]);
  const [allBDEs, setAllBDEs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedProjectType, setSelectedProjectType] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const { projectTypes } = useAdminSettings(selectedCountry?.code || null);
  const { states } = useGeography(selectedCountry?.code || null, null);
  const { districts } = useGeography(selectedCountry?.code || null, selectedState);

  const [docs, setDocs] = useState(DEFAULT_REQUIRED_DOCS);
  useEffect(() => {
    if (!selectedCountry) return;
    const stored = localStorage.getItem(`bde_onboarding_docs_${selectedCountry.code}`);
    setDocs(stored ? JSON.parse(stored) : DEFAULT_REQUIRED_DOCS);
  }, [selectedCountry, settingsOpen]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, bRes] = await Promise.all([
          fetch(`${API_BASE}/api/countries`).then(r => r.json()),
          fetch(`${API_BASE}/api/bde`).then(r => r.json()),
        ]);
        if (cRes.success) setCountries(cRes.data?.filter(c => c.isActive) || []);
        else if (Array.isArray(cRes)) setCountries(cRes.filter(c => c.isActive));
        const bdeList = bRes.bdes || bRes.data || (Array.isArray(bRes) ? bRes : []);
        setAllBDEs(bdeList);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchData();
  }, [refresh]);

  const refreshData = () => setRefresh(r => r + 1);

  const scopedBDEs = allBDEs.filter(bde => {
    const bdeCountries = (bde.assignedCountries || []).map(c => c.toLowerCase());
    if (selectedCountry && !bdeCountries.includes(selectedCountry.code.toLowerCase()) && (bde.country || '').toLowerCase() !== selectedCountry.code.toLowerCase()) return false;
    if (selectedDistrict) {
      const bdeDists = (bde.assignedDistricts || []).map(d => d.toLowerCase());
      return bdeDists.includes(selectedDistrict.toLowerCase());
    }
    return true;
  });

  // BDE count helpers for each drill-down level
  const countryBDEs = (countryCode) =>
    allBDEs.filter(b => (b.assignedCountries || []).map(x => x.toLowerCase()).includes(countryCode?.toLowerCase()) || (b.country || '').toLowerCase() === countryCode?.toLowerCase()).length;

  const stateBDEs = (stateName) =>
    allBDEs.filter(b => {
      const bdeCountries = (b.assignedCountries || []).map(c => c.toLowerCase());
      const inCountry = selectedCountry ? bdeCountries.includes(selectedCountry.code.toLowerCase()) : true;
      // Check assignedStates directly — exact match only
      const inState = (b.assignedStates || []).map(s => s.toLowerCase()).includes(stateName.toLowerCase());
      return inCountry && inState;
    }).length;

  const districtBDECount = (distName) =>
    allBDEs.filter(b => {
      const bdeCountries = (b.assignedCountries || []).map(c => c.toLowerCase());
      const inCountry = selectedCountry ? bdeCountries.includes(selectedCountry.code.toLowerCase()) : true;
      const inDist = (b.assignedDistricts || []).map(d => d.toLowerCase()).includes(distName.toLowerCase());
      return inCountry && inDist;
    }).length;

  const projectTypeBDECount = (ptValue) =>
    allBDEs.filter(b => {
      const bdeCountries = (b.assignedCountries || []).map(c => c.toLowerCase());
      const inCountry = selectedCountry ? bdeCountries.includes(selectedCountry.code.toLowerCase()) : true;
      const inPT = !ptValue || (b.assignedProjectTypes || []).map(p => p.toLowerCase()).includes(ptValue.toLowerCase());
      return inCountry && inPT;
    }).length;

  const Card = ({ icon, title, subtitle, count, approvedCount, onClick, accent = "blue" }) => {
    const border  = { blue: "border-blue-200 hover:border-blue-400 hover:bg-blue-50/40",   green:  "border-green-200 hover:border-green-400 hover:bg-green-50/40",  amber:  "border-amber-200 hover:border-amber-400 hover:bg-amber-50/40",  purple: "border-purple-200 hover:border-purple-400 hover:bg-purple-50/40" };
    const iconCls = { blue: "text-blue-400",   green: "text-green-400",   amber: "text-amber-400",   purple: "text-purple-400" };
    return (
      <div onClick={onClick} className={`cursor-pointer bg-white p-5 rounded-2xl border-2 shadow-sm hover:shadow-md transition-all duration-150 flex flex-col items-center justify-center min-h-[150px] relative select-none ${border[accent]}`}>
        <div className={`mb-2.5 ${iconCls[accent]}`}>{icon}</div>
        <h2 className="text-base font-black text-slate-800 text-center uppercase leading-tight">{title}</h2>
        {subtitle && <p className="text-slate-400 text-[11px] font-semibold uppercase mt-1">{subtitle}</p>}
        {count !== undefined && (
          <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
            <div className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 ${count > 0 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"}`}>
              <Users className="w-3 h-3"/> {count} BDEs
            </div>
            {approvedCount !== undefined && count > 0 && (
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-black ${approvedCount === count ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-600"}`}>
                {approvedCount === count ? "✓ All Approved" : `${approvedCount} Approved`}
              </div>
            )}
          </div>
        )}
        <ChevronRight className="absolute bottom-2.5 right-2.5 w-4 h-4 text-slate-300"/>
      </div>
    );
  };

  const Breadcrumb = () => (
    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 flex-wrap mb-6">
      <button onClick={() => { setSelectedCountry(null); setSelectedProjectType(null); setSelectedState(null); setSelectedDistrict(null); }} className="text-blue-600 hover:underline">Countries</button>
      {selectedCountry && (<><span>/</span><button onClick={() => { setSelectedProjectType(null); setSelectedState(null); setSelectedDistrict(null); }} className="text-blue-600 hover:underline">{selectedCountry.name}</button></>)}
      {selectedProjectType && (<><span>/</span><button onClick={() => { setSelectedState(null); setSelectedDistrict(null); }} className="text-blue-600 hover:underline">{selectedProjectType}</button></>)}
      {selectedState && (<><span>/</span><button onClick={() => setSelectedDistrict(null)} className="text-blue-600 hover:underline">{selectedState}</button></>)}
      {selectedDistrict && (<><span>/</span><span className="text-slate-800">{selectedDistrict}</span></>)}
    </div>
  );

  if (loading) return <div className="p-8 text-slate-500">Loading BDE Onboarding...</div>;

  // ── District Level — BDEs with Admin Approve ──
  if (selectedDistrict) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setSelectedDistrict(null)} className="flex items-center gap-2 text-blue-600 font-semibold hover:underline text-sm"><ArrowLeft className="w-4 h-4"/> Back</button>
          {selectedCountry && (
            <button onClick={() => setSettingsOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition">
              <Settings className="w-4 h-4"/> Document Settings
            </button>
          )}
        </div>
        <Breadcrumb/>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-black text-slate-800">BDE Onboarding — {selectedDistrict}</h2>
            <p className="text-sm text-slate-500 mt-1">BDEs upload docs from their profile. Review & approve here.</p>
          </div>
          <button onClick={refreshData} className="text-xs text-blue-600 hover:underline font-bold">↻ Refresh</button>
        </div>

        <div className="flex items-center gap-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6">
          <ClipboardList className="w-5 h-5 text-blue-500 shrink-0"/>
          <p className="text-sm text-blue-700 font-medium">BDEs upload their documents (Aadhar, PAN, Bank, etc.) from <strong>My Profile → Documents</strong>. Once uploaded, you can review and approve each document below.</p>
        </div>

        {scopedBDEs.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40"/>
            <p className="font-semibold">No BDEs assigned to {selectedDistrict}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {scopedBDEs.map(bde => (
              <BDEOnboardingCard key={bde._id} bde={bde} requiredDocs={docs} onApproved={refreshData}/>
            ))}
          </div>
        )}

        {settingsOpen && selectedCountry && (
          <OnboardingSettingsPanel countryCode={selectedCountry.code} countryName={selectedCountry.name} onClose={() => setSettingsOpen(false)}/>
        )}
      </div>
    );
  }

  // ── State Level — Districts ──
  if (selectedState) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <button onClick={() => setSelectedState(null)} className="flex items-center gap-2 text-blue-600 font-semibold hover:underline text-sm mb-2"><ArrowLeft className="w-4 h-4"/> Back</button>
        <Breadcrumb/>
        <h2 className="text-2xl font-black text-slate-800 mb-6">Districts in {selectedState}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {(districts || []).map(d => {
            const cnt = districtBDECount(d);
            return <Card key={d} icon={<MapPin className="w-8 h-8"/>} title={d} count={cnt} onClick={() => setSelectedDistrict(d)} accent="purple"/>;
          })}
          {(districts || []).length === 0 && <div className="col-span-full text-center py-10 text-slate-400 text-sm">No districts found</div>}
        </div>
      </div>
    );
  }

  // ── Project Type Level — States ──
  if (selectedProjectType) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <button onClick={() => setSelectedProjectType(null)} className="flex items-center gap-2 text-blue-600 font-semibold hover:underline text-sm mb-2"><ArrowLeft className="w-4 h-4"/> Back</button>
        <Breadcrumb/>
        <h2 className="text-2xl font-black text-slate-800 mb-6">States — {selectedProjectType}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {(states || []).map(s => {
            const cnt = stateBDEs(s);
            return <Card key={s} icon={<Building2 className="w-8 h-8"/>} title={s} count={cnt} onClick={() => setSelectedState(s)} accent="green"/>;
          })}
          {(states || []).length === 0 && <div className="col-span-full text-center py-10 text-slate-400 text-sm">No states configured</div>}
        </div>
      </div>
    );
  }

  // ── Country Level — Project Types ──
  if (selectedCountry) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setSelectedCountry(null)} className="flex items-center gap-2 text-blue-600 font-semibold hover:underline text-sm"><ArrowLeft className="w-4 h-4"/> Back</button>
          <button onClick={() => setSettingsOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition">
            <Settings className="w-4 h-4"/> Document Settings
          </button>
        </div>
        <Breadcrumb/>
        <h2 className="text-2xl font-black text-slate-800 mb-6">Project Types — {selectedCountry.name}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {projectTypes.map(pt => {
            const cnt = projectTypeBDECount(pt.value);
            return <Card key={pt.value} icon={<Briefcase className="w-8 h-8"/>} title={pt.label} count={cnt} onClick={() => setSelectedProjectType(pt.value)} accent="amber"/>;
          })}
          {projectTypes.length === 0 && <div className="col-span-full text-center py-10 text-slate-400 text-sm">No project types configured</div>}
        </div>
        {settingsOpen && <OnboardingSettingsPanel countryCode={selectedCountry.code} countryName={selectedCountry.name} onClose={() => setSettingsOpen(false)}/>}
      </div>
    );
  }

  // ── Top Level — Countries ──
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">BDE Onboarding</h2>
          <p className="text-sm text-slate-500 mt-1">Select a country → project type → state → district to review BDE documents</p>
        </div>
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <ClipboardList className="w-5 h-5 text-blue-600"/>
          <div>
            <p className="text-xs text-blue-500 font-bold uppercase">Total BDEs</p>
            <p className="text-xl font-black text-blue-800">{allBDEs.length}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {countries.map(c => (
          <Card key={c._id} icon={<Globe className="w-10 h-10"/>} title={c.name} subtitle="Click to onboard BDEs"
            count={countryBDEs(c.code)}
            onClick={() => setSelectedCountry(c)} accent="blue"/>
        ))}
        {countries.length === 0 && <div className="col-span-full text-center py-16 text-slate-400 text-sm">No active countries found</div>}
      </div>
    </div>
  );
}
