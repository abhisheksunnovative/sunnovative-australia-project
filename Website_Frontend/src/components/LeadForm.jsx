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
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    // Union Territories
    "Andaman & Nicobar Islands", "Chandigarh", "Dadra & Nagar Haveli and Daman & Diu",
    "Delhi", "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
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
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Rajkot");
  const [customerState, setCustomerState] = useState("Gujarat");
  const [monthlyBill, setMonthlyBill] = useState(2500);
  const [postcode, setPostcode] = useState("");
  const [retailer, setRetailer] = useState("AGL");
  const [ownsProperty, setOwnsProperty] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [preferredBrands, setPreferredBrands] = useState({});
  const [productCategories, setProductCategories] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [stcSettings, setStcSettings] = useState(null);
  const [projectTypeConfigs, setProjectTypeConfigs] = useState([]);
  const [eligibilityCategories, setEligibilityCategories] = useState([]);
  const [selectedUpgradeKw, setSelectedUpgradeKw] = useState(0);
  const [selectedKw, setSelectedKw] = useState(0);
  // Section 4: Customer-chosen kW (may differ from recommended)
  const [customKw, setCustomKw] = useState(null); // null = not yet chosen (shows recommended)
  // AU Bill Scan — STC info returned from backend
  const [scannedStcInfo, setScannedStcInfo] = useState(null);
  const [scannedRetailer, setScannedRetailer] = useState(null);
  const [scannedBillingPeriod, setScannedBillingPeriod] = useState(null);
  const [scannedQuarterlyKwh, setScannedQuarterlyKwh] = useState(null);

  // Dynamic form settings from backend
  const [formSettings, setFormSettings] = useState(null);
  // Dynamic field values for any extra dynamic fields
  const [dynamicValues, setDynamicValues] = useState({});

  // Fetch project-specific form settings
  useEffect(() => {
    const loadFormSettings = async () => {
      const ptKey = selectedProjectType || "default";
      const countryCode = getCountryCode();
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4005";
      try {
        const res = await fetch(`${apiBase}/api/website-settings/${countryCode}/${ptKey}`);
        const data = await res.json();
        let settingsToUse = null;
        if (data.success && data.data?.projectForm) {
          settingsToUse = data.data.projectForm;
        } else if (propSettings?.projectForm) {
          settingsToUse = propSettings.projectForm;
        }
        
        if (settingsToUse && settingsToUse.fields) {
          const hasEmail = settingsToUse.fields.some(f => f.key === 'email');
          if (!hasEmail) {
            const mobileIdx = settingsToUse.fields.findIndex(f => f.key === 'mobileNumber');
            const insertIdx = mobileIdx >= 0 ? mobileIdx + 1 : 2;
            settingsToUse.fields.splice(insertIdx, 0, {
              key: 'email',
              label: `Email Address *`,
              type: 'email',
              required: true,
              placeholder: 'e.g. hello@example.com'
            });
          }
          setFormSettings(settingsToUse);
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

    const fetchProductConfigs = async () => {
      try {
        const ptKey = selectedProjectType || "Residential Solar";
        const res = await fetch(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/product-configs?country=${getCountryCode()}&projectType=${ptKey}` : `http://localhost:4005/api/product-configs?country=${getCountryCode()}&projectType=${ptKey}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const uniqueCategories = [...new Set(data.map(item => item.productCategory))];
          setProductCategories(uniqueCategories);
        }
      } catch (err) {
        console.error("Failed to fetch product configs", err);
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

    const fetchEligibilitySettings = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/eligibility-settings` : `http://localhost:4005/api/eligibility-settings`, {
          headers: { 'country': getCountryCode() }
        });
        const data = await res.json();
        if (data.success && data.data?.projectCategories) {
          setEligibilityCategories(data.data.projectCategories);
        }
      } catch (err) {
        console.error("Failed to fetch eligibility settings", err);
      }
    };

    fetchBrands();
    fetchProductConfigs();
    fetchStcSettings();
    fetchEligibilitySettings();
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

  // Bill scan — routes to AU or India pipeline based on country
  const handleScanBill = async (file) => {
    setScanError("");
    setScanConfidence(null);
    setEligibilityResult(null);
    setScannedStcInfo(null);
    setScannedRetailer(null);
    setScannedBillingPeriod(null);
    setScannedQuarterlyKwh(null);
    setIsScanning(true);

    try {
      const formData = new FormData();
      formData.append("billFile", file);

      const { data } = await billScanApi.post("/api/light-bill/scan", formData, {
        headers: { "x-country": getCountryCode() }
      });

      setScanConfidence(data.confidence);
      const ex = data.extracted;

      // ── Common fields ─────────────────────────────────────────────────────
      if (ex.consumerName)   setFullName(ex.consumerName);
      if (ex.consumerNumber) setConsumerNumber(ex.consumerNumber);
      if (ex.meterCategory)  setMeterCategory(ex.meterCategory);
      if (ex.tariffType) setMeterCategory(ex.tariffType);
      if (ex.discom || ex.retailer) setDiscom(ex.discom || ex.retailer);
        if (ex.tariffDesc || ex.tariffCode || ex.tariffType || ex.tariff) setTariffDesc(ex.tariffDesc || ex.tariffCode || ex.tariffType || ex.tariff);
        if (ex.meterType) setMeterCategory(ex.meterType);

      if (data.confidence === "low") {
        setScanError(data.message || "Some fields could not be clearly extracted. Please verify manually.");
      }

      // ── AUSTRALIA: populate AU-specific fields ────────────────────────────
      if (data.country === "australia") {
        if (ex.suburb)        setCity(ex.suburb);
        if (ex.postcode)      setPostcode(ex.postcode);
        if (ex.retailer)      setScannedRetailer(ex.retailer);
        if (ex.state) {
          const auStates = countryStatesMap["AU"] || [];
          const matchedState = auStates.find(s => s.toLowerCase() === ex.state.toLowerCase());
          if (matchedState) setCustomerState(matchedState);
        }
        if (ex.monthlyBillEquivalent) {
          setMonthlyBill(ex.monthlyBillEquivalent); // monthly equiv of quarterly bill
        }
        if (ex.quarterlyKwh) setScannedQuarterlyKwh(ex.quarterlyKwh);
        if (ex.billingPeriodFrom && ex.billingPeriodTo) {
          setScannedBillingPeriod(`${ex.billingPeriodFrom} → ${ex.billingPeriodTo}`);
        }
        if (data.stcInfo) setScannedStcInfo(data.stcInfo);
        // Update kW slider from scan recommendation
        if (data.recommendedKw) setSelectedKw(data.recommendedKw);

      } else {
        // ── INDIA: populate India-specific fields ─────────────────────────────
        if (ex.billAmount)   setMonthlyBill(ex.billAmount);
        if (ex.discomId)     setDiscom(ex.discomId);
        if (ex.tariffDesc)   setTariffDesc(ex.tariffDesc);
        if (ex.billStatus)   setBillStatus(ex.billStatus);
        if (ex.dueAmount)    setDueAmount(ex.dueAmount);
        if (ex.district)     setCity(ex.district);

        const currentStates = countryStatesMap[country] || countryStatesMap["IN"];
        if (ex.detectedState) {
          const matchedState = currentStates.find(s => s.toLowerCase() === ex.detectedState.toLowerCase());
          if (matchedState) setCustomerState(matchedState);
        }

        if (data.recommendedKw) setSelectedKw(data.recommendedKw);

        const units = data.monthlyUnitsUsed || ex.monthlyUnits || null;
        setOcrMonthlyUnits(units);

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
        alert("This file appears to be empty (0 MB). Please upload a valid file.");
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
    if (!fullName || !city) {
      alert("Required details (Name, City) are missing.");
      return;
    }
    if (isAU && !email) {
      alert("Email is required for Australia/International leads.");
      return;
    }
    if (!isAU && !mobileNumber) {
      alert("Mobile number is required for Indian leads.");
      return;
    }
    if (eligibilityResult && eligibilityResult.isEligible === false) {
      alert("Eligibility Check Failed:\n" + (eligibilityResult.reasons?.join('\n') || "Your bill does not meet the requirements."));
      return;
    }
    setIsSubmitting(true);

    // Match the UI's calculation for Recommended Size based on current monthly bill
    const currentMaxKw = (() => {
      const matchSlug = selectedProjectType || (isAU ? 'residential' : 'surya-ghar');
      const cfg = projectTypeConfigs?.find(c => c.slug === matchSlug);
      return cfg?.maxKwLimit || (isAU ? 20 : 10);
    })();
    
    let uiRecommendedKw;
    if (isAU) {
      uiRecommendedKw = selectedKw || Math.max(3, Math.min(currentMaxKw, Math.ceil(monthlyBill / 100)));
    } else {
      const units = Math.round(monthlyBill / 7.2);
      uiRecommendedKw = Math.max(1, Math.min(currentMaxKw, Math.ceil(units / 115)));
    }

    // Prefer user's explicit selection (customKw) over the UI recommended base
    let finalCapacity = customKw || uiRecommendedKw;
    
    if (selectedUpgradeKw && selectedUpgradeKw > finalCapacity) {
      finalCapacity = selectedUpgradeKw;
    }
    
    // Validate finalCapacity against project type limits
    const { minKwLimit, maxKwLimit } = (() => {
      const matchSlug = selectedProjectType || (isAU ? 'residential' : 'surya-ghar');
      const cfg = projectTypeConfigs?.find(c => c.slug === matchSlug);
      const elig = eligibilityCategories?.find(c => c.id === matchSlug || c.name?.toLowerCase() === matchSlug.toLowerCase());
      return {
        minKwLimit: elig?.minKW || 1,
        maxKwLimit: elig?.maxKW || cfg?.maxKwLimit || (isAU ? 20 : 10)
      };
    })();

    if (finalCapacity < minKwLimit || finalCapacity > maxKwLimit) {
      alert(`You are not eligible for this project type with ${finalCapacity} kW.\nThe allowed range for ${selectedProjectType || 'this project'} is ${minKwLimit} kW to ${maxKwLimit} kW.\nPlease adjust your system size using the scale or select a different project type tab.`);
      setIsSubmitting(false);
      return;
    }

    const subsidy = eligibilityResult?.subsidy?.total ?? (finalCapacity === 1 ? 33000 : finalCapacity === 2 ? 66000 : 78500);
    const totalCost = finalCapacity * 60000;
    const net = totalCost - subsidy;

    let mappedSolarType = selectedProjectType || (country === "AU" ? "residential" : "surya-ghar");

    // Merge dynamic field values into submission (only for Lead-known keys)
    const KNOWN_LEAD_KEYS = ["consumerNumber","fullName","mobileNumber","email","postcode","city","customerState","monthlyBill","ownsProperty"];
    const extraFromDynamic = {};
    Object.entries(dynamicValues).forEach(([key, val]) => {
      if (KNOWN_LEAD_KEYS.includes(key)) extraFromDynamic[key] = val;
      else extraFromDynamic[key] = val; // include any extra as notes
    });

    let billUrl = "";
    if (uploadedFile) {
      try {
        const fd = new FormData();
        fd.append("file", uploadedFile);
        const uploadRes = await fetch(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/upload-file` : "http://localhost:4005/api/upload-file", {
          method: "POST",
          body: fd
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          billUrl = uploadData.fileUrl;
        }
      } catch (e) {
        console.error("Failed to upload bill", e);
      }
    }

    const submission = {
        name: fullName || extraFromDynamic.fullName,
        mobile: mobileNumber || extraFromDynamic.mobileNumber,
        email: email || extraFromDynamic.email,
        country: isAU ? 'australia' : 'india',
        city: city || extraFromDynamic.city,
        state: customerState || extraFromDynamic.customerState,
        district: city || extraFromDynamic.district || customerState,
        consumerNumber: consumerNumber || extraFromDynamic.consumerNumber || "",
        meterCategory: meterCategory || "Not detected",
        discom: discom || "Not detected",
        tariff: tariffDesc || "Not detected",
        billAmount: monthlyBill || extraFromDynamic.monthlyBill,
        kw: finalCapacity,
        totalCost: totalCost,
        subsidy: subsidy,
        source: "website-form",
        solarType: mappedSolarType,
        postcode: postcode || extraFromDynamic.postcode,
        retailer: isAU ? retailer : undefined,
        ownsProperty: ownsProperty !== undefined ? ownsProperty : extraFromDynamic.ownsProperty,
        dynamicBrands: preferredBrands, // Send directly just in case backend expects it
        billUrl: billUrl,
        notes: `Estimated Subsidy / STC Rebate: ${subsidy}, Net Cost: ${net}${Object.keys(preferredBrands).length > 0 ? ` | Preferred Brands: ${Object.keys(preferredBrands).map(k => `${k}:${availableBrands.find(b=>b._id===preferredBrands[k]||b.id===preferredBrands[k])?.name||preferredBrands[k]}`).join(', ')}` : ''}`,
      };

      try {
        const res = await fetch(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/leads` : "http://localhost:4005/api/leads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-country": isAU ? "australia" : "india",
          },
          body: JSON.stringify(submission),
        });
        const data = await res.json();
        
        if (data.success) {
          alert("Enquiry Submitted Successfully!");
          setSubmitSuccess({
            ...submission,
            isEligible: eligibilityResult?.isEligible ?? true,
            estimatedCapacityKw: finalCapacity,
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
    setEmail("");
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
    setPreferredBrands({});
    setCustomKw(null);
    // AU scan state
    setScannedStcInfo(null);
    setScannedRetailer(null);
    setScannedBillingPeriod(null);
    setScannedQuarterlyKwh(null);
  };

  const isAU = country === "AU";

  // ── Max kW limit from admin projectTypeConfigs (or default 15) ───────────
  const maxKwLimit = (() => {
    if (!projectTypeConfigs || projectTypeConfigs.length === 0) return isAU ? 20 : 10;
    const matchSlug = selectedProjectType || (isAU ? 'residential' : 'surya-ghar');
    const cfg = projectTypeConfigs.find(c => c.slug === matchSlug);
    return cfg?.maxKwLimit || (isAU ? 20 : 10);
  })();

  // ── STC zone helper (reuse frontend version for live calculation) ────────
  const getStcZone = (pc) => {
    const code = parseInt(pc, 10);
    if (!code) return 3;
    if ((code >= 800 && code <= 899) || (code >= 6700 && code <= 6799) || (code >= 4700 && code <= 4899)) return 1;
    if ((code >= 4600 && code <= 4699) || (code >= 4300 && code <= 4499) || (code >= 6600 && code <= 6699)) return 2;
    if ((code >= 7000 && code <= 7999) || code === 2627 || code === 2628) return 4;
    return 3;
  };

  // ── India subsidy table (PM Surya Ghar Yojana) ───────────────────────────
  const getIndiaSubsidy = (kw) => {
    if (kw <= 0) return 0;
    if (kw <= 1) return 30000;
    if (kw <= 2) return 60000;
    return 78000; // capped at 3kW for central subsidy
  };
  const getIndiaCost = (kw) => {
    if (kw <= 1) return 60000;
    if (kw <= 2) return 120000;
    return 120000 + (kw - 2) * 40000;
  };

  // ── AU STC calculation for any kW ────────────────────────────────────────
  const calcStcForKw = (kw) => {
    const zone = getStcZone(postcode);
    const multiplier = zone === 1 ? 1.622 : zone === 2 ? 1.536 : zone === 3 ? 1.382 : 1.185;
    const deemingYears = stcSettings?.deemingYears || 5;
    const stcPrice = stcSettings?.stcPrice || 38;
    const stcs = Math.floor(kw * multiplier * deemingYears);
    const stcValue = Math.round(stcs * stcPrice);
    const installCost = Math.round(kw * 1100);
    const netCost = Math.max(500, installCost - stcValue);
    return { zone, multiplier, deemingYears, stcPrice, stcs, stcValue, installCost, netCost };
  };

  // ── Recommended kW (from bill, scan, or estimate) ────────────────────────
  let sliderUnits, sliderKw, sliderSubsidy, sliderCost, sliderNet, sliderPaybackMonths;

  if (isAU) {
    sliderKw = selectedKw || Math.max(3, Math.min(maxKwLimit, Math.ceil(monthlyBill / 100)));
    sliderUnits = Math.round(sliderKw * 115);
    const stcCalc = calcStcForKw(sliderKw);
    sliderSubsidy = stcCalc.stcValue;
    sliderCost = stcCalc.installCost;
    sliderNet = stcCalc.netCost;
    sliderPaybackMonths = Math.round(sliderNet / (monthlyBill * 0.85 / 3));
  } else {
    sliderUnits = Math.round(monthlyBill / 7.2);
    sliderKw = Math.max(1, Math.min(maxKwLimit, Math.ceil(sliderUnits / 115)));
    sliderSubsidy = getIndiaSubsidy(sliderKw);
    sliderCost = getIndiaCost(sliderKw);
    sliderNet = Math.max(10000, sliderCost - sliderSubsidy);
    sliderPaybackMonths = Math.round(sliderNet / (monthlyBill * 0.85));
  }

  // ── Custom kW chosen by user in Section 4 ────────────────────────────────
  const effectiveCustomKw = customKw !== null ? customKw : sliderKw;
  const customStcCalc = isAU ? calcStcForKw(effectiveCustomKw) : null;
  const customIndiaSubsidy = !isAU ? getIndiaSubsidy(effectiveCustomKw) : 0;
  const customIndiaCost = !isAU ? getIndiaCost(effectiveCustomKw) : 0;
  const customIndiaNet = !isAU ? Math.max(10000, customIndiaCost - customIndiaSubsidy) : 0;

  // AU standard system sizes for quick-select buttons
  const AU_QUICK_SIZES = [3, 5, 6.6, 10, 13, 15, 20].filter(s => s <= maxKwLimit);
  const IN_QUICK_SIZES = [1, 2, 3, 5, 6, 8, 10].filter(s => s <= maxKwLimit);

  // Helper: render a single dynamic form field
  const renderDynamicField = (field, idx) => {
    const stateKeyMap = {
      consumerNumber: [consumerNumber, setConsumerNumber],
      fullName: [fullName, setFullName],
      mobileNumber: [mobileNumber, (v) => setMobileNumber(v.replace(/\D/g, ""))],
      email: [email, setEmail],
      city: [city, setCity],
      customerState: [customerState, setCustomerState],
      monthlyBill: [monthlyBill, (v) => setMonthlyBill(Number(v))],
      postcode: [postcode, setPostcode],
      tariffDesc: [tariffDesc, setTariffDesc],
        meterCategory: [meterCategory, setMeterCategory],
        discom: [discom, setDiscom],
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
        <label className="block text-[11px] font-bold text-slate-700 mb-0.5 truncate">
          {field.label}{field.required && " *"}
        </label>
        {field.type === "select" ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            className="w-full px-2.5 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all cursor-pointer font-medium"
          >
            <option value="">Select...</option>
            {(field.key === "customerState" ? (countryStatesMap[country] || countryStatesMap["IN"]) : (field.options || [])).map((opt, oi) => <option key={oi} value={opt}>{opt}</option>)}
          </select>
        ) : field.type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            rows={1}
            className="w-full px-2.5 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all font-medium"
          />
        ) : (
          <input
            type={field.type || "text"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            className="w-full px-2.5 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all font-medium"
          />
        )}
      </div>
    );
  };

  // Decide whether to use dynamic fields or default layout
  const hasDynamicFields = formSettings?.fields && formSettings.fields.length > 0;

  return (
    <section id="eligibility-calculator" className="py-6 md:py-8 solar-gradient relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {formSettings?.title || "Apply for Solar"}
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 mt-1.5 leading-tight">
            {submitSuccess ? "Project Details Submitted Successfully" : (formSettings?.subtitle || "Check Your Subsidy & Rooftop Solar Estimate")}
          </h2>
          <p className="text-slate-600 mt-1 text-xs">
            {submitSuccess ? "We have received your project details." : "Select your state or upload your electricity bill for instant capacity recommendation."}
          </p>
        </div>

        {submitSuccess && (
          <div className="max-w-3xl mx-auto glass-panel rounded-2xl p-5 mb-6 relative overflow-hidden" id="lead-success-receipt">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-solar-yellow via-solar-green to-solar-sky"></div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-emerald-50 text-solar-green rounded-full flex items-center justify-center mb-2 border border-emerald-250">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-display font-bold text-slate-900">Rooftop Solar Enquiry Submitted!</h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Your application ID is <strong className="text-slate-800 font-mono">{submitSuccess.id}</strong>.
              </p>
              
              <div className="mt-4 flex gap-3">
                <button onClick={() => setSubmitSuccess(null)} className="px-4 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-center">
                  Enquire for another home
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="glass-panel p-4 md:p-5 rounded-2xl max-w-3xl mx-auto shadow-lg border border-slate-200">
          <form onSubmit={handleFormSubmit} className="space-y-3.5" id="solar-lead-form">
            
            {/* --- DYNAMIC FIELDS (from Admin Panel Form Builder) --- */}
            {hasDynamicFields ? (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">1. Your Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {(() => {
                    const dynamicFields = [...formSettings.fields.filter(f => f.key !== 'billFile')];
                    if (!dynamicFields.find(f => f.key === 'tariffDesc')) dynamicFields.push({ label: 'Tariff', key: 'tariffDesc', type: 'text', required: false, options: [] });
                    if (!dynamicFields.find(f => f.key === 'meterCategory')) dynamicFields.push({ label: 'Meter Category', key: 'meterCategory', type: 'text', required: false, options: [] });
                    if (!dynamicFields.find(f => f.key === 'discom')) dynamicFields.push({ label: 'Discom / Retailer', key: 'discom', type: 'text', required: false, options: [] });
                    return dynamicFields.map((field, idx) => renderDynamicField(field, idx));
                  })()}
                </div>
              </div>
            ) : (
            /* --- DEFAULT FIELDS (fallback) --- */
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-2.5">1. Applicant & Location Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">State *</label>
                  <select
                    value={customerState}
                    onChange={(e) => { setCustomerState(e.target.value); setEligibilityResult(null); }}
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all cursor-pointer font-medium"
                  >
                    {(countryStatesMap[country] || countryStatesMap["IN"]).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAU ? "Suburb / City *" : "District / City *"}</label>
                  {isAU ? (
                    <div className="flex gap-2">
                      <input type="text" required value={city} onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Parramatta"
                        className="w-2/3 px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all font-medium" />
                      <input type="text" required value={postcode} onChange={(e) => setPostcode(e.target.value.replace(/\D/g, ""))} maxLength={4}
                        placeholder="Postcode"
                        className="w-1/3 px-2.5 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all font-medium" />
                    </div>
                  ) : (
                    <select value={city} onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all cursor-pointer font-medium">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  </div></div><div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2.5"><div><label className="block text-[11px] font-bold text-slate-700 mb-1">Tariff</label><input type="text" value={tariffDesc || ''} onChange={(e) => setTariffDesc(e.target.value)} className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all font-medium" /></div><div><label className="block text-[11px] font-bold text-slate-700 mb-1">Meter Category</label><input type="text" value={meterCategory || ''} onChange={(e) => setMeterCategory(e.target.value)} className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all font-medium" /></div><div><label className="block text-[11px] font-bold text-slate-700 mb-1">Discom / Retailer</label><input type="text" value={discom || ''} onChange={(e) => setDiscom(e.target.value)} className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all font-medium" /></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><div><label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name (Owner Name) *</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rajeshbhai Kunjibhai Patel"
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile Number (WhatsApp){isAU ? ' (Optional)' : ' *'}</label>
                  <div className="relative">
                    {isAU && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">+61</span>}
                    <input type="tel" required={!isAU} maxLength={10} value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder={isAU ? "412 345 678" : "e.g. 98982 12345"}
                      className={`w-full ${isAU ? 'pl-9' : 'px-3'} pr-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all font-medium`} />
                  </div>
                  <div className="mt-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address {isAU ? '*' : '(Optional)'}</label>
                    <input type="email" required={isAU} value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. hello@example.com"
                      pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                      className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all font-medium invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-500 invalid:[&:not(:placeholder-shown):not(:focus)]:ring-red-500" />
                  </div>
                </div>
              </div>
              
              {/* Dynamic Brand Selections */}
              {productCategories.length > 0 && (
                <div className="mt-3 bg-white p-3 rounded-xl border border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-700 mb-2">Preferred Brands (Optional)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {productCategories.map(cat => (
                      <div key={cat}>
                        <label className="block text-[10px] text-slate-500 mb-1">{cat}</label>
                        <select 
                          value={preferredBrands[cat] || ""}
                          onChange={(e) => setPreferredBrands(prev => ({...prev, [cat]: e.target.value}))}
                          className="w-full px-2.5 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all font-medium"
                        >
                          <option value="">No Preference</option>
                          {availableBrands.filter(b => b.products && b.products.includes(cat)).map(brand => (
                            <option key={brand._id || brand.id} value={brand._id || brand.id}>{brand.name}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            )}

            {/* 2. Bill Fetch / Upload Section */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 mt-1">2. Electricity Bill Check</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isAU ? "Upload Electricity Bill (AGL / Origin etc.)" : "Upload Light Bill for Auto-Scan"}
                  </label>
                  <div
                    onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                    onClick={handleTriggerFileInput}
                    className={`border border-dashed rounded-xl p-2.5 text-center cursor-pointer transition-all ${
                      dragActive ? "border-solar-sky bg-sky-50/50" : uploadedFile ? "border-solar-green bg-emerald-50/20" : "border-slate-300 bg-slate-50/50 hover:bg-slate-100/80"
                    }`}
                    id="drag-drop-container"
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf" className="hidden" id="bill-file-input" />
                    {isScanning ? (
                      <div className="flex items-center justify-center gap-2 py-0.5">
                        <ScanLine className="w-4 h-4 text-solar-sky animate-pulse" />
                        <p className="text-xs font-bold text-slate-800">Scanning bill...</p>
                      </div>
                    ) : uploadedFile ? (
                      <div className="flex items-center justify-center gap-2 py-0.5">
                        <FileCheck className="w-4 h-4 text-solar-green" />
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[200px]">{uploadedFile.name}</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 py-0.5">
                        <UploadCloud className="w-4 h-4 text-slate-400" />
                        <p className="text-xs font-semibold text-slate-700">Drag & drop or click to upload bill</p>
                      </div>
                    )}
                  </div>
                  {scanError && (
                    <div className="text-[10px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" /> {scanError}
                    </div>
                  )}
                  {uploadedFile && !scanError && !isScanning && (
                    <div className="text-[10.5px] text-orange-600 font-semibold mt-1.5 flex items-start gap-1 bg-orange-50 p-1.5 rounded-md border border-orange-100">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> 
                      <span>Note: Verify the auto-filled details. AI can sometimes make mistakes. If anything looks incorrect, please manually edit the fields above.</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Or Enter Average Bill Manually</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{isAU ? "$" : "₹"}</span>
                    <input type="number" required value={monthlyBill}
                      onChange={(e) => setMonthlyBill(Number(e.target.value))}
                      placeholder="e.g. 2150"
                      className="w-full pl-7 pr-3 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all font-medium" />
                  </div>
                  <p className="text-[9px] text-slate-400 italic mt-0.5">Used for calculating system size.</p>
                </div>
              </div>
            </div>

            {/* 3. Recommended System & Subsidy (Auto-calculated, read-only) */}
            <div className="bg-amber-50/40 rounded-xl border border-amber-200/60 p-3 mt-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-900">
                  3. {isAU ? "Recommended System & STC Rebate" : "Recommended System & Subsidy"}
                </h3>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  🤖 Auto-calculated
                </span>
              </div>

              {/* AU: Bill scan STC detail banner */}
              {isAU && scannedStcInfo && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex flex-wrap gap-3 items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-black">Z{scannedStcInfo.zone}</span>
                    <span className="font-bold text-blue-800">STC Zone {scannedStcInfo.zone} detected</span>
                  </div>
                  <span className="text-blue-600">{scannedStcInfo.stcs} STCs × ${scannedStcInfo.stcPrice}/STC</span>
                  <span className="font-black text-emerald-700">${scannedStcInfo.stcValue.toLocaleString()} rebate</span>
                  <span className="text-slate-500">({scannedStcInfo.deemingYears}-yr deeming)</span>
                  {scannedRetailer && <span className="ml-auto bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-slate-600 font-medium">{scannedRetailer}</span>}
                </div>
              )}
              {/* AU: Scanned usage info */}
              {isAU && scannedQuarterlyKwh && (
                <div className="mb-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex flex-wrap gap-3">
                  <span>📊 <strong>Quarterly Usage:</strong> {scannedQuarterlyKwh.toLocaleString()} kWh</span>
                  {scannedBillingPeriod && <span>📅 <strong>Period:</strong> {scannedBillingPeriod}</span>}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="p-3 bg-white rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-tight">Recommended Size</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{sliderKw} kW</span>
                  <span className="text-[9px] text-slate-400">{sliderUnits} kWh/mo est.</span>
                </div>
                <div className="p-3 bg-[#10B981]/10 rounded-xl border border-[#10B981]/20 text-center">
                  <span className="text-[10px] text-emerald-600 block uppercase font-bold tracking-tight">
                    {isAU ? `STC Rebate${scannedStcInfo ? ` (Zone ${scannedStcInfo.zone})` : ""}` : "Govt Subsidy"}
                  </span>
                  <span className="text-sm font-black text-solar-green mt-0.5 block">
                    {isAU ? `$${sliderSubsidy.toLocaleString()}` : `₹${sliderSubsidy.toLocaleString("en-IN")}`}
                  </span>
                  {isAU && <span className="text-[9px] text-emerald-700 block">{Math.floor(sliderKw * (getStcZone(postcode) === 1 ? 1.622 : getStcZone(postcode) === 2 ? 1.536 : getStcZone(postcode) === 4 ? 1.185 : 1.382) * (stcSettings?.deemingYears || 5))} STCs</span>}
                </div>
                {!isAU && (
                  <>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-tight">Install Cost</span>
                      <span className="text-sm font-bold text-slate-700 mt-0.5 block">₹{sliderCost.toLocaleString()}</span>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
                      <span className="text-[10px] text-blue-600 block uppercase font-bold tracking-tight">Net Investment</span>
                      <span className="text-sm font-black text-blue-900 mt-0.5 block">₹{sliderNet.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-100 text-[11px] text-slate-600">
                <Award className="w-4 h-4 text-solar-sky shrink-0" />
                <p>
                  A <strong>{sliderKw} kW</strong> system generates ~<strong>{sliderUnits} kWh</strong> monthly, saving {isAU ? "$" : "₹"}{(sliderUnits * (isAU ? 0.3 : 7.2)).toFixed(0)} on your bill.
                  Estimated ROI: <strong>{sliderPaybackMonths} months</strong>.
                  {isAU && <> STC rebate applied upfront — <strong>no wait for government refund</strong>.</>}
                </p>
              </div>
            </div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* 4. Customize Your System Size (customer-chosen kW) */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="rounded-2xl border-2 border-solar-sky/30 bg-gradient-to-br from-sky-50/60 to-blue-50/40 p-5 mt-4" id="section-customize-kw">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">4. Customize Your System Size</h3>
                <span className="text-xs bg-sky-100 text-sky-700 font-bold px-2.5 py-1 rounded-full">
                  🔧 Optional upgrade
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-4">
                {isAU
                  ? `We recommend ${sliderKw} kW. Want more panels? Choose your preferred size below — up to ${maxKwLimit} kW.`
                  : `Our AI recommends ${sliderKw} kW for your usage. You can choose a larger system (up to ${maxKwLimit} kW) — subsidies apply as per PM Surya Ghar Yojana.`}
              </p>

              {/* Quick-select kW preset buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(isAU ? AU_QUICK_SIZES : IN_QUICK_SIZES).map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setCustomKw(size)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      effectiveCustomKw === size
                        ? "bg-solar-sky text-white border-solar-sky shadow-md shadow-sky-200"
                        : size === sliderKw
                          ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                          : "bg-white text-slate-600 border-slate-200 hover:border-solar-sky hover:text-solar-sky"
                    }`}
                  >
                    {size} kW{size === sliderKw ? " ★" : ""}
                  </button>
                ))}
              </div>

              {/* Fine-tune slider */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-500">Drag to fine-tune:</span>
                  <span className="text-lg font-black text-solar-sky">{effectiveCustomKw} kW</span>
                </div>
                <input
                  type="range"
                  min={isAU ? 1.5 : 1}
                  max={maxKwLimit}
                  step={isAU ? 0.5 : 1}
                  value={effectiveCustomKw}
                  onChange={(e) => setCustomKw(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-solar-sky focus:outline-none"
                  id="custom-kw-slider"
                />
                <div className="flex justify-between text-[10px] text-slate-400 px-0.5 mt-1">
                  <span>{isAU ? "1.5" : "1"} kW</span>
                  <span>{maxKwLimit} kW (max)</span>
                </div>
              </div>

              {/* ─── AUSTRALIA: Live STC Breakdown ─── */}
              {isAU && customStcCalc && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <div className="p-3 bg-white rounded-xl border border-slate-100 text-center">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-tight">System Size</span>
                      <span className="text-base font-black text-slate-900 mt-0.5 block">{effectiveCustomKw} kW</span>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                      <span className="text-[9px] text-emerald-600 block uppercase font-bold tracking-tight">STC Rebate</span>
                      <span className="text-base font-black text-solar-green mt-0.5 block">${customStcCalc.stcValue.toLocaleString()}</span>
                      <span className="text-[9px] text-emerald-600">{customStcCalc.stcs} STCs × ${customStcCalc.stcPrice}</span>
                    </div>
                  </div>
                  {/* STC breakdown explainer */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
                    <div className="flex items-center gap-2 font-semibold text-blue-700">
                      <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-black">Z{customStcCalc.zone}</span>
                      STC Zone {customStcCalc.zone} — How your rebate is calculated:
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-500">
                      <span>System size: <strong className="text-slate-700">{effectiveCustomKw} kW</strong></span>
                      <span>Zone multiplier: <strong className="text-slate-700">{customStcCalc.multiplier.toFixed(3)}</strong></span>
                      <span>Deeming period: <strong className="text-slate-700">{customStcCalc.deemingYears} years</strong></span>
                      <span>STC price: <strong className="text-slate-700">${customStcCalc.stcPrice}/certificate</strong></span>
                      <span className="col-span-2 mt-1 pt-1 border-t border-slate-100">
                        STCs = {effectiveCustomKw} kW × {customStcCalc.multiplier.toFixed(3)} × {customStcCalc.deemingYears} yrs
                        = <strong className="text-emerald-700">{customStcCalc.stcs} certificates</strong>
                        &nbsp;× ${customStcCalc.stcPrice} = <strong className="text-emerald-700">${customStcCalc.stcValue.toLocaleString()} rebate</strong>
                      </span>
                    </div>
                    <div className="mt-1.5 text-[10px] text-slate-400 italic">
                      💡 STC rebate is deducted upfront from your installation cost. No waiting for government refund.
                    </div>
                  </div>
                </div>
              )}

              {/* ─── INDIA: PM Surya Ghar Subsidy Table ─── */}
              {!isAU && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    <div className="p-3 bg-white rounded-xl border border-slate-100 text-center">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-tight">Your Choice</span>
                      <span className="text-base font-black text-slate-900 mt-0.5 block">{effectiveCustomKw} kW</span>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                      <span className="text-[9px] text-emerald-600 block uppercase font-bold tracking-tight">Govt Subsidy</span>
                      <span className="text-base font-black text-solar-green mt-0.5 block">₹{customIndiaSubsidy.toLocaleString("en-IN")}</span>
                      <span className="text-[9px] text-emerald-600">PM Surya Ghar</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-100 text-center">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-tight">Total Cost</span>
                      <span className="text-base font-bold text-slate-700 mt-0.5 block">₹{customIndiaCost.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
                      <span className="text-[9px] text-blue-600 block uppercase font-bold tracking-tight">Net Cost</span>
                      <span className="text-base font-black text-blue-900 mt-0.5 block">₹{customIndiaNet.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* PM Surya Ghar subsidy rules table */}
                  <div className="rounded-xl border border-amber-200 overflow-hidden">
                    <div className="bg-amber-100 px-3 py-2 text-[10px] font-bold text-amber-800 uppercase tracking-wide">
                      ☀️ PM Surya Ghar Yojana — Subsidy Slabs
                    </div>
                    <div className="divide-y divide-amber-100">
                      {[
                        { kw: "Up to 1 kW", subsidy: "₹30,000", note: "₹30,000/kW" },
                        { kw: "1 kW – 2 kW", subsidy: "₹60,000", note: "₹30,000/kW" },
                        { kw: "2 kW – 3 kW", subsidy: "₹78,000", note: "₹18,000 for 3rd kW" },
                        { kw: "Above 3 kW", subsidy: "₹78,000", note: "Capped — additional kW no subsidy" },
                      ].map((row, i) => (
                        <div
                          key={i}
                          className={`grid grid-cols-3 px-3 py-2 text-xs ${
                            (effectiveCustomKw <= 1 && i === 0) ||
                            (effectiveCustomKw > 1 && effectiveCustomKw <= 2 && i === 1) ||
                            (effectiveCustomKw > 2 && effectiveCustomKw <= 3 && i === 2) ||
                            (effectiveCustomKw > 3 && i === 3)
                              ? "bg-emerald-50 font-bold text-emerald-800"
                              : "bg-white text-slate-600"
                          }`}
                        >
                          <span>{row.kw}</span>
                          <span className="text-center font-bold">{row.subsidy}</span>
                          <span className="text-right text-slate-400 text-[10px]">{row.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 italic px-1">
                    * Central subsidy capped at 3 kW. State subsidies (if any) added separately. Final amount confirmed post site survey.
                  </div>
                </div>
              )}

              {customKw !== null && customKw !== sliderKw && (
                <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  You've upgraded from our recommended <strong>{sliderKw} kW</strong> to <strong>{customKw} kW</strong>.
                  Our team will confirm final pricing and availability.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-6">
              <button type="submit" disabled={isSubmitting || (eligibilityResult && eligibilityResult.isEligible === false)}
                className={`w-full py-4 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                  (eligibilityResult && eligibilityResult.isEligible === false)
                    ? "bg-slate-400 cursor-not-allowed shadow-none"
                    : "bg-solar-green hover:bg-emerald-600 shadow-emerald-500/10 cursor-pointer"
                }`}
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






