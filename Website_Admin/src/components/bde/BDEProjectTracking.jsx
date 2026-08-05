import React, { useState, useEffect } from "react";
import { CheckCircle, Clock, Upload, Eye, Search, AlertCircle, FileText, Check, XCircle } from "lucide-react";
import HorizontalJourneyTracker from "../HorizontalJourneyTracker";

export default function BDEProjectTracking({ bdeId }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterProjectType, setFilterProjectType] = useState("");
  const [availableDiscoms, setAvailableDiscoms] = useState([]);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

  // Predefined states for various countries
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
        setProjects(data.projects);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleUploadDoc = async (projectId, stepId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/api/bde/projects/${projectId}/step/${stepId}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert("Document uploaded and step completed successfully!");
        fetchProjects();
      } else {
        alert("Upload failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading document");
    }
  };

  const filteredProjects = projects.filter(p => 
    p.customerName?.toLowerCase().includes(search.toLowerCase()) || 
    p.orderNumber?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading Active Projects...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-xl font-bold text-gray-900">My Active Projects</h2>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search customer or order..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500/20 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="bg-slate-800 p-4 rounded-xl shadow-inner flex flex-wrap gap-4 overflow-x-auto items-end">
        <div className="flex flex-col flex-1 min-w-[120px]">
          <select value={filterCountry} onChange={e => { setFilterCountry(e.target.value); setFilterState(""); setFilterDistrict(""); }}
            className="text-sm font-bold text-white border border-slate-600 rounded-lg px-3 py-2 bg-slate-700 focus:outline-none focus:border-yellow-400">
            <option value="">🌍 All Countries</option>
            <option value="india">🇮🇳 India</option>
            <option value="australia">🇦🇺 Australia</option>
            <option value="newzealand">🇳🇿 New Zealand</option>
          </select>
        </div>
        <div className="flex flex-col flex-1 min-w-[120px]">
          <select value={filterState} onChange={e => { setFilterState(e.target.value); setFilterDistrict(""); }} disabled={!filterCountry}
            className="text-sm font-semibold text-white border border-slate-600 rounded-lg px-3 py-2 bg-slate-700 focus:outline-none focus:border-yellow-400 disabled:opacity-50">
            <option value="">All States</option>
            {allStates.map(state => <option key={state} value={state}>{state}</option>)}
          </select>
        </div>
        <div className="flex flex-col flex-1 min-w-[120px]">
          <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} disabled={!filterCountry}
            className="text-sm font-semibold text-white border border-slate-600 rounded-lg px-3 py-2 bg-slate-700 focus:outline-none focus:border-yellow-400 disabled:opacity-50">
            <option value="">All Districts</option>
            {availableDistricts.map(dist => <option key={dist} value={dist}>{dist}</option>)}
          </select>
        </div>
        <div className="flex flex-col flex-1 min-w-[120px]">
          <select value={filterProjectType} onChange={e => setFilterProjectType(e.target.value)}
            className="text-sm font-semibold text-white border border-slate-600 rounded-lg px-3 py-2 bg-slate-700 focus:outline-none focus:border-yellow-400">
            <option value="">All Types</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="group">Group / Society</option>
            <option value="common-meter">Common Meter</option>
          </select>
        </div>
        {(search || filterCountry || filterState || filterDistrict || filterProjectType) && (
          <button onClick={() => { setSearch(""); setFilterCountry(""); setFilterState(""); setFilterDistrict(""); setFilterProjectType(""); }} className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-400 bg-slate-700 border border-red-500/30 rounded-lg hover:bg-red-500/10 hover:text-red-300">
            Clear Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl border border-dashed border-gray-200">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
            <p className="text-gray-500 font-medium">No active projects found.</p>
            <p className="text-gray-400 text-sm mt-1">Convert a lead to see it here.</p>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const isAU = project.country === "australia" || filterCountry === "australia";
            const currencySymbol = isAU ? "$" : "₹";
            // Group other projects by same customer mobile
            const relatedCustomerProjects = projects.filter(p => p.customerMobile && p.customerMobile === project.customerMobile);

            return (
              <div key={project._id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4">
                
                {/* Customer Multi-Project Tabs */}
                {relatedCustomerProjects.length > 1 && (
                  <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-bold w-max mb-2">
                    <span className="text-slate-500 px-2 uppercase text-[10px]">Customer Applications ({relatedCustomerProjects.length}):</span>
                    {relatedCustomerProjects.map((rp, rIdx) => (
                      <span key={rp._id} className={`px-3 py-1 rounded-lg ${rp._id === project._id ? "bg-blue-600 text-white shadow-sm" : "bg-white text-slate-700"}`}>
                        #{rIdx + 1} - {rp.projectTypeLabel || rp.projectType} ({rp.orderNumber})
                      </span>
                    ))}
                  </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-black text-slate-900 text-xl">{project.customerName}</h3>
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-extrabold uppercase border border-blue-200">
                        {project.orderNumber || 'Pending ID'}
                      </span>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-extrabold uppercase border border-emerald-200">
                        {project.status}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-500">{project.projectTypeLabel || project.projectType} Solar • {project.location?.city || project.district || 'Location'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-800 mb-1">{project.completionPercentage || 25}% Progress</div>
                    <div className="w-36 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2.5 rounded-full" style={{ width: `${project.completionPercentage || 25}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* 3 Metric Cards (Matching Customer View) */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-900 text-white p-3 rounded-xl text-center">
                    <p className="text-[9px] font-black uppercase text-slate-400">SYSTEM</p>
                    <p className="text-sm font-black mt-0.5">{project.systemSizeKW || 6.6} kW</p>
                  </div>
                  <div className="bg-slate-900 text-white p-3 rounded-xl text-center">
                    <p className="text-[9px] font-black uppercase text-slate-400">TOTAL COST</p>
                    <p className="text-sm font-black mt-0.5">{currencySymbol}{(project.totalProjectCost || project.systemSizeKW * 1100 || 65000).toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-900 text-white p-3 rounded-xl text-center">
                    <p className="text-[9px] font-black uppercase text-slate-400">{isAU ? "STC REBATE" : "SUBSIDY"}</p>
                    <p className="text-sm font-black mt-0.5 text-emerald-400">{currencySymbol}{(project.estimatedSubsidy || 1710).toLocaleString()}</p>
                  </div>
                </div>

                {/* Assigned EPC Installer Details */}
                <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-4">
                  <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider mb-2">Assigned EPC Installation Partner</h4>
                  {project.assignedEPCName ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div><p className="text-slate-400 font-medium">Company</p><p className="font-bold text-slate-800">{project.assignedEPCName}</p></div>
                      <div><p className="text-slate-400 font-medium">Contact Person</p><p className="font-bold text-slate-800">{project.epcDetails?.contactPerson || "Installer Representative"}</p></div>
                      <div><p className="text-slate-400 font-medium">Phone</p><p className="font-bold text-slate-800">{project.epcDetails?.contactPersonMobile || "+61 400 123 456"}</p></div>
                      <div><p className="text-slate-400 font-medium">Location</p><p className="font-bold text-slate-800">{project.epcDetails?.city || "Sydney"}, {project.epcDetails?.state || "NSW"}</p></div>
                    </div>
                  ) : (
                    <p className="text-xs text-blue-700 italic">BDE / Admin is curating the best certified installer partner for this property.</p>
                  )}
                </div>

                {/* Horizontal Live Journey Tracker */}
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Live Journey Tracking Engine &amp; Step Cards</h4>
                    <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">⚡ BDE ON-BEHALF MODE ACTIVE</span>
                  </div>
                  <HorizontalJourneyTracker 
                    steps={project.steps} 
                    isBDE={true}
                    onExecuteStep={(stepId, file, note) => handleUploadDoc(project._id, stepId, file)}
                  />
                </div>

                {/* Step Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  {project.steps?.map((step) => (
                    <div key={step.stepId} className={`p-3 rounded-xl border text-xs ${step.status === 'completed' ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          {step.status === 'completed' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Clock className="w-3.5 h-3.5 text-amber-500" />}
                          {step.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2">{step.description}</p>
                      {step.status === 'completed' ? (
                        <div className="text-[11px] font-bold text-emerald-700 flex items-center justify-between">
                          <span>✓ Done</span>
                          {step.evidenceUrl && (
                            <a href={API_BASE + step.evidenceUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                              <Eye className="w-3 h-3"/> Doc
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Pending {step.assignedTo}</span>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
