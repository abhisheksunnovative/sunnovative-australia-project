import React, { useState, useEffect } from "react";
import { Globe, ArrowLeft, MapPin, PhoneCall, Calendar, ArrowRight, CheckCircle, Clock, Zap, DollarSign, ClipboardList, ShieldCheck, Mail, KeyRound, X , User } from "lucide-react";
import { useAdminSettings } from "../../hooks/useAdminSettings";

function BDEProspectsContent({ bdeId, country, bdeType, onBack, multiCountry }) {
  const isFreelancer = bdeType?.toLowerCase().includes("freelance");
  const [leads, setLeads] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectTypeFilter, setProjectTypeFilter] = useState("All");
  const [kwFilter, setKwFilter] = useState("All");
  const [followUpFilter, setFollowUpFilter] = useState("All");
  const [pendingDaysFilter, setPendingDaysFilter] = useState("All");
  const [activeSummaryFilter, setActiveSummaryFilter] = useState('All'); // 'All', 'DatePending', 'EPCPending', 'FollowUpToday', 'FollowUpTomorrow', 'FollowUpFuture' 
  const { projectTypes: dynamicProjectTypes } = useAdminSettings(country);
  const [loading, setLoading] = useState(true);
  
  const [bookingLead, setBookingLead] = useState(null);
  
  // OTP & Calendar States
  const [otpModalLead, setOtpModalLead] = useState(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
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
    const isIndia = country?.toLowerCase() === 'india' || country?.toLowerCase() === 'in';
    
    if (isIndia) {
      if (!customerPhone) return alert("Phone number required for OTP");
    } else {
      if (!customerEmail) return alert("Email required");
    }
    
    setIsOtpLoading(true);
    console.log(`[OTP-UI] Sending OTP for lead: ${otpModalLead?._id}, target: ${isIndia ? customerPhone : customerEmail}`);
    try {
      const token = localStorage.getItem('token');
      const payload = isIndia ? { phone: customerPhone } : { email: customerEmail };
      
      const res = await fetch(`${API_BASE}/api/leads/${otpModalLead._id}/request-date-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
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

  
  const [overdueDaysThreshold, setOverdueDaysThreshold] = useState(3);
  const [overdueFilterEnabled, setOverdueFilterEnabled] = useState(true);
  
  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/order-journey-settings?country=${country || 'india'}`);
      const data = await res.json();
      if (data && data.journeys && data.journeys.length > 0) {
        // Try to get setting from the first journey, default to 3
        const days = data.journeys[0].myProspectsOverdueDays;
        if (days !== undefined) setOverdueDaysThreshold(days);
      }
    } catch(err) {
      console.error("Failed to fetch order journey settings:", err);
    }
  };

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
        body: JSON.stringify({ tokenPaid: true })
      });
      if (res.ok) {
        alert("Token Payment Confirmed!");
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
    const leadCountry = (l.country || "australia").toLowerCase();
    const targetCountry = (country || "").toLowerCase();
    if (targetCountry && leadCountry !== targetCountry) return false;

    if (l.status === 'Converted' || l.status === 'Not Interested' || l.status === 'Lost' || l.bdeMovedToOrderJourney) return false; // removed l.convertedProjectId so it stays until fully converted
    
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
    // Summary Card Filters
    
    
    if (activeSummaryFilter === 'DatePending' && l.preferredInstallDate) return false;
        if (activeSummaryFilter === 'EPCPending' && (!l.preferredInstallDate || l.assignedEPCName)) return false;
    
    
    
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

    
    if (pendingDaysFilter !== "All") {
      if (l.preferredInstallDate) return false;
      const days = Math.floor((Date.now() - new Date(l.createdAt || l.updatedAt).getTime()) / (1000 * 3600 * 24));
      if (pendingDaysFilter.endsWith("+")) {
        const threshold = parseInt(pendingDaysFilter.replace("+", ""));
        if (days < threshold) return false;
      } else {
        if (days !== parseInt(pendingDaysFilter)) return false;
      }
    }

    if (searchQuery) {
      return (l.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
             (l.mobile || "").includes(searchQuery);
    }
    return true;
  });

  
  const datePendingCount = baseProspects.filter(l => !l.preferredInstallDate).length;
    const overdueCount = baseProspects.filter(l => !l.preferredInstallDate && ((Date.now() - new Date(l.createdAt || l.updatedAt).getTime()) / (1000 * 3600 * 24)) > overdueDaysThreshold).length;
    const epcPendingCount = baseProspects.filter(l => l.preferredInstallDate && !l.assignedEPCName).length;
  
  const todayStr = new Date().toDateString();
  const tomorrowObj = new Date(); tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toDateString();
  
  let fuTodayCount = 0;
  let fuTomorrowCount = 0;
  let fuFutureCount = 0;
  
  baseProspects.forEach(l => {
    if(l.nextFollowUp) {
       const fuStr = new Date(l.nextFollowUp).toDateString();
       if(fuStr === todayStr) fuTodayCount++;
       else if(fuStr === tomorrowStr) fuTomorrowCount++;
       else if(new Date(l.nextFollowUp) > new Date()) fuFutureCount++;
    }
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

      
        {/* Top Summary Cards (Sticky Filters) */}
        <div className="sticky top-0 z-20 bg-slate-50 p-2 shadow-sm rounded-xl mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 1. Install Date Pending */}
            <div 
              onClick={() => setActiveSummaryFilter(activeSummaryFilter === 'DatePending' ? 'All' : 'DatePending')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer shadow-sm flex flex-col justify-between ${activeSummaryFilter === 'DatePending' ? 'bg-indigo-50 border-indigo-400 ring-4 ring-indigo-100' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-indigo-600 font-bold">
                  <Calendar className="w-5 h-5"/> Install Date Pending
                </div>
                <div className="flex items-center gap-2">
                  {overdueCount > 0 && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black animate-pulse">{overdueCount} Overdue</span>}
                  <span className={`text-xl font-black ${activeSummaryFilter === 'DatePending' ? 'text-indigo-700' : 'text-slate-800'}`}>{datePendingCount}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Needs Installation Date</p>
            </div>



            {/* 3. EPC Pending */}
            <div 
              onClick={() => setActiveSummaryFilter(activeSummaryFilter === 'EPCPending' ? 'All' : 'EPCPending')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer shadow-sm flex flex-col justify-between ${activeSummaryFilter === 'EPCPending' ? 'bg-blue-50 border-blue-400 ring-4 ring-blue-100' : 'bg-white border-slate-200 hover:border-blue-300'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-blue-600 font-bold">
                  <MapPin className="w-5 h-5"/> EPC Pending
                </div>
                <span className={`text-xl font-black ${activeSummaryFilter === 'EPCPending' ? 'text-blue-700' : 'text-slate-800'}`}>{epcPendingCount}</span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Awaiting EPC Partner</p>
            </div>
            
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center relative z-10">
        <input 
          type="text" 
          placeholder="Search by name or phone..." 
          className="flex-1 min-w-[200px] px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        
        {/* Pending Days Filter */}
        <select 
          className="px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500 font-medium text-slate-600"
          value={pendingDaysFilter}
          onChange={(e) => setPendingDaysFilter(e.target.value)}
        >
          <option value="All">All Pending Days</option>
          {Array.from({ length: overdueDaysThreshold }).map((_, i) => (
            <option key={i+1} value={i+1}>{i+1} Day{i+1 > 1 ? 's' : ''} Pending</option>
          ))}
          <option value={`${overdueDaysThreshold}+`}>{`${overdueDaysThreshold}+`} Days Pending</option>
        </select>
        
        {/* Follow Up Filter */}
        <select 
          className="px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500 font-medium text-slate-600"
          value={followUpFilter}
          onChange={(e) => setFollowUpFilter(e.target.value)}
        >
          <option value="All">All Follow-ups</option>
          <option value="Today">Follow-up Today</option>
          <option value="Tomorrow">Follow-up Tomorrow</option>
          <option value="Future">Follow-up Future</option>
        </select>
        
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
                </div>
              </div>

              {/* Col 2: Project Specs & Follow-up (Middle) */}
              <div className="flex-1 min-w-[250px] w-full lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-center items-center gap-3">
                  
                  {/* Overdue Badge */}
                  {!lead.preferredInstallDate && Math.floor((Date.now() - new Date(lead.createdAt || lead.updatedAt).getTime()) / (1000 * 3600 * 24)) >= overdueDaysThreshold && (
                    <div className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-1.5 rounded-lg border border-rose-200 w-fit flex items-center gap-1.5 shadow-sm">
                      <Clock className="w-3.5 h-3.5"/> Overdue for Install Date (&gt;{Math.floor((Date.now() - new Date(lead.createdAt || lead.updatedAt).getTime()) / (1000 * 3600 * 24))} days)
                    </div>
                  )}

                  {lead.status !== 'Converted' && (
                    <div className="flex flex-col items-center justify-center w-full gap-2 mt-2">
                      <div className="text-center">
                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider mb-0.5">Project Specs</p>
                        <h4 className="text-base font-black text-indigo-700">{dynamicProjectTypes?.find(pt => pt.value === lead.solarType)?.label || lead.solarType || 'Standard'}</h4>
                        <div className="inline-block mt-1 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">
                          <span className="font-bold text-slate-800 text-sm">{lead.kw || lead.systemSizeKW || "N/A"} kW</span>
                          <span className="text-[10px] text-slate-500 font-medium ml-1">System</span>
                        </div>
                      </div>

                      {/* Follow up date picker (Inline clean design) */}
                      {((!isAU && !lead.tokenPaid) || (isAU && (!lead.preferredInstallDate || !lead.assignedEPCName || !lead.address))) && (
                        <div className="flex items-center gap-2 mt-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-slate-400"/>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Follow-up:</span>
                          <input 
                            type="date" 
                            className="bg-transparent text-[11px] font-bold text-blue-700 cursor-pointer outline-none w-[110px]"
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
                      )}
                    </div>
                  )}
              </div>

              {/* Col 3: Action Buttons (Right) */}
              <div className="flex-1 min-w-[220px] w-full lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-center items-center gap-3 relative">
                
                
                {lead.status === 'Converted' ? (
                  <div className="text-center p-3 bg-emerald-50 border border-emerald-200 rounded-lg w-full mt-6">
                    <p className="text-sm font-bold text-emerald-700 uppercase">Converted to Order</p>
                    <p className="text-xs text-emerald-600 mt-1">Moved to Customer Order Journey</p>
                  </div>
                ) : (
                  <div className="flex flex-col justify-center w-full max-w-[200px] gap-3 mt-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowDetailsModal(lead); }}
                      className="w-full justify-center px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-colors border border-slate-200 flex items-center gap-2 shadow-sm"
                    >
                      <User className="w-4 h-4 text-blue-500"/> Show Details
                    </button>

                    {!lead.preferredInstallDate ? (
                      <button onClick={() => handleRequestOtp(lead)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5">
                        <Calendar className="w-4 h-4"/> Select Install Date
                      </button>
                    ) : (
                      <div className="text-center w-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px] py-2 px-3 rounded-xl">
                        Install Date: {new Date(lead.preferredInstallDate).toLocaleDateString('en-IN')}
                      </div>
                    )}
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
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">
                    {(country?.toLowerCase() === 'india' || country?.toLowerCase() === 'in') ? 'Customer Phone' : 'Customer Email'}
                  </label>
                  <div className="relative">
                    {(country?.toLowerCase() === 'india' || country?.toLowerCase() === 'in') ? (
                      <PhoneCall className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    ) : (
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    )}
                    {(country?.toLowerCase() === 'india' || country?.toLowerCase() === 'in') ? (
                      <input 
                        autoFocus
                        type="tel" 
                        value={customerPhone} 
                        onChange={e => setCustomerPhone(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendOtp()}
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                        placeholder="Customer Mobile Number"
                      />
                    ) : (
                      <input 
                        autoFocus
                        type="email" 
                        value={customerEmail} 
                        onChange={e => setCustomerEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendOtp()}
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                        placeholder="customer@email.com"
                      />
                    )}
                  </div>
                  <button 
                    onClick={sendOtp} 
                    disabled={isOtpLoading || ((country?.toLowerCase() === 'india' || country?.toLowerCase() === 'in') ? !customerPhone : !customerEmail)} 
                    className="w-full py-2.5 bg-blue-600 disabled:opacity-50 text-white font-bold rounded-lg"
                  >
                    {isOtpLoading ? 'Sending...' : 'Send OTP to Customer'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-700 font-medium">
                    ✅ OTP sent to <strong>{(country?.toLowerCase() === 'india' || country?.toLowerCase() === 'in') ? customerPhone : customerEmail}</strong>
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

            {/* Customer Details Modal */}
      {showDetailsModal && (
          <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowDetailsModal(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 leading-tight">Customer Details</h3>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">{showDetailsModal.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailsModal(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition cursor-pointer">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-5 overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Customer Name</p>
                    <p className="font-black text-slate-800 text-sm mt-0.5 truncate">{showDetailsModal.name || showDetailsModal.customerName}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Mobile</p>
                    <p className="font-black text-slate-800 text-sm mt-0.5">{showDetailsModal.mobile || showDetailsModal.customerMobile || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Project Type</p>
                    <p className="font-black text-slate-800 text-sm mt-0.5 truncate">{showDetailsModal.solarType === 'au-standard-family' ? 'Residential' : (dynamicProjectTypes?.find(pt => pt.value === showDetailsModal.solarType)?.label || (showDetailsModal.solarType === 'surya-ghar' ? 'PM Surya Ghar' : showDetailsModal.solarType)) || showDetailsModal.projectType || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 md:col-span-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                    <p className="font-black text-slate-800 text-sm mt-0.5 break-all">{showDetailsModal.email || showDetailsModal.customerEmail || 'N/A'}</p>
                  </div>
                </div>
  
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <MapPin className="w-4 h-4 text-blue-500"/> Location Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-500 text-xs block mb-0.5">State</span> <span className="font-bold text-slate-800">{showDetailsModal.state || 'N/A'}</span></div>
                    <div><span className="text-slate-500 text-xs block mb-0.5">District / Suburb</span> <span className="font-bold text-slate-800">{showDetailsModal.district || showDetailsModal.suburb || 'N/A'}</span></div>
                    {showDetailsModal.address && showDetailsModal.address !== 'N/A' && <div className="col-span-2"><span className="text-slate-500 text-xs block mb-0.5">Full Address</span> <span className="font-bold text-slate-800">{showDetailsModal.address}</span></div>}
                    <div><span className="text-slate-500 text-xs block mb-0.5">Pincode</span> <span className="font-bold text-slate-800">{showDetailsModal.pincode || showDetailsModal.postcode || 'N/A'}</span></div>
                  </div>
                </div>
  
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <Zap className="w-4 h-4 text-amber-500"/> Technical Specs & Utility
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div><span className="text-slate-500 text-xs block mb-0.5">System Size</span> <span className="font-bold text-slate-800">{showDetailsModal.kw || showDetailsModal.systemSizeKW || "N/A"} kW</span></div>
                    {showDetailsModal.propertyType && showDetailsModal.propertyType !== "N/A" && <div><span className="text-slate-500 text-xs block mb-0.5">Property Type</span> <span className="font-bold text-slate-800">{showDetailsModal.propertyType}</span></div>}
                    {showDetailsModal.roofType && showDetailsModal.roofType !== "N/A" && <div><span className="text-slate-500 text-xs block mb-0.5">Roof Type</span> <span className="font-bold text-slate-800">{showDetailsModal.roofType}</span></div>}
                    <div><span className="text-slate-500 text-xs block mb-0.5">{showDetailsModal.country === 'australia' || showDetailsModal.country === 'au' ? 'Quarterly Bill' : 'Monthly Bill'}</span> <span className="font-bold text-slate-800">{showDetailsModal.billAmount || showDetailsModal.monthlyBill ? (showDetailsModal.country === "australia" || showDetailsModal.country === "au" ? "$" : "\u20B9") + (showDetailsModal.billAmount || showDetailsModal.monthlyBill) : "N/A"}</span></div>
                    {showDetailsModal.discom && showDetailsModal.discom !== "Not detected" && <div><span className="text-slate-500 text-xs block mb-0.5">Discom / Retailer</span> <span className="font-bold text-slate-800">{showDetailsModal.discom}</span></div>}
                    {showDetailsModal.tariff && showDetailsModal.tariff !== "Not detected" && <div><span className="text-slate-500 text-xs block mb-0.5">Tariff</span> <span className="font-bold text-slate-800">{showDetailsModal.tariff}</span></div>}
                    {showDetailsModal.meterCategory && showDetailsModal.meterCategory !== "Not detected" && <div><span className="text-slate-500 text-xs block mb-0.5">Meter Category</span> <span className="font-bold text-slate-800">{showDetailsModal.meterCategory}</span></div>}
                    {showDetailsModal.subsidy > 0 && <div><span className="text-slate-500 text-xs block mb-0.5">{showDetailsModal.country === "australia" ? "Estimated STC Rebate" : "Estimated Subsidy"}</span> <span className="font-bold text-emerald-600">{(showDetailsModal.country === "australia" ? "$" : "\u20B9") + showDetailsModal.subsidy}</span></div>}
                  </div>
                  {(showDetailsModal.billUrl || showDetailsModal.billFileUrl) && (
                    <div className="pt-2 border-t border-slate-200 mt-2">
                       <a href={showDetailsModal.billUrl || showDetailsModal.billFileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"><Zap className="w-3 h-3"/> View Uploaded Bill</a>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0 rounded-b-2xl">
                <button onClick={() => setShowDetailsModal(null)} className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 transition shadow-sm cursor-pointer">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
</div>
  );
}

export default function BDEProspects({ bdeId, country, bdeType }) {
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">My Prospects</h1>
          <p className="text-slate-500">Select a country to view your prospects.</p>
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
      <BDEProspectsContent bdeId={bdeId} country={selectedCountry || country} bdeType={bdeType} multiCountry={bdeCountries.length > 1} onBack={() => setSelectedCountry(null)} />
    </div>
  );
}
