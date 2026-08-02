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

export default function LeadForm({ initialMode = "calculator" }) {
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
    fetchBrands();
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
  const handleCheckEligibility = async ({ meterCategory, billAmount, monthlyUnits, dueAmount, billStatus, monthsOverdue }) => {
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
    const totalCost = capacity * 60000;
    const net = totalCost - subsidy;

    let mappedSolarType = "surya-ghar";
    if (country === "AU") {
      if (capacity <= 6.6) mappedSolarType = "au-small-home";
      else if (capacity <= 10) mappedSolarType = "au-standard-family";
      else if (capacity <= 13) mappedSolarType = "au-large-home";
      else mappedSolarType = "au-ev-owners";
    }

    const submission = {
        name: fullName,
        mobile: mobileNumber,
        city,
        state: customerState,
        consumerNumber: consumerNumber || "",
        meterCategory: meterCategory || "Not detected",
        discom: discom || "Not detected",
        tariff: tariffDesc || "Not detected",
        billAmount: monthlyBill,
        kw: capacity,
        source: "website-form",
        solarType: mappedSolarType,
        postcode: isAU ? postcode : undefined,
        retailer: isAU ? retailer : undefined,
        ownsProperty: isAU ? ownsProperty : undefined,
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

  if (isAU) {
    // For AU: monthlyBill is actually Quarterly Bill in AUD
    sliderKw = Math.max(3, Math.min(15, Math.ceil(monthlyBill / 100))); // e.g. $400/qtr = 4kW
    sliderUnits = Math.round(sliderKw * 115); 
    sliderSubsidy = Math.round(sliderKw * 1.17 * 5 * 38); // Zone 3 estimate (multiplier 1.17, 5 yrs deeming, $38 STC)
    sliderCost = sliderKw * 1100;
    sliderNet = Math.max(1000, sliderCost - sliderSubsidy);
    sliderPaybackMonths = Math.round(sliderNet / (monthlyBill * 0.85 / 3)); // monthlyBill is quarterly, so div by 3 for monthly savings
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

  return (
    <section id="eligibility-calculator" className="py-20 solar-gradient relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Realtime Solar Simulator
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 mt-3 leading-tight">
            Check Your Subsidy & Rooftop Solar Estimate
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

              <div className="w-full max-w-md bg-slate-50 rounded-2xl p-5 border border-slate-100 mt-6 text-left space-y-3 font-sans">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-xs text-slate-400 uppercase font-black tracking-wider">Parameters</span>
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {isAU ? "CEC Accredited" : "GEDA Empanelled"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                  <div>
                    <span className="text-slate-400 uppercase tracking-wide text-[10px]">Applicant Name</span>
                    <p className="font-semibold text-slate-800 truncate">{submitSuccess.fullName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wide text-[10px]">Contact Mobile</span>
                    <p className="font-semibold text-slate-800">{submitSuccess.mobileNumber}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wide text-[10px]">City / State</span>
                    <p className="font-semibold text-slate-800 flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-rose-500" /> {submitSuccess.city}, {submitSuccess.state}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wide text-[10px]/none">{isAU ? "Postcode" : "Consumer No"}</span>
                    <p className="font-semibold font-mono text-slate-800">{submitSuccess.consumerNumber}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wide text-[10px]">{isAU ? "Retailer/DNSP" : "DISCOM"}</span>
                    <p className="font-semibold text-slate-800">{submitSuccess.discom}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wide text-[10px]">Meter Category</span>
                    <p className="font-semibold text-slate-800">{submitSuccess.meterCategory}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wide text-[10px]">Tariff</span>
                    <p className="font-semibold text-slate-800 text-xs truncate" title={submitSuccess.tariff}>{submitSuccess.tariff}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wide text-[10px]">Eligibility</span>
                    <p className={`font-semibold ${submitSuccess.isEligible ? "text-emerald-600" : "text-red-500"}`}>
                      {submitSuccess.isEligible ? "✓ Eligible" : "✗ Needs Review"}
                    </p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-150 grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-sky-50 rounded-lg">
                      <span className="text-slate-400 text-[9px] block uppercase leading-none font-semibold">Recommended Capacity</span>
                      <span className="text-sm font-black text-solar-sky mt-0.5 block">{submitSuccess.estimatedCapacityKw} kW</span>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <span className="text-slate-400 text-[9px] block uppercase leading-none font-semibold">{isAU ? "STC Discount" : "Estimated Subsidy"}</span>
                      <span className="text-sm font-black text-solar-green mt-0.5 block">{isAU ? "$" : "₹"}{submitSuccess.estimatedSubsidy.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <span className="text-slate-400 text-[9px] block uppercase leading-none font-semibold">Your Est Investment</span>
                      <span className="text-sm font-black text-slate-900 mt-0.5 block">{isAU ? "$" : "₹"}{submitSuccess.netCostEstimate.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
                {submitSuccess.billFileName && (
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-150">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-500" /> Light Bill uploaded safely: <strong>{submitSuccess.billFileName}</strong>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a href="tel:+919898231245" className="px-5 py-2 text-xs font-bold text-white bg-slate-950 rounded-xl hover:bg-slate-800 text-center">
                  📞 Direct Helpline Call
                </a>
                <button onClick={() => setSubmitSuccess(null)} className="px-5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-center">
                  Enquire for another home
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 glass-panel p-6 rounded-3xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-slate-900">Subsidy Estimator</h3>
                <p className="text-[11px] text-slate-500">Quick calculation — for your exact eligibility, scan your bill on the right →</p>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-1 bg-slate-50 p-2 rounded-xl">
                  <span className="text-xs text-slate-550 font-bold">
                    {isAU ? "Average Quarterly Bill Amount:" : "Average Monthly Bill Amount:"}
                  </span>
                  <span className="text-lg font-black text-solar-sky">
                    {isAU ? "$" : "₹"}{monthlyBill.toLocaleString("en-IN")}
                  </span>
                </div>
                <input
                  type="range" min="500" max="15000" step="250" value={monthlyBill}
                  onChange={(e) => {
                    setMonthlyBill(Number(e.target.value));
                    if (fetchedData) setFetchedData(null);
                    if (eligibilityResult) setEligibilityResult(null);
                  }}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-solar-sky focus:outline-none"
                  id="bill-range-slider"
                />
                <div className="flex justify-between text-[10px] text-slate-400 px-1 mt-1">
                  <span>{isAU ? "$500 / Qtr" : "₹500 / Month"}</span>
                  <span>{isAU ? "$15,000 / Qtr" : "₹15,000 / Month"}</span>
                </div>
              </div>

              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-tight">Est. Power Needs</span>
                    <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">{sliderUnits} Units <span className="text-[10px] text-slate-400">/ mo</span></span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-tight">Recommended Panel</span>
                    <span className="text-lg font-extrabold text-solar-sky mt-0.5 block">{sliderKw} kW Rooftop</span>
                  </div>
                </div>
                <div className="p-4 bg-[#10B981]/5 rounded-2xl border border-[#10B981]/15">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Award className="w-4 h-4" /> 
                      {isAU ? "STC Upfront Discount" : "PM Surya Ghar Subsidy"}
                    </span>
                    <span className="text-lg font-black text-solar-green">
                      {isAU ? "$" : "₹"}{sliderSubsidy.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {isAU ? "Small-scale Technology Certificates (STC) applied directly by installer." : "Standard central government incentive transferred to bank."}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-650">
                    <span>Approx Setup Cost</span>
                    <span className="font-semibold text-slate-800">{isAU ? "$" : "₹"}{sliderCost.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-650">
                    <span className="text-emerald-600 font-bold">{isAU ? "Minus STC Discount" : "Minus Central Subsidy"}</span>
                    <span className="font-bold text-solar-green">- {isAU ? "$" : "₹"}{sliderSubsidy.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="border-t border-slate-200/60 pt-2 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900">Your Net Investment</span>
                    <span className="text-base font-black text-slate-900">{isAU ? "$" : "₹"}{sliderNet.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-2.5 bg-sky-50 rounded-xl">
                    <span className="text-slate-500 text-[9px] block font-bold uppercase leading-none">Investment ROI</span>
                    <span className="text-xs font-extrabold text-slate-800 mt-1 block flex items-center justify-center gap-0.5">
                      <TrendingDown className="w-3.5 h-3.5 text-solar-sky" /> Approx {sliderPaybackMonths} Months
                    </span>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-xl">
                    <span className="text-slate-500 text-[9px] block font-bold uppercase leading-none">Green Benefit</span>
                    <span className="text-xs font-extrabold text-slate-800 mt-1 block flex items-center justify-center gap-0.5">
                      <Trees className="w-3.5 h-3.5 text-solar-green" /> Plnt {sliderTreesPlanted} Trees
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 glass-panel p-6 md:p-8 rounded-3xl">
            <div className="bg-[#0081C9]/5 rounded-2xl p-4 border border-[#0081C9]/15 mb-6">
              

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your State * (for {isAU ? 'STC zone estimation' : 'subsidy calculation'})</label>
              <select
                value={customerState}
                onChange={(e) => { setCustomerState(e.target.value); setEligibilityResult(null); }}
                className="w-full px-4 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all cursor-pointer"
              >
                {(countryStatesMap[country] || countryStatesMap["IN"]).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {fetchedData && (
              <div className="p-4 bg-[#10B981]/5 rounded-2xl border border-[#10B981]/20 mb-4" id="fetched-details-card">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#10B981] mb-2 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  {scanConfidence ? "Bill scanned successfully!" : "Demo data loaded!"}
                </div>
                {scanConfidence && scanConfidence !== "high" && (
                  <div className="flex items-start gap-2 mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-700">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Kuch details bill se clearly nahi mil payi — kripya neeche form me manually check/edit kar lo.</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 text-xs mb-1">
                  <div>
                    <span className="text-slate-400 font-medium">Consumer Name:</span>
                    <p className="font-bold text-slate-800 truncate">{fetchedData.consumerName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">DISCOM Provider:</span>
                    <p className="font-bold text-[#0081C9] truncate">{discom || fetchedData.discom || "—"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Meter Category:</span>
                    <p className="font-bold text-[#0081C9]">{meterCategory || "—"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Tariff / Phase:</span>
                    <p className="font-bold text-[#0081C9]">{tariffDesc || "—"}</p>
                  </div>
                  <div className="grid grid-cols-3 col-span-2 gap-2 text-center pt-2 mt-2 border-t border-slate-200/50">
                    <div className="p-1.5 bg-white rounded-lg">
                      <span className="text-[9px] text-slate-400">Monthly units</span>
                      <span className="font-extrabold text-slate-800 block">{fetchedData.monthlyUnits} Units</span>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg">
                      <span className="text-[9px] text-slate-400">Est solar capacity</span>
                      <span className="font-extrabold text-solar-sky block">{fetchedData.eligibleCapacityKw} kW System</span>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg">
                      <span className="text-[9px] text-slate-400">Guaranteed Subsidy</span>
                      <span className="font-extrabold text-solar-green block">₹{Number(fetchedData.subsidyAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isCheckingEligibility && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-6 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-solar-sky animate-spin" />
                <span className="text-xs font-semibold text-slate-600">Checking eligibility against Sunnovative's admin rules...</span>
              </div>
            )}

            {eligibilityError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold mb-6 flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" /> {eligibilityError}
              </div>
            )}

            {eligibilityResult && (
              <div className={`p-4 rounded-2xl border mb-6 ${
                eligibilityResult.isEligible ? "bg-emerald-50/60 border-emerald-200" : "bg-red-50/60 border-red-200"
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  {eligibilityResult.isEligible ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`text-sm font-bold ${eligibilityResult.isEligible ? "text-emerald-700" : "text-red-600"}`}>
                    {eligibilityResult.isEligible ? "You're Eligible for Rooftop Solar!" : "Needs Review Before Proceeding"}
                  </span>
                </div>

                {eligibilityResult.reasons?.length > 0 && (
                  <ul className="text-[11px] text-slate-600 space-y-1 mb-3 list-disc list-inside">
                    {eligibilityResult.reasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                )}

                {eligibilityResult.dueAmountWarning && (
                  <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {eligibilityResult.dueAmountWarning}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Recommended</p>
                    <p className="text-base font-black text-solar-sky">{eligibilityResult.suggestedKW} kW</p>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Subsidy</p>
                    <p className="text-base font-black text-solar-green">
                      {eligibilityResult.isSubsidyEligible ? `₹${eligibilityResult.subsidy.total.toLocaleString("en-IN")}` : "Not eligible"}
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Net Investment</p>
                    <p className="text-base font-black text-slate-900">₹{eligibilityResult.estimatedInvestment.netAfterSubsidy.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                {eligibilityResult.isSubsidyEligible && eligibilityResult.subsidy.total > 0 && (
                  <p className="text-[10px] text-slate-500 mt-2">
                    ₹{eligibilityResult.subsidy.central.toLocaleString("en-IN")} Central (PM Surya Ghar) + ₹{eligibilityResult.subsidy.state.toLocaleString("en-IN")} {customerState} state top-up
                    {eligibilityResult.subsidy.stateScheme ? ` (${eligibilityResult.subsidy.stateScheme})` : ""}.
                  </p>
                )}

                {eligibilityResult.isEligible && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60">
                    <p className="text-[11px] text-slate-500">
                      Next step: fill your details below and submit — our team will help you choose an EPC installer for this project. 👇
                    </p>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4" id="solar-lead-form">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-3">Applicant & Survey Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name (Owner Name) *</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rajeshbhai Kunjibhai Patel"
                    className="w-full px-4 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (WhatsApp Status Sync) *</label>
                  <div className="relative">
                    {isAU && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">+61</span>}
                    <input type="tel" required maxLength={10} value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder={isAU ? "412 345 678" : "e.g. 98982 12345"}
                      className={`w-full ${isAU ? 'pl-10' : 'px-4'} pr-4 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all`} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{isAU ? "Suburb / City *" : "City *"}</label>
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
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{isAU ? "Average Quarterly Bill *" : "Average Monthly Bill *"}</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{isAU ? "$" : "₹"}</span>
                    <input type="number" required value={monthlyBill}
                      onChange={(e) => setMonthlyBill(Number(e.target.value))}
                      placeholder="e.g. 2150"
                      className="w-full pl-7 pr-4 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all" />
                  </div>
                </div>
              </div>

              {isAU && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Electricity Retailer *</label>
                    <select value={retailer} onChange={(e) => setRetailer(e.target.value)}
                      className="w-full px-4 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all cursor-pointer">
                      <option value="AGL">AGL</option>
                      <option value="Origin Energy">Origin Energy</option>
                      <option value="EnergyAustralia">EnergyAustralia</option>
                      <option value="Red Energy">Red Energy</option>
                      <option value="Alinta Energy">Alinta Energy</option>
                      <option value="Simply Energy">Simply Energy</option>
                      <option value="Lumo Energy">Lumo Energy</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="flex items-center mt-6">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" checked={ownsProperty} onChange={(e) => setOwnsProperty(e.target.checked)}
                        className="w-4 h-4 text-solar-sky bg-slate-50 border-slate-300 rounded focus:ring-solar-sky" />
                      <span className="ml-2 text-xs font-semibold text-slate-700">I own this property</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Solar Brand</label>
                  <select value={preferredSolarBrand} onChange={(e) => setPreferredSolarBrand(e.target.value)} className="w-full px-4 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all cursor-pointer">
                    <option value="">Any Reputed Brand</option>
                    {availableBrands.filter(b => b.type === 'Solar').map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Inverter Brand</label>
                  <select value={preferredInverterBrand} onChange={(e) => setPreferredInverterBrand(e.target.value)} className="w-full px-4 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all cursor-pointer">
                    <option value="">Any Reputed Brand</option>
                    {availableBrands.filter(b => b.type === 'Inverter').map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Upload Latest Light Bill — Auto-Scanned</label>
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
                      <p className="text-[10px] text-slate-400 mt-1">Reading consumer number, meter category & consumption</p>
                    </div>
                  ) : uploadedFile ? (
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-solar-green flex items-center justify-center mb-2">
                        <FileCheck className="w-5 h-5 animate-pulse-subtle" />
                      </div>
                      <p className="text-xs font-bold text-slate-800 tracking-tight">{uploadedFile.name}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Click or drag to change file</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-xs font-semibold text-slate-700">Drag & drop your latest Light Bill photo</p>
                      <p className="text-[10.5px] text-slate-400 mt-1">Or click to browse • Supports JPG, PNG, and PDF — auto-scans instantly</p>
                    </div>
                  )}
                </div>
                {scanError && (
                  <div className="text-[11px] text-red-500 font-semibold mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {scanError}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button type="submit" disabled={isSubmitting}
                  className="w-full py-4 bg-solar-green hover:bg-emerald-600 text-white font-bold text-sm rounded-xl cursor-pointer shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-2"
                  id="lead-submit-btn">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      {isAU ? "Generating Quote..." : "Registering GEDA File..."}
                    </span>
                  ) : (
                    <>Submit your enquiry here <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
                <span className="block text-center text-[10px] text-slate-400 mt-2.5 flex items-center justify-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> Your bill or consumer information is fully secured under {isAU ? "DNSP" : "GEDA/DISCOM"} security protocols. We never share your data.
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}