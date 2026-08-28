import React, { useState, useEffect } from "react";
import { MapPin, PhoneCall, Calendar, ArrowRight, UserCheck, CheckCircle, Edit2, Plus, X, ShieldCheck, XCircle, Clock, Zap , User } from "lucide-react";
import UnifiedAddLeadModal from "../UnifiedAddLeadModal";
import { useAdminSettings } from "../../hooks/useAdminSettings";

const STATUS_OPTIONS = ["New", "Called", "Interested", "Follow Up", "Meeting Scheduled", "Survey Done", "Negotiation", "Converted", "Not Interested", "Lost"];

const STATUS_RANK = {
  "New": 1,
  "Called": 2,
  "Interested": 3,
  "Follow Up": 4,
  "Meeting Scheduled": 5,
  "Survey Done": 6,
  "Negotiation": 7,
  "Converted": 8,
  "Not Interested": 0,
  "Lost": 0
};

export default function BDELeadManagement({ bdeId, country, bdeType, filterTab = "self-leads" }) {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";
  const [isFreelancer, setIsFreelancer] = useState(bdeType?.toLowerCase().includes("freelance") || false);
  useEffect(() => {
    fetch(`${API_BASE}/api/bde/${bdeId}`).then(r => r.json()).then(d => { 
      if(d.success && d.bde?.bdeType?.toLowerCase().includes("freelance")) { 
        setIsFreelancer(true); setActiveTab("manual"); 
      } else {
        setIsFreelancer(false); setActiveTab("website");
      }
    }).catch(e=>{});
  }, [bdeId, API_BASE]);
  const [leads, setLeads] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("date-desc");
  const [projectTypeFilter, setProjectTypeFilter] = useState("All");
  const { projectTypes: dynamicProjectTypes } = useAdminSettings(country);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  
  const isAU = country?.toLowerCase() === 'australia' || country?.toLowerCase() === 'au' || localStorage.getItem('userCountry')?.toLowerCase() === 'australia' || window.location.pathname.includes('aust');

  const [viewingDetailLead, setViewingDetailLead] = useState(null);
  const [recommendModalLead, setRecommendModalLead] = useState(null);
  const [availableEpcsForBde, setAvailableEpcsForBde] = useState([]);
  const [selectedEpcIdsForCustomer, setSelectedEpcIdsForCustomer] = useState([]);
  const [isSendingRecommendations, setIsSendingRecommendations] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);
  const [formData, setFormData] = useState({
    name: '', mobile: '', email: '', district: '', 
    state: isAU ? 'New South Wales' : 'Gujarat', 
    pincode: '', kw: '', billAmount: '', 
    solarType: isAU ? 'au-standard-family' : 'surya-ghar', 
    notes: '', consumerNumber: '', discom: '', tariff: '', meterCategory: '',
    country: isAU ? 'australia' : 'india'
  });

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
        headers: { "x-country": isAU ? "australia" : "india" },
        body: formDataUpload
      });
      
      const data = await res.json();
      
      if (data.extracted) {
        const ex = data.extracted;
        setFormData(prev => {
          let pType = prev.solarType;
          if (isAU) {
            pType = ex.solarType || "au-standard-family";
          } else if (ex.meterCategory) {
            const cat = ex.meterCategory.toLowerCase();
            if (cat.includes("commercial") || cat.includes("industrial") || cat.includes("lt-2") || cat.includes("lt-3")) pType = "commercial";
            else if (cat.includes("residential") || cat.includes("domestic") || cat.includes("lt-1")) pType = "surya-ghar";
          }

          return {
            ...prev,
            name: ex.consumerName || ex.name || prev.name,
            billAmount: ex.billAmount || prev.billAmount,
            district: ex.district || ex.city || ex.suburb || prev.district,
            state: ex.detectedState || ex.state || prev.state || (isAU ? 'New South Wales' : 'Gujarat'),
            pincode: ex.postcode || ex.pincode || prev.pincode,
            kw: data.recommendedKw || ex.kw || prev.kw,
            solarType: pType,
            consumerNumber: ex.consumerNumber || ex.nmi || prev.consumerNumber,
            discom: ex.discomId || ex.retailer || ex.dnsp || prev.discom,
            tariff: ex.tariffCode || prev.tariff,
            meterCategory: ex.meterCategory || prev.meterCategory,
            country: isAU ? 'australia' : 'india'
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
  const [isConfirmDateCalendarOpen, setIsConfirmDateCalendarOpen] = useState(false);
  const [confirmingLead, setConfirmingLead] = useState(null);
  const [calendarSlots, setCalendarSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedRawDate, setSelectedRawDate] = useState(null);
  const [qualifyingLead, setQualifyingLead] = useState(null);
  const [billUploadLead, setBillUploadLead] = useState(null);
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
    setCurrentLead(null);
    setFormData({
      name: '', mobile: '', email: '', district: '', 
      state: isAU ? 'New South Wales' : 'Gujarat', 
      pincode: '', kw: '', billAmount: '', 
      solarType: isAU ? 'au-standard-family' : 'surya-ghar', 
      notes: '', consumerNumber: '', discom: '', tariff: '', meterCategory: '',
      country: isAU ? 'australia' : 'india'
    });
    setUploadedFile(null);
    setScanError("");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (lead) => {
    setCurrentLead(lead);
    setFormData({ 
      name: lead.name || '', mobile: lead.mobile || '', email: lead.email || '', 
      district: lead.district || '', state: lead.state || (isAU ? 'New South Wales' : 'Gujarat'), pincode: lead.pincode || lead.postcode || '', 
      kw: lead.kw || '', billAmount: lead.billAmount || '', solarType: lead.solarType || (isAU ? 'au-standard-family' : 'surya-ghar'), notes: lead.notes || '',
      consumerNumber: lead.consumerNumber || '', discom: lead.discom || lead.retailer || '', tariff: lead.tariff || '', meterCategory: lead.meterCategory || '',
      preferredInstallDate: lead.preferredInstallDate || '',
      country: lead.country || (isAU ? 'australia' : 'india')
    });
    setIsEditModalOpen(true);
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    try {
      const url = currentLead ? `${API_BASE}/api/bde/leads/${currentLead._id}/details` : `${API_BASE}/api/bde/${bdeId}/leads`;
      const method = currentLead ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "x-country": isAU ? "australia" : "india" },
        body: JSON.stringify({ ...formData, country: isAU ? "australia" : "india" })
      });
      if(res.ok) {
        setIsAddModalOpen(false); setIsEditModalOpen(false); setCurrentLead(null);
        fetchLeads();
      }
    } catch(err) { console.error(err); }
  };

  const updateLeadStatus = async (leadId, status, nextFollowUp = null) => {
    const targetLead = leads.find(l => l._id === leadId);
    if (!targetLead) return;

    try {
      const res = await fetch(`${API_BASE}/api/bde/leads/${leadId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, nextFollowUp })
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (err) { console.error(err); }
  };

  const handleReject = async (lead) => {
    if (!window.confirm(`Reject ${lead.name}'s lead?`)) return;
    updateLeadStatus(lead._id, "Not Interested");
  };

  
  const handleOpenUploadBill = (lead) => {
    setCurrentLead(lead);
    setIsAddModalOpen(true);
  };

  const handleBillUploadAndQualify = async (e) => {
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
        headers: { "x-country": isAU ? "australia" : "india" },
        body: formDataUpload
      });
      const data = await res.json();

      if (data.success && (data.details || data.extracted)) {
         const details = data.details || data.extracted;
         // Now update the lead with these details!
         const updateRes = await fetch(`${API_BASE}/api/bde/leads/${billUploadLead._id}/details`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "x-country": isAU ? "australia" : "india" },
            body: JSON.stringify({
               billAmount: details.billAmount || (isAU ? 300 : 1500),
               nmi: details.nmi || details.consumerNumber || details.accountNumber,
               consumerNumber: details.consumerNumber || details.accountNumber,
               retailer: details.retailer || details.discom,
               discom: details.retailer || details.discomId || details.discom,
               meterCategory: details.meterType || details.meterCategory,
               tariff: details.tariffType || details.tariffCode || details.tariffDesc || details.tariff,
               kw: details.kwRecommendation || data.recommendedKw || (isAU ? 5 : 3),
               solarType: details.projectTypeRecommendation || 'residential',
               billUrl: data.fileUrl
            })
         });
         if (updateRes.ok) {
            // Auto-qualify the lead into My Prospects (no manual button needed)
            console.log(`[BDE] Bill uploaded for lead ${billUploadLead._id}. Calling eligibility API...`);
            try {
              const eligRes = await fetch(`${API_BASE}/api/bde/leads/${billUploadLead._id}/eligibility`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isEligibleForInstallation: true })
              });
              const eligData = await eligRes.json();
              console.log(`[BDE] Eligibility API response:`, eligRes.status, eligData);
              if (!eligRes.ok) {
                console.error("[BDE] Eligibility API failed:", eligData);
                alert("Bill scanned but auto-qualification failed. Please refresh and check My Prospects.");
              } else {
                alert(`Bill scanned! Lead "${billUploadLead.name}" moved to My Prospects automatically.`);
              }
            } catch (e) { 
              console.error("[BDE] Auto-eligibility exception:", e); 
              alert("Bill scanned but qualification error occurred. Check console.");
            }
            setBillUploadLead(null);
            fetchLeads();
         }
      } else {
        setScanError(data.message || "Failed to extract details.");
      }
    } catch (err) {
      setScanError("Error scanning bill.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleQualify = async (lead) => {
    setQualifyingLead(lead);
    setSelectedSlot(null);
    setCurrentMonth(new Date());

    // If customer selected a date, pre-select it
    if (lead.preferredInstallDate) {
      setSelectedRawDate(new Date(lead.preferredInstallDate).toDateString());
    } else {
      setSelectedRawDate(null);
    }

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
        payload.preferredDate = selectedSlot.date;
      } else if (selectedRawDate) {
        payload.preferredDate = selectedRawDate;
      } else {
        alert("Please select a date from the calendar.");
        return;
      }

      const res = await fetch(`${API_BASE}/api/bde/leads/${qualifyingLead._id}/schedule`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledDate: payload.preferredDate })
      });
      const data = await res.json();
      if (data.success) {
        alert("Installation date locked successfully! The lead is now moved to your Prospects.");
        setIsCalendarModalOpen(false);
        fetchLeads();
      } else {
        alert(data.message || "Failed to schedule");
      }
    } catch (err) { console.error(err); alert("Error processing request"); }
  };

  const handleConfirmDate = (lead) => {
    setConfirmingLead(lead);
    const initialDate = lead.preferredInstallDate ? new Date(lead.preferredInstallDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
    setSelectedRawDate(initialDate);
    setIsConfirmDateCalendarOpen(true);
  };

  const handleLockFinalDate = async () => {
    if (!confirmingLead) return;
    const pId = confirmingLead.convertedProjectId || confirmingLead._id;
    const finalDate = selectedRawDate || (confirmingLead.preferredInstallDate ? new Date(confirmingLead.preferredInstallDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
    
    try {
      const res = await fetch(`${API_BASE}/api/project-orders/${pId}/confirm-install-date`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ preferredDate: finalDate, preferredInstallDate: finalDate })
      });
      const data = await res.json();
      if (data.success) {
        alert(`🎉 Installation Date Officially Confirmed & Locked for ${new Date(finalDate).toLocaleDateString("en-IN")}!

Dual SMS & Email dispatches + In-App Notifications have been sent to both Customer and EPC Partner.`);
        setIsConfirmDateCalendarOpen(false);
        setConfirmingLead(null);
        fetchLeads();
      } else {
        alert(data.message || "Failed to confirm date");
      }
    } catch (err) { console.error(err); alert("Error confirming date"); }
  };

  const handleOpenRecommendModal = async (lead) => {
    setRecommendModalLead(lead);
    if (lead.recommendedEpcs && lead.recommendedEpcs.length > 0) {
      const existingIds = lead.recommendedEpcs.map(epc => (typeof epc === 'object' ? epc._id : epc));
      setSelectedEpcIdsForCustomer(existingIds);
    } else {
      setSelectedEpcIdsForCustomer([]);
    }

    try {
      const res = await fetch(`${API_BASE}/api/bde/epcs?country=australia`);
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setAvailableEpcsForBde(data.data);
      }
    } catch (err) {
      console.error("Error fetching Australian EPCs:", err);
    }
  };

  const handleSendEpcRecommendations = async () => {
    if (!recommendModalLead || selectedEpcIdsForCustomer.length === 0) {
      alert("Please select at least 1 EPC installer to suggest to the customer.");
      return;
    }
    setIsSendingRecommendations(true);
    try {
      const pId = recommendModalLead.convertedProjectId || recommendModalLead._id;
      const res = await fetch(`${API_BASE}/api/bde/projects/${pId}/recommend-epcs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ epcIds: selectedEpcIdsForCustomer })
      });
      const data = await res.json();
      if (data.success) {
        alert(`🎉 Success! EPC suggestions sent to ${recommendModalLead.name}.

Customer has been notified in Customer Portal to select their preferred installer.`);
        setRecommendModalLead(null);
        fetchLeads();
      } else {
        alert(data.message || "Failed sending recommendations");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending recommendations");
    } finally {
      setIsSendingRecommendations(false);
    }
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const customerDateStr = qualifyingLead?.preferredInstallDate ? new Date(qualifyingLead.preferredInstallDate).toDateString() : null;

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-transparent bg-transparent"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateString = dateObj.toDateString();
      const isPastDate = dateObj < today;

      const daySlots = calendarSlots.filter(s => new Date(s.date).toDateString() === dateString);
      const allSlotsBlocked = daySlots.length > 0 && daySlots.every(s => s.isBlocked || s.currentBookings >= s.maxBookings);
      const isCustomerChosen = customerDateStr === dateString;
      const isRawSelected = selectedRawDate === dateString && !selectedSlot;

      days.push(
        <div 
          key={`day-${day}`} 
          onClick={() => {
            if (isPastDate) return;
            setSelectedSlot(null);
            setSelectedRawDate(dateString);
          }}
          className={`min-h-[95px] border p-1.5 rounded-xl flex flex-col gap-1 relative overflow-hidden transition-all ${
            isPastDate
              ? 'bg-slate-100/60 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
              : isCustomerChosen
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400 shadow-md cursor-pointer'
              : isRawSelected
              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300 shadow-md cursor-pointer'
              : allSlotsBlocked
              ? 'bg-rose-50/70 border-rose-200 cursor-pointer hover:bg-rose-100/70'
              : 'bg-emerald-50/40 border-emerald-200/80 cursor-pointer hover:bg-emerald-100/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black ${isPastDate ? 'text-slate-400' : isCustomerChosen ? 'text-amber-900' : isRawSelected ? 'text-blue-800' : 'text-slate-700'}`}>{day}</span>
            {isCustomerChosen && (
              <span className="text-[9px] font-black bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-md shadow-xs">
                ⭐ Preferred
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-end gap-1">
            {isPastDate ? (
              <span className="text-[9px] font-bold text-slate-400 italic">Past Date</span>
            ) : allSlotsBlocked ? (
              <div className="text-[10px] font-bold px-1.5 py-1 rounded bg-rose-100 text-rose-700 border border-rose-200 text-center">
                🔴 Fully Booked
              </div>
            ) : daySlots.length > 0 ? (
              daySlots.map(slot => {
                const isAvailable = !slot.isBlocked && slot.currentBookings < slot.maxBookings;
                const isSelected = selectedSlot?._id === slot._id;
                return (
                  <div 
                    key={slot._id}
                    onClick={(e) => { e.stopPropagation(); if (isAvailable) { setSelectedSlot(slot); setSelectedRawDate(dateString); } }}
                    className={`text-[10px] p-1 rounded-md cursor-pointer border transition-all ${
                      !isAvailable 
                        ? 'bg-rose-100 text-rose-700 border-rose-200 cursor-not-allowed' 
                        : isSelected 
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm font-bold' 
                        : 'bg-emerald-100/80 text-emerald-800 border-emerald-300 font-semibold hover:bg-emerald-200'
                    }`}
                  >
                    <div className="truncate">{isAvailable ? "🟢 Available Slot" : "🔴 Booked Slot"}</div>
                    <div className="text-[8px] opacity-80">{slot.currentBookings}/{slot.maxBookings} Booked</div>
                  </div>
                );
              })
            ) : (
              <div className="text-[10px] font-bold px-1.5 py-1 rounded bg-emerald-100/90 text-emerald-800 border border-emerald-300 text-center">
                🟢 EPC Available
              </div>
            )}
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

  console.log("Total leads fetched:", leads.length);
  // For eligibility tab: exclude leads already qualified (they move to My Prospects)
  // For other tabs: exclude installDateBooked leads (those are shown in prospects)
  const baseLeads = leads.filter(l => {
    if (l.status === 'Converted' || l.status === 'Not Interested' || l.status === 'Lost' || l.convertedProjectId) return false;
    if (filterTab === 'eligibility' && l.isEligibleForInstallation) return false; // Already qualified → in My Prospects
    return true;
  });
  const manualLeads = baseLeads.filter(l => l.history?.some(h => h.action.includes("Manually created by BDE")));
  console.log("Manual leads count:", manualLeads.length);
  const websiteLeads = baseLeads.filter(l => !l.history?.some(h => h.action.includes("Manually created by BDE")));
    const filteredByTabLeads = (activeTab === "manual" ? manualLeads : websiteLeads).filter(l => {
    if (filterTab === "eligibility") {
      if (l.isEligibleForInstallation === true) return false;
    } else if (filterTab === "self-leads") {
      if (isFreelancer && l.isEligibleForInstallation !== true) return false;
    }
    return true;
  });

  const getCountForProjectType = (ptValue) => {
    if (ptValue === "All") return filteredByTabLeads.length;
    return filteredByTabLeads.filter(l => (l.solarType || l.projectType || "").toLowerCase() === ptValue.toLowerCase()).length;
  };

  const displayedLeads = filteredByTabLeads.filter(l => { 
    if (filterStatus !== "ALL" && l.status !== filterStatus) return false;
    if (projectTypeFilter !== "All" && (l.solarType || l.projectType || "").toLowerCase() !== projectTypeFilter.toLowerCase()) return false;
    if (!searchQuery) return true; 
    const sq = searchQuery.toLowerCase(); 
    return (l.name || "").toLowerCase().includes(sq) || (l.email || "").toLowerCase().includes(sq) || (l.mobile || "").toLowerCase().includes(sq); 
  });
  console.log("Displayed leads count:", displayedLeads.length, { filterStatus, projectTypeFilter, activeTab, isFreelancer });
  displayedLeads.sort((a, b) => { if (sortOrder === "date-desc") return new Date(b.createdAt) - new Date(a.createdAt); if (sortOrder === "date-asc") return new Date(a.createdAt) - new Date(b.createdAt); if (sortOrder === "name-asc") return (a.name || "").localeCompare(b.name || ""); if (sortOrder === "name-desc") return (b.name || "").localeCompare(a.name || ""); return 0; });

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading My Leads...</div>;

  if (recommendModalLead) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-6">
        {/* Full Page Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <button 
              onClick={() => setRecommendModalLead(null)} 
              className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-1 cursor-pointer"
            >
              ← Back to Lead Management
            </button>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-blue-600"/> 
              Suggest Top Certified EPC Installers for {recommendModalLead.name}
            </h1>
            <p className="text-xs font-bold text-amber-600 mt-0.5">
              5-Day Open Available Slots Target: {recommendModalLead.preferredInstallDate ? new Date(recommendModalLead.preferredInstallDate).toLocaleDateString("en-IN") : 'Next 5 Days'}
            </p>
          </div>
          <button 
            onClick={handleSendEpcRecommendations}
            disabled={selectedEpcIdsForCustomer.length === 0 || isSendingRecommendations}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center gap-2 shadow-md cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5"/> 
            {isSendingRecommendations ? "Sending..." : `Send (${selectedEpcIdsForCustomer.length}/3) EPC Suggestions to Customer`}
          </button>
        </div>

        {/* Customer Info Card Summary */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div><span className="text-slate-500 block font-semibold uppercase">Customer</span><strong className="text-slate-900 text-sm font-bold">{recommendModalLead.name}</strong></div>
          <div><span className="text-slate-500 block font-semibold uppercase">Mobile & Email</span><strong className="text-slate-900 font-bold">{recommendModalLead.mobile}</strong></div>
          <div><span className="text-slate-500 block font-semibold uppercase">System Capacity</span><strong className="text-amber-600 font-black text-sm">{recommendModalLead.kw || '6.6'} kW ({recommendModalLead.solarType || 'Residential'})</strong></div>
          <div><span className="text-slate-500 block font-semibold uppercase">Installation Date</span><strong className="text-emerald-700 font-black text-sm">{recommendModalLead.preferredInstallDate ? new Date(recommendModalLead.preferredInstallDate).toLocaleDateString("en-IN") : 'Not Set'}</strong></div>
        </div>

        {/* EPC Selection Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">
              Available Certified Australian Installers (Filtered by 5-Day Open Slots)
            </h3>
            <span className="text-xs text-slate-500 font-bold">Select up to 3 installers</span>
          </div>

          {availableEpcsForBde.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm font-bold bg-slate-50 rounded-2xl border">
              Loading top certified Australian installers...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableEpcsForBde.map((epc) => {
                const isSelected = selectedEpcIdsForCustomer.includes(epc._id);
                return (
                  <div
                    key={epc._id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedEpcIdsForCustomer(p => p.filter(id => id !== epc._id));
                      } else {
                        if (selectedEpcIdsForCustomer.length >= 3) {
                          alert("You can select up to 3 EPC installers to suggest.");
                          return;
                        }
                        setSelectedEpcIdsForCustomer(p => [...p, epc._id]);
                      }
                    }}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                      isSelected ? 'bg-blue-50/90 border-blue-600 shadow-md scale-[1.01]' : 'bg-white border-slate-200 hover:border-blue-300 shadow-xs'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                            {isSelected ? '✓' : ''}
                          </span>
                          <h4 className="font-black text-slate-900 text-base">{epc.companyName}</h4>
                        </div>
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-black rounded-lg shrink-0">
                          ⭐ {epc.rating || 4.9}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-semibold pl-7">
                        👤 {epc.ownerName || epc.contactPerson} ({epc.mobile || epc.phone || '0412345671'})
                      </p>
                      <p className="text-xs text-slate-500 pl-7">
                        ✉️ {epc.email || 'epc@sunnovative.com'}
                      </p>
                      <p className="text-xs text-slate-500 pl-7">
                        📍 {[epc.city, epc.state, epc.country].filter(Boolean).join(", ")}
                      </p>

                      <div className="pt-2 border-t border-slate-100 pl-7 space-y-1">
                        <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600"/> 5-Day Open Slot Available
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Total Installations: <strong>{epc.totalInstallations || epc.totalRatings || 140}+ Projects</strong>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          CEC Accreditation: <strong className="text-blue-700">{epc.kycDocuments?.cecAccreditationNumber || 'CEC-AU-CERTIFIED'}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        Verified & Active
                      </span>
                      <span className={`text-xs font-bold ${isSelected ? 'text-blue-700' : 'text-slate-400'}`}>
                        {isSelected ? '✓ Selected' : '+ Click to Select'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* --- TABS & ADD ACTION --- */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2">
          {!isFreelancer ? (
            <button 
              className="px-4 py-2 text-sm font-bold border-b-2 transition-all border-blue-600 text-blue-600"
            >
              Website Enquiries ({websiteLeads.length})
            </button>
          ) : (
            <button 
              className="px-4 py-2 text-sm font-bold border-b-2 transition-all border-blue-600 text-blue-600"
            >
              {filterTab === 'eligibility' ? 'Customer Eligibility' : 'Self-Sourced Leads'} ({manualLeads.length})
            </button>
          )}
        </div>
        {isFreelancer && (
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        )}
      </div>

      
      {/* FILTER & SORT BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex-1 max-w-md">
          <input 
            type="text" 
            placeholder="Search by Name, Email or Phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col flex-1 w-full overflow-hidden">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Project Type</label>
            <div className="w-full flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button 
                onClick={() => setProjectTypeFilter("All")}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1.5 ${projectTypeFilter === 'All' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50'}`}
              >
                All Types
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${projectTypeFilter === 'All' ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-600'}`}>{getCountForProjectType("All")}</span>
              </button>
              {dynamicProjectTypes.map(pt => {
                const ptCount = getCountForProjectType(pt.value);
                if (ptCount === 0 && projectTypeFilter !== pt.value) return null;
                return (
                  <button 
                    key={pt.value}
                    onClick={() => setProjectTypeFilter(pt.value)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1.5 ${projectTypeFilter === pt.value ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50'}`}
                  >
                    {pt.label}
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${projectTypeFilter === pt.value ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-600'}`}>{ptCount}</span>
                  </button>
                )
              })}
            </div>
          </div>
          
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Sort By</label>
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {displayedLeads.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 font-bold shadow-sm">
            No {activeTab === "manual" ? "self-sourced" : "website"} leads found for the selected filters.
          </div>
        ) : (
          displayedLeads.map((lead) => (
            <div key={lead._id} className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-400 transition-all flex flex-col lg:flex-row gap-6 relative group">
              
              {/* Col 1: Customer Details */}
              <div className="flex-1 min-w-[250px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="font-black text-lg text-slate-900 truncate">{lead.name}</div>
                  <button onClick={() => handleOpenEdit(lead)} className="text-slate-400 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5"/></button>
                </div>
                
                <div className="space-y-1.5">
                  <div className="text-sm text-slate-600 font-semibold flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-blue-500"/> 
                    {lead.mobile} 
                    {lead.email && <span className="ml-1 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[11px] border border-slate-200">{lead.email}</span>}
                  </div>
                  <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400"/>
                    {lead.district || lead.city}, {lead.state} {lead.pincode || lead.postcode ? `- ${lead.pincode || lead.postcode}` : ''}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5"/> Lead Added: {new Date(lead.createdAt).toLocaleDateString("en-IN")}
                  </div>
                  {/* Installation Date Badge */}
                  {lead.preferredInstallDate ? (
                    <div className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 inline-flex items-center gap-1.5 font-bold shadow-sm w-fit">
                      <Calendar className="w-4 h-4 text-emerald-600"/> Install: {new Date(lead.preferredInstallDate).toLocaleDateString("en-IN")}
                    </div>
                  ) : (
                    <div className="text-xs bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200 inline-flex items-center gap-1.5 font-bold w-fit shadow-sm">
                      <Calendar className="w-4 h-4 text-amber-500"/> Install: Not Selected
                    </div>
                  )}
                </div>
              </div>

              {/* Col 2: System Info */}
              <div className="flex-1 min-w-[200px] lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-center">
                <div className="text-sm font-black text-slate-800 capitalize mb-2 text-lg">
                  {lead.solarType || "Residential"} • {lead.kw || "6.6"} kW
                </div>
                <div className="text-sm text-slate-600 font-semibold flex items-center gap-2 mb-3">
                  <span className="text-slate-400">Est. Bill:</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">${lead.billAmount || 0} {isAU ? 'AUD' : 'INR'}</span>
                </div>
                
                

              </div>
              {/* Col 4: Actions */}
              <div className="flex-1 min-w-[200px] lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col items-end gap-3 justify-center">
                <div className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-2 shadow-sm mb-1">
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                      <Calendar className="w-3 h-3"/> Follow-up Date
                    </div>
                    <input 
                      type="date" 
                      className="bg-transparent border-none p-0 text-xs font-bold text-blue-700 cursor-pointer focus:ring-0"
                      value={lead.nextFollowUp ? lead.nextFollowUp.split("T")[0] : ""}
                      onChange={(e) => updateLeadStatus(lead._id, lead.status, e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setViewingDetailLead(lead)} 
                  className="w-full justify-center px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-colors border border-slate-200 flex items-center gap-2 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-500"/> Lead Details
                </button>

                {isFreelancer && filterTab === 'eligibility' ? (
                  <div className="w-full flex flex-col gap-2 mt-auto">
                    {!lead.billAmount ? (
                      <>
                        <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-lg font-bold text-center w-full shadow-sm">
                          Note: Upload the customer's bill to auto-qualify and move to My Prospects.
                        </p>
                        <button onClick={() => handleOpenUploadBill(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                          <Zap className="w-4 h-4" /> Upload Bill
                        </button>
                      </>
                    ) : (
                      <p className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg font-bold text-center w-full shadow-sm">
                        ✅ Bill uploaded — Lead is being automatically qualified and moved to My Prospects.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-2 mt-auto">
                    { (lead.hasLoggedIn || lead.preferredInstallDate) ? (
                        <button onClick={() => {
                          if (!lead.nextFollowUp) {
                            alert("Firstly select the follow up date");
                            return;
                          }
                          handleQualify(lead);
                        }} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                          <Calendar className="w-4 h-4" /> Finalize Date
                        </button>
                      ) : (
                        <div className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg font-bold text-center w-full shadow-sm flex flex-col gap-1.5">
                          <span>Ask customer to login and provide an installation date to unlock Finalize Date.</span>
                          <a href="/au/#account" target="_blank" className="text-rose-700 underline flex items-center justify-center gap-1"><ArrowRight className="w-3 h-3"/> Open Customer Portal</a>
                        </div>
                      )}
                    <button onClick={() => handleReject(lead)} className="w-full justify-center px-4 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold border border-rose-100 transition-colors flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5"/> Reject Lead
                    </button>
                  </div>
                )}
              </div>

            </div>
          ))
        )}
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

      {/* Confirm Installation Date Calendar Modal */}
      {isConfirmDateCalendarOpen && confirmingLead && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-amber-500 text-white">
              <div>
                <h2 className="font-black text-lg flex items-center gap-2">
                  📅 Confirm & Lock Final Installation Date
                </h2>
                <p className="text-xs text-amber-100 font-bold">
                  Customer: {confirmingLead.name} • EPC Assigned
                </p>
              </div>
              <button onClick={() => setIsConfirmDateCalendarOpen(false)} className="text-amber-100 hover:text-white"><X className="w-6 h-6"/></button>
            </div>

            <div className="p-4 bg-amber-50 border-b border-amber-200 text-xs font-bold text-amber-950 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-black">
                    Customer's Requested Date
                  </span>
                  <span className="text-sm font-black text-emerald-900 font-mono">
                    {confirmingLead.preferredInstallDate ? new Date(confirmingLead.preferredInstallDate).toLocaleDateString("en-IN") : 'Not Specified'}
                  </span>
                </div>
                {confirmingLead.preferredInstallDate && (
                  <button 
                    type="button"
                    onClick={() => setSelectedRawDate(new Date(confirmingLead.preferredInstallDate).toISOString().split("T")[0])}
                    className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-lg text-[11px] font-bold transition"
                  >
                    Reset to Customer's Date
                  </button>
                )}
              </div>
              <p className="text-[11px] text-amber-800 font-medium">
                📞 BDE phone calls Customer & EPC. If Customer's requested date is kept, proceed with default date. If changed, pick new date on calendar below.
              </p>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
              {renderCalendar()}
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
              <div>
                <span className="text-xs font-black text-slate-700 block">
                  Final Installation Date to Lock: <span className="text-amber-600 font-mono text-sm">{selectedRawDate ? new Date(selectedRawDate).toLocaleDateString("en-IN") : 'Select Date'}</span>
                </span>
                <span className="text-[10px] text-slate-400">Dual SMS & Email alerts + In-App Notifications will be sent to Customer & EPC.</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsConfirmDateCalendarOpen(false)} className="px-4 py-2 border rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-100">
                  Cancel
                </button>
                <button 
                  onClick={handleLockFinalDate} 
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 transition"
                >
                  <Calendar className="w-4 h-4" /> Lock & Confirm Installation Date
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal (Simplified) */}
      {isAddModalOpen && (
        <UnifiedAddLeadModal 
          isBDE={true} 
          bdeId={bdeId}
          userCountry={country}
          existingLead={currentLead}
          onClose={() => { setIsAddModalOpen(false); setCurrentLead(null); }} 
          onSuccess={() => { setIsAddModalOpen(false); setCurrentLead(null); fetchLeads(); }} 
        />
      )}
      {isEditModalOpen && (
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
              <div>
                <label className="text-xs font-bold text-emerald-700 mb-1 block">Preferred Install Date</label>
                <input 
                  type="date" 
                  className="w-full border p-2 rounded text-xs font-bold text-emerald-900 bg-emerald-50 border-emerald-300" 
                  value={formData.preferredInstallDate ? formData.preferredInstallDate.split("T")[0] : ""} 
                  onChange={e=>setFormData({...formData, preferredInstallDate: e.target.value})} 
                />
              </div>
              <div className="md:col-span-2"><label className="text-xs text-gray-500 mb-1 block">Notes</label><textarea className="w-full border p-2 rounded" value={formData.notes} onChange={e=>setFormData({...formData, notes: e.target.value})} /></div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Lead View Modal */}
      {viewingDetailLead && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-slate-900 text-white">
              <div>
                <h2 className="font-black text-lg">{viewingDetailLead.name}</h2>
                <p className="text-xs text-amber-400 font-bold">Comprehensive Lead Audit & SLA Tracker</p>
              </div>
              <button onClick={() => setViewingDetailLead(null)} className="text-slate-400 hover:text-white"><X className="w-6 h-6"/></button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm bg-slate-50/50">
              {/* Customer & Location */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Customer Contact & Address</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-slate-400 font-medium">Name:</span> <strong className="text-slate-800">{viewingDetailLead.name}</strong></div>
                  <div><span className="text-slate-400 font-medium">Mobile:</span> <strong className="text-blue-600">{viewingDetailLead.mobile}</strong></div>
                  <div><span className="text-slate-400 font-medium">Email:</span> <strong className="text-slate-700">{viewingDetailLead.email || '—'}</strong></div>
                  <div><span className="text-slate-400 font-medium">Country:</span> <strong className="text-slate-700">{viewingDetailLead.country || 'India'}</strong></div>
                  <div className="col-span-2"><span className="text-slate-400 font-medium">Address:</span> <strong className="text-slate-800">{[viewingDetailLead.address, viewingDetailLead.district || viewingDetailLead.city, viewingDetailLead.state, viewingDetailLead.pincode || viewingDetailLead.postcode].filter(Boolean).join(", ")}</strong></div>
                </div>
              </div>

              {/* Technical & Utility Info */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">System & Energy Provider</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-slate-400 font-medium">Solar Category:</span> <strong className="text-slate-800 capitalize">{viewingDetailLead.solarType || 'Residential'}</strong></div>
                  <div><span className="text-slate-400 font-medium">Capacity:</span> <strong className="text-amber-600 font-black">{viewingDetailLead.kw || '6.6'} kW</strong></div>
                  <div><span className="text-slate-400 font-medium">Quarterly Bill:</span> <strong className="text-emerald-600 font-black">{isAU ? `$${viewingDetailLead.billAmount || 0} AUD` : `₹${viewingDetailLead.billAmount || 0}`}</strong></div>
                  <div><span className="text-slate-400 font-medium">NMI / Consumer #:</span> <strong className="text-slate-900 font-mono">{viewingDetailLead.consumerNumber || '—'}</strong></div>
                  <div className="col-span-2"><span className="text-slate-400 font-medium">Retailer / DNSP:</span> <strong className="text-blue-700">{viewingDetailLead.discom || viewingDetailLead.retailer || '—'}</strong></div>
                </div>
              </div>

              {/* Installation Date & 5-Day SLA Tracker */}
              <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 space-y-2">
                <p className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-600" /> Customer Installation Date & 5-Day SLA Target
                </p>
                {viewingDetailLead.preferredInstallDate ? (
                  <div className="space-y-1.5 text-xs">
                    <p className="text-amber-950 font-bold">
                      📅 Preferred Install Date: <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-black text-xs">{new Date(viewingDetailLead.preferredInstallDate).toLocaleDateString("en-IN")}</span>
                    </p>
                    <p className="text-amber-900 font-semibold leading-relaxed">
                      ⏳ <strong>5-Day EPC Deadline:</strong> Must assign EPC and start installation by <span className="underline font-bold">{new Date(new Date(viewingDetailLead.preferredInstallDate).setDate(new Date(viewingDetailLead.preferredInstallDate).getDate() + 5)).toLocaleDateString("en-IN")}</span> (within 5 days of preferred date).
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-amber-800 font-bold italic">
                    ⚠️ Customer has not selected their Preferred Installation Date yet in Customer Portal.
                  </p>
                )}
              </div>

              {/* Rooftop Photo */}
              {viewingDetailLead.rooftopPhoto && (
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Rooftop Terrace Image</p>
                  <a href={`${API_BASE}${viewingDetailLead.rooftopPhoto}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-bold underline flex items-center gap-1">
                    📷 View Uploaded Terrace Image (Click to Open)
                  </a>
                </div>
              )}

              {/* Lead History */}
              {viewingDetailLead.history?.length > 0 && (
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">History & Audit Trail</p>
                  <div className="space-y-1">
                    {viewingDetailLead.history.slice(-5).reverse().map((h, i) => (
                      <p key={i} className="text-xs text-slate-500">• {h.action} <span className="text-[10px] text-slate-400">({new Date(h.date).toLocaleDateString("en-IN")})</span></p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-slate-100 flex justify-end">
              <button onClick={() => setViewingDetailLead(null)} className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs">
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EPC Suggestion Modal for Australia */}
      {recommendModalLead && (() => {
        const isAlreadySent = recommendModalLead.bdeRecommendationStatus === 'recommended' || (recommendModalLead.recommendedEpcs && recommendModalLead.recommendedEpcs.length > 0);
        return (
          <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className={`p-4 border-b flex justify-between items-center text-white ${isAlreadySent ? 'bg-emerald-900' : 'bg-blue-900'}`}>
                <div>
                  <h2 className="font-black text-lg flex items-center gap-2">
                    {isAlreadySent ? '🔒 Sent EPC Suggestions (Read-Only)' : `Suggest Top EPC Installers to ${recommendModalLead.name}`}
                  </h2>
                  <p className="text-xs text-amber-300 font-bold">5-Day Open Available Slots Filter (Target: {recommendModalLead.preferredInstallDate ? new Date(recommendModalLead.preferredInstallDate).toLocaleDateString("en-IN") : 'Next 5 Days'})</p>
                </div>
                <button onClick={() => setRecommendModalLead(null)} className="text-slate-400 hover:text-white"><X className="w-6 h-6"/></button>
              </div>

              <div className="p-6 overflow-y-auto space-y-3 flex-1 bg-slate-50/50">
                {isAlreadySent ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Suggestions have already been sent to {recommendModalLead.name}. You are viewing sent EPC choices.</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 font-medium">
                    Below are certified top-rated Australian installers with open available installation slots within 5 days of customer's date. Select up to 3 installers to suggest:
                  </p>
                )}

                {availableEpcsForBde.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-bold">
                    Loading top certified Australian installers...
                  </div>
                ) : (
                  availableEpcsForBde.map((epc) => {
                    const isSelected = selectedEpcIdsForCustomer.includes(epc._id);
                    if (isAlreadySent && !isSelected) return null; // Show only sent ones when already sent

                    return (
                      <div
                        key={epc._id}
                        onClick={() => {
                          if (isAlreadySent) return;
                          if (isSelected) {
                            setSelectedEpcIdsForCustomer(p => p.filter(id => id !== epc._id));
                          } else {
                            if (selectedEpcIdsForCustomer.length >= 3) {
                              alert("You can select up to 3 EPC installers to suggest.");
                              return;
                            }
                            setSelectedEpcIdsForCustomer(p => [...p, epc._id]);
                          }
                        }}
                        className={`p-3.5 rounded-xl border transition flex items-center justify-between ${
                          isAlreadySent ? 'bg-emerald-50/60 border-emerald-300' :
                          isSelected ? 'bg-blue-50 border-blue-500 shadow-xs cursor-pointer' : 'bg-white border-slate-200 hover:border-blue-300 cursor-pointer'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                              isAlreadySent ? 'bg-emerald-600 border-emerald-600 text-white' :
                              isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                            }`}>
                              ✓
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm">{epc.companyName}</h4>
                            {isAlreadySent && <span className="text-[10px] font-black bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded uppercase">Sent to Customer</span>}
                          </div>
                          <p className="text-xs text-slate-500 pl-6">Contact: {epc.ownerName || epc.contactPerson} ({epc.mobile || epc.phone || '0412345671'})</p>
                          <p className="text-[11px] text-emerald-700 font-bold pl-6 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600"/> Open Slots Available: {new Date(recommendModalLead.preferredInstallDate || Date.now()).toLocaleDateString("en-IN")} – {new Date(new Date(recommendModalLead.preferredInstallDate || Date.now()).setDate(new Date(recommendModalLead.preferredInstallDate || Date.now()).getDate() + 5)).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-black rounded-lg">
                            ⭐ {epc.rating || 4.9} ({epc.totalRatings || epc.totalInstallations || 140} Reviews)
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1 font-semibold">CEC Certified</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-4 border-t bg-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600">
                  {isAlreadySent ? `Dispatched: ${selectedEpcIdsForCustomer.length} Installers` : `Selected: ${selectedEpcIdsForCustomer.length}/3 Installers`}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setRecommendModalLead(null)} className="px-4 py-2 border rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-200">
                    {isAlreadySent ? 'Close' : 'Cancel'}
                  </button>
                  {!isAlreadySent && (
                    <button 
                      onClick={handleSendEpcRecommendations}
                      disabled={selectedEpcIdsForCustomer.length === 0 || isSendingRecommendations}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-1 shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4"/> {isSendingRecommendations ? "Sending..." : "Send EPC Suggestions to Customer"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
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
                    <div><span className="text-slate-500 text-xs block mb-0.5">Monthly Bill</span> <span className="font-bold text-slate-800">{showDetailsModal.billAmount || showDetailsModal.monthlyBill ? (showDetailsModal.country === "australia" || showDetailsModal.country === "au" ? "$" : "\u20B9") + (showDetailsModal.billAmount || showDetailsModal.monthlyBill) : "N/A"}</span></div>
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
