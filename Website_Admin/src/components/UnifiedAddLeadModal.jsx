import React, { useState, useRef, useEffect } from "react";
import { Upload, X, CheckCircle, AlertTriangle, ScanLine, FileText, User, Sparkles, ChevronRight, Zap } from "lucide-react";
import { useAdminSettings } from "../hooks/useAdminSettings";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

const getStcZone = (pc) => {
  const code = parseInt(pc, 10);
  if (!code) return 3;
  if ((code >= 800 && code <= 899) || (code >= 6700 && code <= 6799) || (code >= 4700 && code <= 4899)) return 1;
  if ((code >= 4600 && code <= 4699) || (code >= 4300 && code <= 4499) || (code >= 6600 && code <= 6699)) return 2;
  if ((code >= 7000 && code <= 7999) || code === 2627 || code === 2628) return 4;
  return 3;
};

const getIndiaSubsidy = (kw) => {
  if (kw <= 0) return 0;
  if (kw <= 1) return 30000;
  if (kw <= 2) return 60000;
  return 78000;
};

const getIndiaCost = (kw) => {
  if (kw <= 1) return 60000;
  if (kw <= 2) return 120000;
  return 120000 + (kw - 2) * 40000;
};

const calcStcForKw = (kw, postcode) => {
  const zone = getStcZone(postcode);
  const multiplier = zone === 1 ? 1.622 : zone === 2 ? 1.536 : zone === 3 ? 1.382 : 1.185;
  const deemingYears = 5;
  const stcPrice = 38;
  const stcs = Math.floor(kw * multiplier * deemingYears);
  const stcValue = Math.round(stcs * stcPrice);
  const installCost = Math.round(kw * 1100);
  const netCost = Math.max(500, installCost - stcValue);
  return { zone, multiplier, deemingYears, stcPrice, stcs, stcValue, installCost, netCost };
};

const UnifiedAddLeadModal = ({ onClose, onSuccess, initialSource = "website", bdeId = null, isBDE = false, isFreelancer = false, userCountry = "India", existingLead = null }) => {
  const [activeTab, setActiveTab] = useState("scan"); 
  const isAU = userCountry.toLowerCase() === "australia" || userCountry.toLowerCase() === "au";
  const { projectTypes } = useAdminSettings(userCountry);

  // -- 4-Step Scanning UI State --
  const [step, setStep] = useState(1); // 1: Upload, 2: Eligibility, 3: Details, 4: Slider
  const [file, setFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scanConfidence, setScanConfidence] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: existingLead?.name || "", mobile: existingLead?.mobile || "", email: existingLead?.email || "", district: existingLead?.district || "",
    state: existingLead?.state || (isAU ? "New South Wales" : "Gujarat"),
    pincode: existingLead?.pincode || "", kw: existingLead?.kw || "", billAmount: existingLead?.billAmount || "",
    solarType: existingLead?.solarType || (projectTypes?.[0]?.value) || (isAU ? "residential" : "surya-ghar"),
    notes: existingLead?.notes || "", discom: existingLead?.discom || "", country: isAU ? "australia" : "india",
    consumerNumber: existingLead?.consumerNumber || "", tariff: existingLead?.tariff || "", meterCategory: existingLead?.meterCategory || "",
    isEligibleForInstallation: existingLead?.isEligibleForInstallation || false, billFileUrl: existingLead?.billFileUrl || ""
  });
  
  const [recommendedKw, setRecommendedKw] = useState(0);
  const [isEligible, setIsEligible] = useState(false);

  // -- Bulk Upload Tab State --
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkSolarType, setBulkSolarType] = useState(projectTypes?.[0]?.value || "residential");
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkError, setBulkError] = useState("");

  const fileInputRef = useRef(null);
  const bulkFileInputRef = useRef(null);

  // Admin settings for Eligibility
  const [adminEligibility, setAdminEligibility] = useState(null);
  
  useEffect(() => {
    fetch(`${API_BASE}/api/eligibility-settings`, { headers: { 'country': isAU ? "AU" : "IN" } })
      .then(res => res.json())
      .then(data => { if (data.success) setAdminEligibility(data.data); })
      .catch(e => console.error("Failed to load admin eligibility:", e));
  }, [isAU]);

  // Handle Bill Selection & Scan
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    await handleScanBill(selectedFile);
  };

  const calculateEligibility = async (billAmt, apiKw, extractedData) => {
    let kw = apiKw || (isAU ? 6.6 : 3);
    let eligible = true;

    try {
      const eligibilityRes = await fetch(`${API_BASE}/api/light-bill/check-eligibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-country': isAU ? 'australia' : 'india'
        },
        body: JSON.stringify({
          billAmount: billAmt,
          monthlyUnits: extractedData?.monthlyKwhEquivalent || extractedData?.monthlyUnits || 0,
          state: formData.state || extractedData?.state || '',
          meterCategory: formData.meterCategory || extractedData?.meterCategory || extractedData?.tariffDesc || ''
        })
      });
      const eligibilityData = await eligibilityRes.json();
      if (eligibilityData.success) {
        kw = eligibilityData.suggestedKW;
      }
    } catch (e) {
      console.warn('Eligibility API failed in BDE form', e);
    }
    
    setRecommendedKw(kw);
    setIsEligible(eligible);
    setFormData(prev => ({ ...prev, kw: kw, billAmount: billAmt, isEligibleForInstallation: eligible }));
  };

  const handleScanBill = async (uploadedFile) => {
    setScanError("");
    setIsScanning(true);

    try {
      const form = new FormData();
      form.append("billFile", uploadedFile);
      const res = await fetch(`${API_BASE}/api/light-bill/scan`, {
        method: "POST", headers: { "x-country": isAU ? "AU" : "IN" }, body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Scan failed");

      // Upload file to get URL
      let savedUrl = "";
      try {
        const uploadForm = new FormData();
        uploadForm.append("file", uploadedFile);
        const uploadRes = await fetch(`${API_BASE}/api/upload-file`, { method: "POST", body: uploadForm });
        const uploadData = await uploadRes.json();
        if (uploadData.success) savedUrl = uploadData.fileUrl;
      } catch (e) { console.warn("File upload failed", e); }

      const extracted = data.extracted || data.data?.extractedData || {};
      const billAmt = extracted.billAmount || (isAU ? 300 : 1500);
      
      setFormData(prev => ({
        ...prev,
        name: extracted.consumerName || extracted.name || prev.name,
        mobile: extracted.mobile || prev.mobile,
        email: extracted.email || prev.email,
        district: extracted.suburb || extracted.district || extracted.city || prev.district,
        state: extracted.detectedState || extracted.state || prev.state,
        pincode: extracted.postcode || extracted.pincode || prev.pincode,
        consumerNumber: extracted.nmiNumber || extracted.consumerNumber || prev.consumerNumber,
        accountNumber: extracted.accountNumber || prev.accountNumber,
        dailyKwh: extracted.dailyKwh || prev.dailyKwh,
        monthlyUnits: extracted.monthlyUnits || prev.monthlyUnits,
        discom: extracted.retailer || extracted.discomId || extracted.discom || prev.discom,
        meterCategory: extracted.meterType || extracted.meterCategory || prev.meterCategory,
        tariff: extracted.tariffType || extracted.tariffCode || extracted.tariffDesc || extracted.tariff || prev.tariff,
        billAmount: billAmt,
        billUrl: savedUrl || prev.billUrl, billFileUrl: savedUrl || prev.billUrl
      }));
      setScanConfidence(data.data?.confidence || 90);
      await calculateEligibility(billAmt, null, extracted);
      setStep(2); // Move to recommendations
    } catch (err) {
      setScanError(err.message);
      // Fallback: proceed to step 2 manually with defaults
      await calculateEligibility(isAU ? 300 : 1500, null, null);
      setStep(2);
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let computedSubsidy = 0;
    if (isAU) {
      computedSubsidy = calcStcForKw(formData.kw || recommendedKw, formData.pincode).stcValue;
    } else {
      computedSubsidy = getIndiaSubsidy(formData.kw || recommendedKw);
    }
    const payload = { ...formData, uploadSource: isBDE ? "bde_manual" : "admin_manual", subsidy: computedSubsidy };
      let url = `${API_BASE}/api/leads`;
      let method = "POST";
      if (existingLead) {
        url = `${API_BASE}/api/bde/leads/${existingLead._id}/details`;
        method = "PUT";
      } else if (isBDE && bdeId) {
        url = `${API_BASE}/api/bde/${bdeId}/leads`;
      }
      
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json", "x-country": isAU ? "australia" : "india" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (formData.isEligibleForInstallation) {
          alert("Lead is eligible! Moving this lead directly to My Prospects.");
        }
        onSuccess(true, formData.isEligibleForInstallation); // notify parent it's eligible
      } else {
        throw new Error(data.message || "Failed to add lead");
      }
    } catch (err) {
      setScanError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) { setBulkError("Please select a file"); return; }
    setIsBulkLoading(true); setBulkError("");
    try {
      const form = new FormData();
      form.append("file", bulkFile);
      form.append("solarType", bulkSolarType);
      form.append("country", isAU ? "Australia" : "India");
      form.append("uploadSource", isBDE ? "bde_manual" : "admin_manual");
      if (isBDE && bdeId) form.append("bdeId", bdeId);

      const res = await fetch(`${API_BASE}/api/leads/upload`, { method: "POST", body: form });
      const data = await res.json();
      if (data.success) {
        setBulkResult(data);
        setTimeout(() => onSuccess(false), 2000);
      } else {
        setBulkError(data.message || "Upload failed");
      }
    } catch (e) { setBulkError("Network error"); }
    finally { setIsBulkLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">{existingLead ? "Upload Your Light Bill" : "Add New Lead"}</h2>
          </div>
          <button onClick={() => onClose()} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>

        {/* Tabs */}
        {!existingLead ? (
          <div className="flex px-5 pt-3 border-b border-gray-100 gap-4">
            <button 
              onClick={() => { setActiveTab("scan"); setStep(1); }}
              className={`pb-2 px-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'scan' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Single Lead (Manual)
            </button>
            <button 
              onClick={() => setActiveTab("bulk")}
              className={`pb-2 px-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'bulk' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Bulk Upload (CSV)
            </button>
          </div>
        ) : (
          <div className="px-6 py-3 border-b border-gray-100 bg-sky-50">
             <p className="text-sm font-bold text-sky-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Upload Bill for Eligibility Check
             </p>
          </div>
        )}

        {/* Body */}
        <div className="p-5 overflow-y-auto">
          {activeTab === "scan" && (
            <div className="space-y-6">
              
              {/* Top Progress Bar */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-4">
                <span className={step >= 1 ? "text-blue-600" : ""}>1. Upload</span>
                <ChevronRight className="w-4 h-4 opacity-30"/>
                <span className={step >= 2 ? "text-blue-600" : ""}>2. Eligibility</span>
                <ChevronRight className="w-4 h-4 opacity-30"/>
                <span className={step >= 3 ? "text-blue-600" : ""}>3. Details</span>
                <ChevronRight className="w-4 h-4 opacity-30"/>
                <span className={step >= 4 ? "text-blue-600" : ""}>4. Size (kW)</span>
              </div>

              {step === 1 && (
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isScanning ? 'border-blue-300 bg-blue-50' : file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
                  onClick={() => !isScanning && fileInputRef.current?.click()}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,image/*" onChange={handleFileChange} />
                  {isScanning ? (
                    <div className="flex flex-col items-center gap-3">
                      <ScanLine className="w-10 h-10 text-blue-500 animate-pulse" />
                      <p className="text-sm font-bold text-blue-700">AI Scanning Utility Bill...</p>
                      <p className="text-xs text-blue-500">Extracting customer details and eligibility criteria</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-10 h-10 text-gray-400" />
                      <p className="text-base font-bold text-gray-800">Upload Utility Bill for Auto-Scan</p>
                      <p className="text-xs text-gray-500">Supports PDF, JPG, PNG. We will extract details and evaluate eligibility automatically.</p>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className={`p-5 rounded-2xl border-2 flex items-center justify-between ${isEligible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div>
                      <h3 className={`font-black text-lg ${isEligible ? 'text-green-800' : 'text-red-800'}`}>
                        {isEligible ? 'Customer is Eligible!' : 'Not Eligible for Auto-Routing'}
                      </h3>
                      <p className="text-sm font-medium mt-1 text-slate-700">
                        Based on bill amount: {isAU ? "$" : "₹"}{formData.billAmount}
                      </p>
                    </div>
                    {isEligible ? <CheckCircle className="w-10 h-10 text-green-500"/> : <AlertTriangle className="w-10 h-10 text-red-500"/>}
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-amber-500"/> Recommended System</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-3xl font-black text-slate-900">{recommendedKw} <span className="text-lg text-slate-500">kW</span></p>
                        <p className="text-xs text-slate-500 mt-2">Calculated from Admin Panel dynamic rules.</p>
                      </div>
                      
                      {isAU ? (() => {
                        const stc = calcStcForKw(recommendedKw, formData.pincode);
                        return (
                          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex flex-col justify-center">
                            <span className="text-[10px] text-emerald-600 block uppercase font-bold tracking-tight">STC Rebate Estimate</span>
                            <span className="text-xl font-black text-emerald-700 mt-0.5 block">${stc.stcValue.toLocaleString()}</span>
                            <span className="text-[10px] text-emerald-600">{stc.stcs} STCs @ ${stc.stcPrice}</span>
                          </div>
                        );
                      })() : (() => {
                        const sub = getIndiaSubsidy(recommendedKw);
                        return (
                          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex flex-col justify-center">
                            <span className="text-[10px] text-emerald-600 block uppercase font-bold tracking-tight">Govt Subsidy</span>
                            <span className="text-xl font-black text-emerald-700 mt-0.5 block">₹{sub.toLocaleString("en-IN")}</span>
                            <span className="text-[10px] text-emerald-600">PM Surya Ghar</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button onClick={() => setStep(1)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold">Retake Bill</button>
                    <button onClick={() => setStep(3)} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm">Continue to Details</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="font-bold text-slate-800 border-b pb-2">Verify Personal Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Customer Name *</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Mobile Number *</label>
                      <input type="tel" required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Email</label>
                      <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">{isAU ? 'Suburb/City' : 'City/District'}</label>
                      <input type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">State</label>
                      <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Pincode/Postcode</label>
                      <input type="text" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">{isAU ? 'Retailer / DNSP' : 'Discom'}</label>
                      <input type="text" value={formData.discom} onChange={e => setFormData({...formData, discom: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white" />
                    </div>
                    {isAU && (
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Account Number</label>
                        <input type="text" value={formData.accountNumber || ''} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white" />
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">{isAU ? 'NMI Number' : 'Consumer Number'}</label>
                      <input type="text" value={formData.consumerNumber} onChange={e => setFormData({...formData, consumerNumber: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">{isAU ? 'Quarterly Bill ($)' : 'Average Bill (₹)'}</label>
                      <input type="number" value={formData.billAmount || ''} onChange={e => setFormData({...formData, billAmount: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">{isAU ? 'Daily Usage (kWh)' : 'Monthly Units'}</label>
                      <input type="number" step="0.01" value={isAU ? (formData.dailyKwh || '') : (formData.monthlyUnits || '')} onChange={e => {
                        if (isAU) setFormData({...formData, dailyKwh: e.target.value});
                        else setFormData({...formData, monthlyUnits: e.target.value});
                      }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Tariff</label>
                      <input type="text" value={formData.tariff || ''} onChange={e => setFormData({...formData, tariff: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Meter Category</label>
                      <input type="text" value={formData.meterCategory || ''} onChange={e => setFormData({...formData, meterCategory: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white" />
                    </div>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button onClick={() => setStep(2)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold">Back</button>
                    <button onClick={() => setStep(4)} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm">Review Final Size</button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-blue-500"/> Adjust System Size</h3>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
                    <p className="text-5xl font-black text-blue-600">{formData.kw} <span className="text-xl text-slate-500">kW</span></p>
                    <p className="text-sm font-bold text-slate-500 mt-2">Adjust size based on roof capacity</p>
                    <div className="mt-4 flex flex-col items-start text-left max-w-sm mx-auto">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Project Type</label>
                      <select value={formData.solarType} onChange={e => setFormData({...formData, solarType: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none">
                        {projectTypes?.map(pt => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
                      </select>
                    </div>
                    
                    <input 
                      type="range" 
                      min="1" max="50" step="1" 
                      value={formData.kw} 
                      onChange={e => {
                        const newKw = Number(e.target.value);
                        let suggestedType = formData.solarType;
                        if (adminEligibility && adminEligibility.projectCategories?.length > 0) {
                          const validCat = adminEligibility.projectCategories.find(c => newKw >= c.minKW && newKw <= c.maxKW);
                          if (validCat) suggestedType = validCat.id;
                        }
                        setFormData({...formData, kw: newKw, solarType: suggestedType});
                      }}
                      className="w-full mt-6 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                    />
                    <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                      <span>1 kW</span>
                      <span>50 kW</span>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200">
                      {isAU ? (() => {
                        const stc = calcStcForKw(formData.kw, formData.pincode);
                        return (
                          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex justify-between items-center text-left">
                            <div>
                              <span className="text-[10px] text-emerald-600 block uppercase font-bold tracking-tight">Estimated STC Rebate</span>
                              <span className="text-[10px] text-emerald-600">{stc.stcs} STCs @ ${stc.stcPrice}</span>
                            </div>
                            <span className="text-2xl font-black text-emerald-700 block">${stc.stcValue.toLocaleString()}</span>
                          </div>
                        );
                      })() : (() => {
                        const sub = getIndiaSubsidy(formData.kw);
                        return (
                          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex justify-between items-center text-left">
                            <div>
                              <span className="text-[10px] text-emerald-600 block uppercase font-bold tracking-tight">PM Surya Ghar Subsidy</span>
                              <span className="text-[10px] text-emerald-600">Max capped at 3kW</span>
                            </div>
                            <span className="text-2xl font-black text-emerald-700 block">₹{sub.toLocaleString("en-IN")}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button onClick={() => setStep(3)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold">Back</button>
                    <button onClick={handleManualSubmit} disabled={isSubmitting} className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg hover:bg-blue-700 transition">
                      {isSubmitting ? "Saving Lead..." : "Save Lead & Finalize"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "bulk" && (
            <div className="space-y-6">
              {!bulkResult ? (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Solar Type</label>
                    <select value={bulkSolarType} onChange={e => setBulkSolarType(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                      {projectTypes?.map(pt => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
                    </select>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50" onClick={() => bulkFileInputRef.current?.click()}>
                    <input type="file" ref={bulkFileInputRef} onChange={(e) => setBulkFile(e.target.files[0])} className="hidden" accept=".csv,.xlsx" />
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-700">{bulkFile ? bulkFile.name : "Click to upload CSV file"}</p>
                  </div>
                  {bulkError && <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg">{bulkError}</div>}
                  <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">Cancel</button>
                    <button onClick={handleBulkUpload} disabled={isBulkLoading || !bulkFile} className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl">
                      {isBulkLoading ? "Uploading..." : "Upload File"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center space-y-4">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  <h3 className="text-lg font-bold text-gray-800">Upload Successful!</h3>
                  <p className="text-sm text-gray-500">Processed: {bulkResult.processed} | Inserted: {bulkResult.inserted}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedAddLeadModal;





