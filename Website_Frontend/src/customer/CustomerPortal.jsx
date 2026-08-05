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
  return (
    <div className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl p-3 shadow-inner overflow-x-auto scrollbar-hide">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="font-black text-xs text-slate-800 uppercase tracking-wider">Project Journey Timeline</h3>
        <Badge status={status} />
      </div>

      <div className="min-w-[700px] flex items-start justify-between relative px-2 py-1">
        {/* Connecting track line */}
        <div className="absolute left-6 right-6 top-3.5 h-0.5 bg-slate-200 -z-10" />

        {["Lead Captured", "Submit Bill", "Upload Details", "Verify Eligibility", "Document Check", "Select Date", "Payment", "Allocate EPC", "Accept Project", "Site Survey", "Proposal", "Installation", "Upload Docs", "Net Metering", "Subsidy Claim", "Progress Monitor"].map((title, i) => {
          const done = i < 2;
          const active = i === 2;
          return (
            <div key={i} className="flex flex-col items-center flex-1 relative group cursor-pointer">
              {i > 0 && (done || active) && (
                <div className={`absolute right-[50%] left-[-50%] top-3.5 h-0.5 -z-10 transition-all ${done ? 'bg-orange-500' : 'bg-amber-400'}`} />
              )}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ring-2 ring-white mb-1 transition-all ${
                done ? "bg-orange-500 text-white shadow-sm" : 
                active ? "bg-amber-400 text-white shadow-md ring-amber-100 animate-pulse" : 
                "bg-slate-200 text-slate-500"
              }`}>
                {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : (i + 1)}
              </div>
              <p className={`text-[9px] text-center font-bold px-0.5 line-clamp-1 max-w-[75px] ${
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

function ProjectJourneyTracker({ steps }) {
  const [expandedStep, setExpandedStep] = useState(null);

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
        const active = step.status === "in-progress" || (step.status === "pending" && (i === 0 || displaySteps[i-1]?.status === "completed"));
        const isExpanded = expandedStep === i;

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

        return (
          <div key={i} className={`border rounded-xl transition-all ${active ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200 bg-white'}`}>
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 rounded-xl"
              onClick={() => setExpandedStep(isExpanded ? null : i)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                  done ? "bg-green-500 text-white" : 
                  blocked ? "bg-red-500 text-white" :
                  active ? "bg-amber-400 text-white ring-4 ring-amber-100" : 
                  "bg-slate-100 text-slate-400"
                }`}>
                  {done ? <Check className="w-5 h-5" /> : 
                   blocked ? <XCircle className="w-5 h-5" /> : 
                   <span>{step.stepNumber || (i+1)}</span>}
                </div>
                <div>
                  <h4 className={`font-bold text-sm ${done ? 'text-slate-800' : active ? 'text-amber-800' : 'text-slate-500'}`}>
                    {step.title}
                  </h4>
                  {step.completedAt && <p className="text-[10px] text-slate-400 mt-0.5">Completed: {fmtDate(step.completedAt)}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${roleColor}`}>
                  {roleLabel}
                </span>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
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

                {(step.evidenceUrl || step.evidenceNote) ? (
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


// ── SOLAR PACKAGES ────────────────────────────────────────────────────────────
function SolarPackages({ onApply, preselectedType }) {
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
        {/* State selector only for India — AU/NZ don't have state-based subsidies */}
        {isIndia && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select value={selectedState} onChange={e => setSelectedState(e.target.value)}
              className="text-xs font-bold text-slate-700 focus:outline-none bg-transparent">
              {["Gujarat","Maharashtra","Rajasthan","Uttar Pradesh","Delhi","Karnataka","Tamil Nadu","Kerala"].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
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
  const { country } = useCountry();
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

  const isAU = country === "AU";

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] overflow-hidden">
      {/* Top Fixed Area */}
      <div className="shrink-0 space-y-4 pb-2">
        {/* Back Button and Header */}
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-800">Project Details</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">SUN-ACCOUNT</p>
          </div>
        </div>

        {/* Hero card */}
        <div className={`bg-gradient-to-br ${
          project?.projectType?.toLowerCase().includes("commercial") || project?.projectType?.toLowerCase().includes("industrial")
            ? "from-amber-600 via-orange-500 to-amber-700" 
            : project?.projectType?.toLowerCase().includes("agri")
              ? "from-emerald-700 via-green-600 to-emerald-800"
              : project?.projectType?.toLowerCase().includes("off-grid") || project?.projectType?.toLowerCase().includes("off grid")
                ? "from-violet-700 via-purple-600 to-violet-800"
                : "from-solar-navy via-slate-800 to-slate-900"
        } rounded-3xl p-5 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-blue-400/5 rounded-full translate-y-4 -translate-x-4" />

          <div className="flex items-start justify-between mb-4 relative z-10">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{project.orderNumber}</p>
              <h2 className="text-lg font-black mt-0.5">{project.projectTypeLabel || project.projectType} Solar</h2>
              {project.location?.city && (
                <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{project.location.city}</p>
              )}
            </div>
            <Badge status={project.status} />
          </div>

          {/* Progress tracker */}
          <div className="relative z-10 mb-4">
            <ProgressTracker status={project.status} pct={project.completionPercentage} />
          </div>

          <div className="grid grid-cols-3 gap-2.5 relative z-10 mt-3">
            {[
              { l: "SYSTEM", v: project.systemSizeKW ? `${project.systemSizeKW} kW` : "—" },
              { l: "TOTAL COST", v: project.totalProjectCost ? `${country === "AU" ? "$" : "₹"}${project.totalProjectCost.toLocaleString('en-IN')}` : "—" },
              { l: country === "AU" ? "STC REBATE" : "SUBSIDY", v: project.estimatedSubsidy ? `${country === "AU" ? "$" : "₹"}${project.estimatedSubsidy.toLocaleString('en-IN')}` : "—" },
            ].map(s => (
              <div key={s.l} className="bg-slate-950/60 rounded-xl p-2.5 text-center backdrop-blur-md border border-white/10 shadow-sm">
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">{s.l}</p>
                <p className="text-xs sm:text-sm font-black text-white mt-0.5">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Bottom Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-2 pb-16 hide-scrollbar">
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
                  <p className="text-sm font-medium text-yellow-900 mt-0.5">Please pay {isAU ? "$" : "₹"}{project.tokenData.amount.toLocaleString('en-IN')} to publish your project to EPC partners.</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  if (window.confirm(`Are you sure you want to pay ${isAU ? "$" : "₹"}${project.tokenData.amount.toLocaleString('en-IN')}?`)) {
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
                Pay Now ({isAU ? "$" : "₹"}{project.tokenData.amount.toLocaleString('en-IN')})
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
                <Star className="w-5 h-5 animate-pulse" />
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

        {/* ── PROGRESS TRACKER (VERTICAL) ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-yellow-500" />
            <h3 className="font-black text-slate-800">Installation Journey</h3>
          </div>
          <ProjectJourneyTracker steps={project.steps} />
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

            {/* Geo-tag & Photo */}
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
  const { country } = useCountry();
  const [journeySettings, setJourneySettings] = useState(null);

  // Active Project Detail for EPC Partner / Select Installer tabs
  const [activeProjectDetail, setActiveProjectDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Installer Rating States
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
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

  const fetchJourney = async () => {
    try {
      const res = await fetch(`${API}/api/order-journey/${country || "IN"}`);
      if(res.ok) {
        const d = await res.json();
        setJourneySettings(d);
      }
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchJourney(); }, [country]);

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col md:flex-row">
      <ToastContainer />
      
      {/* Sidebar */}
      <div className="md:w-64 bg-solar-navy shrink-0 flex flex-col md:h-full overflow-y-auto">
        
        {/* Brand */}
        <div className="px-4 py-4 flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition text-white/70 hover:text-white md:hidden">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-solar-yellow flex items-center justify-center shrink-0">
            <Sun className="w-5 h-5 text-slate-900 fill-amber-300" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-white text-sm truncate">{customer?.fullName}</p>
          </div>
        </div>

        {/* Dynamic Sidebar Nav */}
        <div className="flex-1 py-4 md:py-6 overflow-y-auto px-3 sm:px-4 flex md:flex-col gap-2 sm:gap-3 hide-scrollbar">
          
          <p className="text-[10px] font-black uppercase text-white/40 tracking-wider mb-2 hidden md:block px-3">Active Projects</p>
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

          <div className="hidden md:block my-2 border-t border-white/10" />

          <p className="text-[10px] font-black uppercase text-white/40 tracking-wider mb-2 hidden md:block px-3 mt-2">Services</p>
          
          {/* Start Another Project Tab */}
          <button onClick={() => { setTab("new-project"); setProjectView("list"); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all whitespace-nowrap md:whitespace-normal text-left ${tab === "new-project" ? "bg-white/20 text-white shadow-md" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
            <Plus className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold text-sm leading-tight">Start Another Project</p>
              <p className="text-[10px] opacity-80">New Application</p>
            </div>
          </button>

          {/* Installer Tab */}
          <button onClick={() => { setTab(country === "AU" ? "select-installer" : "epc-details"); setProjectView("list"); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all whitespace-nowrap md:whitespace-normal text-left ${(tab === "select-installer" || tab === "epc-details") ? "bg-white/20 text-white shadow-md" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
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

          {/* ── HOME DASHBOARD REMOVED - NOW DEFAULTING TO PROJECTS/APPLY VIEW ── */}
          {tab === "home" && (
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-green-100 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-green-800">Gujarat Residents ke liye</p>
                  <p className="text-xs text-green-700 mt-0.5">Central ₹78,000 + Gujarat state ₹40,000 = total ₹1,18,000 tak subsidy milti hai 3kW system pe! PM Surya Ghar Yojana ke under.</p>
                </div>
              </div>
          )}

          {/* ── APPLY ── */}
          {tab === "apply" && <SolarPackages onApply={handleApply} />}

          {/* ── START ANOTHER PROJECT (NEW APPLICATION) ── */}
          {tab === "new-project" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-black text-slate-800 text-lg">Start Another Project</h2>
                <p className="text-xs text-slate-500 mt-0.5">Select a project type to start a new solar journey</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {journeySettings?.projectTypes?.filter(pt => pt.enabled).map((pt) => {
                  const isComm = pt.projectType === "commercial";
                  const pkg = {
                    name: pt.projectTypeLabel || pt.projectType,
                    kw: isComm ? 10 : 3,
                    installCost: isComm ? 500000 : 180000,
                    centralSubsidy: isComm ? 0 : 78000,
                    suitable: [pt.projectTypeLabel || pt.projectType]
                  };
                  return (
                    <div 
                      key={pt.projectType}
                      onClick={() => handleApply(pkg, "Gujarat", 40000, 5)}
                      className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:border-yellow-400 cursor-pointer transition duration-300 flex flex-col justify-between gap-4 group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Application</p>
                          <h3 className="font-black text-slate-800 text-lg group-hover:text-yellow-600 transition">{pt.projectTypeLabel || pt.projectType}</h3>
                          <p className="text-xs text-slate-500 mt-1">Tap to fill form and request installer details.</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center group-hover:scale-110 transition shrink-0">
                          <Plus className="w-6 h-6 text-yellow-600" />
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
                          <p className="text-xs text-slate-600 flex items-center gap-2"><strong>Contact Person:</strong> {activeProjectDetail.epcDetails.contactPerson}</p>
                          <p className="text-xs text-slate-600 flex items-center gap-2"><strong>Phone:</strong> {activeProjectDetail.epcDetails.contactPersonMobile || "Not Shared"}</p>
                          <p className="text-xs text-slate-600 flex items-center gap-2"><strong>Email:</strong> {activeProjectDetail.epcDetails.contactPersonEmail || "Not Shared"}</p>
                          <p className="text-xs text-slate-600 flex items-center gap-2"><strong>Location:</strong> {activeProjectDetail.epcDetails.city}, {activeProjectDetail.epcDetails.state}</p>
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
              ) : activeProjectDetail.bdeRecommendationStatus === "pending" && activeProjectDetail.recommendedEpcs?.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
                    <Star className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-black text-yellow-800">BDE Has Suggested Best EPCs For You</p>
                      <p className="text-xs text-yellow-700 mt-0.5">Please review the recommended installers below and accept your preferred partner to proceed with installation.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activeProjectDetail.recommendedEpcs.map(epc => (
                      <div key={epc._id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-yellow-400 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                            <Building className="w-5 h-5 text-slate-500" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-800 text-sm">{epc.companyName}</h4>
                            <p className="text-xs text-slate-500">{epc.city}, {epc.state} • ⭐ {epc.rating || "New"}</p>
                            <p className="text-[10px] text-slate-400 mt-1">Total installs: {epc.totalInstallations || 0} • Contact: {epc.contactPerson}</p>
                          </div>
                        </div>
                        <button 
                          onClick={async () => {
                            if (window.confirm(`Kya aap ${epc.companyName} ko as a installer accept karna chahte hain?`)) {
                              try {
                                const res = await authFetch(`/api/customer/projects/${activeProjectDetail._id}/accept-epc`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ epcId: epc._id, epcName: epc.companyName })
                                });
                                const d = await res.json();
                                if (d.success) {
                                  alert("EPC Successfully Assigned! 🚀");
                                  fetchProjects();
                                  fetchActiveProjectDetail(activeProjectDetail._id);
                                } else alert(d.message || "Failed to accept EPC");
                              } catch(e) { alert("Error connecting to server"); }
                            }
                          }}
                          className="px-5 py-2.5 bg-yellow-400 hover:bg-amber-400 text-yellow-900 rounded-xl text-xs font-bold transition shadow-sm whitespace-nowrap self-stretch sm:self-auto text-center"
                        >
                          Accept & Assign
                        </button>
                      </div>
                    ))}
                  </div>
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
                      <p className="text-xs text-slate-500 mt-0.5">Sunnovative Empanelled Installation Partner</p>
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
                  <p className="text-xs text-slate-500 mt-1">Your Solar Partner is being assigned by Sunnovative. Once finalized, their contact details will appear here.</p>
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