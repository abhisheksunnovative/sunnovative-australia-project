import React, { useState, useEffect } from "react";
import { MapPin, PhoneCall, Calendar, ArrowRight, CheckCircle, Clock, Zap, DollarSign } from "lucide-react";
import { useAdminSettings } from "../../hooks/useAdminSettings";

export default function BDEProspects({ bdeId, country, bdeType }) {
  const isFreelancer = bdeType?.toLowerCase().includes("freelance");
  const [leads, setLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectTypeFilter, setProjectTypeFilter] = useState("All");
  const [kwFilter, setKwFilter] = useState("All");
  const [followUpFilter, setFollowUpFilter] = useState("All"); 
  const { projectTypes: dynamicProjectTypes } = useAdminSettings(country);
  const [loading, setLoading] = useState(true);
  const [bookingLead, setBookingLead] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";
  
  const isAU = country?.toLowerCase() === 'australia' || country?.toLowerCase() === 'au';

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/bde/${bdeId}/leads`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, [bdeId]);

  const handleSimulateLogin = async (lead) => {
    try {
      const res = await fetch(`${API_BASE}/api/leads/${lead._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasLoggedIn: true, preferredInstallDate: new Date(Date.now() + 86400000 * 3) })
      });
      if (res.ok) fetchLeads();
    } catch (e) { console.error(e); }
  };

  const handleSimulatePayment = async (lead) => {
    try {
      const res = await fetch(`${API_BASE}/api/leads/${lead._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenPaid: true, status: "Converted" })
      });
      if (res.ok) {
        alert("Token Payment Confirmed! Customer has been moved to Order Journey.");
        fetchLeads();
      }
    } catch (e) { console.error(e); }
  };

  const handleBookInstall = async () => {
    if(!selectedDate) return alert("Please select a date");
    try {
      const res = await fetch(`${API_BASE}/api/leads/${bookingLead._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ installDateBooked: true, finalInstallDate: selectedDate })
      });
      if (res.ok) {
        alert("Installation date confirmed!");
        setBookingLead(null);
        fetchLeads();
      }
    } catch (e) { console.error(e); }
  };

  const setFollowUpDate = async (lead, days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(12, 0, 0, 0); // Force noon to prevent midnight timezone boundary bugs
    try {
      const res = await fetch(`${API_BASE}/api/leads/${lead._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextFollowUp: d })
      });
      if (res.ok) {
        alert("Follow-up date set.");
        fetchLeads();
      }
    } catch (e) { console.error(e); }
  };

  const baseProspects = leads.filter(l => {
    if (l.status === 'Converted' || l.convertedProjectId) return false;
    const isAU = l.country?.toLowerCase() === 'australia' || l.country?.toLowerCase() === 'au';
    const isEligibleForOrderJourney = isAU ? l.bdeMovedToOrderJourney : (l.tokenPaid && l.assignedEPCId);
    return l.installDateBooked && !isEligibleForOrderJourney;
  });

  const getCountForProjectType = (ptValue) => {
    if (ptValue === "All") return baseProspects.length;
    return baseProspects.filter(l => (l.solarType || l.projectType || "").toLowerCase() === ptValue.toLowerCase()).length;
  };

  const filteredLeads = baseProspects.filter(l => {
    if (projectTypeFilter !== "All" && (l.solarType || l.projectType || "").toLowerCase() !== projectTypeFilter.toLowerCase()) return false;
    
    if (kwFilter !== "All") {
      const kw = parseFloat(l.kw) || 0;
      if (kwFilter === "<5" && kw >= 5) return false;
      if (kwFilter === "5-10" && (kw < 5 || kw > 10)) return false;
      if (kwFilter === ">10" && kw <= 10) return false;
    }

    if (followUpFilter !== "All") {
      if (!l.nextFollowUp) return false;
      const today = new Date();
      const fu = new Date(l.nextFollowUp);
      const isToday = fu.toDateString() === today.toDateString();
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
      const isTomorrow = fu.toDateString() === tomorrow.toDateString();
      
      if (followUpFilter === "Today" && !isToday) return false;
      if (followUpFilter === "Tomorrow" && !isTomorrow) return false;
      if (followUpFilter === "Future" && (isToday || isTomorrow || fu < today)) return false;
    }

    if (searchQuery) {
      return (l.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
             (l.mobile || "").includes(searchQuery);
    }
    return true;
  });

  return (
    <div className="p-4 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Prospects ({filteredLeads.length})</h1>
          <p className="text-sm font-semibold text-slate-500">Manage customers ready for token payment and installation</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">
        <input 
          type="text" 
          placeholder="Search by name or phone..." 
          className="flex-1 min-w-[200px] px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        
        {/* Project Type Filter Cards */}
      <div className="w-full flex gap-3 overflow-x-auto pb-2 mb-2 scrollbar-hide">
        <button 
          onClick={() => setProjectTypeFilter("All")}
          className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all flex items-center gap-2 ${projectTypeFilter === 'All' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50'}`}
        >
          All Types
          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${projectTypeFilter === 'All' ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-600'}`}>{getCountForProjectType("All")}</span>
        </button>
        {dynamicProjectTypes.map(pt => {
          const ptCount = getCountForProjectType(pt.value);
          if (ptCount === 0 && projectTypeFilter !== pt.value) return null;
          return (
            <button 
              key={pt.value}
              onClick={() => setProjectTypeFilter(pt.value)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all flex items-center gap-2 ${projectTypeFilter === pt.value ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50'}`}
            >
              {pt.label}
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${projectTypeFilter === pt.value ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-600'}`}>{ptCount}</span>
            </button>
          )
        })}
      </div>

        <select value={kwFilter} onChange={e => setKwFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm outline-none bg-slate-50">
          <option value="All">All kW Sizes</option>
          <option value="<5">Under 5 kW</option>
          <option value="5-10">5 - 10 kW</option>
          <option value=">10">Above 10 kW</option>
        </select>

        <select value={followUpFilter} onChange={e => setFollowUpFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm outline-none bg-amber-50 text-amber-800 font-bold">
          <option value="All">All Follow-ups</option>
          <option value="Today">Today Follow-up</option>
          <option value="Tomorrow">Tomorrow Follow-up</option>
          <option value="Future">Future Follow-ups</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-semibold bg-white rounded-xl shadow-sm border border-slate-100">
          No prospects found matching your criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map(lead => (
            <div key={lead._id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row gap-6 items-center hover:shadow-md transition">
              
              {/* Col 1: Customer Details */}
              <div className="flex-1 min-w-[250px] w-full">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-slate-800">{lead.name}</h3>
                  <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-1 rounded-full font-bold lg:hidden">PROSPECT</span>
                </div>
                
                <div className="space-y-1.5 text-sm text-slate-600">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400"/> {lead.district || lead.city}, {lead.state}</div>
                  <div className="flex items-center gap-2"><PhoneCall className="w-4 h-4 text-slate-400"/> {lead.mobile}</div>
                  <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-slate-400"/> {lead.kw} kW ({lead.solarType})</div>
                </div>
              </div>
              
              {/* Col 2: Follow Up & Install */}
              <div className="flex-1 min-w-[250px] w-full lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-center">
                  {lead.preferredInstallDate ? (
                    <div className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 w-fit mb-4">
                      <Calendar className="w-4 h-4"/> Install Date: {new Date(lead.preferredInstallDate).toLocaleDateString()}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500 font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 w-fit mb-4">
                      <Calendar className="w-4 h-4"/> Install Date: Not Selected
                    </div>
                  )}

                  {lead.assignedEPCName ? (
                    <p className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded w-fit mb-2">
                      EPC: {lead.assignedEPCName}
                    </p>
                  ) : (
                    <p className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded w-fit mb-2">
                      Waiting for EPC assignment
                    </p>
                  )}

                  {lead.nextFollowUp && <p className="text-xs text-amber-600 mt-2 font-semibold flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> Scheduled: {new Date(lead.nextFollowUp).toDateString()}</p>}
              </div>

              {/* Col 3: Action Buttons */}
              <div className="flex-1 min-w-[250px] w-full lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-center gap-2">
                <div className="hidden lg:block absolute top-4 right-4">
                  <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-1 rounded-full font-bold">PROSPECT</span>
                </div>
                {!lead.tokenPaid ? (
    <div className="flex flex-col gap-2 mt-4 lg:mt-0">
                  {/* Follow-up Date Editor */}
                  <div className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 flex flex-col gap-1 shadow-sm mb-1">
                    <div className="flex justify-between items-center">
                      <div className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
                        <Calendar className="w-3 h-3"/> Follow-up Date
                      </div>
                      <input 
                        type="date" 
                        className="bg-transparent border-none p-0 text-[10px] font-bold text-blue-700 cursor-pointer focus:ring-0"
                        value={lead.nextFollowUp ? lead.nextFollowUp.split("T")[0] : ""}
                        onChange={async (e) => {
                          try {
                            const token = localStorage.getItem('token');
                            const res = await fetch(`${API_BASE}/api/bde/leads/${lead._id}/status`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ status: lead.status, nextFollowUp: e.target.value })
                            });
                            if (res.ok) { fetchLeads(); }
                          } catch (err) {}
                        }}
                      />
                    </div>
                  </div>

                  {!isAU ? (
                    lead.tokenPaid ? (
                      <p className="text-[10px] font-bold text-emerald-600 text-center uppercase bg-emerald-50 py-2 rounded border border-emerald-100">Token Paid. Waiting for EPC.</p>
                    ) : (
                      <>
                        <p className="text-[10px] font-bold text-rose-600 text-center uppercase bg-rose-50 border border-rose-200 py-1.5 rounded shadow-sm">Ask customer to pay token amount</p>
                        <button onClick={() => handleSimulatePayment(lead)} className="text-[9px] text-blue-600 font-bold underline text-center">Simulate Token Payment</button>
                      </>
                    )
                  ) : (
                    <>
                      <button onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          const res = await fetch(`${API_BASE}/api/leads/${lead._id}/convert`, { 
                            method: "POST", 
                            headers: { Authorization: `Bearer ${token}` } 
                          });
                          if (res.ok) { alert("Moved to Order Journey!"); fetchLeads(); }
                        } catch (e) {}
                      }} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-sm font-bold rounded-lg transition flex justify-center items-center gap-2">
                         Move to Order Journey
                      </button>
                    </>
                  )}
    </div>
  ) : (
                  <div className="text-center text-sm font-bold text-blue-600">
                    Converted to Order
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {bookingLead && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase text-sm">
              Confirm Installation Date
            </div>
            <div className="p-4 space-y-4">
              <p className="text-xs text-slate-500">Check EPC availability and confirm the final date with the customer before taking the sign-up token.</p>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Final Install Date</label>
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setBookingLead(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleBookInstall}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded shadow-sm hover:bg-blue-700"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
