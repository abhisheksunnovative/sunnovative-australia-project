import React, { useState, useEffect } from "react";
import { Search, MapPin, Hand, Filter } from "lucide-react";

export default function BDEDemandPool({ bdeId }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

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

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Scanning Regional Demand Pool...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="font-medium">Unclaimed Leads in your assigned regions</span>
        </div>
        <div className="text-sm text-gray-500">
          Showing {leads.length} available opportunities
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {leads.length === 0 ? (
          <div className="col-span-1 lg:col-span-2 p-12 text-center bg-white rounded-xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 font-medium text-lg">No unassigned leads found in your territory.</p>
            <p className="text-gray-400 text-sm mt-1">Check back later or expand your assigned regions.</p>
          </div>
        ) : (
          leads.map((lead) => (
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
