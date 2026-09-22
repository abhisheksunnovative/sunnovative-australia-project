import React, { useState, useEffect } from "react";
import {
  FileCheck, AlertTriangle, Building, CreditCard, User, ShieldCheck, UserCheck, 
  MapPin, ChevronRight, UploadCloud, X, CheckCircle, FileText
} from "lucide-react";
import { StatusBadge, EmptyState } from "./CommonUI";
import { fetchWithCache } from '../utils/fetchWithCache';

export const KycScreen = () => {
  const [level, setLevel] = useState("country"); // country, state, epcs
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  
  const [epcs, setEpcs] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);

  const [liveCountries, setLiveCountries] = useState([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";
        const res = await fetchWithCache(`${API_BASE}/api/countries`);
        const data = await res.json();
        if (data.success && data.data) {
          setLiveCountries(data.data.filter(c => c.isActive));
        } else if (Array.isArray(data)) {
          setLiveCountries(data.filter(c => c.isActive));
        }
      } catch (err) {
        console.error("Failed to fetch live countries:", err);
      }
    };
    fetchCountries();
  }, []);

  // Fetch states from unified geography or map (fallback to static for now)
  const getStates = (countryName) => {
    const c = countryName?.toLowerCase();
    if (c === "india") return ["All", "Delhi", "Maharashtra", "Karnataka", "Gujarat", "Rajasthan", "Uttar Pradesh", "Tamil Nadu", "Haryana"];
    if (c === "australia") return ["All", "NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];
    return ["All"];
  };

  const fetchEpcs = async (country, state) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || "admin_super_secret_token_12345";
      const res = await fetch(`/api/kyc/epcs?country=${country}&state=${state}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setEpcs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequirements = async (country, state) => {
    try {
      const token = localStorage.getItem("token") || "admin_super_secret_token_12345";
      const res = await fetch(`/api/kyc/requirements?country=${country}&state=${state}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRequirements(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCountryClick = (countryName) => {
    setSelectedCountry(countryName);
    setLevel("state");
  };

  const handleStateClick = (stateName) => {
    setSelectedState(stateName);
    setLevel("epcs");
    fetchEpcs(selectedCountry, stateName);
    fetchRequirements(selectedCountry, stateName);
  };

  const [viewingEpc, setViewingEpc] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [newDocName, setNewDocName] = useState("");

  const handleAddRequirement = async () => {
    if (!newDocName) return;
    try {
      const token = localStorage.getItem("token") || "admin_super_secret_token_12345";
      await fetch('/api/kyc/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ country: selectedCountry, state: selectedState, documentName: newDocName })
      });
      setNewDocName("");
      fetchRequirements(selectedCountry, selectedState);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token") || "admin_super_secret_token_12345";
      await fetch(`/api/kyc/epcs/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      setViewingEpc(null);
      fetchEpcs(selectedCountry, selectedState);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-6">
        <button onClick={() => setLevel("country")} className="hover:text-solar-sky">Countries</button>
        {level !== "country" && (
          <>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => setLevel("state")} className="hover:text-solar-sky">{selectedCountry}</button>
          </>
        )}
        {level === "epcs" && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900">{selectedState}</span>
          </>
        )}
      </div>

      {level === "country" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {liveCountries.map(c => (
            <div key={c._id} onClick={() => handleCountryClick(c.name)} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-solar-sky cursor-pointer transition-all flex flex-col items-center gap-4">
              <span className="text-5xl">{c.flagEmoji || '🌍'}</span>
              <h3 className="text-xl font-bold text-slate-800">{c.name}</h3>
            </div>
          ))}
        </div>
      )}

      {level === "state" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {getStates(selectedCountry).map(s => (
            <div key={s} onClick={() => handleStateClick(s)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-orange-500 cursor-pointer flex items-center gap-3">
              <MapPin className="w-6 h-6 text-slate-400" />
              <span className="font-semibold text-slate-700">{s}</span>
            </div>
          ))}
        </div>
      )}

      {level === "epcs" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">EPC KYC Approvals ({selectedState})</h2>
            <button onClick={() => setShowConfig(true)} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Configure Mandatory Docs
            </button>
          </div>

          {loading ? (
            <div className="text-center p-12">Loading EPCs...</div>
          ) : epcs.length === 0 ? (
            <EmptyState icon={<ShieldCheck />} title="No EPCs Found" description={`No EPCs registered in ${selectedState} yet.`} />
          ) : (
            <div className="flex flex-col gap-4">
              {epcs.map(epc => (
                <div key={epc._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <Building className="w-6 h-6 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{epc.companyName}</h3>
                      <p className="text-xs text-slate-500">{epc.ownerName} • {epc.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <StatusBadge status={epc.onboardingStatus} />
                    <button 
                      onClick={() => setViewingEpc(epc)}
                      className="w-full md:w-auto bg-solar-sky text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors"
                    >
                      View Docs & Agreement
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View Docs Modal */}
      {viewingEpc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{viewingEpc.companyName} - KYC Review</h3>
                <p className="text-xs text-slate-500">Status: {viewingEpc.onboardingStatus}</p>
              </div>
              <button onClick={() => setViewingEpc(null)} className="p-2 hover:bg-slate-200 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <h4 className="text-sm font-bold text-slate-800 border-b pb-2">Mandatory Documents ({requirements.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requirements.map(req => {
                  const uploaded = viewingEpc.kycDocuments?.dynamicDocuments?.find(d => d.documentName === req.documentName);
                  return (
                    <div key={req._id} className="border border-slate-200 p-4 rounded-xl flex items-start gap-3">
                      {uploaded ? <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{req.documentName}</p>
                        {uploaded ? (
                          <a href={uploaded.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-solar-sky underline flex items-center gap-1 mt-1">
                            <FileText className="w-3 h-3" /> View Uploaded File
                          </a>
                        ) : (
                          <p className="text-xs text-slate-400 mt-1">Pending Upload</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button onClick={() => handleUpdateStatus(viewingEpc._id, 'Rejected')} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white text-red-600 border border-red-200 hover:bg-red-50">
                Reject KYC
              </button>
              <button onClick={() => handleUpdateStatus(viewingEpc._id, 'Approved')} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/20">
                Approve KYC & Enable Orders
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Config Modal */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Configure Docs for {selectedState}</h3>
              <button onClick={() => setShowConfig(false)} className="p-2 hover:bg-slate-200 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                {requirements.map(r => (
                  <div key={r._id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-sm font-medium">{r.documentName}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input 
                  type="text" 
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="New Document Name (e.g. ABN Certificate)" 
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm" 
                />
                <button onClick={handleAddRequirement} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold">Add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycScreen;
