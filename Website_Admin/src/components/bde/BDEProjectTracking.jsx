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
  const [bdeUploadFile, setBdeUploadFile] = useState(null);
  const [bdeEvidenceNote, setBdeEvidenceNote] = useState("");
  const [expandedStepIndex, setExpandedStepIndex] = useState(null);

  // Drill-down UI State
  const [drillLevel, setDrillLevel] = useState(0);
  const [drillPath, setDrillPath] = useState({
    projectType: null,
    state: null,
    district: null,
    statusType: null, // "on-time" | "overdue"
    overdueType: null, // "customer" | "epc"
    stageName: null // the active journey step
  });

  const handleDrillDown = (level, value) => {
    const newPath = { ...drillPath };
    if (level === 0) { newPath.projectType = value; newPath.state = null; newPath.district = null; newPath.statusType = null; newPath.overdueType = null; newPath.stageName = null; }
    if (level === 1) { newPath.state = value; newPath.district = null; newPath.statusType = null; newPath.overdueType = null; newPath.stageName = null; }
    if (level === 2) { newPath.district = value; newPath.statusType = null; newPath.overdueType = null; newPath.stageName = null; }
    if (level === 3) { newPath.statusType = value; newPath.overdueType = null; newPath.stageName = null; }
    if (level === 4) { newPath.overdueType = value; newPath.stageName = null; }
    if (level === 5) { newPath.stageName = value; }
    
    setDrillPath(newPath);
    setDrillLevel(level + 1);
  };

  const handleDrillUp = (level) => {
    setDrillLevel(level);
  };

  const getOverdueInfo = (project) => {
    if (!project.steps) return { isOverdue: false, type: null, days: 0, stepTitle: "" };
    const activeStep = project.steps.find(s => s.status === 'in-progress' || s.status === 'pending');
    if (!activeStep) return { isOverdue: false, type: null, days: 0, stepTitle: "Unknown Stage" };
    if (!activeStep.isOverdue) return { isOverdue: false, type: activeStep.assignedTo === 'customer' ? 'customer' : 'epc', days: 0, stepTitle: activeStep.title || "Unknown Stage" };
    
    const isCustomer = activeStep.assignedTo === 'customer';
    return { 
      isOverdue: true, 
      type: isCustomer ? 'customer' : 'epc', 
      days: activeStep.daysOverdue || 0,
      stepTitle: activeStep.title
    };
  };

  // Grouping logic for the current drillLevel
  const currentOptions = React.useMemo(() => {
    let filtered = projects;

    if (drillLevel > 0) filtered = filtered.filter(p => (p.projectTypeLabel || p.projectType || 'Unknown') === drillPath.projectType);
    if (drillLevel > 1) filtered = filtered.filter(p => (p.state || 'Unknown') === drillPath.state);
    if (drillLevel > 2) filtered = filtered.filter(p => (p.district || 'Unknown') === drillPath.district);
    
    // Status Filter (Level 3 -> 4)
    if (drillLevel > 3) {
      filtered = filtered.filter(p => {
        const info = getOverdueInfo(p);
        if (drillPath.statusType === 'overdue') return info.isOverdue;
        return !info.isOverdue;
      });
    }

    // Overdue Type Filter (Level 4 -> 5)
    if (drillLevel > 4 && drillPath.statusType === 'overdue') {
      filtered = filtered.filter(p => {
        const info = getOverdueInfo(p);
        return info.type === drillPath.overdueType;
      });
    }

    // Stage Filter (Level 5 -> 6)
    if (drillLevel > 5) {
      filtered = filtered.filter(p => {
        const info = getOverdueInfo(p);
        return info.stepTitle === drillPath.stageName;
      });
    }

    if (drillLevel === 0) {
      const types = {};
      filtered.forEach(p => {
        const pt = p.projectTypeLabel || p.projectType || 'Unknown';
        types[pt] = (types[pt] || 0) + 1;
      });
      return Object.entries(types).map(([k, v]) => ({ label: k, count: v, value: k }));
    }
    if (drillLevel === 1) {
      const states = {};
      filtered.forEach(p => {
        const st = p.state || 'Unknown';
        states[st] = (states[st] || 0) + 1;
      });
      return Object.entries(states).map(([k, v]) => ({ label: k, count: v, value: k }));
    }
    if (drillLevel === 2) {
      const dists = {};
      filtered.forEach(p => {
        const dt = p.district || 'Unknown';
        dists[dt] = (dists[dt] || 0) + 1;
      });
      return Object.entries(dists).map(([k, v]) => ({ label: k, count: v, value: k }));
    }
    if (drillLevel === 3) {
      let onTime = 0, overdue = 0;
      filtered.forEach(p => {
        if (getOverdueInfo(p).isOverdue) overdue++;
        else onTime++;
      });
      return [
        { label: 'On-Time Orders', count: onTime, value: 'on-time', color: 'emerald' },
        { label: 'Overdue Orders', count: overdue, value: 'overdue', color: 'red' }
      ];
    }
    if (drillLevel === 4) {
      if (drillPath.statusType === 'on-time') return []; // Jump to level 5 instantly
      
      let customer = 0, epc = 0;
      filtered.forEach(p => {
        const info = getOverdueInfo(p);
        if (info.type === 'customer') customer++;
        else if (info.type === 'epc') epc++;
      });
      return [
        { label: 'Customer Steps Overdue', count: customer, value: 'customer', color: 'orange' },
        { label: 'EPC Steps Overdue', count: epc, value: 'epc', color: 'purple' }
      ];
    }

    if (drillLevel === 5) {
      const stages = {};
      filtered.forEach(p => {
         const info = getOverdueInfo(p);
         const stage = info.stepTitle || 'Unknown Stage';
         stages[stage] = (stages[stage] || 0) + 1;
      });
      return Object.entries(stages).map(([k, v]) => ({ label: `Stage: ${k}`, count: v, value: k, color: 'blue' }));
    }

    return filtered; // Level 6
  }, [projects, drillLevel, drillPath]);

  // Jump to level 5 if on-time is selected
  useEffect(() => {
    if (drillLevel === 4 && drillPath.statusType === 'on-time') {
      setDrillLevel(5);
    }
  }, [drillLevel, drillPath]);

  // Notifications for Overdue
  const [lastNotified, setLastNotified] = useState(Date.now());
  const [showOverduePopup, setShowOverduePopup] = useState(null);

  useEffect(() => {
    const checkOverdue = () => {
      const overdueProjects = projects.filter(p => getOverdueInfo(p).isOverdue);
      if (overdueProjects.length > 0) {
        const worst = overdueProjects.sort((a,b) => getOverdueInfo(b).days - getOverdueInfo(a).days)[0];
        const info = getOverdueInfo(worst);
        setShowOverduePopup({
           project: worst,
           info: info
        });
      }
    };
    
    // Check every 5 minutes
    const interval = setInterval(checkOverdue, 5 * 60 * 1000); 
    // Wait for projects to load, then do initial check after 2s
    if (projects.length > 0 && !showOverduePopup) {
       setTimeout(checkOverdue, 2000);
    }
    
    
  const getCountForProjectType = (ptValue) => {
    const arr = typeof filteredLeads !== 'undefined' ? filteredLeads : (typeof displayedProjects !== 'undefined' ? displayedProjects : []);
    // wait, if we use filteredLeads, it will filter by itself. We need base leads!
    // Since BDEProspects and BDEProjectTracking use different variable names (leads vs projects),
    // let's do a loose filter just on the state array (leads or projects).
    const srcArray = (typeof leads !== 'undefined' ? leads : (typeof projects !== 'undefined' ? projects : []));
    
    // Quick filter just for project type
    let matches = srcArray;
    
    // In Prospects, we only count leads that are prospects.
    if (file.includes('Prospects')) {
       matches = matches.filter(l => {
          const isAU = l.country === 'australia' || l.country === 'AU';
          const isEligibleForOrderJourney = isAU ? l.bdeMovedToOrderJourney : (l.tokenPaid && l.assignedEPCId);
          return l.installDateBooked && !isEligibleForOrderJourney;
       });
    }

    if (ptValue === "All") return matches.length;
    return matches.filter(l => (l.solarType || l.projectType || "").toLowerCase() === ptValue.toLowerCase()).length;
  };

  return () => clearInterval(interval);
  }, [projects]);




  // Auto-expand active step
  useEffect(() => {
    if (selectedProjectId) {
      const sp = projects.find(p => p._id === selectedProjectId);
      if (sp && sp.steps) {
        const activeIdx = sp.steps.findIndex(s => s.status === 'in-progress' || s.status === 'pending');
        if (activeIdx >= 0) {
          setExpandedStepIndex(activeIdx);
        }
      }
    }
  }, [selectedProjectId, projects]);
  
  // Date negotiation states
  const [proposedDate, setProposedDate] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [isSubmittingDate, setIsSubmittingDate] = useState(false);

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

  const handleCompleteForCustomer = async (projectId, stepId, file = null, note = "", uploadedActions = []) => {
    setCompletingId(stepId);
    try {
      const formData = new FormData();
      formData.append("bdeName", "BDE");
      if (note) formData.append("note", note);
      if (file) formData.append("file", file);
      if (uploadedActions && uploadedActions.length > 0) {
        formData.append("uploadedActions", JSON.stringify(uploadedActions));
      }

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

  const handleProposeDate = async (projectId) => {
    if (!proposedDate) return alert("Please select a date to propose.");
    setIsSubmittingDate(true);
    try {
      const res = await fetch(`${API_BASE}/api/bde/projects/${projectId}/install-date/propose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposedDate }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Installation Date Proposed successfully!");
        setProposedDate("");
        fetchProjects();
      } else {
        alert("Failed: " + (data.message || "Something went wrong"));
      }
    } catch (err) {
      console.error(err);
      alert("Error proposing date");
    } finally {
      setIsSubmittingDate(false);
    }
  };

  const handleFixFinalDate = async (projectId) => {
    if (!finalDate) return alert("Please select a final date to fix.");
    setIsSubmittingDate(true);
    try {
      const res = await fetch(`${API_BASE}/api/bde/projects/${projectId}/install-date/fix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalDate }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Final Installation Date Fixed!");
        setFinalDate("");
        fetchProjects();
      } else {
        alert("Failed: " + (data.message || "Something went wrong"));
      }
    } catch (err) {
      console.error(err);
      alert("Error fixing final date");
    } finally {
      setIsSubmittingDate(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.customerName?.toLowerCase().includes(search.toLowerCase()) || 
    p.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    p.customerMobile?.includes(search)
  );

  const selectedProject = projects.find(p => p._id === selectedProjectId);

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin text-yellow-500" /> Loading Active Projects...</div>;
  // ── DETAIL TRACKING VIEW (When a BDE clicks a customer card) ──
  if (selectedProject) {
    const isAU = selectedProject.country === "australia" || filterCountry === "australia";
    const currencySymbol = isAU ? "$" : "₹";
    const activeStep = selectedProject.steps?.find(s => s.status === 'in-progress' || s.status === 'pending') || selectedProject.steps?.[0];

    return (
      <div className="max-w-7xl w-full mx-auto space-y-5 pb-10">
        
        {/* Top Back Button above the Hero */}
        <div className="flex items-center mb-1">
          <button 
            onClick={() => setSelectedProjectId(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 shadow-sm text-slate-700 hover:text-blue-600 hover:border-blue-300 rounded-xl font-bold transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>
        </div>

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
              onExecuteStep={(stepId, file, note, uploadedActions) => handleCompleteForCustomer(selectedProject._id, stepId, file, note, uploadedActions)}
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
              const canBdeDo = step.assignedTo === 'bde' || isCustomerStep || step.canBeCompletedByBDE;
              const isDone = step.status === 'completed';
              const isAwaitingApproval = step.status === 'awaiting-approval';
              const isActive = step.status === 'in-progress' || isAwaitingApproval || (step.status === 'pending' && (idx === 0 || selectedProject.steps[idx - 1]?.status === 'completed'));
              const isExpanded = expandedStepIndex === idx;

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

              const isOverdue = isActive && step.isOverdue;

              return (
                <div 
                  key={step.stepId || idx} 
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    isDone ? 'border-emerald-200 bg-emerald-50/30' : 
                    isOverdue ? 'border-l-[6px] border-l-red-500 border-red-300 bg-red-50/20 shadow-sm ring-1 ring-red-200' :
                    isActive ? 'border-amber-300 bg-amber-50/30 shadow-sm ring-1 ring-amber-200' : 
                    'border-slate-200 bg-white'
                  }`}
                >
                  <div 
                    className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50/80 transition"
                    onClick={() => setExpandedStepIndex(isExpanded ? null : idx)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        isDone ? "bg-emerald-500 text-white shadow-sm" : 
                        isActive ? "bg-amber-400 text-amber-950 font-black ring-2 ring-amber-200 animate-pulse" : 
                        "bg-slate-100 text-slate-500"
                      }`}>
                        {isDone ? <Check className="w-4 h-4" /> : <span>{step.stepNumber || (idx + 1)}</span>}
                      </div>
                      <div>
                        <h4 className={`text-sm font-extrabold ${isDone ? 'text-slate-800' : isActive ? 'text-amber-900 font-extrabold' : 'text-slate-700'}`}>
                          {step.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${roleBadge}`}>
                        {roleLabel}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 rounded-b-xl space-y-3">
                      {isOverdue && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-2 text-red-800">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <h4 className="font-bold text-red-700">Step Overdue by {step.daysOverdue} Days</h4>
                          </div>
                          <p className="text-xs font-medium opacity-90 mb-2">
                            This step is pending with <span className="font-bold uppercase">{step.assignedTo}</span>.
                            {step.assignedTo === 'epc-partner' && " Please contact the EPC to expedite."}
                            {step.assignedTo === 'customer' && " Please contact the customer to expedite."}
                            {step.assignedTo === 'admin' && " Pending internal approval/action."}
                          </p>
                          {(step.assignedTo === 'epc-partner' || step.assignedTo === 'customer') && (
                            <div className="bg-white p-2 rounded border border-red-100 text-xs text-slate-700">
                              <p className="mb-1 text-[10px] text-slate-400 uppercase font-black">{step.assignedTo === 'epc-partner' ? 'EPC Details' : 'Customer Details'}</p>
                              {step.assignedTo === 'epc-partner' ? (
                                selectedProject.assignedEPC ? (
                                  <>
                                    <p className="font-bold">{selectedProject.assignedEPC.companyName || selectedProject.assignedEPC.name || 'Not assigned'}</p>
                                    <p>{selectedProject.assignedEPC.phone || selectedProject.assignedEPC.email || 'N/A'}</p>
                                  </>
                                ) : "No EPC assigned yet."
                              ) : (
                                <>
                                  <p className="font-bold">{selectedProject.customerName}</p>
                                  <p>{selectedProject.customerPhone || selectedProject.customerEmail || 'N/A'}</p>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {step.description && (
                        <p className="text-xs text-slate-600 font-medium leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100 animate-fadeIn">
                          {step.description}
                        </p>
                      )}
                      
                      {step.adminNote && (
                        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 font-medium">
                          📌 <strong>Admin Note:</strong> {step.adminNote}
                        </div>
                      )}

                      {isDone && (
                        <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 text-xs font-bold text-emerald-700 flex items-center justify-between">
                          <span>✓ Completed by {step.completedBy || "User"}</span>
                          {step.evidenceUrl && (
                            <a href={API_BASE + step.evidenceUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1.5 font-bold">
                              <Eye className="w-3.5 h-3.5"/> View Document
                            </a>
                          )}
                        </div>
                      )}

                      {step.evidenceNote && (
                        <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium italic text-slate-700">
                          "{step.evidenceNote}"
                        </div>
                      )}
                      
                      {canBdeDo && !isDone && (() => {
                        const previousStepsCompleted = selectedProject.steps.slice(0, idx).every(s => s.status === "completed" || s.status === "skipped");
                        return (
                          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-left">
                            <p className="text-xs font-bold text-amber-900">Complete this step on behalf of customer:</p>
                            {!previousStepsCompleted ? (
                              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-750 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                Please complete all previous steps first.
                              </div>
                            ) : (
                              <>
                                <input 
                                  type="text" 
                                  placeholder="Add a note (optional)..."
                                  className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-amber-500 bg-white focus:outline-none"
                                  value={bdeEvidenceNote}
                                  onChange={e => setBdeEvidenceNote(e.target.value)}
                                />
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <input 
                                    type="file" 
                                    onChange={e => setBdeUploadFile(e.target.files?.[0])}
                                    className="text-xs text-slate-500"
                                  />
                                  <button 
                                    onClick={() => {
                                      handleCompleteForCustomer(selectedProject._id, step.stepId, bdeUploadFile, bdeEvidenceNote);
                                      setBdeUploadFile(null);
                                      setBdeEvidenceNote("");
                                    }}
                                    disabled={completingId === step.stepId}
                                    className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-yellow-950 font-black text-xs rounded-xl transition flex items-center gap-1 shadow-sm sm:ml-auto cursor-pointer"
                                  >
                                    {completingId === step.stepId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                    Submit & Complete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })()}
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
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm font-bold text-slate-800">EPC Assigned</p>
            </div>
          ) : (
            <p className="text-xs text-blue-700 font-medium italic">EmergeSun / BDE is curating the best certified installer partner for this property.</p>
          )}
        </div>

        {/* Installation Date Negotiation UI */}
        {selectedProject.assignedEPCId && (
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-black text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-2">
              <Clock className="w-5 h-5 text-amber-500" /> Installation Date Scheduling
            </h3>
            
            {selectedProject.isInstallDateFixed ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-green-800 uppercase tracking-wider">Final Date Fixed</p>
                  <p className="text-xl font-black text-green-900 mt-1">
                    {new Date(selectedProject.preferredInstallDate || selectedProject.installDateNegotiation?.finalInstallationDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Propose Date (if not proposed yet) */}
                {!selectedProject.installDateNegotiation?.proposedDateByBde && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <p className="text-sm text-slate-700 font-medium mb-3">
                      Propose an initial installation date to the EPC and Customer:
                    </p>
                    <div className="flex gap-3">
                      <input 
                        type="date"
                        value={proposedDate}
                        onChange={(e) => setProposedDate(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-amber-400 focus:outline-none flex-1"
                      />
                      <button 
                        onClick={() => handleProposeDate(selectedProject._id)}
                        disabled={isSubmittingDate || !proposedDate}
                        className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
                      >
                        {isSubmittingDate ? 'Submitting...' : 'Propose Date'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Status of Proposed Date */}
                {selectedProject.installDateNegotiation?.proposedDateByBde && (
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Proposed Date</p>
                      <p className="text-lg font-black text-blue-900">
                        {new Date(selectedProject.installDateNegotiation.proposedDateByBde).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* EPC Status */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">EPC Partner Response</p>
                        <div className="flex items-center gap-2">
                          {selectedProject.installDateNegotiation.epcStatus === 'pending' && <span className="text-slate-600 font-bold text-sm">Pending</span>}
                          {selectedProject.installDateNegotiation.epcStatus === 'accepted' && <span className="text-green-600 font-bold text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Accepted</span>}
                          {selectedProject.installDateNegotiation.epcStatus === 'rejected' && <span className="text-red-600 font-bold text-sm flex items-center gap-1"><XCircle className="w-4 h-4"/> Rejected</span>}
                        </div>
                        {selectedProject.installDateNegotiation.epcNote && (
                          <p className="text-xs text-slate-600 mt-2 bg-white p-2 rounded border border-slate-100">"{selectedProject.installDateNegotiation.epcNote}"</p>
                        )}
                        {selectedProject.installDateNegotiation.epcProposedAlternateDate && (
                          <p className="text-[10px] text-amber-600 font-bold mt-1">Suggested: {new Date(selectedProject.installDateNegotiation.epcProposedAlternateDate).toLocaleDateString()}</p>
                        )}
                      </div>

                      {/* Customer Status */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Customer Response</p>
                        <div className="flex items-center gap-2">
                          {selectedProject.installDateNegotiation.customerStatus === 'pending' && <span className="text-slate-600 font-bold text-sm">Pending</span>}
                          {selectedProject.installDateNegotiation.customerStatus === 'accepted' && <span className="text-green-600 font-bold text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Accepted</span>}
                          {selectedProject.installDateNegotiation.customerStatus === 'rejected' && <span className="text-red-600 font-bold text-sm flex items-center gap-1"><XCircle className="w-4 h-4"/> Rejected</span>}
                        </div>
                        {selectedProject.installDateNegotiation.customerNote && (
                          <p className="text-xs text-slate-600 mt-2 bg-white p-2 rounded border border-slate-100">"{selectedProject.installDateNegotiation.customerNote}"</p>
                        )}
                        {selectedProject.installDateNegotiation.customerProposedAlternateDate && (
                          <p className="text-[10px] text-amber-600 font-bold mt-1">Suggested: {new Date(selectedProject.installDateNegotiation.customerProposedAlternateDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>

                    {/* Fix Final Date (Visible once both have responded, or BDE decides to force it) */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-4 text-white">
                      <p className="text-sm font-medium mb-3">
                        Fix the Final Installation Date (this locks the date for both parties):
                      </p>
                      <div className="flex gap-3">
                        <input 
                          type="date"
                          value={finalDate}
                          onChange={(e) => setFinalDate(e.target.value)}
                          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:border-amber-400 focus:outline-none flex-1"
                        />
                        <button 
                          onClick={() => handleFixFinalDate(selectedProject._id)}
                          disabled={isSubmittingDate || !finalDate}
                          className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
                        >
                          {isSubmittingDate ? 'Fixing...' : 'Fix Final Date'}
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  

  return (
    <div className="space-y-4">
      {/* Overdue Popup Modal */}
      {showOverduePopup && (
         <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border-2 border-red-500 animate-in zoom-in-95 duration-300">
             <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-3">
               <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                 <AlertCircle className="w-5 h-5 text-red-600 animate-pulse" />
               </div>
               <div>
                 <h3 className="font-black text-red-900 leading-tight">Overdue Action Required!</h3>
                 <p className="text-xs font-bold text-red-700 mt-0.5">Please check immediately</p>
               </div>
             </div>
             <div className="p-5">
               <p className="text-sm text-slate-600 mb-4">
                 Project <strong className="text-slate-800">{showOverduePopup.project.customerName}</strong> in <strong className="text-slate-800">{showOverduePopup.project.district}</strong> is overdue by <strong className="text-red-600">{showOverduePopup.info.days} days</strong>.
               </p>
               <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-5">
                 <span className="text-xs font-bold text-slate-500 block mb-1">Overdue Step:</span>
                 <p className="text-sm font-black text-slate-800">{showOverduePopup.info.stepTitle}</p>
                 <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-black uppercase ${showOverduePopup.info.type === 'customer' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'}`}>
                   {showOverduePopup.info.type === 'customer' ? 'Customer Side' : 'EPC Side'}
                 </span>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => setShowOverduePopup(null)} className="flex-1 py-2 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">
                   Snooze
                 </button>
                 <button onClick={() => { 
                   setShowOverduePopup(null); 
                   setSelectedProjectId(showOverduePopup.project._id); 
                 }} className="flex-1 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-sm hover:shadow-md">
                   View Project
                 </button>
               </div>
             </div>
           </div>
         </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-2 text-sm font-bold shadow-sm flex-wrap">
        {drillLevel > 0 && (
          <button 
            onClick={() => handleDrillUp(drillLevel - 1)} 
            className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg mr-2 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        <span 
          onClick={() => handleDrillUp(0)} 
          className={`cursor-pointer ${drillLevel === 0 ? 'text-slate-800' : 'text-blue-600 hover:underline'}`}
        >
          All Project Types
        </span>
        
        {drillLevel > 0 && (
          <>
            <span className="text-slate-400">/</span>
            <span 
              onClick={() => handleDrillUp(1)} 
              className={`cursor-pointer ${drillLevel === 1 ? 'text-slate-800' : 'text-blue-600 hover:underline'}`}
            >
              {drillPath.projectType}
            </span>
          </>
        )}
        
        {drillLevel > 1 && (
          <>
            <span className="text-slate-400">/</span>
            <span 
              onClick={() => handleDrillUp(2)} 
              className={`cursor-pointer ${drillLevel === 2 ? 'text-slate-800' : 'text-blue-600 hover:underline'}`}
            >
              {drillPath.state}
            </span>
          </>
        )}

        {drillLevel > 2 && (
          <>
            <span className="text-slate-400">/</span>
            <span 
              onClick={() => handleDrillUp(3)} 
              className={`cursor-pointer ${drillLevel === 3 ? 'text-slate-800' : 'text-blue-600 hover:underline'}`}
            >
              {drillPath.district}
            </span>
          </>
        )}

        {drillLevel > 3 && (
          <>
            <span className="text-slate-400">/</span>
            <span 
              onClick={() => handleDrillUp(4)} 
              className={`cursor-pointer ${drillLevel === 4 ? 'text-slate-800' : 'text-blue-600 hover:underline'}`}
            >
              {drillPath.statusType === 'on-time' ? 'On-Time Orders' : 'Overdue Orders'}
            </span>
          </>
        )}

        {drillLevel > 4 && drillPath.statusType === 'overdue' && (
          <>
            <span className="text-slate-400">/</span>
            <span 
              onClick={() => handleDrillUp(5)} 
              className={`cursor-pointer ${drillLevel === 5 ? 'text-slate-800' : 'text-blue-600 hover:underline'}`}
            >
              {drillPath.overdueType === 'customer' ? 'Customer Overdue' : 'EPC Overdue'}
            </span>
          </>
        )}

        {drillLevel > 5 && drillPath.stageName && (
          <>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800">
              {drillPath.stageName}
            </span>
          </>
        )}
      </div>

      {/* Grid of Folders / Cards */}
      {drillLevel < 6 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentOptions.length === 0 && (
             <div className="col-span-full text-center p-12 bg-white rounded-2xl border border-dashed border-slate-200">
               <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2"/>
               <p className="text-slate-500 font-bold">No customer projects found here yet.</p>
               <p className="text-xs text-slate-400">Projects will appear once BDE moves them to Order Journey.</p>
             </div>
          )}
          {currentOptions.map((opt, i) => {
            const colorClass = opt.color === 'emerald' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:border-emerald-400' :
                               opt.color === 'blue' ? 'bg-blue-50 border-blue-200 text-blue-800 hover:border-blue-400' :
                               opt.color === 'red' ? 'bg-red-50 border-red-200 text-red-800 hover:border-red-400' :
                               opt.color === 'orange' ? 'bg-orange-50 border-orange-200 text-orange-800 hover:border-orange-400' :
                               opt.color === 'purple' ? 'bg-purple-50 border-purple-200 text-purple-800 hover:border-purple-400' :
                               'bg-white border-slate-200 text-slate-800 hover:border-blue-400';
            
            return (
              <div 
                key={i}
                onClick={() => handleDrillDown(drillLevel, opt.value)}
                className={`p-6 rounded-2xl border shadow-sm cursor-pointer transition-all hover:shadow-md ${colorClass} flex flex-col justify-between h-32`}
              >
                <h3 className="font-black text-lg">{opt.label}</h3>
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold opacity-80">View Orders</span>
                  <span className="text-3xl font-black">{opt.count}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Actual Projects View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentOptions.length === 0 ? (
             <div className="col-span-full text-center p-12 bg-white rounded-2xl border border-dashed border-slate-200">
               <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2"/>
               <p className="text-slate-600 font-bold">No orders found</p>
             </div>
          ) : (
            currentOptions.map((project) => {
              const isAU = project.country === "australia" || filterCountry === "australia";
              const currencySymbol = isAU ? "$" : "₹";
              const info = getOverdueInfo(project);

              return (
                <div 
                  key={project._id} 
                  onClick={() => setSelectedProjectId(project._id)}
                  className={`bg-white rounded-2xl p-5 border-2 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between gap-3 group ${
                    info.isOverdue ? (info.type === 'customer' ? 'border-orange-300' : 'border-purple-300') : 'border-slate-200 hover:border-amber-400'
                  }`}
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
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-2.5">
                    {info.isOverdue && (
                      <div className={`p-2 rounded-lg border text-xs font-bold mb-2 ${
                        info.type === 'customer' ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-purple-50 border-purple-200 text-purple-800'
                      }`}>
                        <div className="flex items-center gap-1 mb-1">
                          <AlertCircle className="w-3.5 h-3.5" /> 
                          {info.type === 'customer' ? 'Customer Step Overdue' : 'EPC Step Overdue'}
                        </div>
                        <p className="text-[10px] opacity-90 leading-tight">Step: {info.stepTitle}</p>
                        <p className="text-[10px] opacity-90 mt-0.5">Overdue by: <span className="text-red-600 font-black">{info.days} days</span></p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold">Progress</span>
                      <span className="font-black text-amber-700">{project.completionPercentage || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-400 to-yellow-500 h-2 rounded-full transition-all" style={{ width: `${project.completionPercentage || 0}%` }}></div>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs font-black text-amber-600 group-hover:underline border-t border-slate-100 mt-1">
                    <span>Open Live Tracking UI →</span>
                    <span className="text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-amber-800">
                      BDE View
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
