import React, { useState, useEffect } from "react";
import { MapPin, PhoneCall, Calendar, ArrowRight, CheckCircle, Clock, Zap, DollarSign, ClipboardList, ShieldCheck, Mail, KeyRound, X } from "lucide-react";
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
  
  // OTP & Calendar States
  const [otpModalLead, setOtpModalLead] = useState(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpValue, setOtpValue] = useState(''); // kept for backward compat
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [dummyOtpDisplay, setDummyOtpDisplay] = useState('');
  const otpInputRefs = React.useRef([]);

  const handleOtpDigit = (index, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setOtpValue(newDigits.join(''));
    if (digit && index < 5) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && otpDigits.join('').length === 6) verifyOtpAndOpenCalendar();
  };

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length) {
      const newDigits = paste.split('').concat(Array(6).fill('')).slice(0, 6);
      setOtpDigits(newDigits);
      setOtpValue(paste);
      otpInputRefs.current[Math.min(paste.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  const handleRequestOtp = async (lead) => {
    setOtpModalLead(lead);
    setCustomerEmail(lead.email || '');
    setOtpSent(false);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpValue('');
  };

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarSlots, setCalendarSlots] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedRawDate, setSelectedRawDate] = useState(null);
  const [isSelectLoading, setIsSelectLoading] = useState(false);

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const sendOtp = async () => {
    if (!customerEmail) return alert("Email required");
    setIsOtpLoading(true);
    console.log(`[OTP-UI] Sending OTP for lead: ${otpModalLead?._id}, email: ${customerEmail}`);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/leads/${otpModalLead._id}/request-date-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: customerEmail })
      });
      console.log(`[OTP-UI] Send OTP response status: ${res.status}`);
      const data = await res.json();
      console.log(`[OTP-UI] Send OTP response data:`, data);
      if (data.success) {
        setOtpSent(true);
        setDummyOtpDisplay(data.dummyOtp || ''); // Show OTP in modal, not alert
      } else { alert(data.message); }
    } catch (e) { 
      console.error('[OTP-UI] sendOtp error:', e);
      alert("Error sending OTP: " + e.message); 
    }
    setIsOtpLoading(false);
  };

  const verifyOtpAndOpenCalendar = async () => {
    const fullOtp = otpDigits.join('');
    console.log(`[OTP-UI] Verifying OTP: "${fullOtp}", digits: ${JSON.stringify(otpDigits)}, otpValue state: "${otpValue}"`);
    if (fullOtp.length < 6) {
      alert(`Please enter all 6 digits. Currently entered: "${fullOtp}"`);
      return;
    }
    setIsOtpLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log(`[OTP-UI] Sending verify request to: ${API_BASE}/api/leads/${otpModalLead._id}/verify-date-otp`);
      const res = await fetch(`${API_BASE}/api/leads/${otpModalLead._id}/verify-date-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ otp: fullOtp })
      });
      console.log(`[OTP-UI] Verify response status: ${res.status}`);
      const data = await res.json();
      console.log(`[OTP-UI] Verify response data:`, data);
      if (data.success) {
        const leadToBook = otpModalLead;
        setOtpModalLead(null);
        setOtpSent(false);
        setOtpDigits(['', '', '', '', '', '']);
        setOtpValue('');
        setDummyOtpDisplay('');
        fetchCalendarForLead(leadToBook);
      } else { alert(data.message || 'Invalid OTP'); }
    } catch (e) { 
      console.error('[OTP-UI] verifyOtp error:', e);
      alert("Error verifying OTP: " + e.message); 
    }
    setIsOtpLoading(false);
  };

  const fetchCalendarForLead = async (lead) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/leads/${lead._id}/epc-calendar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCalendarSlots(data.slots || []);
        setBookingLead(lead); 
        setIsCalendarOpen(true);
      }
    } catch (e) { console.error(e); }
  };

  const handleBookInstallSlot = async () => {
    if (!selectedSlot && !selectedRawDate) return alert("Select a date!");
    setIsSelectLoading(true);
    try {
      let payload = { date: selectedRawDate };
      if (selectedSlot) {
        payload.epcCalendarSlotId = selectedSlot._id;
        payload.date = selectedSlot.date;
      }
      
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/leads/${bookingLead._id}/select-install-date`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        alert("Date Locked successfully!");
        setIsCalendarOpen(false);
        setBookingLead(null);
        fetchLeads(); 
      } else { alert(data.message); }
    } catch (e) { alert("Error"); }
    setIsSelectLoading(false);
  };

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

  console.log(`[BDEProspects] Total leads loaded: ${leads.length}, isFreelancer: ${isFreelancer}, bdeType: ${bdeType}`);

  const baseProspects = leads.filter(l => {
    if (l.status === 'Converted' || l.convertedProjectId) return false;
    
    const isManualLead = l.history?.some(h => h.action.includes("Manually created by BDE"));
    if (isFreelancer && !isManualLead) return false;
    if (!isFreelancer && isManualLead) return false;
    
    if (isFreelancer && !l.isEligibleForInstallation && !l.installDateBooked) {
      console.log(`[BDEProspects] EXCLUDED (not eligible): ${l.name} | isEligible=${l.isEligibleForInstallation} | installDateBooked=${l.installDateBooked}`);
      return false;
    }
    
    console.log(`[BDEProspects] INCLUDED: ${l.name} | isEligible=${l.isEligibleForInstallation} | status=${l.status}`);
    return true;
  });

  console.log(`[BDEProspects] baseProspects count: ${baseProspects.length}`);

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

  // Collect all unique project types present in the BDE's current leads
  const leadProjectTypes = React.useMemo(() => {
    const types = new Set();
    baseProspects.forEach(l => {
      const type = (l.solarType || l.projectType);
      if (type) types.add(type.toLowerCase());
    });
    return Array.from(types).map(t => ({
      value: t,
      label: t.split(/[-_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }));
  }, [baseProspects]);

  // Combine admin-defined project types with lead-derived types to ensure no lead type is missing
  const allProjectTypes = React.useMemo(() => {
    const combined = [...dynamicProjectTypes];
    leadProjectTypes.forEach(lpt => {
      if (!combined.find(pt => pt.value.toLowerCase() === lpt.value.toLowerCase())) {
        combined.push(lpt);
      }
    });
    return combined;
  }, [dynamicProjectTypes, leadProjectTypes]);

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
        {allProjectTypes.map(pt => {
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

              {/* Col 3: Auto-Conversion Status & Follow-Up */}
              <div className="flex-1 min-w-[300px] w-full lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-center gap-2">
                <div className="hidden lg:block absolute top-4 right-4">
                  <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-1 rounded-full font-bold">PROSPECT</span>
                </div>
                
                {lead.status === 'Converted' ? (
                  <div className="text-center p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-sm font-bold text-emerald-700 uppercase">Converted to Order</p>
                    <p className="text-xs text-emerald-600 mt-1">Moved to Customer Order Journey</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 w-full mt-4 lg:mt-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Conversion Requirements</p>
                    
                    {/* Condition 1: Installation Date */}
                    <div className={`p-2 rounded border text-xs font-semibold flex items-center justify-between ${lead.preferredInstallDate ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5"/> 
                        {lead.preferredInstallDate ? 'Date Selected' : '1. Date Pending'}
                      </span>
                      {!lead.preferredInstallDate && (
                        <button onClick={() => handleRequestOtp(lead)} className="text-[9px] bg-white px-2 py-1 border border-rose-200 rounded shadow-sm text-rose-600 hover:bg-rose-50 cursor-pointer">Select Date</button>
                      )}
                    </div>
                    
                    {/* Condition 2: EPC Assigned */}
                    <div className={`p-2 rounded border text-xs font-semibold flex items-center justify-between ${lead.assignedEPCName ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5"/> 
                        {lead.assignedEPCName ? 'EPC Assigned' : '2. EPC Pending'}
                      </span>
                    </div>

                    {/* Condition 3: Apply Form Completed */}
                    <div className={`p-2 rounded border text-xs font-semibold flex items-center justify-between ${lead.address ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                      <span className="flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5"/> 
                        {lead.address ? 'Apply Form Done' : '3. Apply Form Pending'}
                      </span>
                    </div>

                    {/* Condition 4: Token Paid (if applicable) */}
                    {!isAU && (
                      <div className={`p-2 rounded border text-xs font-semibold flex items-center justify-between ${lead.tokenPaid ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                        <span className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5"/> 
                          {lead.tokenPaid ? 'Token Paid' : '4. Token Pending'}
                        </span>
                        {!lead.tokenPaid && (
                          <button onClick={() => handleSimulatePayment(lead)} className="text-[9px] bg-white px-2 py-1 border border-rose-200 rounded shadow-sm text-rose-600 hover:bg-rose-50">Simulate</button>
                        )}
                      </div>
                    )}

                    {!lead.preferredInstallDate || !lead.assignedEPCName || !lead.address || (!isAU && !lead.tokenPaid) ? (
                      <p className="text-[10px] text-rose-500 font-medium text-center mt-1 leading-tight">
                        * Note: Above pending condition(s) must be fulfilled to auto-convert to Order Journey.
                      </p>
                    ) : (
                      <p className="text-[10px] text-emerald-600 font-bold text-center mt-1 animate-pulse">
                        All conditions met! Converting...
                      </p>
                    )}

                    {/* Follow up date picker */}
                    <div className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 flex flex-col gap-1 shadow-sm mt-2">
                      <div className="text-[9px] font-black text-slate-500 uppercase">
                        {isAU ? "Ask customer to pay initial payment" : "Ask customer to pay token"}
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                          <Clock className="w-3 h-3"/> Follow-up Date
                        </div>
                        <input 
                          type="date" 
                          className="bg-transparent border border-slate-300 rounded px-1 text-[10px] font-bold text-blue-700 cursor-pointer focus:ring-0"
                          value={lead.nextFollowUp ? lead.nextFollowUp.split("T")[0] : ""}
                          onChange={async (e) => {
                            try {
                              const token = localStorage.getItem('token');
                              const res = await fetch(`${API_BASE}/api/bde/leads/${lead._id}`, {
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
                  </div>
                )}
              </div>
            </div>
          ))}

        </div>
      )}
      
      {/* OTP Modal */}
      {otpModalLead && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-[999] flex items-center justify-center p-4"
        >
          <div 
            className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative z-[1000]"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600"/> Secure Date Selection
              </h2>
              <button onClick={() => { setOtpModalLead(null); setOtpSent(false); setOtpValue(''); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 font-medium">
                Selecting date on behalf of: <span className="font-bold text-slate-700">{otpModalLead.name}</span>
              </p>
              
              {!otpSent ? (
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Customer Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input 
                      autoFocus
                      type="email" 
                      value={customerEmail} 
                      onChange={e => setCustomerEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendOtp()}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                      placeholder="customer@email.com" 
                    />
                  </div>
                  <button 
                    onClick={sendOtp} 
                    disabled={isOtpLoading || !customerEmail} 
                    className="w-full py-2.5 bg-blue-600 disabled:opacity-50 text-white font-bold rounded-lg"
                  >
                    {isOtpLoading ? 'Sending...' : 'Send OTP to Customer'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-700 font-medium">
                    ✅ OTP sent to <strong>{customerEmail}</strong>
                  </div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase text-center">Enter 6-Digit OTP</label>
                  
                  {/* 6 separate OTP digit boxes */}
                  <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => otpInputRefs.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        autoFocus={index === 0}
                        onChange={e => handleOtpDigit(index, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(index, e)}
                        onClick={e => e.target.select()}
                        className={`w-12 h-14 text-center text-2xl font-black border-2 rounded-xl outline-none transition-all
                          ${digit ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-700'}
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
                      />
                    ))}
                  </div>

                  <button 
                    onClick={verifyOtpAndOpenCalendar} 
                    disabled={isOtpLoading || otpDigits.join('').length < 6} 
                    className="w-full py-2.5 bg-emerald-600 disabled:opacity-40 text-white font-bold rounded-lg"
                  >
                    {isOtpLoading ? 'Verifying...' : 'Verify OTP & Open Calendar'}
                  </button>
                  <button 
                    onClick={() => { setOtpSent(false); setOtpDigits(['','','','','','']); setOtpValue(''); }} 
                    className="w-full text-xs text-slate-400 underline"
                  >
                    Wrong email? Go back
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EPC Calendar Modal */}
      {isCalendarOpen && bookingLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="font-bold text-lg text-slate-900">Book EPC Installation</h2>
                <p className="text-xs text-slate-500">Select an available date for {bookingLead.name} in {bookingLead.district || bookingLead.city}</p>
              </div>
              <button onClick={() => setIsCalendarOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              {/* Calendar Grid Logic inside */}
              <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50 transition-colors shadow-sm text-xs font-semibold">&lt; Prev</button>
                <h3 className="font-bold text-slate-800 text-sm">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50 transition-colors shadow-sm text-xs font-semibold">Next &gt;</button>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, i) => <div key={`empty-${i}`}></div>)}
                {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
                  const day = i + 1;
                  const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const dateString = dateObj.toDateString();
                  
                  const minAllowedDate = new Date();
                  minAllowedDate.setHours(0,0,0,0);
                  minAllowedDate.setDate(minAllowedDate.getDate() + 5);
                  const isPastDate = dateObj < minAllowedDate;
                  
                  const daySlots = calendarSlots.filter(s => new Date(s.date).toDateString() === dateString);
                  const allSlotsBlocked = daySlots.length > 0 && daySlots.every(s => s.isBlocked || s.currentBookings >= s.maxBookings);
                  const isRawSelected = selectedRawDate === dateString && !selectedSlot;
                  
                  return (
                    <div 
                      key={day}
                      onClick={() => {
                        if (isPastDate) return;
                        setSelectedSlot(null);
                        setSelectedRawDate(dateString);
                      }}
                      className={`min-h-[80px] border p-1.5 rounded-xl flex flex-col gap-1 transition-all ${isPastDate ? 'bg-slate-100/50 border-slate-200 text-slate-300 cursor-not-allowed' : isRawSelected ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300 cursor-pointer shadow-md' : allSlotsBlocked ? 'bg-rose-50/70 border-rose-200 cursor-pointer hover:bg-rose-100' : 'bg-emerald-50 border-emerald-200 cursor-pointer hover:bg-emerald-100'}`}
                    >
                       <div className="flex items-center justify-between">
                         <span className={`text-xs font-black ${isPastDate ? 'text-slate-300' : isRawSelected ? 'text-blue-800' : 'text-slate-700'}`}>{day}</span>
                       </div>
                       
                       {!isPastDate && (
                         <div className="flex-1 flex flex-col gap-1 mt-1">
                           {daySlots.map(slot => {
                              const isFull = slot.isBlocked || slot.currentBookings >= slot.maxBookings;
                              return (
                                <button
                                  key={slot._id}
                                  onClick={(e) => { e.stopPropagation(); if(isFull) return; setSelectedSlot(slot); setSelectedRawDate(dateString); }}
                                  className={`text-[9px] font-bold p-1 rounded w-full text-left truncate ${selectedSlot?._id === slot._id ? 'bg-blue-500 text-white' : isFull ? 'bg-rose-100 text-rose-700 line-through' : 'bg-emerald-200/50 text-emerald-800 hover:bg-emerald-200'}`}
                                >
                                  {isFull ? 'Booked Out' : (slot.epcPartner?.companyName || 'EPC Available')}
                                </button>
                              )
                           })}
                           {daySlots.length === 0 && (
                              <div className="text-[9px] font-bold p-1 rounded bg-emerald-100 text-emerald-700 text-center">EPC Available</div>
                           )}
                         </div>
                       )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="p-4 border-t bg-slate-50 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-600">
                {selectedSlot ? `Selected Slot: ${new Date(selectedSlot.date).toLocaleDateString()}` : selectedRawDate ? `Selected Date: ${new Date(selectedRawDate).toLocaleDateString()}` : 'Please select a date'}
              </span>
              <button onClick={handleBookInstallSlot} disabled={isSelectLoading || (!selectedSlot && !selectedRawDate)} className="px-6 py-2 bg-blue-600 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-2 shadow-md">
                <ShieldCheck className="w-4 h-4"/> {isSelectLoading ? 'Saving...' : 'Confirm Date'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
