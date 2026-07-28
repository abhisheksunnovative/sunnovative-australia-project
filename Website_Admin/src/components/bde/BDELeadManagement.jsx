import React, { useState, useEffect } from "react";
import { PhoneCall, Calendar, ArrowRight, UserCheck, CheckCircle, Edit2, Plus, X, ShieldCheck, XCircle, Clock } from "lucide-react";

export default function BDELeadManagement({ bdeId }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);
  const [formData, setFormData] = useState({ name: '', mobile: '', email: '', district: '', state: 'Gujarat', pincode: '', kw: '', billAmount: '', solarType: 'surya-ghar', notes: '', consumerNumber: '', discom: '', tariff: '', meterCategory: '' });

  // Bill Scanning State
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleScanBill = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    setIsScanning(true);
    setScanError("");

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("billFile", file);

      const res = await fetch(`${API_BASE}/api/light-bill/scan`, {
        method: "POST",
        // BDE currently default to India unless specified
        headers: { "x-country": "india" },
        body: formDataUpload
      });
      
      const data = await res.json();
      
      if (data.extracted) {
        const ex = data.extracted;
        setFormData(prev => {
          let pType = prev.solarType;
          if (ex.meterCategory) {
            const cat = ex.meterCategory.toLowerCase();
            if (cat.includes("commercial") || cat.includes("industrial") || cat.includes("lt-2") || cat.includes("lt-3")) pType = "commercial";
            else if (cat.includes("residential") || cat.includes("domestic") || cat.includes("lt-1")) pType = "surya-ghar";
          }
          return {
            ...prev,
            name: ex.consumerName || prev.name,
            billAmount: ex.billAmount || prev.billAmount,
            district: ex.district || prev.district,
            state: ex.detectedState || prev.state,
            kw: data.recommendedKw || prev.kw,
            solarType: pType,
            consumerNumber: ex.consumerNumber || prev.consumerNumber,
            discom: ex.discomId || prev.discom,
            tariff: ex.tariffCode || prev.tariff,
            meterCategory: ex.meterCategory || prev.meterCategory
          };
        });
        if (data.confidence === "low") {
          setScanError("Some fields may be inaccurate. Please verify manually.");
        }
      } else {
        setScanError(data.message || "Failed to extract details.");
      }
    } catch (err) {
      console.error(err);
      setScanError("Error scanning bill.");
    } finally {
      setIsScanning(false);
    }
  };

  // EPC Calendar Modal State
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarSlots, setCalendarSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedRawDate, setSelectedRawDate] = useState(null);
  const [qualifyingLead, setQualifyingLead] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (!bdeId) return;
    fetchLeads();
  }, [bdeId]);

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

  const handleOpenAdd = () => {
    setFormData({ name: '', mobile: '', email: '', district: '', state: 'Gujarat', pincode: '', kw: '', billAmount: '', solarType: 'surya-ghar', notes: '', consumerNumber: '', discom: '', tariff: '', meterCategory: '' });
    setUploadedFile(null);
    setScanError("");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (lead) => {
    setCurrentLead(lead);
    setFormData({ 
      name: lead.name || '', mobile: lead.mobile || '', email: lead.email || '', 
      district: lead.district || '', state: lead.state || 'Gujarat', pincode: lead.pincode || '', 
      kw: lead.kw || '', billAmount: lead.billAmount || '', solarType: lead.solarType || 'surya-ghar', notes: lead.notes || '',
      consumerNumber: lead.consumerNumber || '', discom: lead.discom || '', tariff: lead.tariff || '', meterCategory: lead.meterCategory || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    try {
      const url = currentLead ? `${API_BASE}/api/bde/leads/${currentLead._id}/details` : `${API_BASE}/api/bde/${bdeId}/leads`;
      const method = currentLead ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if(res.ok) {
        setIsAddModalOpen(false); setIsEditModalOpen(false); setCurrentLead(null);
        fetchLeads();
      }
    } catch(err) { console.error(err); }
  };

  const updateLeadStatus = async (leadId, status, nextFollowUp = null) => {
    try {
      await fetch(`${API_BASE}/api/bde/leads/${leadId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, nextFollowUp })
      });
      fetchLeads();
    } catch (err) { console.error(err); }
  };

  const handleReject = async (lead) => {
    if (!window.confirm(`Reject ${lead.name}'s lead?`)) return;
    updateLeadStatus(lead._id, "Not Interested");
  };

  const handleQualify = async (lead) => {
    setQualifyingLead(lead);
    setSelectedSlot(null);
    setCurrentMonth(new Date());
    setIsCalendarModalOpen(true);
    try {
      // Fetch EPC Calendar for this lead's district and project type
      let pType = 'Residential Solar';
      if (lead.solarType === 'surya-ghar') pType = 'Surya Ghar Yojana';
      else if (lead.solarType === 'group-solar') pType = 'Group Solar';
      else if (lead.solarType === 'commercial') pType = 'Commercial Solar';
      else if (lead.solarType === 'village') pType = 'Village Solar Campaign';
      else if (lead.solarType === 'msme') pType = 'Commercial Solar';
      
      const dist = lead.district || lead.city || 'all';
      const res = await fetch(`${API_BASE}/api/bde/${bdeId}/epc-calendar?district=${dist}&projectType=${pType}`);
      const data = await res.json();
      if (data.success) {
        setCalendarSlots(data.slots || []);
      }
    } catch (err) { console.error(err); }
  };

  const handleConvertWithSlot = async () => {
    if (!qualifyingLead) return;
    try {
      let payload = {};
      if (selectedSlot) {
        payload.epcCalendarSlotId = selectedSlot._id;
      } else if (selectedRawDate) {
        payload.preferredDate = selectedRawDate;
      } else {
        alert("Please select a date from the calendar.");
        return;
      }
      
      const res = await fetch(`${API_BASE}/api/leads/${qualifyingLead._id}/convert`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert("Lead Converted & Order Created! It is now broadcasted to EPCs.");
        setIsCalendarModalOpen(false);
        fetchLeads();
      } else {
        alert(data.message || "Failed to convert");
      }
    } catch (err) { console.error(err); alert("Error processing request"); }
  };

  const handleConfirmDate = async (lead) => {
    if (!window.confirm("Has the installation date been finalized with the customer and the EPC?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/project-orders/${lead.convertedProjectId}/confirm-install-date`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ finalizeOnly: true }) // tell backend to just mark as fixed
      });
      const data = await res.json();
      if (data.success) {
        alert("Installation Date Confirmed & Notifications Sent!");
        fetchLeads();
      } else {
        alert(data.message || "Failed to confirm date");
      }
    } catch (err) { console.error(err); alert("Error confirming date"); }
  };

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-transparent bg-transparent"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateString = dateObj.toDateString();
      const daySlots = calendarSlots.filter(s => new Date(s.date).toDateString() === dateString);
      
      const isRawSelected = selectedRawDate === dateString && !selectedSlot;
      days.push(
        <div 
          key={`day-${day}`} 
          onClick={() => { setSelectedSlot(null); setSelectedRawDate(dateString); }}
          className={`min-h-[90px] border p-1.5 rounded flex flex-col gap-1 relative overflow-hidden cursor-pointer transition-all ${isRawSelected ? 'bg-blue-50 border-blue-400 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
        >
          <span className={`text-xs font-bold ${isRawSelected ? 'text-blue-700' : 'text-gray-700'}`}>{day}</span>
          <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
            {daySlots.map(slot => {
               const isAvailable = !slot.isBlocked && slot.currentBookings < slot.maxBookings;
               const isSelected = selectedSlot?._id === slot._id;
               return (
                 <div 
                   key={slot._id}
                   onClick={(e) => { e.stopPropagation(); if (isAvailable) { setSelectedSlot(slot); setSelectedRawDate(dateString); } }}
                   className={`text-[10px] p-1 rounded-sm cursor-pointer border transition-all ${!isAvailable ? 'bg-red-50 text-red-600 border-red-100 opacity-60 cursor-not-allowed' : isSelected ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}
                 >
                   <div className="font-bold truncate">{isAvailable ? "Available Slot" : "Booked Slot"}</div>
                   <div className="text-[8px]">{slot.currentBookings}/{slot.maxBookings} Bookings</div>
                 </div>
               )
            })}
          </div>
        </div>
      );
    }
    
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4 bg-gray-50 p-2 rounded-lg border">
          <button onClick={prevMonth} className="px-3 py-1 bg-white border rounded hover:bg-gray-100 text-sm font-bold text-gray-700 transition">&larr; Prev</button>
          <div className="font-bold text-base text-gray-800">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
          <button onClick={nextMonth} className="px-3 py-1 bg-white border rounded hover:bg-gray-100 text-sm font-bold text-gray-700 transition">Next &rarr;</button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(wd => <div key={wd} className="text-center font-bold text-[10px] text-gray-500 uppercase py-1">{wd}</div>)}
          {days}
        </div>
      </div>
    );
  };

  const [activeTab, setActiveTab] = useState("manual"); // 'manual' or 'website'

  const manualLeads = leads.filter(l => l.history?.some(h => h.action.includes("Manually created by BDE")));
  const websiteLeads = leads.filter(l => !l.history?.some(h => h.action.includes("Manually created by BDE")));
  const displayedLeads = activeTab === "manual" ? manualLeads : websiteLeads;

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading My Leads...</div>;

  return (
    <div className="space-y-6">
      
      {/* --- TABS & ADD ACTION --- */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab("manual")}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all ${activeTab === "manual" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Self-Sourced Leads ({manualLeads.length})
          </button>
          <button 
            onClick={() => setActiveTab("website")}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all ${activeTab === "website" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Website Enquiries ({websiteLeads.length})
          </button>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Customer</th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">System Info</th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Status & Follow-up</th>
              <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayedLeads.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-500">No {activeTab === "manual" ? "self-sourced" : "website"} leads found.</td></tr>
            ) : (
              displayedLeads.map((lead) => (
                <tr key={lead._id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900">{lead.name}</div>
                      <button onClick={() => handleOpenEdit(lead)} className="text-gray-400 hover:text-blue-600"><Edit2 className="w-3 h-3"/></button>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1"><PhoneCall className="w-3 h-3"/> {lead.mobile}</div>
                    <div className="text-xs text-gray-400">{lead.district || lead.city}, {lead.state} - {lead.pincode}</div>
                    <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium"><Clock className="w-3 h-3"/> {new Date(lead.createdAt).toLocaleDateString()}</div>
                    {lead.preferredInstallDate && (
                      <div className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 mt-1 inline-flex items-center gap-1 font-semibold">
                        <Calendar className="w-3 h-3"/> Install Date: {new Date(lead.preferredInstallDate).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-gray-900 capitalize">{lead.solarType} • {lead.kw} kW</div>
                    <div className="text-xs text-gray-500">Bill: ₹{lead.billAmount}</div>
                  </td>
                  <td className="p-4">
                    <select 
                      className="text-sm border rounded p-1 mb-1 bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead._id, e.target.value, lead.nextFollowUp)}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Interested">Interested</option>
                      <option value="Not Interested">Not Interested</option>
                    </select>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3"/> 
                      <input 
                        type="date" 
                        className="bg-transparent border-none p-0 text-xs text-blue-600 focus:ring-0"
                        value={lead.nextFollowUp ? lead.nextFollowUp.split("T")[0] : ""}
                        onChange={(e) => updateLeadStatus(lead._id, lead.status, e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    {lead.status === "Converted" ? (
                      <div className="flex flex-col items-end gap-2">
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium px-3 py-1.5 bg-emerald-50 rounded-lg">
                          <CheckCircle className="w-4 h-4"/> Order Created
                        </span>
                        
                        {lead.epcDetails && (
                          <div className="bg-blue-50 border border-blue-100 p-2 rounded-lg text-xs text-left w-full max-w-[200px]">
                            <p className="font-bold text-blue-800">Accepted by EPC:</p>
                            <p className="text-blue-900 font-semibold">{lead.epcDetails.companyName}</p>
                            <p className="text-blue-700">{lead.epcDetails.contactPerson}</p>
                            <p className="text-blue-700">{lead.epcDetails.mobile}</p>
                          </div>
                        )}

                        {lead.convertedProjectId && !lead.isInstallDateFixed ? (
                          lead.enquiryStatus === "EPC Accepted" ? (
                            <button
                              onClick={() => handleConfirmDate(lead)}
                              className="inline-flex items-center gap-1 text-white text-xs font-medium px-3 py-1 bg-amber-500 hover:bg-amber-600 rounded-lg transition"
                            >
                              <Calendar className="w-3 h-3"/> Confirm Install Date
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium px-3 py-1 bg-amber-50 rounded-lg border border-amber-100">
                              <Clock className="w-3 h-3"/> Waiting for EPC
                            </span>
                          )
                        ) : lead.isInstallDateFixed ? (
                          <span className="inline-flex items-center gap-1 text-blue-600 text-xs font-medium px-3 py-1 bg-blue-50 rounded-lg border border-blue-100">
                            <Calendar className="w-3 h-3"/> Date Fixed
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleReject(lead)} className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg" title="Reject Lead">
                          <XCircle className="w-4 h-4"/>
                        </button>
                        <button onClick={() => handleQualify(lead)} className="inline-flex items-center gap-1 text-white text-sm font-medium px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition">
                          Qualify & Book <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* EPC Calendar Modal */}
      {isCalendarModalOpen && qualifyingLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="font-bold text-lg text-gray-900">Book EPC Installation</h2>
                <p className="text-xs text-gray-500">Select an available date for {qualifyingLead.name} in {qualifyingLead.district || qualifyingLead.city || "Unknown Location"}</p>
              </div>
              <button onClick={() => setIsCalendarModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
              {renderCalendar()}
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium">
                {selectedSlot ? `Selected Slot: ${new Date(selectedSlot.date).toLocaleDateString()}` : selectedRawDate ? `Selected Preferred Date: ${new Date(selectedRawDate).toLocaleDateString()}` : 'Please select a date from the calendar'}
              </span>
              <button 
                onClick={handleConvertWithSlot} 
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm flex items-center gap-2 transition"
              >
                <ShieldCheck className="w-5 h-5" /> Convert & Finalize Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal (Simplified) */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-lg">{isEditModalOpen ? 'Edit Lead' : 'Add New Lead'}</h2>
              <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSaveLead} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 p-4 bg-sky-50 border border-sky-100 rounded-lg mb-2">
                <label className="text-xs font-semibold text-sky-800 mb-2 block flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Auto-fill with Light Bill (OCR)
                </label>
                <div className="flex items-center gap-3">
                  <input type="file" accept="image/*,application/pdf" onChange={handleScanBill} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-100 file:text-sky-700 hover:file:bg-sky-200" disabled={isScanning} />
                  {isScanning && <span className="text-xs text-sky-600 flex items-center gap-1 animate-pulse"><Clock className="w-3.5 h-3.5" /> Scanning...</span>}
                </div>
                {scanError && <p className="text-xs text-red-500 mt-2 font-medium">{scanError}</p>}
                {uploadedFile && !isScanning && !scanError && <p className="text-xs text-emerald-600 mt-2 font-medium">Successfully fetched details from bill!</p>}
              </div>
              <div><label className="text-xs text-gray-500 mb-1 block">Name</label><input required className="w-full border p-2 rounded" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Mobile</label><input required className="w-full border p-2 rounded" value={formData.mobile} onChange={e=>setFormData({...formData, mobile: e.target.value})} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">District</label><input required className="w-full border p-2 rounded" value={formData.district} onChange={e=>setFormData({...formData, district: e.target.value})} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Pincode</label><input required className="w-full border p-2 rounded" value={formData.pincode} onChange={e=>setFormData({...formData, pincode: e.target.value})} /></div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Project Type</label>
                <select className="w-full border p-2 rounded" value={formData.solarType} onChange={e=>setFormData({...formData, solarType: e.target.value})}>
                  <option value="surya-ghar">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="group-solar">Group Housing</option>
                  <option value="au-small-home">AU Small Home (6.6kW)</option>
                  <option value="au-standard-family">AU Standard Family (8-10kW)</option>
                  <option value="au-large-home">AU Large Home (10-13kW)</option>
                  <option value="au-ev-owners">AU EV Owners (13-20kW)</option>
                  <option value="au-solar-battery">AU Solar + Battery</option>
                </select>
              </div>
              <div><label className="text-xs text-gray-500 mb-1 block">Required kW</label><input type="number" className="w-full border p-2 rounded" value={formData.kw} onChange={e=>setFormData({...formData, kw: e.target.value})} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Consumer Number</label><input className="w-full border p-2 rounded" value={formData.consumerNumber} onChange={e=>setFormData({...formData, consumerNumber: e.target.value})} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">DISCOM</label><input className="w-full border p-2 rounded" value={formData.discom} onChange={e=>setFormData({...formData, discom: e.target.value})} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Tariff Code</label><input className="w-full border p-2 rounded" value={formData.tariff} onChange={e=>setFormData({...formData, tariff: e.target.value})} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Meter Category</label><input className="w-full border p-2 rounded" value={formData.meterCategory} onChange={e=>setFormData({...formData, meterCategory: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="text-xs text-gray-500 mb-1 block">Notes</label><textarea className="w-full border p-2 rounded" value={formData.notes} onChange={e=>setFormData({...formData, notes: e.target.value})} /></div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
