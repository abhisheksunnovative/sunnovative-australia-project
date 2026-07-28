import React, { useState, useEffect } from "react";
import { CheckCircle, Clock, Upload, Eye, Search, AlertCircle, FileText } from "lucide-react";

export default function BDEProjectTracking({ bdeId }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

  useEffect(() => {
    if (!bdeId) return;
    fetchProjects();
  }, [bdeId]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/bde/${bdeId}/projects`);
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

      <div className="grid grid-cols-1 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl border border-dashed border-gray-200">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
            <p className="text-gray-500 font-medium">No active projects found.</p>
            <p className="text-gray-400 text-sm mt-1">Convert a lead to see it here.</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div key={project._id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-gray-900 text-lg">{project.customerName}</h3>
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                      {project.orderNumber || 'Pending ID'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{project.projectType} • {project.systemSizeKW} kW • ₹{project.monthlyBillAmount} Bill</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900 mb-1">{project.completionPercentage}% Completed</div>
                  <div className="w-32 bg-gray-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${project.completionPercentage}%` }}></div>
                  </div>
                </div>
              </div>

              {/* SITE LOCATION & ROOFTOP EVIDENCE PANEL FOR BDE */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-800">Site Location & Rooftop Evidence</h3>
                    <p className="text-xs text-slate-500 mt-0.5 mb-3">
                      View customer's submitted details. (Admin will qualify/reject this lead based on these images).
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Rooftop Photo</p>
                        {project.rooftopPhoto ? (
                          <img src={project.rooftopPhoto.startsWith('http') ? project.rooftopPhoto : `${API_BASE}/uploads/${project.rooftopPhoto.split('/').pop()}`} alt="Rooftop" className="w-full h-24 object-cover rounded-lg" />
                        ) : (
                          <div className="w-full h-24 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 text-xs">No photo uploaded</div>
                        )}
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">GPS Location</p>
                        {project.location?.latitude && project.location?.longitude ? (
                          <div className="h-full flex flex-col justify-center">
                            <p className="font-mono text-xs text-slate-700 font-bold mb-1">Lat: {project.location.latitude.toFixed(6)}</p>
                            <p className="font-mono text-xs text-slate-700 font-bold">Lng: {project.location.longitude.toFixed(6)}</p>
                            <a href={`https://maps.google.com/?q=${project.location.latitude},${project.location.longitude}`} target="_blank" rel="noreferrer" className="mt-2 text-[10px] text-blue-600 font-bold hover:underline">
                              View on Maps
                            </a>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-slate-400 text-xs">No GPS data</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Journey Steps */}
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {project.steps?.map((step) => (
                  <div key={step.stepId} className={`p-3 rounded-lg border ${step.status === 'completed' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-sm text-gray-900 flex items-center gap-1.5">
                        {step.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-500" />
                        )}
                        {step.title}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{step.description}</p>
                    
                    {step.status === 'completed' ? (
                      <div className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                        Completed
                        {step.evidenceUrl && (
                          <a href={API_BASE + step.evidenceUrl} target="_blank" rel="noreferrer" className="ml-auto text-blue-600 hover:underline flex items-center gap-1">
                            <Eye className="w-3 h-3"/> View Doc
                          </a>
                        )}
                      </div>
                    ) : step.requiresDoc ? (
                      <label className="flex items-center justify-center gap-2 w-full py-1.5 px-2 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition">
                        <Upload className="w-3 h-3" />
                        Upload Document
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleUploadDoc(project._id, step.stepId, e.target.files[0])}
                        />
                      </label>
                    ) : (
                      <div className="text-xs font-medium text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3"/> Pending EPC Action
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
