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
  Filter, SlidersHorizontal, BarChart3, Leaf, Wallet, Check, CreditCard,
} from "lucide-react";
import { useCustomerAuth } from "./CustomerAuthContext";
import { useCountry } from "../context/CountryContext";
import { generateDynamicEligibility } from "../data/mockConsumers";

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
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-white uppercase tracking-wider">Project Progress</span>
        <span className="text-xs font-black text-yellow-400">{pct || 0}%</span>
      </div>
      <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-700"
          style={{ width: `${pct || 0}%` }} />
      </div>
    </div>
  );
}

function HorizontalJourneyTracker({ steps }) {
  const displaySteps = steps?.length > 0 ? steps : [
    { stepNumber: 1, title: 'Lead Captured', status: 'completed' },
    { stepNumber: 2, title: 'EPC Assigned', status: 'pending' },
    { stepNumber: 3, title: 'Site Survey', status: 'pending' },
    { stepNumber: 4, title: 'Installation', status: 'pending' },
    { stepNumber: 5, title: 'Completed', status: 'pending' }
  ];

  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
      <div className="min-w-[600px] flex items-start justify-between relative mt-4 px-4">
        {/* Background track line */}
        <div className="absolute left-10 right-10 top-5 h-1 bg-slate-200 -z-10" />
        
        {displaySteps.map((step, i) => {
          const done = step.status === "completed";
          const active = step.status === "in-progress" || step.status === "pending"; // For visualization, if no active, show pending as gray
          const reallyActive = step.status === "in-progress" || (step.status === "pending" && (i === 0 || displaySteps[i-1]?.status === "completed"));
          const blocked = step.status === "blocked";
          
          return (
            <div key={i} className="flex flex-col items-center flex-1 relative group cursor-default">
              {/* Colored track line (if completed) */}
              {i > 0 && (done || reallyActive) && (
                <div className={`absolute right-[50%] left-[-50%] top-5 h-1 -z-10 transition-all ${done || reallyActive ? 'bg-orange-400' : 'bg-slate-200'}`} />
              )}
              
              {/* Circle */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ring-4 ring-white mb-2 transition-all ${
                done ? "bg-orange-500 text-white shadow-md" : 
                reallyActive ? "bg-amber-400 text-white shadow-md ring-amber-50" : 
                blocked ? "bg-red-500 text-white shadow-md" : 
                "bg-slate-200 text-slate-400"
              }`}>
                {done ? <Check className="w-5 h-5" /> : 
                 blocked ? <XCircle className="w-5 h-5" /> : 
                 <span className={reallyActive ? "text-white" : ""}>{step.stepNumber || (i+1)}</span>}
              </div>
              
              {/* Title */}
              <p className={`text-xs text-center font-bold px-2 max-w-[120px] ${
                done ? "text-slate-800" : 
                reallyActive ? "text-amber-700" : 
                "text-slate-400"
              }`}>
                {step.title}
              </p>

              {/* Assignments / Dates */}
              {step.assignedTo && (
                <span className={`text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded-full ${
                  step.assignedTo === "epc-partner" ? "bg-purple-100 text-purple-700" :
                  step.assignedTo === "customer" ? "bg-blue-100 text-blue-700" :
                  "bg-slate-100 text-slate-600"
                }`}>
                  {step.assignedTo === "epc-partner" ? "⚡ EPC" : step.assignedTo === "customer" ? "👤 Aap" : "🏢 Us"}
                </span>
              )}
              
              {step.completedAt && (
                <p className="text-[10px] text-slate-500 mt-1">{fmtDate(step.completedAt)}</p>
              )}
              {step.pendingActionAlert && reallyActive && (
                <p className="text-[9px] text-red-600 bg-red-50 px-1 py-0.5 rounded mt-1 font-bold text-center leading-tight max-w-[110px]">
                  {step.pendingActionAlert}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}


// ── SOLAR PACKAGES ────────────────────────────────────────────────────────────
function SolarPackages({ onApply }) {
  const [packages, setPackages] = useState([]);
  const [stateOverrides, setStateOverrides] = useState({});
  const [selectedState, setSelectedState] = useState("Gujarat");
  const [loading, setLoading] = useState(true);
  const [minBookingDays, setMinBookingDays] = useState(5);

  const { country } = useCountry();
  const getCountryCode = () => { if (country === "AU") return "australia"; if (country === "NZ") return "new_zealand"; return "india"; };

  useEffect(() => {
    fetch(`${API}/api/customer/public/solar-packages`, { headers: { "x-country": getCountryCode() } })
      .then(r => r.json())
      .then(d => { if (d.success) { setPackages(d.packages); setStateOverrides(d.stateOverrides || {}); setMinBookingDays(d.minBookingDays || 5); } })
      .finally(() => setLoading(false));
  }, [country]);

  const stateSubsidy = stateOverrides[selectedState] || 0;

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-yellow-400" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-black text-slate-800 text-lg">Solar System Packages</h2>
          <p className="text-xs text-slate-500 mt-0.5">Apni zaroorat ke hisaab se package chunko</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <select value={selectedState} onChange={e => setSelectedState(e.target.value)}
            className="text-xs font-bold text-slate-700 focus:outline-none bg-transparent">
            {["Gujarat","Maharashtra","Rajasthan","Uttar Pradesh","Delhi","Karnataka","Tamil Nadu","Kerala"].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {stateSubsidy > 0 && (
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

              {/* Subsidy breakdown */}
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
                  {stateSubsidy > 0 && (
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
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 text-center">
                  <p className="text-xs text-slate-500">Central subsidy applicable nahi — custom quote ke liye apply karo</p>
                </div>
              )}

              <button onClick={() => onApply(pkg, selectedState, stateSubsidy, minBookingDays)}
                className={`w-full py-3 text-sm font-black rounded-xl flex items-center justify-center gap-2 transition-all ${
                  isPopular ? "bg-yellow-400 hover:bg-amber-400 text-yellow-900 shadow-md" :
                  "bg-slate-900 hover:bg-slate-700 text-white"
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

  const PLAN_COLOR = { Standard: "bg-slate-100 text-slate-600", Professional: "bg-blue-100 text-blue-700", Enterprise: "bg-purple-100 text-purple-700" };

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
          <p className="text-xs text-slate-400 mt-1">Sunnovative directly assign karega aapke project ke liye</p>
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
          <p className="text-xs text-blue-600 mt-0.5">Aapke project apply karne ke baad, Sunnovative aapke district ke hisaab se best rated solar installer automatically assign karega ya aapko select karne ka option dega.</p>
        </div>
      </div>
    </div>
  );
}

// ── PROJECT DETAIL ────────────────────────────────────────────────────────────
function ProjectDetail({ projectId, onBack, authFetch }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const fileRef = useRef();

  useEffect(() => {
    fetchProject();
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

  const cfg = sCfg(project.status);

  return (
    <div className="space-y-5">
      {/* Hero card */}
      <div className={`bg-gradient-to-br ${
        project?.projectType?.toLowerCase().includes("commercial") || project?.projectType?.toLowerCase().includes("industrial")
          ? "from-amber-600 via-orange-500 to-amber-700" 
          : project?.projectType?.toLowerCase().includes("agri")
            ? "from-emerald-700 via-green-600 to-emerald-800"
            : project?.projectType?.toLowerCase().includes("off-grid") || project?.projectType?.toLowerCase().includes("off grid")
              ? "from-violet-700 via-purple-600 to-violet-800"
              : "from-solar-navy via-slate-800 to-slate-900"
      } rounded-3xl p-6 text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-blue-400/5 rounded-full translate-y-4 -translate-x-4" />

        <div className="flex items-start justify-between mb-5 relative z-10">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{project.orderNumber}</p>
            <h2 className="text-xl font-black mt-1">{project.projectTypeLabel || project.projectType} Solar</h2>
            {project.location?.address && (
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{project.location.city || project.location.address}</p>
            )}
          </div>
          <Badge status={project.status} />
        </div>

        {/* Progress tracker */}
        <div className="relative z-10 mb-5">
          <ProgressTracker status={project.status} pct={project.completionPercentage} />
        </div>

        <div className="grid grid-cols-4 gap-2 relative z-10">
          {[
            { l: "System", v: project.systemSizeKW ? `${project.systemSizeKW} kW` : "—" },
            { l: "Total Cost", v: project.totalProjectCost ? fmt(project.totalProjectCost) : "—" },
            { l: "Subsidy", v: project.estimatedSubsidy ? fmt(project.estimatedSubsidy) : "—" },
            { l: "You Pay", v: (project.totalProjectCost && project.estimatedSubsidy) ? fmt(Math.max(0, project.totalProjectCost - project.estimatedSubsidy)) : "—" },
          ].map(s => (
            <div key={s.l} className="bg-white/8 rounded-xl p-2.5 text-center backdrop-blur-sm border border-white/5">
              <p className="text-[9px] text-slate-500 uppercase font-bold">{s.l}</p>
              <p className="text-xs font-black text-white mt-0.5">{s.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Token Payment Banner */}
      {project.tokenData?.isPending && (
        <div className="bg-gradient-to-r from-amber-400 to-yellow-500 rounded-2xl p-5 shadow-lg shadow-yellow-200 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/20 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <CreditCard className="w-5 h-5 text-yellow-900" />
              </div>
              <div>
                <h3 className="text-base font-black text-yellow-950">Pay Platform Token</h3>
                <p className="text-sm font-medium text-yellow-900 mt-0.5">Please pay ₹{project.tokenData.amount.toLocaleString('en-IN')} to publish your project to EPC partners.</p>
              </div>
            </div>
            <button
              onClick={async () => {
                if (window.confirm(`Are you sure you want to pay ₹${project.tokenData.amount.toLocaleString('en-IN')}?`)) {
                  try {
                    const res = await authFetch(`/api/customer/projects/${projectId}/pay-token`, { method: "POST" });
                    const data = await res.json();
                    if (data.success) {
                      alert("Payment successful! Your order is now Open for EPCs.");
                      fetchProject();
                    } else {
                      alert(data.message || "Payment failed");
                    }
                  } catch (e) {
                    alert("An error occurred during payment.");
                  }
                }
              }}
              className="px-6 py-3 bg-yellow-950 text-white rounded-xl font-bold text-sm hover:bg-black transition shadow-xl shrink-0"
            >
              Pay Now (₹{project.tokenData.amount.toLocaleString('en-IN')})
            </button>
          </div>
        </div>
      )}

      {/* Pending action banner */}
      {project.pendingActionAlert && project.pendingActionFor === "customer" && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-amber-900" />
          </div>
          <div>
            <p className="text-sm font-black text-amber-800">Action Required — Aapki Taraf Se</p>
            <p className="text-xs text-amber-700 mt-0.5">{project.pendingActionAlert}</p>
          </div>
        </div>
      )}

      {/* Australia BDE EPC Recommendation Block */}
      {project.bdeRecommendationStatus === "pending" && project.recommendedEpcs?.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0 shadow-sm text-white">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-blue-950">Recommended Installers</h3>
              <p className="text-xs font-medium text-blue-800 mt-0.5">Humare BDE ne aapke project ke liye {project.recommendedEpcs.length} best EPCs select kiye hain. Kripya ek chunein.</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {project.recommendedEpcs.map(epc => (
              <div key={epc._id} className="bg-white border border-blue-100 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-black text-slate-800">{epc.companyName}</p>
                  <p className="text-xs text-slate-500">{epc.city}, {epc.state} • ⭐ {epc.rating} Rating</p>
                </div>
                <button 
                  onClick={async () => {
                    if (window.confirm(`Kya aap ${epc.companyName} ko as a installer accept karna chahte hain?`)) {
                      try {
                        const res = await authFetch(`/api/customer/projects/${projectId}/accept-epc`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ epcId: epc._id, epcName: epc.companyName })
                        });
                        const d = await res.json();
                        if (d.success) {
                          alert("EPC Successfully Assigned! 🚀");
                          fetchProject();
                        } else alert(d.message || "Failed to accept EPC");
                      } catch(e) { alert("Error connecting to server"); }
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm whitespace-nowrap"
                >
                  Accept & Assign
                </button>
              </div>
            ))}
          </div>

          <button 
            onClick={async () => {
              if (window.confirm("Are you sure you want to reject all recommendations and request new ones?")) {
                try {
                  const res = await authFetch(`/api/customer/projects/${projectId}/reject-epcs`, { method: "POST" });
                  const d = await res.json();
                  if (d.success) {
                    alert("Recommendations rejected. Your BDE will send new ones soon.");
                    fetchProject();
                  } else alert(d.message);
                } catch(e) { alert("Error connecting to server"); }
              }
            }}
            className="w-full mt-4 py-2 border border-blue-200 text-blue-600 font-bold text-xs rounded-xl hover:bg-blue-100 transition"
          >
            Reject All & Request New
          </button>
        </div>
      )}

      {/* EPC Partner */}
      {project.assignedEPCName && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Your Solar Installation Partner</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center text-yellow-700 font-black text-lg border border-yellow-200">
              <Building className="w-6 h-6 text-yellow-700" />
            </div>
            <div className="flex-1">
              <p className="font-black text-slate-800">Certified Solar Installer</p>
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
      {/* ── PROGRESS TRACKER (HORIZONTAL) ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mt-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-yellow-500" />
          <h3 className="font-black text-slate-800">Installation Journey</h3>
        </div>
        
        <HorizontalJourneyTracker steps={project.steps} />
      </div>

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
  );
}

// ── APPLY MODAL ───────────────────────────────────────────────────────────────
function ApplyModal({ pkg, selectedState, stateSubsidy, minBookingDays, customer, onClose, onSuccess }) {
  const [form, setForm] = useState({
    address: customer?.address || "",
    city: customer?.city || "",
    pincode: customer?.pincode || "",
    preferredInstallDate: ""
  });
  const [consumerNumber, setConsumerNumber] = useState("");
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [rooftopPhoto, setRooftopPhoto] = useState(null);
  const [geo, setGeo] = useState({ lat: null, lng: null });
  const [geoError, setGeoError] = useState("");
  const fileRef = useRef();

  // For CUSTOMER_SELECT
  const [epcSelectionMode, setEpcSelectionMode] = useState(false);
  const [availableEpcs, setAvailableEpcs] = useState([]);
  const [selectedEpc, setSelectedEpc] = useState(null);

  const token = localStorage.getItem("customer_token");
  const total = pkg.centralSubsidy + stateSubsidy;
  const net = Math.max(0, pkg.installCost - total);

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
    if (!form.address || !form.city) return setError("Address aur city required hain");
    if (!rooftopPhoto) return setError("Rooftop photo upload karna zaroori hai");
    if (!geo.lat) return setError("Location capture nahi hui. Photo upload retry karein aur location allow karein.");
    if (!form.preferredInstallDate) return setError("Install date select karein");

    setSubmitting(true);
    const fd = new FormData();
    const payload = {
        projectType: pkg.suitable?.[0]?.toLowerCase().replace(" solar","").replace(" ","-") || "residential",
        projectTypeLabel: pkg.name,
        systemSizeKW: pkg.kw,
        monthlyBillAmount: 0,
        estimatedSubsidy: total,
        totalProjectCost: pkg.installCost,
        state: selectedState,
        location: { address: form.address, city: form.city, pincode: form.pincode, state: selectedState },
        preferredInstallDate: form.preferredInstallDate,
        latitude: geo.lat,
        longitude: geo.lng
    };
    if (selectedEpc) {
      payload.selectedEpcId = selectedEpc._id;
      payload.selectedEpcName = selectedEpc.companyName;
    }
    fd.append("payload", JSON.stringify(payload));
    fd.append("rooftopPhoto", rooftopPhoto);

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
            currency: "INR",
            name: "Sunnovative Solar",
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
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="bg-slate-900 rounded-t-3xl p-5 border-b border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-black text-2xl text-white">{pkg.name}</h3>
              <p className="text-sm font-bold text-slate-400 mt-0.5">{pkg.kw} KW System</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-800 text-slate-400 rounded-xl transition"><X className="w-5 h-5" /></button>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Project Type</p><p className="text-base font-black text-white">{pkg.suitable?.[0]?.replace(" Solar","") || "Residential"}</p></div>
            <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">KW Capacity</p><p className="text-base font-black text-white">{pkg.kw} KW</p></div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Payment</p>
              <p className="text-base font-black text-white">{fmt(pkg.installCost)}</p>
            </div>
          </div>
          {total > 0 && (
            <p className="text-[10px] text-amber-600 font-bold mt-3 bg-amber-50 p-2 rounded-lg inline-block">
              * Note: Aapko upfront {fmt(pkg.installCost)} pay karna hoga. Subsidy of {fmt(total)} project complete hone ke baad seedha aapke bank account mein aayegi.
            </p>
          )}
        </div>

        <div className="p-5 space-y-5">
          {epcSelectionMode ? (
            <div>
              <h4 className="text-sm font-black text-slate-700 mb-3 border-b border-slate-100 pb-1">Select Your Solar Installer (EPC)</h4>
              <p className="text-xs text-slate-500 mb-4">Aapke area ke mutabiq available certified installers ki list. Kripya kisi ek ko select karein.</p>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {availableEpcs.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">Koi installer available nahi hai. Kripya support se sampark karein.</p>
                ) : (
                  availableEpcs.map(epc => (
                    <div 
                      key={epc._id} 
                      onClick={() => setSelectedEpc(epc)}
                      className={`border p-3 rounded-xl cursor-pointer transition ${selectedEpc?._id === epc._id ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200 hover:border-yellow-200'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{epc.companyName}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Contact: {epc.contactPerson}</p>
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
              {/* Dynamic Filters for Location & Project Type */}


              <div>
                <h4 className="text-sm font-black text-slate-700 mb-3 border-b border-slate-100 pb-1">Application Details</h4>

            
            {/* Eligibility Check */}
            <div className="mb-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Consumer Number *</label>
              <div className="flex gap-2">
                <input type="text" value={consumerNumber} onChange={e => setConsumerNumber(e.target.value)}
                  placeholder="e.g. 1234567890"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400/50" />
                <button type="button" onClick={handleCheckEligibility} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs whitespace-nowrap hover:bg-slate-800 transition">
                  Verify
                </button>
              </div>
              {eligibilityResult && (
                <div className="mt-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs font-bold text-green-700 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Verified: {eligibilityResult.consumerName}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
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

            {/* Date Picker */}
            <div className="mb-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Date *</label>
              <input type="date" value={form.preferredInstallDate} min={getMinDateString()} onChange={e => setForm(p => ({ ...p, preferredInstallDate: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50" />
              <p className="text-[9px] text-amber-600 mt-1 font-medium bg-amber-50 p-1.5 rounded border border-amber-100">
                ⚠️ Note: The final installation date will be fixed by the EPC partner within 5 days of your selected date.
              </p>
            </div>

            {/* Geo-tag & Photo (Simplified design to match new clean look) */}
            <div className="mb-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Rooftop Photo *</label>
              <div className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition ${rooftopPhoto ? "border-green-300 bg-green-50" : "border-slate-200 hover:border-slate-300"}`}
                onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                {rooftopPhoto ? (
                  <div>
                    <p className="text-xs font-bold text-green-700">📎 {rooftopPhoto.name}</p>
                    {geo.lat && <p className="text-[10px] text-green-600 font-bold mt-1">📍 Auto-fetched location ({geo.lat.toFixed(4)}, {geo.lng.toFixed(4)})</p>}
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
                <button onClick={submit} disabled={submitting || (epcSelectionMode && !selectedEpc)}
                  className="w-full py-3.5 px-8 bg-yellow-400 text-yellow-900 font-black text-sm rounded-xl hover:bg-amber-400 transition flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {submitting ? "Processing..." : epcSelectionMode ? "Confirm EPC & Pay" : "Submit Application"}
                </button>
                {epcSelectionMode && (
                  <button onClick={() => setEpcSelectionMode(false)} className="w-full mt-2 py-2 text-slate-500 text-xs font-bold hover:bg-slate-50 rounded-xl transition">
                    Go Back
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

  const fetchProjects = async () => {
    setProjLoading(true);
    try {
      const res = await authFetch("/api/customer/projects");
      const d = await res.json();
      if (d.success) setProjects(d.data);
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

  const handleApply = (pkg, state, stateSubsidy, minBookingDays) => setApplyData({ pkg, state, stateSubsidy, minBookingDays });

  const handleApplySuccess = (order) => {
    setApplyData(null);
    setAppliedProject(order);
    fetchProjects();
    setTab("projects");
  };

  const active = projects.filter(p => !["completed","closed","cancelled"].includes(p.status));
  const done = projects.filter(p => ["completed","closed"].includes(p.status));
  const totalSavings = projects.reduce((s, p) => s + (p.estimatedSubsidy || 0), 0);

  const TABS = [
    { id: "home",     icon: <LayoutDashboard className="w-4 h-4" />, label: "Home" },
    { id: "projects", icon: <FolderOpen className="w-4 h-4" />,      label: `Projects${projects.length ? ` (${projects.length})` : ""}` },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-solar-navy px-4 sm:px-6 py-3.5 flex items-center gap-3 shrink-0">
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-solar-yellow flex items-center justify-center shrink-0">
          <Sun className="w-5 h-5 text-slate-900 fill-amber-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm truncate">{customer?.fullName}</p>
          <p className="text-[11px] text-slate-400">Solar Customer Portal</p>
        </div>
        {tab === "projects" && projectView === "detail" && (
          <button onClick={() => setProjectView("list")} className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/10 transition">
            <ArrowLeft className="w-3.5 h-3.5" />All
          </button>
        )}
        {active.length > 0 && tab !== "projects" && (
          <button onClick={() => setTab("projects")} className="relative p-2 rounded-xl hover:bg-white/10 transition text-slate-400 hover:text-white">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-400" />
          </button>
        )}
        <button onClick={() => { logout(); onClose?.(); }} className="p-2 rounded-xl hover:bg-white/10 transition text-slate-400 hover:text-white">
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Nav tabs */}
      <div className="bg-white border-b border-slate-200 shrink-0 overflow-x-auto">
        <div className="flex px-2 min-w-max">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setProjectView("list"); }}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                tab === t.id ? "border-yellow-400 text-yellow-600" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">

          {/* ── HOME ── */}
          {tab === "home" && (
            <div className="space-y-5">
              {/* Welcome */}
              <div className="bg-gradient-to-br from-solar-navy to-slate-800 rounded-3xl p-6 text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-yellow-400/10 rounded-full" />
                <div className="absolute top-12 right-14 w-16 h-16 bg-yellow-400/10 rounded-full" />
                <div className="relative z-10">
                  <p className="text-sm text-slate-400">Namaste 👋</p>
                  <h2 className="text-2xl font-black mt-1">{customer?.fullName?.split(" ")[0]}</h2>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{customer?.city || customer?.state || "Gujarat"}</p>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {[
                      { l: "Projects", v: projects.length || "0", c: "text-yellow-400" },
                      { l: "Active", v: active.length || "0", c: "text-blue-400" },
                      { l: "Total Savings", v: totalSavings ? `₹${(totalSavings/1000).toFixed(0)}K` : "₹0", c: "text-green-400" },
                    ].map(s => (
                      <div key={s.l} className="bg-white/8 rounded-2xl p-3 text-center backdrop-blur-sm border border-white/5">
                        <p className={`text-lg font-black ${s.c}`}>{s.v}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{s.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Success banner after apply */}
              {appliedProject && (
                <div className="flex items-start gap-3 p-4 bg-green-50 border-2 border-green-300 rounded-2xl">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-black text-green-800">Application Submitted! 🎉</p>
                    <p className="text-xs text-green-700 mt-0.5">Order ID: <strong>{appliedProject.orderNumber}</strong> — Sunnovative team 24hrs mein contact karegi.</p>
                  </div>
                  <button onClick={() => setAppliedProject(null)} className="ml-auto text-green-600"><X className="w-4 h-4" /></button>
                </div>
              )}

              {/* Active projects */}
              {active.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Active Projects</p>
                    <button onClick={() => setTab("projects")} className="text-xs text-yellow-600 font-bold flex items-center gap-0.5 hover:gap-1.5 transition-all">
                      View all <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {active.slice(0,2).map(p => (
                    <div key={p._id} className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 cursor-pointer hover:shadow-sm hover:border-yellow-200 transition-all"
                      onClick={() => { setTab("projects"); setProjectView("detail"); setSelectedProjectId(p._id); }}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-slate-400">{p.orderNumber}</p>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">{p.projectTypeLabel || p.projectType} Solar</p>
                        </div>
                        <Badge status={p.status} />
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                          <span>Progress</span><span className="font-bold">{p.completionPercentage || 0}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full" style={{ width: `${p.completionPercentage || sCfg(p.status).pct}%` }} />
                        </div>
                      </div>
                      {p.pendingActionAlert && p.pendingActionFor === "customer" && (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-700 font-bold">
                          <Bell className="w-3 h-3" />{p.pendingActionAlert}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id:"apply", icon:<Plus className="w-5 h-5 text-yellow-600" />, label:"New Application", desc:"Solar system ke liye apply karo", color:"bg-yellow-50 border-yellow-100" },
                  { id:"epc",   icon:<Zap className="w-5 h-5 text-purple-600" />,  label:"Solar Installers",   desc:"Verified installers dekho",    color:"bg-purple-50 border-purple-100" },
                ].map(a => (
                  <button key={a.id} onClick={() => setTab(a.id)}
                    className={`${a.color} border rounded-2xl p-4 text-left hover:shadow-sm transition-all`}>
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-3 border border-white/80">{a.icon}</div>
                    <p className="font-bold text-slate-800 text-sm">{a.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{a.desc}</p>
                  </button>
                ))}
              </div>

              {/* Trust / Ad Banner */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full -translate-y-8 translate-x-8 blur-2xl" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                    <Star className="w-6 h-6 text-white fill-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-blue-900">#1 Choice in {customer?.district || customer?.city || customer?.state || "Your Area"}!</h3>
                    <p className="text-xs text-blue-800 mt-1">Hamare verified installers ne pichle mahine <strong>50+ projects</strong> time par complete kiye hain. Customers ki <strong>4.8/5 average rating</strong> ke saath aapko milti hai sabse tez aur safe installation guarantee!</p>
                  </div>
                </div>
              </div>

              {/* Solar tip */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-green-100 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-green-800">Gujarat Residents ke liye</p>
                  <p className="text-xs text-green-700 mt-0.5">Central ₹78,000 + Gujarat state ₹40,000 = total ₹1,18,000 tak subsidy milti hai 3kW system pe! PM Surya Ghar Yojana ke under.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── APPLY ── */}
          {tab === "apply" && <SolarPackages onApply={handleApply} />}

          {/* ── PROJECTS ── */}
          {tab === "projects" && (
            <div className="space-y-4">
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
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />+91 {customer?.mobile}</p>
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
                  <input value={`+91 ${customer?.mobile}`} readOnly className="w-full border border-slate-100 rounded-xl px-4 py-2.5 text-sm bg-slate-50 text-slate-400 cursor-not-allowed" />
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
                  { l: "Total Subsidy Earned", v: <span className="font-bold text-green-600">{fmt(totalSavings)}</span> },
                ].map(row => (
                  <div key={row.l} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{row.l}</span>
                    {row.v}
                  </div>
                ))}
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
          onClose={() => setApplyData(null)}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
}