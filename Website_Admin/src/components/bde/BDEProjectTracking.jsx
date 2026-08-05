import React, { useState, useEffect } from "react";
import { 
  CheckCircle, Clock, Upload, Eye, Search, AlertCircle, FileText, Check, XCircle, 
  ArrowLeft, Building, User, MapPin, Shield, Zap, BarChart3, ChevronDown, ChevronUp, Loader2
} from "lucide-react";
import HorizontalJourneyTracker from "../HorizontalJourneyTracker";

export default function BDEProjectTracking({ bdeId }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterProjectType, setFilterProjectType] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [availableDiscoms, setAvailableDiscoms] = useState([]);
  const [completingId, setCompletingId] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

  const countryStatesMap = {
    india: ["Andhra Pradesh", "Gujarat", "Maharashtra", "Rajasthan", "Uttar Pradesh"],
    australia: ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania"],
    newzealand: ["Auckland", "Wellington", "Canterbury", "Otago"],
  };
  const allStates = countryStatesMap[filterCountry] || [];

  const fetchDiscoms = async () => {
    if (!filterCountry) return;
    try {
      const res = await fetch(`${API_BASE}/api/discoms?country=${filterCountry}`);
      const data = await res.json();
      if (data.success) setAvailableDiscoms(data.data || []);
    } catch { }
  };
  useEffect(() => { fetchDiscoms(); }, [filterCountry]);

  const availableDistricts = [...new Set(availableDiscoms.filter(d => filterState === "" || d.state === filterState).flatMap(d => d.districts || []))].sort();

  useEffect(() => {
    if (!bdeId) return;
    fetchProjects();
  }, [bdeId, search, filterCountry, filterState, filterDistrict, filterProjectType]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filterCountry) params.append("country", filterCountry);
      if (filterState) params.append("state", filterState);
      if (filterDistrict) params.append("district", filterDistrict);
      if (filterProjectType) params.append("projectType", filterProjectType);

      const res = await fetch(`${API_BASE}/api/bde/${bdeId}/projects?${params}`);
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCompleteForCustomer = async (projectId, stepId, file = null, note = "") => {
    setCompletingId(stepId);
    try {
      const formData = new FormData();
      formData.append("bdeName", "BDE");
      if (note) formData.append("note", note);
      if (file) formData.append("file", file);

      const res = await fetch(`${API_BASE}/api/bde/projects/${projectId}/step/${stepId}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert("Step completed on behalf of customer! 🚀");
        fetchProjects();
      } else {
        alert("Action failed: " + (data.message || "Cannot complete step"));
      }
    } catch (err) {
      console.error(err);
      alert("Error completing step");
    } finally {
      setCompletingId(null);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.customerName?.toLowerCase().includes(search.toLowerCase()) || 
    p.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    p.customerMobile?.includes(search)
  );

  const selectedProject = projects.find(p => p._id === selectedProjectId);

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin text-yellow-500" /> Loading Active Projects...</div>;  // ── DETAIL TRACKING VIEW (When a BDE clicks a customer card) ──
  if (selectedProject) {
    const isAU = selectedProject.country === "australia" || filterCountry === "australia";
    const currencySymbol = isAU ? "$" : "₹";
    const activeStep = selectedProject.steps?.find(s => s.status === 'in-progress' || s.status === 'pending') || selectedProject.steps?.[0];

    return (
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Sticky Dark Blue Hero Container matching Screenshot */}
        <div className="sticky top-0 z-20 bg-[#0f172a] rounded-3xl p-4 md:p-5 text-white shadow-2xl space-y-3.5 border border-slate-800 backdrop-blur-md">
          
          {/* Top Bar inside Dark Hero: ← Back + SUN-2026-XXXX + Active Status Pill */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedProjectId(null)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition border border-slate-700 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="font-black text-white text-sm md:text-base tracking-wide font-mono">
                {selectedProject.orderNumber || 'SUN-ACCOUNT'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-bold flex items-center gap-1.5 border border-white/20">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {activeStep?.title || selectedProject.status}
              </span>
            </div>
          </div>

          {/* Inner White Container for Project Journey Timeline (Ultra-Thin Circle Step Bar Only) */}
          <div className="bg-slate-100 text-slate-900 rounded-2xl p-3 shadow-inner space-y-2">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-amber-500" /> PROJECT JOURNEY TIMELINE
              </h3>
              <span className="px-2.5 py-0.5 bg-white text-slate-700 rounded-full text-[10px] font-bold border border-slate-200 shadow-sm flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {activeStep?.title || 'Active'}
              </span>
            </div>

            <HorizontalJourneyTracker 
              steps={selectedProject.steps} 
              userRole="bde"
              showGridCards={false}
              onExecuteStep={(stepId, file, note) => handleCompleteForCustomer(selectedProject._id, stepId, file, note)}
            />
          </div>

          {/* 3 Metric Cards at Bottom of Dark Hero Card */}
          <div className="grid grid-cols-3 gap-3 pt-0.5">
            <div className="bg-[#090d16] p-2.5 rounded-2xl text-center border border-slate-800">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">SYSTEM</p>
              <p className="text-sm font-black text-white mt-0.5">{selectedProject.systemSizeKW || 1} kW</p>
            </div>
            <div className="bg-[#090d16] p-2.5 rounded-2xl text-center border border-slate-800">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">TOTAL COST</p>
              <p className="text-sm font-black text-white mt-0.5">{currencySymbol}{(selectedProject.totalProjectCost || selectedProject.systemSizeKW * 1100 || 65000).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-[#090d16] p-2.5 rounded-2xl text-center border border-slate-800">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{isAU ? "STC REBATE" : "SUBSIDY"}</p>
              <p className="text-sm font-black text-white mt-0.5">{currencySymbol}{(selectedProject.estimatedSubsidy || 30000).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Installation Journey Section (Matching Screenshot) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-500" /> Installation Journey
            </h3>
            <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-200">
              ⚡ BDE ON-BEHALF MODE
            </span>
          </div>

          {/* Vertical Accordion Step Rows matching Screenshot */}
          <div className="space-y-3">
            {selectedProject.steps?.map((step, idx) => {
              const isCustomerStep = step.assignedTo === 'customer';
              const canBdeDo = isCustomerStep || step.canBeCompletedByBDE;
              const isDone = step.status === 'completed';
              const isAwaitingApproval = step.status === 'awaiting-approval';
              const isActive = step.status === 'in-progress' || isAwaitingApproval || (step.status === 'pending' && (idx === 0 || selectedProject.steps[idx - 1]?.status === 'completed'));
              const isExpanded = completingId === step.stepId;

              let roleBadge = "bg-slate-100 text-slate-600";
              let roleLabel = "Admin";
              if (step.assignedTo === "bde") {
                roleBadge = "bg-blue-100 text-blue-700";
                roleLabel = "BDE";
              } else if (step.assignedTo === "epc-partner") {
                roleBadge = "bg-purple-100 text-purple-700";
                roleLabel = "EPC";
              } else if (step.assignedTo === "customer") {
                roleBadge = "bg-green-100 text-green-700";
                roleLabel = "Customer";
              }

              return (
                <div 
                  key={step.stepId || idx} 
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    isDone ? 'border-emerald-200 bg-emerald-50/30' : 
                    isActive ? 'border-amber-300 bg-amber-50/30 shadow-sm ring-1 ring-amber-200' : 
                    'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50/80 transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        isDone ? "bg-emerald-500 text-white shadow-sm" : 
                        isActive ? "bg-amber-400 text-amber-950 font-black ring-2 ring-amber-200 animate-pulse" : 
                        "bg-slate-100 text-slate-500"
                      }`}>
                        {isDone ? <Check className="w-4 h-4" /> : <span>{step.stepNumber || (idx + 1)}</span>}
                      </div>
                      <div>
                        <h4 className={`text-sm font-extrabold ${isDone ? 'text-slate-800' : isActive ? 'text-amber-900' : 'text-slate-700'}`}>
                          {step.title}
                        </h4>
                        {step.description && <p className="text-[11px] text-slate-400 font-medium">{step.description}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${roleBadge}`}>
                        {roleLabel}
                      </span>
                      {canBdeDo && !isDone && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteForCustomer(selectedProject._id, step.stepId);
                          }}
                          disabled={completingId === step.stepId}
                          className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-yellow-950 font-black text-xs rounded-xl transition flex items-center gap-1 shadow-sm"
                        >
                          {completingId === step.stepId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          Complete (BDE)
                        </button>
                      )}
                    </div>
                  </div>

                  {step.adminNote && (
                    <div className="px-4 py-2 bg-blue-50/80 border-t border-blue-100 text-xs text-blue-800 font-medium">
                      📌 <strong>Admin Note:</strong> {step.adminNote}
                    </div>
                  )}

                  {isDone && (
                    <div className="px-4 py-2 bg-emerald-50/80 border-t border-emerald-100 text-xs font-bold text-emerald-700 flex items-center justify-between">
                      <span>✓ Completed by {step.completedBy || "User"}</span>
                      {step.evidenceUrl && (
                        <a href={API_BASE + step.evidenceUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5"/> View Document
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Assigned EPC Installation Partner Card */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 shadow-sm">
          <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-blue-600" /> Assigned EPC Installation Partner
          </h4>
          {selectedProject.assignedEPCName ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div><p className="text-slate-400 font-medium">Company</p><p className="font-bold text-slate-800">{selectedProject.assignedEPCName}</p></div>
              <div><p className="text-slate-400 font-medium">Contact Person</p><p className="font-bold text-slate-800">{selectedProject.epcDetails?.contactPerson || "Installer Rep"}</p></div>
              <div><p className="text-slate-400 font-medium">Phone</p><p className="font-bold text-slate-800">{selectedProject.epcDetails?.contactPersonMobile || "Not Shared"}</p></div>
              <div><p className="text-slate-400 font-medium">Location</p><p className="font-bold text-slate-800">{selectedProject.epcDetails?.city || "City"}, {selectedProject.epcDetails?.state || "State"}</p></div>
            </div>
          ) : (
            <p className="text-xs text-blue-700 font-medium italic">Sunnovative / BDE is curating the best certified installer partner for this property.</p>
          )}
        </div>

      </div>
    );
  }

  // ── MASTER LIST VIEW (Top Filter Bar + Customer/Lead Project Cards) ──
  return (
    <div className="space-y-4">
      {/* Top Filter Bar + Search Integrated In One Row */}
      <div className="bg-slate-900 p-3 rounded-2xl shadow-md flex flex-wrap gap-2.5 items-center">
        {/* Search Bar Inline */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search customer, order #, or mobile..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Country Selector */}
        <select 
          value={filterCountry} 
          onChange={e => { setFilterCountry(e.target.value); setFilterState(""); setFilterDistrict(""); }}
          className="text-xs font-bold text-white border border-slate-700 rounded-xl px-3 py-2 bg-slate-800 focus:outline-none focus:border-amber-400"
        >
          <option value="">🌍 All Countries</option>
          <option value="india">🇮🇳 India</option>
          <option value="australia">🇦🇺 Australia</option>
          <option value="newzealand">🇳🇿 New Zealand</option>
        </select>

        {/* State Selector */}
        <select 
          value={filterState} 
          onChange={e => { setFilterState(e.target.value); setFilterDistrict(""); }} 
          disabled={!filterCountry}
          className="text-xs font-bold text-white border border-slate-700 rounded-xl px-3 py-2 bg-slate-800 focus:outline-none focus:border-amber-400 disabled:opacity-50"
        >
          <option value="">All States</option>
          {allStates.map(state => <option key={state} value={state}>{state}</option>)}
        </select>

        {/* District Selector */}
        <select 
          value={filterDistrict} 
          onChange={e => setFilterDistrict(e.target.value)} 
          disabled={!filterCountry}
          className="text-xs font-bold text-white border border-slate-700 rounded-xl px-3 py-2 bg-slate-800 focus:outline-none focus:border-amber-400 disabled:opacity-50"
        >
          <option value="">All Districts</option>
          {availableDistricts.map(dist => <option key={dist} value={dist}>{dist}</option>)}
        </select>

        {/* Project Type Selector */}
        <select 
          value={filterProjectType} 
          onChange={e => setFilterProjectType(e.target.value)}
          className="text-xs font-bold text-white border border-slate-700 rounded-xl px-3 py-2 bg-slate-800 focus:outline-none focus:border-amber-400"
        >
          <option value="">All Types</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="solar-battery">Solar + Battery</option>
          <option value="farm-rural">Farm / Rural</option>
          <option value="community-strata">Community / Strata</option>
        </select>

        {/* Clear Filters Button */}
        {(search || filterCountry || filterState || filterDistrict || filterProjectType) && (
          <button 
            onClick={() => { setSearch(""); setFilterCountry(""); setFilterState(""); setFilterDistrict(""); setFilterProjectType(""); }} 
            className="px-3 py-2 text-xs font-bold text-red-400 bg-slate-800 border border-red-500/30 rounded-xl hover:bg-red-500/20 hover:text-red-300 transition"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Customer / Lead Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center p-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2"/>
            <p className="text-slate-600 font-bold">No customer project cards found</p>
            <p className="text-slate-400 text-xs mt-1">Convert leads to see active customer tracking cards.</p>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const isAU = project.country === "australia" || filterCountry === "australia";
            const currencySymbol = isAU ? "$" : "₹";

            return (
              <div 
                key={project._id} 
                onClick={() => setSelectedProjectId(project._id)}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition cursor-pointer flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-black text-slate-800 text-base group-hover:text-amber-600 transition">{project.customerName}</h3>
                      <p className="text-[11px] text-slate-400 font-mono font-bold mt-0.5">{project.orderNumber || 'SUN-ACCOUNT'}</p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase border border-emerald-200 shrink-0">
                      {project.status}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-600 flex items-center gap-1 mt-1">
                    <Building className="w-3.5 h-3.5 text-amber-500" />
                    {project.projectTypeLabel || project.projectType} Solar
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {project.location?.city || project.district || 'Location'}
                  </p>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold">Progress</span>
                    <span className="font-black text-amber-700">{project.completionPercentage || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-400 to-yellow-500 h-2 rounded-full transition-all" style={{ width: `${project.completionPercentage || 0}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 pt-1">
                    <span>System: {project.systemSizeKW || 1} kW</span>
                    <span className="text-emerald-700">Cost: {currencySymbol}{(project.totalProjectCost || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs font-black text-amber-600 group-hover:underline">
                  <span>Open Live Tracking UI →</span>
                  <span className="text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-amber-800">
                    BDE On-Behalf
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
