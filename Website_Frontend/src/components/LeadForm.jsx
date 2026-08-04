/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Calculator,
  HelpCircle,
  Search,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  FileCheck,
  TrendingDown,
  Award,
  Trees,
  ArrowRight,
  ShieldAlert,
  MapPin,
  ScanLine,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  mockConsumers,
  generateDynamicEligibility,
} from "../data/mockConsumers";
import billScanApi from "../api/billScanApi";
import { useCountry } from "../context/CountryContext";

// State maps by country
const countryStatesMap = {
  IN: [
    "Gujarat", "Maharashtra", "Rajasthan", "Uttar Pradesh", "Kerala",
    "Karnataka", "Tamil Nadu", "Madhya Pradesh", "Delhi", "Haryana",
    "Punjab", "Uttarakhand", "Andhra Pradesh", "Telangana", "Bihar",
    "West Bengal", "Odisha", "Jharkhand", "Assam", "Himachal Pradesh",
    "Goa", "Chhattisgarh",
  ],
  AU: [
    "New South Wales", "Victoria", "Queensland", "Western Australia",
    "South Australia", "Tasmania", "Australian Capital Territory", "Northern Territory",
  ]
};

export default function LeadForm({ initialMode = "calculator", selectedProjectType, settings: propSettings }) {
  const { country } = useCountry();
  const getCountryCode = () => { if (country === "AU") return "australia"; if (country === "NZ") return "new_zealand"; return "india"; };

  // Input State
  const [consumerNumber, setConsumerNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [city, setCity] = useState("Rajkot");
  const [customerState, setCustomerState] = useState("Gujarat");
  const [monthlyBill, setMonthlyBill] = useState(2500);
  const [postcode, setPostcode] = useState("");
  const [retailer, setRetailer] = useState("AGL");
  const [ownsProperty, setOwnsProperty] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [preferredSolarBrand, setPreferredSolarBrand] = useState("");
  const [preferredInverterBrand, setPreferredInverterBrand] = useState("");
  const [availableBrands, setAvailableBrands] = useState([]);
  const [stcSettings, setStcSettings] = useState(null);
  const [projectTypeConfigs, setProjectTypeConfigs] = useState([]);
  const [selectedUpgradeKw, setSelectedUpgradeKw] = useState(0);
  const [selectedKw, setSelectedKw] = useState(3);

  // Dynamic form settings from backend
  const [formSettings, setFormSettings] = useState(null);
  // Dynamic field values for any extra dynamic fields
  const [dynamicValues, setDynamicValues] = useState({});

  // Fetch project-specific form settings
  useEffect(() => {
    const loadFormSettings = async () => {
      // Use propSettings if passed, else try fetching
      const ptKey = selectedProjectType || "default";
      const countryCode = getCountryCode();
      try {
        const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4005";
        const res = await fetch(`${apiBase}/api/website-settings/${countryCode}/${ptKey}`);
        const data = await res.json();
        if (data.success && data.data?.projectForm) {
          setFormSettings(data.data.projectForm);
        } else if (propSettings?.projectForm) {
          setFormSettings(propSettings.projectForm);
        }
      } catch {
        if (propSettings?.projectForm) setFormSettings(propSettings.projectForm);
      }
    };
    loadFormSettings();
  }, [country, selectedProjectType, propSettings]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/brands?country=${getCountryCode()}` : `http://localhost:4005/api/brands?country=${getCountryCode()}`);
        const data = await res.json();
        if (data.success) {
          setAvailableBrands(data.data.filter(b => b.isActive));
        }
      } catch (err) {
        console.error("Failed to fetch brands", err);
      }
    };
    
    const fetchStcSettings = async () => {
      if (country !== "AU") return;
      try {
        const res = await fetch(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/country-website-settings/public/AU` : "http://localhost:4005/api/country-website-settings/public/AU");
        const data = await res.json();
        if (data.success && data.data) {
          if (country === "AU") setStcSettings(data.data.stcSettings);
          if (data.data.projectTypeConfigs) setProjectTypeConfigs(data.data.projectTypeConfigs);
        }
      } catch (err) {
        console.error("Failed to fetch STC settings", err);
      }
    };

    fetchBrands();
    fetchStcSettings();
  }, [country]);

  // Status & Dynamic Feedback state
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [fetchedData, setFetchedData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [showBillHelp, setShowBillHelp] = useState(false);

  // OCR bill scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scanConfidence, setScanConfidence] = useState(null);
  const [meterCategory, setMeterCategory] = useState(null);
  const [discom, setDiscom] = useState(null);
  const [tariffDesc, setTariffDesc] = useState(null);
  const [billStatus, setBillStatus] = useState(null);
  const [dueAmount, setDueAmount] = useState(0);
  const [ocrMonthlyUnits, setOcrMonthlyUnits] = useState(null);

  // Eligibility check state
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [eligibilityError, setEligibilityError] = useState("");

  const fileInputRef = useRef(null);

  const handleFetchDetails = () => {
    if (!consumerNumber) {
      setFetchError("Please enter a Consumer Number first.");
      return;
    }
    setFetchError("");
    setIsFetching(true);
    setSubmitSuccess(null);

    setTimeout(() => {
      const sanitizedNum = consumerNumber.replace(/\s+/g, "");
      if (mockConsumers[sanitizedNum]) {
        setFetchedData(mockConsumers[sanitizedNum]);
        setFullName(mockConsumers[sanitizedNum].consumerName.split("(")[0].trim());
        setMonthlyBill(mockConsumers[sanitizedNum].monthlyBillAmount);
      } else {
        const dynamicSet = generateDynamicEligibility(sanitizedNum, monthlyBill);
        setFetchedData(dynamicSet);
        if (!fullName) setFullName(dynamicSet.consumerName);
      }
      setIsFetching(false);
    }, 1100);
  };

  // Task 2: Call the real eligibility engine (CustomerEligibilityScreen rules)
  const handleCheckEligibility = async ({ meterCategory, billAmount, monthlyUnits, dueAmount, billStatus, monthsOverdue, overrideKw = 0 }) => {
    setIsCheckingEligibility(true);
    setEligibilityError("");
    setEligibilityResult(null);

    try {
      const { data } = await billScanApi.post("/api/light-bill/check-eligibility", {
        meterCategory,
        billAmount,
        monthlyUnits,
        dueAmount,
        billStatus,
        monthsOverdue,
        state: customerState,
        overrideKw,
      }, { headers: { "x-country": getCountryCode() } });
      setEligibilityResult(data);

      setFetchedData((prev) => ({
        ...(prev || {}),
        consumerName: prev?.consumerName || fullName || "—",
        discom: prev?.discom || "Detected via Bill Scan",
        address: prev?.address || "—",
        monthlyUnits: monthlyUnits || prev?.monthlyUnits || "—",
        eligibleCapacityKw: data.suggestedKW,
        subsidyAmount: data.subsidy.total,
      }));
      // Reset upgrade choice
      setSelectedUpgradeKw(0);
    } catch (err) {
      console.error("check-eligibility error:", err.response?.data || err.message);
      setEligibilityError(err.response?.data?.message || "Eligibility check failed. Please try again.");
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  // Task 1: Real OCR bill scan — chains into Task 2 automatically
  const handleScanBill = async (file) => {
    setScanError("");
    setScanConfidence(null);
    setEligibilityResult(null);
    setIsScanning(true);

    try {
      const formData = new FormData();
      formData.append("billFile", file);

      // 🔴 FIX: Content-Type header REMOVE kiya — FormData ke saath axios
      // khud sahi boundary generate karta hai. Manually set karne se boundary
      // missing ho jaata tha aur backend (multer) file parse nahi kar pa raha tha.
      const { data } = await billScanApi.post("/api/light-bill/scan", formData, { headers: { "x-country": getCountryCode() } });

      setScanConfidence(data.confidence);
      const ex = data.extracted;

      if (ex.consumerNumber) setConsumerNumber(ex.consumerNumber);
      if (ex.consumerName) setFullName(ex.consumerName);
      if (ex.billAmount) setMonthlyBill(ex.billAmount);
      if (ex.meterCategory) setMeterCategory(ex.meterCategory);
      if (ex.discomId) setDiscom(ex.discomId);
      if (ex.tariffDesc) setTariffDesc(ex.tariffDesc);
      if (ex.billStatus) setBillStatus(ex.billStatus);
      if (ex.dueAmount) setDueAmount(ex.dueAmount);
      
      const currentStates = countryStatesMap[country] || countryStatesMap["IN"];
      if (ex.detectedState && currentStates.includes(ex.detectedState)) setCustomerState(ex.detectedState);
      
      if (ex.district) setCity(ex.district);
      const units = data.monthlyUnitsUsed || ex.monthlyUnits || null;
      setOcrMonthlyUnits(units);

      if (data.confidence === "low") {
        setScanError(data.message || "Kuch fields clearly nahi mile — kripya manually verify kar lo.");
      }

      if (ex.billAmount) {
        await handleCheckEligibility({
          meterCategory: ex.meterCategory,
          billAmount: ex.billAmount,
          monthlyUnits: units,
          dueAmount: ex.dueAmount || 0,
          billStatus: ex.billStatus,
          monthsOverdue: ex.monthsOverdue || 0,
        });
      }
    } catch (err) {
      console.error("scan error:", err.response?.data || err.message);
      setScanError(err.response?.data?.message || "Bill scan failed. Please try a clearer photo, or fill details manually.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.includes("image/") || file.type === "application/pdf") {
        setUploadedFile(file);
        handleScanBill(file); // Dono case me yahan se call chalegi
      } else {
        alert("Please upload an image (PNG/JPG) or a PDF file of your bill.");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check agar file khali (0 bytes) hai
      if (file.size === 0) {
        alert("Yeh file khali (0 MB) lag rahi hai. Kripya koi doosri valid file upload karein.");
        return;
      }

      setUploadedFile(file);
      if (file.type.includes("image/") || file.type === "application/pdf") {
        handleScanBill(file);
      }
    }
  };

  const handleTriggerFileInput = () => fileInputRef.current?.click();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !mobileNumber || !city) {
      alert("Required details (Name, Mobile, City) are missing.");
      return;
    }
    setIsSubmitting(true);

    const capacity = eligibilityResult?.suggestedKW || (fetchedData?.eligibleCapacityKw) || Math.ceil(monthlyBill / 700);
    const subsidy = eligibilityResult?.subsidy?.total ?? (capacity === 1 ? 33000 : capacity === 2 ? 66000 : 78500);
    let finalCapacity = capacity;
    if (selectedUpgradeKw && selectedUpgradeKw > capacity) {
      finalCapacity = selectedUpgradeKw;
    }
    const totalCost = finalCapacity * 60000;
    const net = totalCost - subsidy;

    let mappedSolarType = "surya-ghar";
    if (country === "AU") {
      if (finalCapacity <= 6.6) mappedSolarType = "au-small-home";
      else if (finalCapacity <= 10) mappedSolarType = "au-standard-family";
      else if (finalCapacity <= 13) mappedSolarType = "au-large-home";
      else mappedSolarType = "au-ev-owners";
    }

    // Merge dynamic field values into submission (only for Lead-known keys)
    const KNOWN_LEAD_KEYS = ["consumerNumber","fullName","mobileNumber","email","postcode","city","customerState","monthlyBill","ownsProperty"];
    const extraFromDynamic = {};
    Object.entries(dynamicValues).forEach(([key, val]) => {
      if (KNOWN_LEAD_KEYS.includes(key)) extraFromDynamic[key] = val;
      else extraFromDynamic[key] = val; // include any extra as notes
    });

    const submission = {
        name: fullName || extraFromDynamic.fullName,
        mobile: mobileNumber || extraFromDynamic.mobileNumber,
        email: extraFromDynamic.email,
        city: city || extraFromDynamic.city,
        state: customerState || extraFromDynamic.customerState,
        consumerNumber: consumerNumber || extraFromDynamic.consumerNumber || "",
        meterCategory: meterCategory || "Not detected",
        discom: discom || "Not detected",
        tariff: tariffDesc || "Not detected",
        billAmount: monthlyBill || extraFromDynamic.monthlyBill,
        kw: finalCapacity,
        source: "website-form",
        solarType: mappedSolarType,
        postcode: postcode || extraFromDynamic.postcode,
        retailer: isAU ? retailer : undefined,
        ownsProperty: ownsProperty !== undefined ? ownsProperty : extraFromDynamic.ownsProperty,
        preferredSolarBrand: preferredSolarBrand || undefined,
        preferredInverterBrand: preferredInverterBrand || undefined,
        notes: `Estimated Subsidy: ${subsidy}, Net Cost: ${net}`,
      };

      try {
        const res = await fetch(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/leads` : "http://localhost:4005/api/leads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submission),
        });
        const data = await res.json();
        
        if (data.success) {
          alert("Enquiry Submitted Successfully!");
          setSubmitSuccess({
            ...submission,
            isEligible: eligibilityResult?.isEligible ?? true,
            estimatedCapacityKw: capacity,
            estimatedSubsidy: subsidy,
            netCostEstimate: net,
            billFileName: uploadedFile ? uploadedFile.name : null,
            id: data.lead?.orderNumber || data.lead?._id || data.leadId || data.id || `APP-${Date.now().toString().slice(-6)}`
          });
          resetFormInputs();
          // Auto scroll to success message
          setTimeout(() => {
            document.getElementById("lead-success-receipt")?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        } else {
          alert("Failed to submit lead: " + (data.message || "Unknown error"));
        }
      } catch (err) {
        console.error("Lead submission error:", err);
        alert("Failed to connect to server to submit lead.");
      } finally {
        setIsSubmitting(false);
      }
  };

  const resetFormInputs = () => {
    setConsumerNumber("");
    setFullName("");
    setMobileNumber("");
    setCity("Rajkot");
    setCustomerState("Gujarat");
    setMonthlyBill(2500);
    setFetchedData(null);
    setUploadedFile(null);
    setScanConfidence(null);
    setScanError("");
    setMeterCategory(null);
    setBillStatus(null);
    setDueAmount(0);
    setOcrMonthlyUnits(null);
    setEligibilityResult(null);
    setEligibilityError("");
    setDiscom(null);
    setTariffDesc(null);
    setPreferredSolarBrand("");
    setPreferredInverterBrand("");
  };

  const isAU = country === "AU";
  let sliderUnits, sliderKw, sliderSubsidy, sliderCost, sliderNet, sliderPaybackMonths, sliderTreesPlanted;

  const getStcZone = (pc) => {
    const code = parseInt(pc, 10);
    if (!code) return 3; 
    // Basic mapping: NT and North WA/QLD -> Zone 1
    if ((code >= 800 && code <= 899) || (code >= 6700 && code <= 6799) || (code >= 4700 && code <= 4899)) return 1;
    // Central AU -> Zone 2
    if ((code >= 4600 && code <= 4699) || (code >= 4300 && code <= 4499) || (code >= 6600 && code <= 6699)) return 2;
    // Tasmania and Alpine -> Zone 4
    if ((code >= 7000 && code <= 7999) || code === 2627 || code === 2628) return 4;
    // Default major cities -> Zone 3
    return 3;
  };

  // Effect to auto-update selectedKw when monthly bill or scan results change
  useEffect(() => {
    if (isAU) {
      setSelectedKw(Math.max(3, Math.min(15, Math.ceil(monthlyBill / 100))));
    } else {
      const units = Math.round(monthlyBill / 7.2);
      setSelectedKw(Math.max(1, Math.min(15, Math.ceil(units / 115))));
    }
  }, [monthlyBill, isAU]);

  if (isAU) {
    sliderKw = selectedKw || Math.max(3, Math.min(15, Math.ceil(monthlyBill / 100))); // e.g. $400/qtr = 4kW
    sliderUnits = Math.round(sliderKw * 115); 
    
    const zone = getStcZone(postcode);
    const multiplier = zone === 1 ? 1.62 : zone === 2 ? 1.53 : zone === 3 ? 1.38 : 1.18;
    const deemingYears = stcSettings?.deemingYears || 5; 
    const stcPrice = stcSettings?.stcPrice || 38;
    
    const stcs = Math.floor(sliderKw * multiplier * deemingYears);
    sliderSubsidy = stcs * stcPrice; 
    
    sliderCost = sliderKw * 1100;
    sliderNet = Math.max(1000, sliderCost - sliderSubsidy);
    sliderPaybackMonths = Math.round(sliderNet / (monthlyBill * 0.85 / 3)); 
    sliderTreesPlanted = sliderKw * 35;
  } else {
    // For IN: monthlyBill is Monthly Bill in INR
    sliderUnits = Math.round(monthlyBill / 7.2);
    sliderKw = Math.max(1, Math.min(15, Math.ceil(sliderUnits / 115)));
    if (sliderKw === 1) sliderSubsidy = 33000;
    else if (sliderKw === 2) sliderSubsidy = 66000;
    else sliderSubsidy = 78000;
    
    if (sliderKw === 1) sliderCost = 59000;
    else if (sliderKw === 2) sliderCost = 112000;
    else sliderCost = 112000 + (sliderKw - 2) * 38000;
    
    sliderNet = Math.max(10000, sliderCost - sliderSubsidy);
    sliderPaybackMonths = Math.round(sliderNet / (monthlyBill * 0.85));
    sliderTreesPlanted = sliderKw * 35;
  }

  // Helper: render a single dynamic form field
  const renderDynamicField = (field, idx) => {
    const stateKeyMap = {
      consumerNumber: [consumerNumber, setConsumerNumber],
      fullName: [fullName, setFullName],
      mobileNumber: [mobileNumber, (v) => setMobileNumber(v.replace(/\D/g, ""))],
      city: [city, setCity],
      customerState: [customerState, setCustomerState],
      monthlyBill: [monthlyBill, (v) => setMonthlyBill(Number(v))],
      postcode: [postcode, setPostcode],
      ownsProperty: [ownsProperty ? "Yes" : "No", (v) => setOwnsProperty(v === "Yes")],
      billFile: [null, null], // handled separately
    };
    const mapped = stateKeyMap[field.key];
    const value = mapped ? mapped[0] : (dynamicValues[field.key] || "");
    const onChange = mapped ? mapped[1] : (v) => setDynamicValues(prev => ({ ...prev, [field.key]: v }));

    // Skip billFile — handled by the drag-drop area below
    if (field.key === "billFile") return null;

    return (
      <div key={idx}>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {field.label}{field.required && " *"}
        </label>
        {field.type === "select" ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            className="w-full px-4 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all cursor-pointer"
          >
            <option value="">Select...</option>
            {(field.options || []).map((opt, oi) => <option key={oi} value={opt}>{opt}</option>)}
          </select>
        ) : field.type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            rows={3}
            className="w-full px-4 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all"
          />
        ) : (
          <input
            type={field.type || "text"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            className="w-full px-4 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all"
          />
        )}
      </div>
    );
  };

  // Decide whether to use dynamic fields or default layout
  const hasDynamicFields = formSettings?.fields && formSettings.fields.length > 0;

  return (
    <section id="eligibility-calculator" className="py-20 solar-gradient relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            {formSettings?.title || "Apply for Solar"}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 mt-3 leading-tight">
            {formSettings?.subtitle || "Check Your Subsidy & Rooftop Solar Estimate"}
          </h2>
          <p className="text-slate-600 mt-3 text-xs md:text-sm">
            Select your state, then upload a photo of your latest light bill —
            we'll scan it and instantly tell you your recommended capacity,
            subsidy, and eligibility.
          </p>
        </div>

        {submitSuccess && (
          <div className="max-w-3xl mx-auto glass-panel rounded-3xl p-8 mb-12 relative overflow-hidden" id="lead-success-receipt">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-solar-yellow via-solar-green to-solar-sky"></div>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-emerald-50 text-solar-green rounded-full flex items-center justify-center mb-4 border border-emerald-250">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-display font-bold text-slate-900">Rooftop Solar Enquiry Submitted!</h3>
              <p className="text-slate-500 text-xs mt-1">
                Your application ID is <strong className="text-slate-800 font-mono">{submitSuccess.id}</strong>.
                A dedicated Sunnovative solar consultant is processing your file.
              </p>
              
              <div className="mt-6 flex gap-3">
                <button onClick={() => setSubmitSuccess(null)} className="px-5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-center">
                  Enquire for another home
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="glass-panel p-6 md:p-8 rounded-3xl max-w-3xl mx-auto">
          <form onSubmit={handleFormSubmit} className="space-y-6" id="solar-lead-form">
            
            {/* --- DYNAMIC FIELDS (from Admin Panel Form Builder) --- */}
            {hasDynamicFields ? (
              <div>
                <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-4">1. Your Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formSettings.fields.filter(f => f.key !== "billFile").map((field, idx) => renderDynamicField(field, idx))}
                </div>
              </div>
            ) : (
            /* --- DEFAULT FIELDS (fallback) --- */
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-4">1. Applicant & Location Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                  <select
                    value={customerState}
                    onChange={(e) => { setCustomerState(e.target.value); setEligibilityResult(null); }}
                    className="w-full px-4 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all cursor-pointer"
                  >
                    {(countryStatesMap[country] || countryStatesMap["IN"]).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{isAU ? "Suburb / City *" : "District / City *"}</label>
                  {isAU ? (
                    <div className="flex gap-2">
                      <input type="text" required value={city} onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Parramatta"
                        className="w-2/3 px-4 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all" />
                      <input type="text" required value={postcode} onChange={(e) => setPostcode(e.target.value.replace(/\D/g, ""))} maxLength={4}
                        placeholder="Postcode"
                        className="w-1/3 px-3 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all" />
                    </div>
                  ) : (
                    <select value={city} onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all cursor-pointer">
                      {!["Rajkot", "Morbi", "Jamnagar", "Gondal", "Jetpur", "Jasdan", "Wankaner"].includes(city) && (
                        <option value={city}>{city}</option>
                      )}
                      <option value="Rajkot">Rajkot</option>
                      <option value="Morbi">Morbi</option>
                      <option value="Jamnagar">Jamnagar</option>
                      <option value="Gondal">Gondal</option>
                      <option value="Jetpur">Jetpur</option>
                      <option value="Jasdan">Jasdan</option>
                      <option value="Wankaner">Wankaner</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name (Owner Name) *</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rajeshbhai Kunjibhai Patel"
                    className="w-full px-4 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (WhatsApp) *</label>
                  <div className="relative">
                    {isAU && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">+61</span>}
                    <input type="tel" required maxLength={10} value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder={isAU ? "412 345 678" : "e.g. 98982 12345"}
                      className={`w-full ${isAU ? 'pl-10' : 'px-4'} pr-4 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all`} />
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* 2. Bill Fetch / Upload Section */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-4 mt-6">2. Electricity Bill Check</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Upload Light Bill for Auto-Scan</label>
                  <div
                    onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                    onClick={handleTriggerFileInput}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                      dragActive ? "border-solar-sky bg-sky-50/50" : uploadedFile ? "border-solar-green bg-emerald-50/20" : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                    }`}
                    id="drag-drop-container"
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf" className="hidden" id="bill-file-input" />
                    {isScanning ? (
                      <div className="flex flex-col items-center">
                        <ScanLine className="w-8 h-8 text-solar-sky mb-2 animate-pulse" />
                        <p className="text-xs font-bold text-slate-800">Scanning your bill...</p>
                      </div>
                    ) : uploadedFile ? (
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-solar-green flex items-center justify-center mb-2">
                          <FileCheck className="w-5 h-5 animate-pulse-subtle" />
                        </div>
                        <p className="text-xs font-bold text-slate-800 tracking-tight">{uploadedFile.name}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-xs font-semibold text-slate-700">Drag & drop bill photo</p>
                      </div>
                    )}
                  </div>
                  {scanError && (
                    <div className="text-[11px] text-red-500 font-semibold mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {scanError}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Or Enter Average Bill Manually</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{isAU ? "$" : "₹"}</span>
                    <input type="number" required value={monthlyBill}
                      onChange={(e) => setMonthlyBill(Number(e.target.value))}
                      placeholder="e.g. 2150"
                      className="w-full pl-7 pr-4 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all mb-2" />
                  </div>
                  <p className="text-[10px] text-slate-400 italic">This helps us calculate your required solar system size.</p>
                </div>
              </div>
            </div>

            {/* 3. Subsidy Rules & kW Scale Selector (Appears BELOW the bill fetch) */}
            <div className="bg-amber-50/50 rounded-2xl border border-amber-100 p-5 mt-6">
              <h3 className="text-sm font-bold text-slate-900 border-b border-amber-200/50 pb-2 mb-4">3. Recommended System & Expected Subsidy</h3>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-600 font-bold">Select System Size (kW):</span>
                  <span className="text-lg font-black text-solar-sky">{selectedKw} kW</span>
                </div>
                <input
                  type="range" min="1" max="15" step="1" value={selectedKw}
                  onChange={(e) => setSelectedKw(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-solar-sky focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-slate-400 px-1 mt-1">
                  <span>1 kW</span>
                  <span>15 kW</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="p-3 bg-white rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-tight">Est. Generation</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{sliderUnits} Units<span className="text-[9px] text-slate-400">/mo</span></span>
                </div>
                <div className="p-3 bg-[#10B981]/10 rounded-xl border border-[#10B981]/20 text-center">
                  <span className="text-[10px] text-emerald-600 block uppercase font-bold tracking-tight">Govt Subsidy</span>
                  <span className="text-sm font-black text-solar-green mt-0.5 block">{isAU ? "$" : "₹"}{sliderSubsidy.toLocaleString("en-IN")}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-tight">Setup Cost</span>
                  <span className="text-sm font-bold text-slate-700 mt-0.5 block">{isAU ? "$" : "₹"}{sliderCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
                  <span className="text-[10px] text-blue-600 block uppercase font-bold tracking-tight">Net Investment</span>
                  <span className="text-sm font-black text-blue-900 mt-0.5 block">{isAU ? "$" : "₹"}{sliderNet.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-100 text-[11px] text-slate-600">
                <Award className="w-4 h-4 text-solar-sky shrink-0" />
                <p>
                  By installing a <strong>{selectedKw} kW</strong> system, you will generate approx <strong>{sliderUnits} units</strong> monthly, saving {isAU ? "$" : "₹"}{(sliderUnits * (isAU ? 0.3 : 7.2)).toFixed(0)} on your bill. 
                  ROI is estimated at <strong>{sliderPaybackMonths} months</strong>.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-6">
              <button type="submit" disabled={isSubmitting}
                className="w-full py-4 bg-solar-green hover:bg-emerald-600 text-white font-bold text-sm rounded-xl cursor-pointer shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-2"
                id="lead-submit-btn">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    {isAU ? "Generating Quote..." : "Registering Application..."}
                  </span>
                ) : (
                  <>Submit Application <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
              <span className="block text-center text-[10px] text-slate-400 mt-2.5 flex items-center justify-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> Your information is fully secured. We never share your data.
              </span>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}



