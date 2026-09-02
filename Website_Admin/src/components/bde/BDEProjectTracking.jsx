import React, { useState, useEffect } from "react";
import { 
  Globe,
  CheckCircle, Clock, Upload, Eye, Search, AlertCircle, FileText, Check, XCircle, 
  ArrowLeft, Building, User, MapPin, Shield, Zap, BarChart3, ChevronDown, ChevronUp, Loader2
} from "lucide-react";
import HorizontalJourneyTracker from "../HorizontalJourneyTracker";
import { useAdminSettings } from "../../hooks/useAdminSettings";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

function BDEProjectTrackingContent({ bdeId, country, multiCountry }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Top Level Filters
  const [search, setSearch] = useState("");
    const [filterCountry, setFilterCountry] = useState(country || "");
  useEffect(() => {
    if (country) setFilterCountry(country);
  }, [country]);
  const [filterState, setFilterState] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterProjectType, setFilterProjectType] = useState("");
  const [validDistricts, setValidDistricts] = useState([]);
  
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [availableDiscoms, setAvailableDiscoms] = useState([]);
  const [completingId, setCompletingId] = useState(null);
  const [bdeUploadFile, setBdeUploadFile] = useState(null);
  const [bdeEvidenceNote, setBdeEvidenceNote] = useState("");
  const [expandedStepIndex, setExpandedStepIndex] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(null);
  const [bdeDetails, setBdeDetails] = useState(null);
  
  const { projectTypes: dynamicProjectTypes } = useAdminSettings(bdeDetails?.country || filterCountry || "india");

  // New Drill-down UI State
  const [drillLevel, setDrillLevel] = useState(0); 
  // 0: Main (Ontime / Overdue cards)
  // 1: Inside Overdue (Customer / EPC cards)
  // 2A: Inside EPC Overdue (Horizontal Stages -> List of EPCs)
  // 2B: Inside Customer Overdue (Horizontal Stages -> List of Customers)
  // 3A: Inside EPC Card (List of Customers for that EPC)
  
  const [drillPath, setDrillPath] = useState({
    statusType: null, // "on-time" | "overdue"
    overdueType: null, // "customer" | "epc"
    stageName: null, 
    epcId: null
  });

  useEffect(() => {
    const fetchBde = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/bde/${bdeId}`);
        const data = await res.json();
        if (data.success) {
           setBdeDetails(data.bde);
           if (!filterCountry && data.bde.country) setFilterCountry(data.bde.country);
        }
      } catch (e) {}
    };
    if (bdeId) fetchBde();
  }, [bdeId]);

  useEffect(() => {
    if (filterState) {
      const countryCode = bdeDetails?.country || filterCountry || 'india';
      fetch(`${API_BASE}/api/districts?state=${filterState}&country=${countryCode}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setValidDistricts(data.data.map(d => d.district));
          } else {
            setValidDistricts([]);
          }
        })
        .catch(() => setValidDistricts([]));
    } else {
      setValidDistricts([]);
    }
  }, [filterState, bdeDetails, filterCountry]);

  useEffect(() => {
    const fetchDiscoms = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/discom`);
        const data = await res.json();
        if (data.success) setAvailableDiscoms(data.data);
      } catch (err) {}
    };
    fetchDiscoms();
  }, []);

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

  
  useEffect(() => {
    if (dynamicProjectTypes && dynamicProjectTypes.length > 0 && !filterProjectType) {
      setFilterProjectType(dynamicProjectTypes[0].value);
    }
  }, [dynamicProjectTypes]);

  useEffect(() => {
    fetchProjects();
  }, [bdeId, search, filterCountry, filterState, filterDistrict, filterProjectType]);

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

  const handleBDECompleteStep = async (projectId, stepId) => {
    if (!window.confirm("Mark this step as completed by BDE?")) return;
    setCompletingId(stepId);
    try {
      const fd = new FormData();
      if (bdeEvidenceNote) fd.append("evidenceNote", bdeEvidenceNote);
      if (bdeUploadFile) fd.append("evidenceFile", bdeUploadFile);

      const res = await fetch(`${API_BASE}/api/bde/projects/${projectId}/steps/${stepId}/complete`, {
        method: "POST",
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        setBdeUploadFile(null);
        setBdeEvidenceNote("");
        alert("Step completed!");
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

  const handleDrillUp = (level) => {
    setDrillLevel(level);
  };

  if (loading && projects.length === 0) return <div className="p-8 text-center text-slate-500 font-bold flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin text-yellow-500" /> Loading Active Projects...</div>;

  const onTimeProjectsRaw = filteredProjects.filter(p => !getOverdueInfo(p).isOverdue);
  const overdueProjectsRaw = filteredProjects.filter(p => getOverdueInfo(p).isOverdue);

  // Filter out legacy/orphaned projects whose step no longer exists in the workflow template
  const activePt = dynamicProjectTypes ? dynamicProjectTypes.find(p => p.value === filterProjectType) : null;
  let validStepTitles = new Set();
  if (activePt) {
    activePt.steps.forEach(s => validStepTitles.add(s.title));
  } else if (dynamicProjectTypes) {
    dynamicProjectTypes.forEach(pt => pt.steps?.forEach(s => validStepTitles.add(s.title)));
  }

  const onTimeProjects = onTimeProjectsRaw.filter(p => validStepTitles.has(getOverdueInfo(p).stepTitle));
  const overdueProjects = overdueProjectsRaw.filter(p => validStepTitles.has(getOverdueInfo(p).stepTitle));

  // Derive All Unique Stages from all projects (to show horizontal list)
    // Pull all stages from dynamic settings if available
  let allStages = []; 
  if (filterProjectType && dynamicProjectTypes) {
    const pt = dynamicProjectTypes.find(p => p.value === filterProjectType);
    if (pt && pt.steps) allStages = pt.steps.map(s => s.title);
  } else if (dynamicProjectTypes && dynamicProjectTypes.length > 0) {
    // If "All Project Types" is selected, just show the steps of the first project type (usually Residential)
    if (dynamicProjectTypes[0].steps) allStages = dynamicProjectTypes[0].steps.map(s => s.title);
  }
  
  if (allStages.length === 0) {
    allStages = [...new Set(projects.flatMap(p => p.steps?.map(s => s.title) || []))];
  } else {
    // Ensure any orphaned/legacy steps that exist in active projects but not in the new journey settings are still appended
    const existingStages = new Set(allStages);
    const orphanedStages = [...new Set(projects.flatMap(p => p.steps?.map(s => s.title) || []))].filter(s => !existingStages.has(s));
    allStages = [...allStages, ...orphanedStages];
  }

  return (
    <div className="max-w-7xl w-full mx-auto space-y-5 pb-10">
      
      
      {selectedProjectId && selectedProject ? (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <button 
            onClick={() => setSelectedProjectId(null)} 
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to List
          </button>
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-1">
              {selectedProject.customerName}
            </h2>
            <div className="flex gap-4 text-xs font-bold text-slate-500 mb-6 border-b border-slate-100 pb-4">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {selectedProject.city || selectedProject.district || 'Location N/A'}</span>
              <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5"/> {selectedProject.systemCapacityKw || '0'} kW</span>
              <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5"/> {selectedProject.assignedEPCName || 'Pending EPC'}</span>
            </div>

            <HorizontalJourneyTracker 
              project={selectedProject}
              epcs={[]}
            />
            
                        {/* Detailed Step Breakdown imitating Customer Portal UI */}
            <div className="w-full space-y-3 mt-8 text-left">
              <h3 className="text-lg font-black text-slate-800 mb-4">Detailed Step Breakdown</h3>
              {selectedProject.steps?.map((step, i) => {
                const done = step.status === 'completed';
                const isOverdue = step.isOverdue;
                const isCurrent = step.status === 'in-progress' || step.status === 'pending';
                const isExpanded = expandedStepIndex === i;
                const previousStepsCompleted = i === 0 || selectedProject.steps[i - 1].status === 'completed';

                let roleColor = "bg-slate-100 text-slate-600";
                let roleLabel = "Admin";
                if (step.assignedTo === "bde") {
                  roleColor = "bg-blue-100 text-blue-700";
                  roleLabel = "BDE";
                } else if (step.assignedTo === "epc-partner") {
                  roleColor = "bg-orange-100 text-orange-700";
                  roleLabel = "EPC";
                } else if (step.assignedTo === "customer") {
                  roleColor = "bg-green-100 text-green-700";
                  roleLabel = "Customer";
                }

                return (
                  <div key={i} className={`border rounded-lg transition-all ${isCurrent && !done ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200/80 bg-white'}`}>
                    <div 
                      className="flex items-center justify-between py-1.5 px-3 cursor-pointer hover:bg-slate-50 rounded-lg"
                      onClick={() => setExpandedStepIndex(isExpanded ? null : i)}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                          done ? "bg-green-500 text-white" : 
                          isCurrent ? "border-[3px] border-amber-400 bg-white text-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.5)]" : 
                          "bg-slate-100 text-slate-300"
                        }`}>
                          {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                        </div>
                        <div>
                          <h4 className={`font-bold text-xs ${isCurrent && !done ? 'text-amber-700' : 'text-slate-700'}`}>
                            {step.title}
                          </h4>
                          <p className="text-[10px] font-bold mt-0.5 text-slate-400">
                            {done ? (
                              <span className="text-green-600 flex items-center gap-0.5"><CheckCircle className="w-3 h-3"/> Completed</span>
                            ) : isOverdue ? (
                              <span className="text-red-500 flex items-center gap-0.5"><AlertCircle className="w-3 h-3"/> OVERDUE</span>
                            ) : (
                              <span className={`uppercase px-1.5 py-0.5 rounded-md ${roleColor}`}>{roleLabel}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className={`text-slate-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-slate-100">
                        <div className="pl-9 space-y-3">
                          <p className="text-xs text-slate-500">{step.description || "No description provided."}</p>
                          
                          {isCurrent && !done && (
                            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-left">
                              <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-blue-500"/> Action on behalf of {step.assignedTo}:</p>
                              {!previousStepsCompleted ? (
                                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-[11px] font-bold text-red-600">
                                  Previous steps must be completed first.
                                </div>
                              ) : (
                                <div className="space-y-3 mt-2">
                                  <input 
                                    type="text" 
                                    placeholder="Add an evidence note or reference ID (optional)"
                                    value={bdeEvidenceNote}
                                    onChange={e => setBdeEvidenceNote(e.target.value)}
                                    className="w-full text-[11px] p-2 border border-slate-200 rounded-lg outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition"
                                  />
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="file" 
                                      id={`file-${step.stepId}`}
                                      onChange={e => setBdeUploadFile(e.target.files[0])}
                                      className="hidden"
                                    />
                                    <label htmlFor={`file-${step.stepId}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition text-[11px] font-bold text-slate-500">
                                      <Upload className="w-3 h-3" />
                                      <span className="truncate max-w-[100px]">{bdeUploadFile ? bdeUploadFile.name : "Upload File"}</span>
                                    </label>
                                    
                                    <button 
                                      onClick={() => handleBDECompleteStep(selectedProject._id, step._id)}
                                      disabled={completingId === step._id}
                                      className="flex-1 py-2 bg-yellow-400 hover:bg-amber-400 text-yellow-950 rounded-lg font-black text-[11px] flex justify-center items-center gap-1 shadow-sm transition disabled:opacity-50"
                                    >
                                      {completingId === step._id ? <Loader2 className="w-3 h-3 animate-spin"/> : <CheckCircle className="w-3 h-3" />}
                                      Mark Done
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top Level Filters & Search */}
          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
            <h2 className="text-sm font-black text-slate-800 mb-2">Customer Order Journey</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input 
                type="text"
                placeholder="Search by Name, Mobile, Order No..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition shadow-sm"
              />
              
              <select 
                value={filterState} 
                onChange={e => { setFilterState(e.target.value); setFilterDistrict(""); }}
                className="w-full text-xs font-bold text-slate-700 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 shadow-sm"
              >
                <option value="">All States</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="New South Wales">New South Wales</option>
                <option value="Victoria">Victoria</option>
                <option value="Queensland">Queensland</option>
              </select>
              <select 
                value={filterDistrict} 
                onChange={e => setFilterDistrict(e.target.value)}
                className="w-full text-xs font-bold text-slate-700 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 shadow-sm"
                disabled={!filterState}
              >
                <option value="">All Districts/Suburbs</option>
                {validDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            
            </div>
            
            <div className="w-full flex gap-2 overflow-x-auto pt-2 mt-2 border-t border-slate-100 scrollbar-hide">
              {dynamicProjectTypes.map(pt => {
                const isActive = filterProjectType === pt.value;
                return (
                  <button 
                    key={pt.value}
                    onClick={() => { setFilterProjectType(pt.value); setDrillLevel(0); }}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${isActive ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50'}`}
                  >
                    {pt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Breadcrumbs for Drilldown */}
          {drillLevel > 0 && (
            <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center gap-2 text-xs font-bold shadow-sm flex-wrap">
              <button onClick={() => handleDrillUp(drillLevel - 1)} className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg mr-2 transition">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <span onClick={() => handleDrillUp(0)} className="cursor-pointer text-blue-600 hover:underline">Home</span>
              
              {drillLevel > 0 && (
                <>
                  <span className="text-slate-400">/</span>
                  <span onClick={() => handleDrillUp(1)} className={`cursor-pointer ${drillLevel === 1 ? 'text-slate-800' : 'text-blue-600 hover:underline'}`}>
                    {drillPath.statusType === 'on-time' ? 'On-Time Orders' : 'Overdue Orders'}
                  </span>
                </>
              )}
              {drillLevel > 1 && drillPath.stageName && drillPath.statusType === 'overdue' && (
                <>
                  <span className="text-slate-400">/</span>
                  <span onClick={() => handleDrillUp(2)} className={`cursor-pointer ${drillLevel === 2 ? 'text-slate-800' : 'text-blue-600 hover:underline'}`}>
                    {drillPath.stageName}
                  </span>
                </>
              )}
              {drillLevel > 2 && drillPath.stepAssignedTo && drillPath.statusType === 'overdue' && (
                <>
                  <span className="text-slate-400">/</span>
                  <span onClick={() => handleDrillUp(3)} className={`cursor-pointer ${drillLevel === 3 ? 'text-slate-800' : 'text-blue-600 hover:underline'}`}>
                    {drillPath.stepAssignedTo === 'customer' ? 'Customer Steps Overdue' : 'EPC Steps Overdue'}
                  </span>
                </>
              )}
              {drillLevel > 3 && drillPath.epcId && drillPath.statusType === 'overdue' && (
                <>
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-800">EPC Details</span>
                </>
              )}
            </div>
          )}

          {/* RENDERING UI BASED ON DRILL LEVEL */}
          
          {drillLevel === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div onClick={() => { setDrillPath({...drillPath, statusType: 'on-time'}); setDrillLevel(1); }} className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-8 hover:shadow-xl hover:border-emerald-400 transition cursor-pointer group">
                <CheckCircle className="w-12 h-12 text-emerald-500 mb-4 group-hover:scale-110 transition-transform"/>
                <h3 className="text-2xl font-black text-emerald-900 mb-1">On-Time Orders</h3>
                <p className="text-emerald-700/80 font-bold text-sm mb-6">Running exactly as scheduled</p>
                <div className="text-5xl font-black text-emerald-600">{onTimeProjects.length}</div>
              </div>
              <div onClick={() => { setDrillPath({...drillPath, statusType: 'overdue'}); setDrillLevel(1); }} className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 hover:shadow-xl hover:border-red-400 transition cursor-pointer group">
                <Clock className="w-12 h-12 text-red-500 mb-4 group-hover:scale-110 transition-transform"/>
                <h3 className="text-2xl font-black text-red-900 mb-1">Overdue Orders</h3>
                <p className="text-red-700/80 font-bold text-sm mb-6">Requires immediate attention</p>
                <div className="text-5xl font-black text-red-600">{overdueProjects.length}</div>
              </div>
            </div>
          )}

          {/* ON-TIME PATH */}
          {drillLevel === 1 && drillPath.statusType === 'on-time' && (
            <div className="flex flex-col gap-4">
              {onTimeProjects.length === 0 && <div className="col-span-full text-center p-8 text-slate-500 font-bold">No on-time orders found.</div>}
              {onTimeProjects.map(p => (
                <div key={p._id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div>
                     <h3 className="font-black text-slate-800 text-lg mb-1">{p.customerName}</h3>
                     <p className="text-xs font-bold text-slate-400 mb-1">{p.orderNumber}</p>
                     <div className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-[10px] font-black uppercase">
                        On Time
                     </div>
                   </div>
                   <button onClick={() => setSelectedProjectId(p._id)} className="w-full md:w-auto px-8 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition text-sm shrink-0">
                     Live Tracking & Details
                   </button>
                </div>
              ))}
            </div>
          )}

          {/* OVERDUE PATH */}
          {drillLevel === 1 && drillPath.statusType === 'overdue' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <h3 className="font-black text-slate-800 text-sm mb-3">Overdue Journey Steps</h3>
                
                {/* Horizontal Timeline (Compact) */}
                <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
                  <div className="flex min-w-max px-2">
                    {(() => {
                      const pt = dynamicProjectTypes.find(p => p.value === filterProjectType);
                      if (!pt) return <div className="p-2 text-slate-500 font-bold text-xs">Please select a project type.</div>;
                      
                      const allStepsToRender = pt.steps.map(s => ({ title: s.title, assignedTo: s.assignedTo }));

                      return allStepsToRender.map((step, idx) => {
                        const stepProjects = overdueProjects.filter(p => {
                          const info = getOverdueInfo(p); 
                          return info.stepTitle === step.title;
                        });
                        const count = stepProjects.length;
                        
                        let roleColor = "bg-slate-100 text-slate-500";
                        if (step.assignedTo === "bde") roleColor = "bg-blue-100 text-blue-700";
                        else if (step.assignedTo === "epc-partner" || step.assignedTo === "epc") roleColor = "bg-purple-100 text-purple-700";
                        else if (step.assignedTo === "customer") roleColor = "bg-orange-100 text-orange-700";
                        
                        const hasOverdue = count > 0;

                        return (
                          <div 
                            key={step.title}
                            onClick={() => { if(hasOverdue) { setDrillPath({...drillPath, stageName: step.title, stepAssignedTo: step.assignedTo}); setDrillLevel(2); } }}
                            className={`relative flex flex-col items-center w-20 group ${hasOverdue ? 'cursor-pointer' : 'opacity-70'}`}
                          >
                            {/* Connector Line */}
                            {idx !== allStepsToRender.length - 1 && (
                              <div className={`absolute top-4 left-[50%] w-full h-[2px] z-0 ${hasOverdue ? 'bg-red-200' : 'bg-slate-100'}`} />
                            )}
                            
                            {/* Circle */}
                            <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs shadow-sm transition-transform ${hasOverdue ? 'border-red-500 bg-red-50 text-red-600 group-hover:scale-110 group-hover:shadow-md' : 'border-slate-200 bg-white text-slate-400'}`}>
                              {idx + 1}
                            </div>
                            
                            {/* Title */}
                            <p className="mt-2 text-[8px] font-bold text-slate-800 text-center leading-tight h-6 w-20 line-clamp-2 px-0.5">
                              {step.title}
                            </p>
                            
                            {/* Overdue Count */}
                            <div className={`mt-1 px-1.5 py-0.5 rounded text-[9px] font-black shadow-sm border ${hasOverdue ? 'bg-red-600 text-white border-red-700 animate-pulse' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                              {count}
                            </div>
                          </div>
                        )
                      });
                    })()}
                  </div>
                </div>
              </div>
              
              {/* Step Cards Grid (Compact Horizontal Cards) */}
              <div className="flex flex-col gap-3">
                {(() => {
                  const pt = dynamicProjectTypes.find(p => p.value === filterProjectType);
                  if (!pt) return null;
                  
                  return pt.steps.map((step, idx) => {
                    const stepProjects = overdueProjects.filter(p => {
                      const info = getOverdueInfo(p); 
                      return info.stepTitle === step.title;
                    });
                    const count = stepProjects.length;
                    
                    let roleColor = "bg-slate-100 text-slate-600 border-slate-200";
                    let roleLabel = "Admin";
                    if (step.assignedTo === "bde") {
                      roleColor = "bg-blue-50 text-blue-700 border-blue-200";
                      roleLabel = "BDE";
                    } else if (step.assignedTo === "epc-partner" || step.assignedTo === "epc") {
                      roleColor = "bg-purple-50 text-purple-700 border-purple-200";
                      roleLabel = "EPC";
                    } else if (step.assignedTo === "customer") {
                      roleColor = "bg-orange-50 text-orange-700 border-orange-200";
                      roleLabel = "Customer";
                    }
                    
                    const hasOverdue = count > 0;

                    return (
                      <div 
                        key={`card-${step.title}`}
                        onClick={() => { if (hasOverdue) { setDrillPath({...drillPath, stageName: step.title, stepAssignedTo: step.assignedTo}); setDrillLevel(2); } }}
                        className={`bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center justify-between gap-3 ${hasOverdue ? 'cursor-pointer hover:shadow-md hover:border-red-400 transition' : 'opacity-70'}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-black text-sm ${hasOverdue ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                            {idx + 1}
                          </div>
                          <div className="min-w-0 flex flex-col items-start gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${roleColor}`}>
                              {roleLabel}
                            </span>
                            <h4 className="font-bold text-slate-800 text-xs truncate w-full" title={step.title}>{step.title}</h4>
                          </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-end">
                          <span className="text-[10px] font-bold text-slate-500">Overdue</span>
                          <span className={`text-lg font-black leading-none ${hasOverdue ? 'text-red-600' : 'text-slate-300'}`}>{count}</span>
                        </div>
                      </div>
                    )
                  });
                })()}
              </div>
            </div>
          )}

          {/* DRILL LEVEL 2: DYNAMIC CARD */}
          {drillLevel === 2 && drillPath.statusType === 'overdue' && (
            <div className="mt-4">
              <h3 className="font-black text-slate-800 text-lg mb-4">Stage: {drillPath.stageName}</h3>
              {(() => {
                const isCustomer = drillPath.stepAssignedTo === 'customer';
                
                const projectsInStage = overdueProjects.filter(p => {
                  const info = getOverdueInfo(p);
                  return info.stepTitle === drillPath.stageName;
                });
                
                if (isCustomer) {
                  return (
                    <div 
                      onClick={() => setDrillLevel(3)} 
                      className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-8 hover:shadow-xl hover:border-orange-400 transition cursor-pointer group max-w-md"
                    >
                      <User className="w-10 h-10 text-orange-500 mb-4 group-hover:scale-110 transition-transform"/>
                      <h3 className="text-xl font-black text-orange-900 mb-1">Customer Steps Overdue</h3>
                      <div className="text-4xl font-black text-orange-600 mt-4">{projectsInStage.length}</div>
                    </div>
                  );
                } else {
                  return (
                    <div 
                      onClick={() => setDrillLevel(3)} 
                      className="bg-purple-50 border-2 border-purple-200 rounded-3xl p-8 hover:shadow-xl hover:border-purple-400 transition cursor-pointer group max-w-md"
                    >
                      <Building className="w-10 h-10 text-purple-500 mb-4 group-hover:scale-110 transition-transform"/>
                      <h3 className="text-xl font-black text-purple-900 mb-1">EPC Steps Overdue</h3>
                      <div className="text-4xl font-black text-purple-600 mt-4">{projectsInStage.length}</div>
                    </div>
                  );
                }
              })()}
            </div>
          )}

          {/* DRILL LEVEL 3 (EPC FLOW): EPC LIST */}
          {drillLevel === 3 && drillPath.statusType === 'overdue' && drillPath.stepAssignedTo !== 'customer' && (
            <div>
              <h3 className="font-black text-slate-800 text-lg mb-4">EPCs with Overdue Projects in "{drillPath.stageName}"</h3>
              <div className="flex flex-col gap-4">
                {(() => {
                  const projectsInStage = overdueProjects.filter(p => {
                    const info = getOverdueInfo(p);
                    return info.stepTitle === drillPath.stageName;
                  });
                  if (projectsInStage.length === 0) return <div className="col-span-full p-4 text-center font-bold text-slate-400">No EPCs active in this stage.</div>;
                  
                  const epcMap = {};
                  projectsInStage.forEach(p => {
                    const eid = p.assignedEpc || 'Unassigned';
                    if (!epcMap[eid]) epcMap[eid] = { id: eid, name: p.assignedEPCName || 'Unknown EPC', projects: [] };
                    epcMap[eid].projects.push(p);
                  });

                  return Object.values(epcMap).map(epc => (
                    <div 
                      key={epc.id} 
                      onClick={() => { setDrillPath({...drillPath, epcId: epc.id, epcName: epc.name}); setDrillLevel(4); }}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                       <div className="flex items-center gap-4 mb-0">
                         <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-black text-xl">
                           {epc.name.charAt(0).toUpperCase()}
                         </div>
                         <div>
                           <h4 className="font-black text-slate-800 text-base">{epc.name}</h4>
                           <p className="text-xs font-bold text-slate-500">{epc.projects.length} Overdue Projects</p>
                         </div>
                       </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* DRILL LEVEL 4 (EPC FLOW): CUSTOMER LIST */}
          {drillLevel === 4 && drillPath.statusType === 'overdue' && drillPath.stepAssignedTo !== 'customer' && (
            <div>
              <h3 className="font-black text-slate-800 text-lg mb-4">Overdue Projects for {drillPath.epcName}</h3>
              <div className="flex flex-col gap-4">
                {(() => {
                  return overdueProjects.filter(p => {
                    const info = getOverdueInfo(p);
                    return info.stepTitle === drillPath.stageName && (p.assignedEpc === drillPath.epcId || (p.assignedEpc == null && drillPath.epcId === 'Unassigned'));
                  }).map(p => (
                     <div key={p._id} className="bg-white rounded-2xl p-5 border border-purple-200 shadow-sm transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                       <div>
                         <h3 className="font-black text-slate-800 text-lg mb-1">{p.customerName}</h3>
                         <p className="text-xs font-bold text-slate-500 mb-2">{p.orderNumber}</p>
                         <div className="inline-block px-2 py-1 rounded text-[10px] font-black uppercase bg-red-50 text-red-700">
                           Overdue: {getOverdueInfo(p).days} days
                         </div>
                       </div>
                     </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* DRILL LEVEL 3 (CUSTOMER FLOW): CUSTOMER LIST */}
          {drillLevel === 3 && drillPath.statusType === 'overdue' && drillPath.stepAssignedTo === 'customer' && (
            <div>
              <h3 className="font-black text-slate-800 text-lg mb-4">Overdue Customer Projects in "{drillPath.stageName}"</h3>
              <div className="flex flex-col gap-4">
                {(() => {
                  return overdueProjects.filter(p => {
                    const info = getOverdueInfo(p);
                    return info.stepTitle === drillPath.stageName;
                  }).map(p => (
                     <div key={p._id} className="bg-white rounded-2xl p-5 border border-orange-200 shadow-sm transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                       <div>
                         <h3 className="font-black text-slate-800 text-lg mb-1">{p.customerName}</h3>
                         <p className="text-xs font-bold text-slate-500 mb-2">{p.orderNumber}</p>
                         <div className="inline-block px-2 py-1 rounded text-[10px] font-black uppercase bg-red-50 text-red-700">
                           Overdue: {getOverdueInfo(p).days} days
                         </div>
                       </div>
                       <button onClick={() => setSelectedProjectId(p._id)} className="w-full md:w-auto px-6 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition text-sm shrink-0">
                         Live Tracking & Details
                       </button>
                     </div>
                  ));
                })()}
              </div>
            </div>
          )}

        </>
      )}
    </div>
  );
}

export default function BDEProjectTracking({ bdeId }) {
  const [bdeCountries, setBdeCountries] = React.useState([]);
  const [selectedCountry, setSelectedCountry] = React.useState(null);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

  React.useEffect(() => {
    if (!bdeId) return;
    fetch(`${API_BASE}/api/bde/${bdeId}`).then(r=>r.json()).then(d => {
        if (d.success) {
           let data = d.data || d.bde;
           if (data) {
             let arr = data.assignedCountries || [];
             if (typeof arr === 'string') arr = arr.split(',').map(s=>s.trim()).filter(Boolean);
             let finalArr = arr.map(c => c.toLowerCase());
             if (finalArr.length === 0) finalArr = ["australia"]; // fallback
             setBdeCountries(finalArr);
             if (finalArr.length === 1) setSelectedCountry(finalArr[0].toLowerCase());
           }
        }
    }).catch(console.error);
  }, [bdeId]);

  if (bdeCountries.length === 0) return <div className="p-8 text-center text-slate-500 font-medium">Loading BDE Profile...</div>;

  if (bdeCountries.length > 1 && !selectedCountry) {
    return (
      <div className="p-8 max-w-7xl mx-auto font-sans">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Customer Order Journey</h1>
          <p className="text-slate-500">Select a country to view and manage active orders.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bdeCountries.map(c => (
            <div 
              key={c}
              onClick={() => setSelectedCountry(c)}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-600 cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <Globe className="w-10 h-10 text-slate-400 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-bold text-slate-700 capitalize group-hover:text-blue-700">{c}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {bdeCountries.length > 1 && (
        <button onClick={() => setSelectedCountry(null)} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition mb-4 ml-6 mt-4">
          <ArrowLeft className="w-4 h-4" /> Back to Countries
        </button>
      )}
      <BDEProjectTrackingContent bdeId={bdeId} country={selectedCountry} multiCountry={bdeCountries.length > 1} />
    </div>
  );
}
