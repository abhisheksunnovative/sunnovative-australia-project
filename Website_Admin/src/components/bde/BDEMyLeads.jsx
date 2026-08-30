import React, { useState, useEffect } from "react";
import { User, Mail, Phone, ArrowRight, UploadCloud, Search, Calendar, Filter } from "lucide-react";
import { useAdminSettings } from "../../hooks/useAdminSettings";
import UnifiedAddLeadModal from "../UnifiedAddLeadModal";
import { Plus } from "lucide-react";

export default function BDEMyLeads({ bdeId, country, bdeType, onTabChange }) {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { projectTypes } = useAdminSettings(country);
  const [selectedProjectTypes, setSelectedProjectTypes] = useState({});
  const [sortDays, setSortDays] = useState("asc");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [bdeId]);

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/bde/${bdeId}/leads`);
      const data = await res.json();
      if (data.success) {
        // Only show RAW leads manually created by freelancer
        let rawLeads = (data.leads || []).filter(l => l.status === "RAW" && l.history?.some(h => h.action.includes("Manually created")));
        
        // Sort by days
        rawLeads = rawLeads.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortDays === "asc" ? dateB - dateA : dateA - dateB;
        });
        
        setLeads(rawLeads);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQualify = async (lead) => {
    const pt = selectedProjectTypes[lead._id];
    if (!pt) {
      alert("First select project type");
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/api/leads/${lead._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'New', solarType: pt })
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (e) {
      console.error(e);
      alert("Error qualifying lead");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">My Leads</h1>
          <p className="text-slate-500 text-sm mt-1">Qualify your bulk imported or manual leads here.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl flex items-center gap-2 border border-slate-200">
            <Filter className="w-4 h-4"/>
            <select className="bg-transparent border-none outline-none font-bold" value={sortDays} onChange={(e) => { setSortDays(e.target.value); setTimeout(fetchLeads, 100); }}>
              <option value="asc">Newest First</option>
              <option value="desc">Oldest First</option>
            </select>
          </button>
          
          <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5">
            <UploadCloud className="w-5 h-5"/> Upload Bulk Leads
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><div className="animate-spin w-8 h-8 border-4 border-solar-sky border-t-transparent rounded-full"></div></div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-slate-300"/>
          </div>
          <h3 className="text-lg font-bold text-slate-700">No Raw Leads</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">Upload bulk leads to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {leads.map(lead => (
            <div key={lead._id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
              
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400"/>
                  <span className="font-bold text-slate-800 text-lg">{lead.name || lead.fullName || lead.consumerName || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400"/> {lead.email || "No Email"}</div>
                  <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400"/> {lead.mobile || lead.mobileNumber || "No Number"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                <select 
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 min-w-[200px]"
                  value={selectedProjectTypes[lead._id] || ""}
                  onChange={(e) => setSelectedProjectTypes(prev => ({...prev, [lead._id]: e.target.value}))}
                >
                  <option value="">Select Project Type</option>
                  {projectTypes.map(pt => (
                    <option key={pt.value || pt.slug} value={pt.value || pt.slug}>{pt.label || pt.name}</option>
                  ))}
                </select>
                
                <button 
                  onClick={() => handleQualify(lead)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all whitespace-nowrap"
                >
                  Qualify <ArrowRight className="w-4 h-4"/>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
      {isAddModalOpen && (
        <UnifiedAddLeadModal 
          isBDE={true} 
          bdeId={bdeId}
          userCountry={country}
          existingLead={null}
          mode="bulk"
          onClose={() => { setIsAddModalOpen(false); fetchLeads(); }} 
        />
      )}
    </div>
  );
}