import React, { useState, useEffect } from "react";
import { Search, MapPin, Hand, Filter, Globe, ArrowLeft } from "lucide-react";

export default function BDEDemandPool({ bdeId }) {
  const [bdeCountries, setBdeCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

  useEffect(() => {
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

  useEffect(() => {
    if (!bdeId) return;
    fetchDemandPool();
  }, [bdeId]);

  const fetchDemandPool = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/bde/${bdeId}/demand-pool`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleClaimLead = async (leadId) => {
    try {
      const res = await fetch(`${API_BASE}/api/bde/assign-lead`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, bdeId })
      });
      const data = await res.json();
      if (data.success) {
        alert("Lead claimed successfully! Check 'My Prospects'.");
        fetchDemandPool();
      } else {
        alert(data.message || "Failed to claim lead");
      }
    } catch (err) {
      console.error(err);
      alert("Error claiming lead");
    }
  };

  if (loading && bdeCountries.length === 0) return <div className="p-8 text-center text-gray-500 font-medium">Scanning BDE Profile...</div>;

  if (bdeCountries.length > 1 && !selectedCountry) {
    return (
      <div className="p-8 max-w-7xl mx-auto font-sans">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Demand Pool</h1>
          <p className="text-slate-500">Select a country to view available leads in that region.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bdeCountries.map(country => (
            <div 
              key={country}
              onClick={() => setSelectedCountry(country)}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#28377f] cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <Globe className="w-10 h-10 text-slate-400 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-bold text-slate-700 capitalize group-hover:text-[#28377f]">{country}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filteredLeads = leads.filter(l => (l.country || 'australia').toLowerCase() === (selectedCountry || '').toLowerCase()); // Fallback for old leads

  return (
    <div className="space-y-6">
      {bdeCountries.length > 1 && (
        <button onClick={() => setSelectedCountry(null)} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Countries
        </button>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="font-medium">Unclaimed Leads in <span className="capitalize text-blue-700 font-bold">{selectedCountry}</span> territory</span>
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredLeads.length} available opportunities
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
           <div className="col-span-1 lg:col-span-2 p-12 text-center text-gray-500">Loading leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="col-span-1 lg:col-span-2 p-12 text-center bg-white rounded-xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 font-medium text-lg">No unassigned leads found in your territory for <span className="capitalize">{selectedCountry}</span>.</p>
            <p className="text-gray-400 text-sm mt-1">Check back later or expand your assigned regions.</p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <div key={lead._id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition group">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{lead.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin className="w-4 h-4 text-gray-400" /> 
                    {lead.district}, {lead.state} - {lead.pincode}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                    {lead.solarType}
                  </span>
                  <div className="text-sm font-bold text-gray-900 mt-1">{lead.kw} kW</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50 my-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Monthly Bill</p>
                  <p className="font-medium text-gray-900">₹{lead.billAmount}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Submitted On</p>
                  <p className="font-medium text-gray-900">{new Date(lead.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <button 
                onClick={() => handleClaimLead(lead._id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 bg-slate-50 text-slate-700 font-medium rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"
              >
                <Hand className="w-4 h-4" /> Claim Lead
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
