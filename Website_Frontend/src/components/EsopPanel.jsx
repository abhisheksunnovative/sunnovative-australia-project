/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import HorizontalStepper from "./HorizontalStepper";
import {
  ArrowLeft,
  ArrowRight,
  Sun,
  Zap,
  Check,
  AlertCircle,
  Sparkles,
  Search,
  MapPin,
  Activity,
  Phone,
  Filter,
  Plus,
  Minus,
  Lock,
  User,
  ChevronDown,
} from "lucide-react";

function CustomFilterSelect({ label, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="space-y-1.5 relative w-full" ref={dropdownRef}>
      <label className="block text-[10px] text-slate-450 uppercase tracking-widest font-black leading-none">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl px-3.5 py-3 text-xs text-white outline-none flex items-center justify-between transition-all duration-200 cursor-pointer text-left focus:ring-1 focus:ring-solar-yellow focus:border-solar-yellow"
      >
        <span className="font-bold truncate">
          {selectedOption ? selectedOption.label : String(value)}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
            isOpen ? "transform rotate-180 text-solar-yellow" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl py-1 divide-y divide-slate-900 overflow-hidden max-h-60 overflow-y-auto animate-fadeIn">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-xs transition-colors duration-150 flex items-center justify-between ${
                  isSelected
                    ? "bg-[#0081C9]/25 text-white font-extrabold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-solar-yellow stroke-[3]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function EsopPanel({ viewMode, setViewMode }) {
  // Account state & Live tracking
  const [consumerNumInput, setConsumerNumInput] = useState("");
  const [isTrackerLoggedIn, setIsTrackerLoggedIn] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [activeTrackerTab, setActiveTrackerTab] = useState("milestones");

  // Interactive Sizing Estimator States
  const [billFrom, setBillFrom] = useState(2000);
  const [billTo, setBillTo] = useState(5000);
  const [monthlyBill, setMonthlyBill] = useState(3500);
  const [selectedSector, setSelectedSector] = useState("residential");

  // Keep monthlyBill in sync as the average of billFrom and billTo range selection
  useEffect(() => {
    const avg = Math.round((billFrom + billTo) / 2);
    setMonthlyBill(avg);
    setIsOverridden(false); // Recalculate GEDA recommendations when bill changes
  }, [billFrom, billTo]);
  // Custom KW stepper (overriding suggested KW)
  const [customKw, setCustomKw] = useState(3);
  const [isOverridden, setIsOverridden] = useState(false);

  // Filter Catalog States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [selectedSubsidyState, setSelectedSubsidyState] =
    useState("Gujarat (GEDA)");
  const [filterCapacity, setFilterCapacity] = useState("All");
  const [filterBrand, setFilterBrand] = useState("All Brands");
  const [filterCellType, setFilterCellType] = useState("All");
  const [onlySubsidyEligible, setOnlySubsidyEligible] = useState(false);
  const [filterBatteryOption, setFilterBatteryOption] = useState("Grid-Tie");
  const [maxBudgetCost, setMaxBudgetCost] = useState(1000000);

  // Interactive individual card active tabs state
  const [cardTabs, setCardTabs] = useState({});

  // Live Simulated SCADA Output
  const [scrubbedTime, setScrubbedTime] = useState("12:00 PM");
  const [livePowerOutput, setLivePowerOutput] = useState(0);

  // List of Catalog Packages
  const [catalog, setCatalog] = useState([
    {
      id: "pkg-1kw",
      title: "1kW Premium Village Solar Kit",
      capacityKw: 1,
      price: 65000,
      brand: "Waaree Energies",
      dcrType: "DCR",
      isSubsidyEligible: true,
      batteryConfig: "Grid-Tie",
      description:
        "Engineered for energy-efficient homes. Extremely popular under village electrification campaigns.",
      features: [
        "2x Waaree Energies 550Wp Mono-PERC Panels",
        "Growatt 1kW smart grid-tie Micro string inverter",
        "Hot-Dip Galvanized lightweight structure",
        "State DISCOM utility net-metering liaison",
      ],
      panels: "Waaree Energies 550Wp Mono PERC (ALMM Approved)",
      panelsQty: 2,
      inverter: "Growatt 1000TL-X Smart Grid Inverter",
      warranty: "25 Year performance warranty, 10 Year Inverter",
      image:
        "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "pkg-3kw",
      title: "3kW EcoShield Residential Solar Array",
      capacityKw: 3,
      price: 135000,
      brand: "Tata Power Solar",
      dcrType: "DCR",
      isSubsidyEligible: true,
      batteryConfig: "Grid-Tie",
      description:
        "The absolute bestseller in Rajkot. Eligible for maximum PM Surya Ghar central subsidy of ₹78,000.",
      features: [
        "6x Tata Power 545Wp Mono-PERC Half-cut panels",
        "Growatt On-Grid Smart Inverter with Android app monitoring",
        "Heavy elevation hot-dip structural galvanized Scaffolds",
        "Complete GEDA & PGVCL bidirectional netmetering assistance",
      ],
      panels: "Tata Power EcoShield 545Wp Mono-PERC (ALMM Listed)",
      panelsQty: 6,
      inverter: "Growatt 3000TL-X Dual-MPPT Intelligent Inverter",
      warranty: "25 Year continuous performance, 10 Year Inverter",
      image:
        "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "pkg-5kw",
      title: "5kW Lumina Pro Residential Smart Setup",
      capacityKw: 5,
      price: 215000,
      brand: "Waaree Energies",
      dcrType: "DCR",
      isSubsidyEligible: true,
      batteryConfig: "Grid-Tie",
      description:
        "Designed for standard multi-floor bungalows running high-capacity heat pumps or split ACs.",
      features: [
        "10x Waaree Energies 540Wp Bi-facial Glass-Glass Modules",
        "Solis 5kW Dual-MPPT High Efficiency Inverter",
        "Heavy civil concrete foundation scaffolds (150km/hr speed certified)",
        "Dual independent safety chemical grounding pits",
      ],
      panels: "Waaree Energies DCR Twin-Shield 540Wp Duo-Cell",
      panelsQty: 10,
      inverter: "Solis 5000TL-X Smart Connected Inverter",
      warranty: "30 Year Bi-facial Performance, 10 Year Inverter warranty",
      image:
        "https://images.unsplash.com/photo-1548613053-220ef31815bb?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "pkg-10kw",
      title: "10kW Zenith Premium Off-Grid & Grid Setup",
      capacityKw: 10,
      price: 495000,
      brand: "Adani Solar",
      dcrType: "DCR",
      isSubsidyEligible: true,
      batteryConfig: "Grid-Tie",
      description:
        "The heavyweight luxury config for massive bungalows, farms, or light industrial showrooms.",
      features: [
        "18x Adani Solar 550Wp N-Type TOPCon Panels",
        "Solis Commercial 10kW Triple-MPPT Inverter",
        "Pre-engineered structural framing with integrated safety walkway",
        "Class-II lightning surge and dynamic earth protections",
      ],
      panels: "Adani N-Type TOPCon Elite 550Wp High Efficiency",
      panelsQty: 18,
      inverter: "Solis 10K-Commercial Series Inverter",
      warranty: "30 Year TOPCon Output capability, 12 Year Inverter",
      image:
        "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "pkg-20kw",
      title: "20kW SolMax Commercial Rooftop Array",
      capacityKw: 20,
      price: 780000,
      brand: "Goldi Solar",
      dcrType: "Non-DCR",
      isSubsidyEligible: false,
      batteryConfig: "Grid-Tie",
      description:
        "Superb commercial asset for schools, community hospitals, cold storages, or GIDC industrial offices.",
      features: [
        "36x Goldi Solar Mono-Crystalline Half-cut 555Wp modules",
        "Sungrow Advanced multi-grid stabilizer 20kW inverter",
        "Custom modular structural scaffold height elevations up to 10 feet",
        "40% accelerated depreciation tax write-off pre-configured",
      ],
      panels: "Goldi Solar 555Wp Helioprotect Mono-Cell (Tier-1)",
      panelsQty: 36,
      inverter: "Sungrow SG-20K Heavy Utility Inverter",
      warranty: "25 Year industrial output stability, 5 Year Inverter warranty",
      image:
        "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "pkg-50kw",
      title: "50kW Titan Commercial Mega Array",
      capacityKw: 50,
      price: 1850000,
      brand: "Tata Power Solar",
      dcrType: "Non-DCR",
      isSubsidyEligible: false,
      batteryConfig: "Grid-Tie",
      description:
        "Ultimate power station for factories, foundry halls, textile mills or high-capacity processing hubs.",
      features: [
        "90x Tata Power Premium 550Wp commercial modules",
        "Sungrow Smart 3-Phase 50kW centralized power controller",
        "Wind load compliant ultra-rugged scaffolding systems & runways",
        "Full structural, thermal and telemetry audit certifications included",
      ],
      panels: "Tata Power Titan 550Wp Industrial Grade Mono PERC",
      panelsQty: 90,
      inverter: "Sungrow SG-50CX Commercial High-Volt Web System",
      warranty: "25 Year performance warranty, 5 Year core inverter cover",
      image:
        "https://images.unsplash.com/photo-1559302915-d41c19b0ce4a?auto=format&fit=crop&w=600&q=80",
    },
  ]);

  // Accounts Database loaded/saved from local storage
  const [accountsDb, setAccountsDb] = useState({});

  // Checkout modal states
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [consumerCode, setConsumerCode] = useState("");
  const [assignedEpcName, setAssignedEpcName] = useState(
    "Ambika Solar Installers",
  );
  const [checkoutSuccessfulMsg, setCheckoutSuccessfulMsg] = useState("");
  const [checkoutErrorMsg, setCheckoutErrorMsg] = useState("");

  // Initial seed and load db
  useEffect(() => {
    // Override local catalog if existing
    const storedCat = localStorage.getItem("sunnovative_custom_catalog");
    if (storedCat) {
      setCatalog(JSON.parse(storedCat));
    }

    const storedDb = localStorage.getItem("sunnovative_esop_db_v2");
    if (storedDb) {
      setAccountsDb(JSON.parse(storedDb));
    } else {
      const demoDb = {
        "04602123456": {
          consumerNumber: "04602123456",
          consumerName: "Rajeshbhai Kanjibhai Patel",
          phone: "+91 98251 44551",
          address: "B-204, Shivalik Pride, Near Kalawad Road, Rajkot - 360005",
          discom: "Paschim Gujarat Vij Company Ltd (PGVCL)",
          eligibleCapacityKw: 3,
          assignedEpc: {
            name: "Ambika Solar Installers",
            engineer: "Hardikbhai Savaliya (Senior Operations)",
            phone: "+91 98251 44551",
            email: "install@ambikasolar.com",
            gedaId: "GEDA-EMP-A109",
            avatar:
              "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=150&h=150&q=80",
            rating: 4.9,
          },
          productSpecs: {
            panels: {
              make: "Tata Power EcoShield 545Wp Mono-PERC Half-cut (ALMM Approved)",
              tier: "Tier-1 Premium Quality",
              qty: 6,
              efficiency: "21.3%",
              warrantyYears: 25,
            },
            inverter: {
              make: "Growatt 3000TL-X Smart Grid-Tie Inverter",
              efficiency: "97.6%",
              wifiMonitoring: true,
              protectionClass: "IP65 Weatherproof",
              warrantyYears: 10,
            },
            structure: {
              material:
                "Hot-Dip Galvanized civil structural frame (G.I Channel)",
              windSpeed: "Load compliant up to 150 km/h wind structural load",
              coatingThickness: "85 μm G.I. channel",
            },
            safety: {
              earthingPits: 3,
              surgeArrestor: "Class II SPD Protective Device inside DCDB",
              cableType: "Havells Dual-Wall 4 sq mm Cross-linked XLPE DC Cable",
            },
          },
          installDetails: {
            dates: {
              booked: "12 March 2026",
              surveyCompleted: "18 March 2026",
              gedaApproved: "26 March 2026",
              installationStart: "05 April 2026",
              netMeteringSet: "28 April 2026",
              subsidyDisbursed: "25 May 2026",
            },
            currentStepIndex: 5, // Fully Completed
            projectCostTotal: "₹1,35,000",
            subsidyExpected: "₹78,000",
            netOutlay: "₹57,000",
            netMeterSerial: "PGV-SOL-998810",
          },
        },
        "04608987654": {
          consumerNumber: "04608987654",
          consumerName: "Sureshbhai Mansukhbhai Vekaria",
          phone: "+91 99791 22881",
          address:
            "15, Gokuldham Society, Near Mavdi Bypass Road, Rajkot - 360004",
          discom: "Paschim Gujarat Vij Company Ltd (PGVCL)",
          eligibleCapacityKw: 5,
          assignedEpc: {
            name: "Vertex Power Systems",
            engineer: "Kiritbhai Marvaniya (Lead Surveyor)",
            phone: "+91 99791 22881",
            email: "support@vertexpower.in",
            gedaId: "GEDA-EMP-V402",
            avatar:
              "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
            rating: 4.8,
          },
          productSpecs: {
            panels: {
              make: "Waaree Energies DCR Twin-Shield 540Wp Duo-Cell",
              tier: "Tier-1 High Gain",
              qty: 10,
              efficiency: "20.9%",
              warrantyYears: 25,
            },
            inverter: {
              make: "Solis 5000TL-X Smart Connected Inverter",
              efficiency: "97.2%",
              wifiMonitoring: true,
              protectionClass: "IP65 Weatherproof",
              warrantyYears: 10,
            },
            structure: {
              material: "Pre-Galvanized Raised G.I Elevated Framing Scaffolds",
              windSpeed: "Wind tunnel certified up to 140 km/h wind stability",
              coatingThickness: "65 μm channel",
            },
            safety: {
              earthingPits: 2,
              surgeArrestor: "Internal DC Varistor & SPD protection modules",
              cableType:
                "PolyCab Solar XLPE 4 sq mm High Oxidation Resistance Cable",
            },
          },
          installDetails: {
            dates: {
              booked: "10 April 2026",
              surveyCompleted: "14 April 2026",
              gedaApproved: "22 April 2026",
              installationStart: "12 May 2026",
              netMeteringSet: "Awaiting PGVCL bidirectional Net-Meter",
              subsidyDisbursed: "Awaiting Net-meter active report",
            },
            currentStepIndex: 3, // Rooftop installed, Net Metering Pending
            projectCostTotal: "₹2,15,000",
            subsidyExpected: "₹78,000",
            netOutlay: "₹1,37,000",
            netMeterSerial: "Allocated: PGV-MTR-PEND-281",
          },
        },
      };
      setAccountsDb(demoDb);
      localStorage.setItem("sunnovative_esop_db_v2", JSON.stringify(demoDb));
    }
  }, []);

  // Sync to memory
  const updateDbState = (updated) => {
    setAccountsDb(updated);
    localStorage.setItem("sunnovative_esop_db_v2", JSON.stringify(updated));
  };

  // Light bill dynamic calculations
  // Average electricity board tariff: ₹7.5 per unit
  // Average monthly generation: 1 kW size produces ~120 kWh / units per month
  const suggestedKwByBill = Math.max(
    1,
    Math.min(50, Math.round(monthlyBill / 7.5 / 120)),
  );

  // Sync customKw with suggestedKw unless overridden by manual + or - stepper!
  useEffect(() => {
    if (!isOverridden) {
      setCustomKw(suggestedKwByBill);
    }
  }, [monthlyBill, suggestedKwByBill, isOverridden]);

  // Estimated stats based on customKw size:
  const panelsQuantity = Math.max(2, Math.ceil((customKw * 1000) / 550));
  const spaceRequiredSqFt = customKw * 80;
  const averageDailyUnits = parseFloat((customKw * 4.2).toFixed(1));
  const averageMonthlyUnits = Math.round(customKw * 125);
  const estimatedAnnualSavings = Math.round(averageMonthlyUnits * 12 * 7.5);
  const carbonOffsetTons = parseFloat((customKw * 1.4).toFixed(1));

  // Pricing based on selected system capacity kw
  let targetUnitPrice = 50000; // default average cost per kW
  if (customKw === 1) targetUnitPrice = 65000;
  else if (customKw === 2) targetUnitPrice = 60000;
  else if (customKw === 3) targetUnitPrice = 45000;
  else if (customKw <= 5) targetUnitPrice = 43000;
  else if (customKw <= 10) targetUnitPrice = 49500;
  else if (customKw <= 20) targetUnitPrice = 39000;
  else targetUnitPrice = 37000;

  const calculatedGrossCost = customKw * targetUnitPrice;

  // Government Subsidy Calculation (PM Surya Ghar Rules)
  // Residential: 1kW => 30k, 2kW => 60k, >=3kW => Capped at 78k Max
  // Comm/Ind => Flat 0
  let calculatedExpectedSubsidy = 0;
  if (selectedSector === "residential") {
    if (customKw === 1) calculatedExpectedSubsidy = 30000;
    else if (customKw === 2) calculatedExpectedSubsidy = 60000;
    else if (customKw >= 3) calculatedExpectedSubsidy = 78000;
  }

  const calculatedNetOutlay = calculatedGrossCost - calculatedExpectedSubsidy;

  // Handle tracking file sign-in
  const handleTrackerLogin = (e) => {
    e.preventDefault();
    const trimmed = consumerNumInput.trim();
    if (!trimmed) {
      setLoginError("Please enter a valid PGVCL Consumer Number.");
      return;
    }

    if (accountsDb[trimmed]) {
      setCurrentAccount(accountsDb[trimmed]);
      setIsTrackerLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError(
        "Consumer Number is not matching active GEDA ledger. Explore configurations below & order to create an instant tracking profile.",
      );
    }
  };

  // Custom live telemetry calculation
  useEffect(() => {
    if (!currentAccount) return;

    // Simulate clock and daytime intensity curve
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const displayTime = `${hours % 12 || 12}:${minutes} ${hours >= 12 ? "PM" : "AM"}`;
    setScrubbedTime(displayTime);

    let efficiencyCoeff = 0;
    if (hours >= 7 && hours <= 18) {
      // sine wave distribution peaked at noon
      const theta = ((hours + date.getMinutes() / 60 - 7) * Math.PI) / 11;
      efficiencyCoeff = Math.sin(theta) * 0.85;
    }

    const calculatedLiveKw = parseFloat(
      (
        currentAccount.eligibleCapacityKw * Math.max(0, efficiencyCoeff)
      ).toFixed(2),
    );
    setLivePowerOutput(calculatedLiveKw);

    const interval = setInterval(() => {
      // small solar fluctuation noise (e.g. passage of sparse cloud)
      const minorNoise =
        (Math.random() - 0.5) * 0.05 * currentAccount.eligibleCapacityKw;
      setLivePowerOutput((prev) => {
        const value = prev + minorNoise;
        return parseFloat(
          Math.max(
            0,
            Math.min(value, currentAccount.eligibleCapacityKw * 1.05),
          ).toFixed(2),
        );
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [currentAccount, activeTrackerTab]);

  // Handle book kit action trigger
  const triggerPackageCheckout = (pkg) => {
    setCheckoutProduct(pkg);
    setCustName("");
    setCustPhone("");
    setCustAddress("");
    setConsumerCode("");
    setCheckoutSuccessfulMsg("");
    setCheckoutErrorMsg("");
    setIsCheckoutOpen(true);
  };

  // Complete booking and generate order ledger record
  const submitCheckoutForm = (e) => {
    e.preventDefault();
    setCheckoutErrorMsg("");

    if (
      !custName.trim() ||
      !custPhone.trim() ||
      !custAddress.trim() ||
      !consumerCode.trim()
    ) {
      setCheckoutErrorMsg(
        "Please fill in complete name, phone, site address and PGVCL grid code.",
      );
      return;
    }

    if (consumerCode.length < 5) {
      setCheckoutErrorMsg(
        "Invalid Consumer ID. Must contain 5-11 numeric board digits.",
      );
      return;
    }

    // Subsidy bracket
    let computedSubsidy = 0;
    if (selectedSector === "residential" && checkoutProduct.isSubsidyEligible) {
      if (checkoutProduct.capacityKw === 1) computedSubsidy = 30000;
      else if (checkoutProduct.capacityKw === 2) computedSubsidy = 60000;
      else computedSubsidy = 78000;
    }

    const computedNet = checkoutProduct.price - computedSubsidy;

    // Pick dynamic EPC personnel
    const epcRepresentMap = {
      "Ambika Solar Installers": {
        name: "Ambika Solar Installers",
        engineer: "Hardikbhai Savaliya (Senior Operations)",
        phone: "+91 98251 44551",
        email: "install@ambikasolar.com",
        gedaId: "GEDA-EMP-A109",
        avatar:
          "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=150&h=150&q=80",
        rating: 4.9,
      },
      "Vertex Power Systems": {
        name: "Vertex Power Systems",
        engineer: "Kiritbhai Marvaniya (Lead Surveyor)",
        phone: "+91 99791 22881",
        email: "support@vertexpower.in",
        gedaId: "GEDA-EMP-V402",
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
        rating: 4.8,
      },
    };

    const targetEpc =
      epcRepresentMap[assignedEpcName] ||
      epcRepresentMap["Ambika Solar Installers"];

    // Structure dynamic new tracking profile
    const newProfile = {
      consumerNumber: consumerCode,
      consumerName: custName,
      phone: custPhone,
      address: custAddress,
      discom: "Paschim Gujarat Vij Company Ltd (PGVCL)",
      eligibleCapacityKw: checkoutProduct.capacityKw,
      assignedEpc: targetEpc,
      productSpecs: {
        panels: {
          make: checkoutProduct.panels,
          tier: "Tier-1 Premium Quality (ALMM Certified)",
          qty: checkoutProduct.panelsQty,
          efficiency: "21.3%",
          warrantyYears: 25,
        },
        inverter: {
          make: checkoutProduct.inverter,
          efficiency: "97.6%",
          wifiMonitoring: true,
          protectionClass: "IP65 Weatherproof",
          warrantyYears: 10,
        },
        structure: {
          material: "Hot-Dip Galvanized Struct (Civil load certified standard)",
          windSpeed: "Wind load compliant up to 150 km/h structural stability",
          coatingThickness: "85 μm G.I. channel",
        },
        safety: {
          earthingPits: 3,
          surgeArrestor: "Class II SPD Surge Protective Device pre-wired",
          cableType: "Havells Dual-Wall 4 sq mm Cross-linked XLPE DC Cable",
        },
      },
      installDetails: {
        dates: {
          booked: new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          surveyCompleted:
            "Expected: " +
            new Date(Date.now() + 5 * 24 * 3600 * 1000).toLocaleDateString(
              "en-GB",
              { day: "numeric", month: "long" },
            ),
          gedaApproved: "Processing inside State portal",
          installationStart: "Pending structural civil mapping",
          netMeteringSet: "Pending DISCOM bi-directional inspection",
          subsidyDisbursed: "Direct Surya Ghar credit routing active",
        },
        currentStepIndex: 0, // Freshly Booked
        projectCostTotal: `₹${checkoutProduct.price.toLocaleString("en-IN")}`,
        subsidyExpected: `₹${computedSubsidy.toLocaleString("en-IN")}`,
        netOutlay: `₹${computedNet.toLocaleString("en-IN")}`,
        netMeterSerial:
          "Allocated: PGV-MTR-PEND-" + Math.floor(Math.random() * 9000 + 1000),
      },
    };

    const updatedDb = { ...accountsDb, [consumerCode]: newProfile };
    updateDbState(updatedDb);

    setCheckoutSuccessfulMsg(
      `Kit Ordered Successfully! Interactive solar profile generated. Enter Consumer Code: "${consumerCode}" at the top of E-Shop Tracker to view progress step-by-step.`,
    );
    setConsumerNumInput(consumerCode); // preload tracker input
  };

  // Modify installer progress steps in-context to demonstrate the power of the dashboard of the app
  const adminIncrementStepOfClient = (num, newStep) => {
    if (!accountsDb[num]) return;
    const copied = { ...accountsDb[num] };
    copied.installDetails.currentStepIndex = newStep;

    const dateStr = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (newStep >= 1)
      copied.installDetails.dates.surveyCompleted = "Verified: " + dateStr;
    if (newStep >= 2)
      copied.installDetails.dates.gedaApproved =
        "Feasibility GEDA-Approved: OK";
    if (newStep >= 3)
      copied.installDetails.dates.installationStart =
        "Active: Civil structure completed";
    if (newStep >= 4)
      copied.installDetails.dates.netMeteringSet =
        "Commissioned: PGVCL Bi-directional active";
    if (newStep >= 5)
      copied.installDetails.dates.subsidyDisbursed =
        "Disbursed: ₹78k Surya Ghar credit";

    const updated = { ...accountsDb, [num]: copied };
    updateDbState(updated);

    if (currentAccount && currentAccount.consumerNumber === num) {
      setCurrentAccount(copied);
    }
  };

  // Delete customer profile
  const adminRemoveClient = (num) => {
    const updated = { ...accountsDb };
    delete updated[num];
    updateDbState(updated);

    if (currentAccount && currentAccount.consumerNumber === num) {
      setIsTrackerLoggedIn(false);
      setCurrentAccount(null);
    }
  };

  // Sorting and filtering package catalogue representation
  const filteredCatalog = catalog
    .filter((pkg) => {
      // Search query constraint
      if (searchQuery.trim() !== "") {
        const matchText =
          `${pkg.title} ${pkg.brand} ${pkg.description}`.toLowerCase();
        if (!matchText.includes(searchQuery.toLowerCase())) return false;
      }

      // Capacity size filter dropdown
      if (filterCapacity !== "All") {
        const capacityTarget = parseInt(filterCapacity);
        if (pkg.capacityKw !== capacityTarget) return false;
      }

      // Brand radio selector
      if (filterBrand !== "All Brands") {
        if (pkg.brand !== filterBrand) return false;
      }

      // Cell technology type button
      if (filterCellType !== "All") {
        if (pkg.dcrType !== filterCellType) return false;
      }

      // Subsidy toggle
      if (onlySubsidyEligible) {
        if (!pkg.isSubsidyEligible) return false;
      }

      // Max budget slider
      if (pkg.price > maxBudgetCost) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "priceAsc") return a.price - b.price;
      if (sortBy === "priceDesc") return b.price - a.price;
      return b.capacityKw - a.capacityKw; // popular defaults to capacity order
    });

  const ledgerSteps = [
    {
      title: "Booking Confirmed",
      info: "Agreement signed, initial file initiated in DISCOM ledger.",
    },
    {
      title: "Physical Tech Survey",
      info: "Rooftop shade index, azimuth orientation & height profile verified.",
    },
    {
      title: "GEDA Approved",
      info: "Technical grid feasibility record issued by GEDA nodal team.",
    },
    {
      title: "System Installed",
      info: "Civil scaffolds assembled, solar modules fastened & inverter mounted.",
    },
    {
      title: "Net-Meter Online",
      info: "Bidirectional utility meter configured and grid synchronized.",
    },
    {
      title: "Capital Subsidy Credited",
      info: "PM Surya Ghar federal subsidy disbursed directly to homeowner bank.",
    },
  ];

  return (
    <div
      id="eshop-client-portal"
      className="bg-slate-905 min-h-screen text-slate-100 font-sans pb-20"
    >
      {/* 1. Header Banner of the Separate Portal page */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 py-10 relative">
        <div className="absolute top-0 right-0 w-[450px] h-[300px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <button
                onClick={() => setViewMode("home")}
                className="inline-flex items-center gap-2 text-xs font-black uppercase text-solar-yellow hover:text-white transition-all bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Landing Page
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#0081C9] bg-sky-950/80 border border-sky-800 px-3 py-0.5 rounded-full">
                  GEDA E-Commerce Portal
                </span>
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-900 px-3 py-0.5 rounded-full">
                  PM Surya Ghar Ready
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-white leading-tight">
                GEDA Solar e-Shop <span className="text-solar-yellow">&</span>{" "}
                State Live Tracker
              </h1>

              <p className="text-xs md:text-sm text-slate-400 max-w-2xl">
                Compare premium mono-PERC arrays under ALMM rules. Use our
                dynamic calculator to estimate size configurations according to
                your electricity light bill, manually adjust sizes, and trace
                milestone statuses in real-time.
              </p>
            </div>

            {/* Authenticated Tracker CTA */}
            <div className="bg-slate-950/90 border border-slate-800 p-6 rounded-3xl w-full md:max-w-md shadow-2xl relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-900/40 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="text-lg font-black text-white mb-2">Track Your Project Securely</h4>
              <p className="text-xs text-slate-400 mb-6">
                Login to your Solar Customer Portal to view real-time project progress, manage documents, and communicate with your assigned EPC installer.
              </p>
              <button
                onClick={() => { window.location.hash = "account"; }}
                className="w-full bg-[#0081C9] hover:bg-[#006EAD] text-white font-black uppercase text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
              >
                Login to Customer Portal
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* =========================================
             DYNAMIC WORKFLOW: ACTIVE LANDED TRACKER
             ========================================= */}
        {isTrackerLoggedIn && currentAccount && (
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl mb-12 animate-fadeIn space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-5">
              <div>
                <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 font-black px-2.5 py-1 rounded">
                  Paschim Gujarat Vij (PGVCL) File Profile
                </span>
                <h3 className="text-lg font-black text-white mt-2">
                  Customer: {currentAccount.consumerName}
                </h3>
                <p className="text-xs text-slate-450 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />{" "}
                  {currentAccount.address}
                </p>
              </div>

              {/* Assigned EPC Installer Contact */}
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center gap-3 max-w-sm">
                <img
                  src={currentAccount.assignedEpc.avatar}
                  alt={currentAccount.assignedEpc.engineer}
                  className="w-10 h-10 rounded-full object-cover border border-slate-850 shrink-0"
                  referrerPolicy="no-referrer"
                />

                <div className="text-xs">
                  <div className="text-[9px] text-slate-500 uppercase font-extrabold tracking-widest	">
                    Empanelled EPC Engineer
                  </div>
                  <div className="font-bold text-white">
                    {currentAccount.assignedEpc.engineer}
                  </div>
                  <div className="text-[10px] text-[#0081C9] font-mono leading-none">
                    {currentAccount.assignedEpc.name} (
                    {currentAccount.assignedEpc.gedaId})
                  </div>
                  <a
                    href={`tel:${currentAccount.assignedEpc.phone}`}
                    className="font-bold text-emerald-400 hover:underline mt-1 block flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" /> Dial:{" "}
                    {currentAccount.assignedEpc.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* TAB PANES OF ACTIVE LEDGER STATUS */}
            {activeTrackerTab === "milestones" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-3.5 bg-solar-yellow rounded"></span>
                    PM Surya Ghar Subsidy Verification Steps (Step{" "}
                    {currentAccount.installDetails.currentStepIndex + 1} of 6)
                  </h4>
                  <p className="text-[11px] text-slate-450 mt-1">
                    Track compliance statuses under current state regulation
                    structures:
                  </p>
                </div>

                {/* Progress Timeline Graphic */}
                <div className="relative pt-4 pb-6">
                  <HorizontalStepper
                    theme="dark"
                    steps={ledgerSteps.map((step, idx) => {
                      const dateVal =
                        idx === 0 ? currentAccount.installDetails.dates.booked :
                        idx === 1 ? currentAccount.installDetails.dates.surveyCompleted :
                        idx === 2 ? currentAccount.installDetails.dates.gedaApproved :
                        idx === 3 ? currentAccount.installDetails.dates.installationStart :
                        idx === 4 ? currentAccount.installDetails.dates.netMeteringSet :
                        idx === 5 ? currentAccount.installDetails.dates.subsidyDisbursed : null;
                      
                      return { title: step.title, info: dateVal || step.info };
                    })}
                    currentStatus={ledgerSteps[currentAccount.installDetails.currentStepIndex]?.title}
                  />
                </div>

                {/* Economic Breakdown Ledger */}
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <span className="text-[9px] text-slate-500 font-black uppercase">
                      Project gross Contract Cost
                    </span>
                    <div className="text-lg font-black text-white mt-1">
                      {currentAccount.installDetails.projectCostTotal}
                    </div>
                    <span className="text-[9px] text-[#0081C9] font-medium mt-0.5 block">
                      Includes physical GEDA fees & structural scaffolds
                    </span>
                  </div>
                  <div className="sm:border-x border-slate-850 sm:px-6">
                    <span className="text-[9px] text-emerald-400 font-bold uppercase">
                      Expected Direct Govt Subsidy
                    </span>
                    <div className="text-lg font-black text-emerald-400 mt-1">
                      -{currentAccount.installDetails.subsidyExpected}
                    </div>
                    <span className="text-[9px] text-slate-500 block mt-0.5">
                      Disbursed directly after bidirectional PGVCL commissioning
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-solar-yellow font-bold uppercase">
                      Actual Net Payment Outlay
                    </span>
                    <div className="text-lg font-black text-solar-yellow mt-1">
                      {currentAccount.installDetails.netOutlay}
                    </div>
                    <span className="text-[9px] text-slate-500 block mt-0.5">
                      Homeowner self-funded outlay capital
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TECHNICAL BLUEPRINTS SPECIFICATIONS TAB */}
            {activeTrackerTab === "technical" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl space-y-4">
                  <h5 className="text-xs font-black uppercase tracking-wider text-[#0081C9] border-b border-slate-800 pb-2">
                    ☀️ Dynamic Rooftop Components
                  </h5>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">
                        ALMM Empanelled Solar PV Modules
                      </span>
                      <strong className="text-white text-sm">
                        {currentAccount.productSpecs.panels.make}
                      </strong>
                      <div className="text-[10px] text-slate-350 mt-1">
                        Quantity: {currentAccount.productSpecs.panels.qty}{" "}
                        Modules | Conversion Eff:{" "}
                        {currentAccount.productSpecs.panels.efficiency} |
                        Performance Cover:{" "}
                        {currentAccount.productSpecs.panels.warrantyYears} Years
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">
                        Central Smart Inverter Box
                      </span>
                      <strong className="text-white text-sm">
                        {currentAccount.productSpecs.inverter.make}
                      </strong>
                      <div className="text-[10px] text-slate-350 mt-1">
                        Over-all Eff:{" "}
                        {currentAccount.productSpecs.inverter.efficiency} |
                        Weather Range:{" "}
                        {currentAccount.productSpecs.inverter.protectionClass} |
                        Wifi:{" "}
                        {currentAccount.productSpecs.inverter.wifiMonitoring
                          ? "Connected Smart APP"
                          : "Analog Offline"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl space-y-4">
                  <h5 className="text-xs font-black uppercase tracking-wider text-solar-yellow border-b border-slate-800 pb-2">
                    🛡️ Civil Foundations & Safety
                  </h5>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">
                        Engineered Elevation Framing
                      </span>
                      <strong className="text-white text-sm">
                        {currentAccount.productSpecs.structure.material}
                      </strong>
                      <div className="text-[10px] text-slate-355 mt-1">
                        Channel Zinc:{" "}
                        {currentAccount.productSpecs.structure.coatingThickness}{" "}
                        | Certified wind resistance:{" "}
                        {currentAccount.productSpecs.structure.windSpeed}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">
                        Grounding Protection Loop
                      </span>
                      <strong className="text-white text-sm">
                        {currentAccount.productSpecs.safety.earthingPits}{" "}
                        Dedicated Independent Earth Pits Installed
                      </strong>
                      <div className="text-[10px] text-slate-355 mt-1">
                        Surge Spike Protection:{" "}
                        {currentAccount.productSpecs.safety.surgeArrestor} |
                        Cable rating:{" "}
                        {currentAccount.productSpecs.safety.cableType}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* REAL-TIME TELEMETRY LAB */}
            {activeTrackerTab === "telemetry" && (
              <div className="space-y-5">
                <div className="bg-slate-900/40 p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 border border-slate-850">
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full animate-pulse-subtle">
                    <Activity className="w-3.5 h-3.5" /> Synchronized Remote
                    Telemetry
                  </span>

                  <h5 className="text-xs text-slate-400 uppercase font-black tracking-wider">
                    Simulated Rooftop Generation Output at {scrubbedTime}
                  </h5>

                  <div className="relative p-2 flex items-center justify-center">
                    <div className="w-36 h-36 rounded-full border-8 border-slate-800 border-t-[#0081C9] flex flex-col items-center justify-center text-center">
                      <Zap className="w-6 h-6 text-solar-yellow animate-bounce" />
                      <span className="text-2xl font-black text-white mt-1 leading-none">
                        {livePowerOutput}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        kW Current
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 max-w-md leading-relaxed">
                    Under real-time weather coordinates, your physical{" "}
                    {currentAccount.eligibleCapacityKw}kW GEDA solar
                    installation generates energy. Estimated average yield
                    contributor: ~
                    {(currentAccount.eligibleCapacityKw * 4.4).toFixed(1)} kWh
                    Units per day.
                  </p>
                </div>
              </div>
            )}

            {/* Quick controller option for testing/demo progress step-up */}
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-850 text-xs flex flex-wrap items-center justify-between gap-3 px-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase	 tracking-wider">
                🎮 DEMO CONTROL (Simulate GEDA progress updates):
              </span>
              <div className="flex flex-wrap gap-2 text-[10px]">
                {[0, 1, 2, 3, 4, 5].map((step) => (
                  <button
                    key={step}
                    onClick={() =>
                      adminIncrementStepOfClient(
                        currentAccount.consumerNumber,
                        step,
                      )
                    }
                    className={`px-3 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                      currentAccount.installDetails.currentStepIndex === step
                        ? "bg-[#0081C9] border-[#0081C9] text-white"
                        : "bg-slate-950 border-slate-800 text-slate-450 hover:text-white"
                    }`}
                  >
                    Set Step {step + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    adminRemoveClient(currentAccount.consumerNumber)
                  }
                  className="px-3 py-1 bg-rose-950 border border-rose-900 text-rose-300 rounded-lg hover:bg-rose-900 transition-colors font-bold cursor-pointer"
                >
                  Delete Sample Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
             DYNAMIC SECTOR 2: ADVISOR & KW ENERGY CALCULATOR
             ========================================= */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl border-b border-slate-850 pb-6 mb-8">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-solar-yellow bg-solar-yellow/15 border border-solar-yellow/25 px-2.5 py-0.5 rounded-full mb-3">
              <Sun className="w-3.5 h-3.5" /> Instant GEDA sizing calculator
            </span>
            <h2 className="text-xl md:text-3xl font-display font-black text-white">
              Configure Solar Capacity From Light Bill
            </h2>
            <p className="text-xs text-slate-450 leading-relaxed mt-1">
              Select your sector, drag the monthly bill slider representing your
              local DISCOM utility charges, and inspect actual capacity size
              suggestions immediately. Customize the kW manually if you intend
              to expand your arrays in the future.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left inputs */}
            <div className="lg:col-span-6 space-y-6">
              {/* Sector selector */}
              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2.5">
                  1. Select Customer Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["residential", "commercial", "industrial"].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => {
                        setSelectedSector(sec);
                        setIsOverridden(false); // reset override on sector change
                        if (sec === "residential") {
                          setBillFrom(2000);
                          setBillTo(5000);
                        } else if (sec === "commercial") {
                          setBillFrom(8000);
                          setBillTo(20000);
                        } else {
                          setBillFrom(15000);
                          setBillTo(45000);
                        }
                      }}
                      className={`py-2 rounded-xl text-[10.5px] uppercase font-black border tracking-wider transition-all cursor-pointer ${
                        selectedSector === sec
                          ? "bg-[#0081C9] border-[#0081C9] text-white"
                          : "bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bill Range Selector: From -> To */}
              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2.5">
                  2. Average Monthly Power Bill (From ➔ To Range)
                </label>

                <div className="grid grid-cols-2 gap-4">
                  {/* From value stepper */}
                  <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-2xl space-y-1.5">
                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-500 block leading-none">
                      From (Minimum)
                    </span>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          const val = Math.max(1000, billFrom - 500);
                          setBillFrom(val);
                          if (billTo < val) setBillTo(val + 500);
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-center font-black text-xs text-slate-300 transition-colors cursor-pointer select-none"
                      >
                        -
                      </button>
                      <span className="text-white font-mono font-black text-sm">
                        ₹{billFrom.toLocaleString("en-IN")}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const maxLimit =
                            selectedSector === "residential" ? 14500 : 99000;
                          const val = Math.min(maxLimit, billFrom + 500);
                          setBillFrom(val);
                          if (billTo <= val) setBillTo(val + 500);
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-center font-black text-xs text-slate-200 transition-colors cursor-pointer select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* To value stepper */}
                  <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-2xl space-y-1.5">
                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-500 block leading-none">
                      To (Maximum)
                    </span>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          const minLimit = billFrom + 500;
                          const val = Math.max(minLimit, billTo - 500);
                          setBillTo(val);
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-center font-black text-xs text-slate-300 transition-colors cursor-pointer select-none"
                      >
                        -
                      </button>
                      <span className="text-solar-yellow font-mono font-black text-sm">
                        ₹{billTo.toLocaleString("en-IN")}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const maxLimit =
                            selectedSector === "residential" ? 15000 : 100000;
                          const val = Math.min(maxLimit, billTo + 500);
                          setBillTo(val);
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-center font-black text-xs text-slate-200 transition-colors cursor-pointer select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 bg-slate-900/40 px-3 py-2 rounded-xl border border-slate-900">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Sun className="w-3.5 h-3.5 text-solar-yellow" /> Sizing
                    Calculated Average:
                  </span>
                  <span className="font-mono font-black text-white">
                    ₹{monthlyBill.toLocaleString("en-IN")} / mo
                  </span>
                </div>
              </div>

              {/* Stepper with increase/decrease target capacity KW */}
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold">
                      3. Target System Size (kW)
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {isOverridden ? (
                        <span className="text-[#0081C9] font-black">
                          ⚙️ Custom Override Active
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-black">
                          ✨ Optimal GEDA Suggestion
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Plus/Minus counter */}
                  <div className="flex items-center bg-slate-950 border border-slate-800 p-1.5 rounded-xl">
                    <button
                      type="button"
                      disabled={customKw <= 1}
                      onClick={() => {
                        setCustomKw((prev) => Math.max(1, prev - 1));
                        setIsOverridden(true);
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-900 hover:bg-slate-800 disabled:opacity-20 text-white transition-all cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="w-16 text-center font-display font-black text-white text-base">
                      {customKw} kWp
                    </span>

                    <button
                      type="button"
                      disabled={
                        customKw >= (selectedSector === "residential" ? 15 : 50)
                      }
                      onClick={() => {
                        setCustomKw((prev) =>
                          Math.min(
                            selectedSector === "residential" ? 15 : 50,
                            prev + 1,
                          ),
                        );
                        setIsOverridden(true);
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-900 hover:bg-slate-800 disabled:opacity-20 text-white transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-850 mt-3 pt-2.5 flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">Estimated Power Units:</span>
                  <span className="font-mono text-white font-bold">
                    {averageMonthlyUnits} kWh Units/month
                  </span>
                </div>
              </div>
            </div>

            {/* Right Estimator Outcome */}
            <div className="lg:col-span-6 bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-6">
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-black leading-none pb-2 border-b border-slate-900">
                🛠️ Estimated System Specifications & Outlay
              </span>

              {/* Technical Specifications Grid inside advisor */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold leading-none">
                    Total Solar Modules
                  </span>
                  <strong className="text-white text-sm block mt-1">
                    {panelsQuantity} Panels
                  </strong>
                  <span className="text-[8.5px] text-slate-500 leading-none">
                    High Output 550Wp Monocrystalline
                  </span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold leading-none">
                    Roof Area Needed
                  </span>
                  <strong className="text-white text-sm block mt-1">
                    {spaceRequiredSqFt} Sq. Ft.
                  </strong>
                  <span className="text-[8.5px] text-slate-500 leading-none">
                    Clear south-facing shading headroom
                  </span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold leading-none">
                    Estimated Daily Yield
                  </span>
                  <strong className="text-emerald-400 text-sm block mt-1">
                    ~{averageDailyUnits} units / day
                  </strong>
                  <span className="text-[8.5px] text-slate-500 leading-none">
                    Avg clean electricity units generated
                  </span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold leading-none">
                    Estimated Annual Savings
                  </span>
                  <strong className="text-solar-yellow text-sm block mt-1">
                    ₹{estimatedAnnualSavings.toLocaleString("en-IN")} / yr
                  </strong>
                  <span className="text-[8.5px] text-slate-500 leading-none">
                    Assuming DISCOM rate of ₹7.5/unit
                  </span>
                </div>
              </div>

              {/* Financial Subsume Outlays */}
              <div className="border-t border-slate-900 pt-4 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-350">
                  <span>Gross System Price:</span>
                  <span className="font-mono font-bold text-white">
                    ₹{calculatedGrossCost.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between items-center text-emerald-400">
                  <span>Expected Government Subsidy:</span>
                  <span className="font-mono font-bold">
                    -₹{calculatedExpectedSubsidy.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="border-t border-slate-900 pt-3.5 flex justify-between items-center text-sm">
                  <span className="font-black text-white">
                    Estimated Net Outlay:
                  </span>
                  <span className="font-mono font-black text-solar-yellow text-base">
                    ₹{calculatedNetOutlay.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Live search catalog recommendations overlay feedback */}
              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-805/40 text-[10.5px] text-slate-400 flex items-center justify-between gap-3">
                <span>
                  🔍 Our catalogue includes pre-configured{" "}
                  <strong className="text-white">{customKw}kW</strong> grid
                  kits!
                </span>
                <button
                  onClick={() => {
                    setFilterCapacity(customKw.toString());
                    const section = document.getElementById(
                      "shop-catalog-anchor",
                    );
                    if (section) section.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-[#0081C9] hover:bg-[#006FAD] text-white px-3 py-1 rounded text-[9.5px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
             PORTAL SCREEN 3: CATALOG & GRID VIEW PANELS
             ========================================= */}
        <div
          id="shop-catalog-anchor"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6"
        >
          {/* CATALOG LEFT SIDEBAR: ADVANCED FILTERS MODULE (Matches Mockup exact filters!) */}
          <div className="lg:col-span-3 bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <span className="text-xs font-black uppercase text-white flex items-center gap-1.5 leading-none">
                <Filter className="w-3.5 h-3.5 text-solar-yellow" /> Catalog
                Filters
              </span>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSortBy("popular");
                  setSelectedSubsidyState("Gujarat (GEDA)");
                  setFilterCapacity("All");
                  setFilterBrand("All Brands");
                  setFilterCellType("All");
                  setOnlySubsidyEligible(false);
                  setMaxBudgetCost(1000000);
                }}
                className="text-[10px] font-bold text-[#0081C9] hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Sort Dropdown */}
            <CustomFilterSelect
              label="Sort Products By"
              value={sortBy}
              options={[
                { value: "popular", label: "Popular Capacity" },
                { value: "priceAsc", label: "Price: Low to High" },
                { value: "priceDesc", label: "Price: High to Low" },
              ]}
              onChange={(val) => setSortBy(val)}
            />

            {/* Subsidy State Selector */}
            <CustomFilterSelect
              label="State-Specific Subsidy"
              value={selectedSubsidyState}
              options={[
                { value: "Gujarat (GEDA)", label: "Gujarat (GEDA PGVCL)" },
                {
                  value: "Maharashtra (MSEDCL)",
                  label: "Maharashtra (MSEDCL)",
                },
                { value: "Rajasthan (RRECL)", label: "Rajasthan (RRECL)" },
                { value: "Delhi (BYPL)", label: "Delhi (BYPL)" },
                { value: "Karnataka (BESCOM)", label: "Karnataka (BESCOM)" },
              ]}
              onChange={(val) => setSelectedSubsidyState(val)}
            />

            {/* System Size kW (Watt) */}
            <CustomFilterSelect
              label="System Size / Wattage"
              value={filterCapacity}
              options={[
                { value: "All", label: "Any Capacity (1kW - 50kW)" },
                { value: "1", label: "1 kW System" },
                { value: "3", label: "3 kW System" },
                { value: "5", label: "5 kW System" },
                { value: "10", label: "10 kW System" },
                { value: "20", label: "20 kW System" },
                { value: "50", label: "50 kW System" },
              ]}
              onChange={(val) => setFilterCapacity(val)}
            />

            {/* Solar Panel Brand */}
            <CustomFilterSelect
              label="Solar Panel Brand"
              value={filterBrand}
              options={[
                { value: "All Brands", label: "All Brands" },
                { value: "Tata Power Solar", label: "Tata Power Solar" },
                { value: "Waaree Energies", label: "Waaree Energies" },
                { value: "Adani Solar", label: "Adani Solar" },
                { value: "Goldi Solar", label: "Goldi Solar" },
              ]}
              onChange={(val) => setFilterBrand(val)}
            />

            {/* Technology Cell Deployment */}
            <CustomFilterSelect
              label="Cell Technology Type"
              value={filterCellType}
              options={[
                { value: "All", label: "All Tech / Cell Types" },
                { value: "DCR", label: "DCR Subsidy Approved" },
                { value: "Non-DCR", label: "Non-DCR System" },
              ]}
              onChange={(val) => setFilterCellType(val)}
            />

            {/* Subsidy Eligible Only */}
            <div className="flex items-center justify-between py-2 border-t border-b border-slate-900">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Subsidy Eligible Only
              </span>
              <input
                type="checkbox"
                checked={onlySubsidyEligible}
                onChange={(e) => setOnlySubsidyEligible(e.target.checked)}
                className="w-4 h-4 accent-solar-yellow cursor-pointer"
              />
            </div>

            {/* Max Budget Limit Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-500 uppercase tracking-widest">
                  Max Outflow Cap
                </span>
                <span className="text-white font-mono">
                  ₹{maxBudgetCost.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min={60000}
                max={2000000}
                step={50000}
                value={maxBudgetCost}
                onChange={(e) => setMaxBudgetCost(parseInt(e.target.value))}
                className="w-full accent-solar-yellow cursor-pointer bg-slate-900 h-1.5 rounded-lg appearance-none outline-none"
              />

              <div className="flex justify-between text-[8px] text-slate-550 leading-none font-mono">
                <span>₹60,000</span>
                <span>₹20 Lakh</span>
              </div>
            </div>
          </div>

          {/* ADVANCED RIGHT SIDE: SOLAR PRODUCTS CATALOG LIST GRID */}
          <div className="lg:col-span-9 space-y-6">
            {/* Search and results micro bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search solar kits, capacities, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-solar-yellow"
                />

                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
              </div>

              <div className="text-xs text-slate-400 font-bold">
                Showing{" "}
                <strong className="text-white">{filteredCatalog.length}</strong>{" "}
                Solar configurations found
              </div>
            </div>

            {/* Empty filter outcome handling */}
            {filteredCatalog.length === 0 ? (
              <div className="bg-slate-950/60 border border-slate-850 p-12 rounded-3xl text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="font-bold text-white text-base">
                  No Matching Configurations Found
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Adjust your brand selection, deployment code filters, or raise
                  the budget limit slider to display our grid-empanelled PV
                  kits.
                </p>
                <button
                  onClick={() => {
                    setFilterCapacity("All");
                    setFilterBrand("All Brands");
                    setFilterCellType("All");
                    setOnlySubsidyEligible(false);
                    setMaxBudgetCost(2000000);
                    setSearchQuery("");
                  }}
                  className="bg-[#0081C9] hover:bg-[#006FAD] text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Clear Filters & Show All
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {filteredCatalog.map((pkg) => {
                  // Compute dynamic GEDA subsidy per package
                  let cardSubsidy = 0;
                  if (
                    selectedSector === "residential" &&
                    pkg.isSubsidyEligible
                  ) {
                    if (pkg.capacityKw === 1) cardSubsidy = 30000;
                    else if (pkg.capacityKw === 2) cardSubsidy = 60000;
                    else cardSubsidy = 78000;
                  }

                  const cardNetPrice = pkg.price - cardSubsidy;
                  const monthEmiOption = Math.round(cardNetPrice / 36);

                  // Highlight matching advisor recommend capacity
                  const isRecommendedMatch = pkg.capacityKw === customKw;

                  // Active view mode tab for this card: 'overview' | 'technical' | 'calculator'
                  const activeCardTab = cardTabs[pkg.id] || "overview";
                  const setCardTab = (tab) => {
                    setCardTabs((prev) => ({ ...prev, [pkg.id]: tab }));
                  };

                  // Dynamic color styling for the brand badge
                  let brandBadgeStyle =
                    "bg-sky-500/10 text-sky-400 border-sky-500/20";
                  if (pkg.brand.includes("Tata")) {
                    brandBadgeStyle =
                      "bg-sky-500/15 text-sky-300 border-sky-500/30";
                  } else if (pkg.brand.includes("Waaree")) {
                    brandBadgeStyle =
                      "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
                  } else if (pkg.brand.includes("Adani")) {
                    brandBadgeStyle =
                      "bg-indigo-500/15 text-indigo-400 border-indigo-500/30";
                  } else if (pkg.brand.includes("Goldi")) {
                    brandBadgeStyle =
                      "bg-amber-500/15 text-amber-400 border-amber-500/30";
                  }

                  return (
                    <div
                      key={pkg.id}
                      className={`bg-slate-950 rounded-[24px] overflow-hidden border transition-all flex flex-col justify-between group h-full relative duration-300 ${
                        isRecommendedMatch
                          ? "border-solar-yellow ring-4 ring-solar-yellow/10 shadow-2xl shadow-amber-500/10"
                          : "border-slate-850 hover:border-slate-700 hover:shadow-lg"
                      }`}
                    >
                      {/* Big Solar Panel Image */}
                      <div className="h-56 bg-slate-900 relative overflow-hidden">
                        <img
                          src={pkg.image}
                          alt={pkg.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                        {/* kW capacity overlay badge */}
                        <div className="absolute top-4 left-4">
                          <span className="bg-[#0081C9] text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-lg">
                            {pkg.capacityKw} kW System
                          </span>
                        </div>

                        {/* Advisor recommendation Sparkle overlay badge */}
                        {isRecommendedMatch && (
                          <div className="absolute top-4 right-4 bg-solar-yellow text-slate-950 text-[9.5px] font-black uppercase px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />{" "}
                            Recommended
                          </div>
                        )}
                      </div>

                      {/* Card Content details */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${brandBadgeStyle}`}
                            >
                              {pkg.brand}
                            </span>
                            <span className="text-[9.5px] bg-slate-900 text-slate-400 font-mono px-2 py-0.5 rounded border border-slate-800 uppercase font-bold">
                              {pkg.dcrType} Approved
                            </span>
                          </div>

                          <h4 className="font-extrabold text-white text-base lg:text-lg leading-snug group-hover:text-solar-yellow transition-colors duration-200">
                            {pkg.title}
                          </h4>
                        </div>

                        {/* Cost & Simple EMI sections */}
                        <div className="pt-4 border-t border-slate-900/60 flex justify-between items-end">
                          <div className="space-y-1">
                            <span className="text-[9.5px] text-[#0081C9] block font-black uppercase tracking-wider leading-none">
                              Net Installation Cost
                            </span>
                            <div className="text-xl font-black text-solar-yellow font-mono leading-none">
                              ₹{cardNetPrice.toLocaleString("en-IN")}
                            </div>
                            <span className="text-[9px] text-slate-400 block leading-none font-medium">
                              MRP: ₹{pkg.price.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <div className="text-right leading-none space-y-1">
                            <span className="text-[8.5px] text-slate-500 block font-bold uppercase tracking-wider">
                              Easy Finance EMI
                            </span>
                            <span className="text-white text-xs font-black font-mono leading-none block">
                              ₹{monthEmiOption.toLocaleString("en-IN")}/mo
                            </span>
                            <span className="text-[8px] text-slate-500 block">
                              36-Month Loan
                            </span>
                          </div>
                        </div>

                        {/* CTA Reserve Setup */}
                        <button
                          type="button"
                          onClick={() => triggerPackageCheckout(pkg)}
                          className="w-full bg-[#0081C9] hover:bg-[#006FAD] text-white text-xs font-black uppercase py-3.5 rounded-xl text-center cursor-pointer shadow-md shadow-[#0081C9]/10 transition-all duration-200 hover:shadow-lg hover:shadow-[#0081C9]/25 active:scale-[0.98]"
                        >
                          Reserve Setup
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================
           SLIDEOUT / DIALOG CHECKOUT SYSTEM
           ========================================= */}
      {isCheckoutOpen && checkoutProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl relative animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0081C9] to-sky-900 p-5 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#FFF] bg-white/10 px-2 py-0.5 rounded">
                  System Reservation Drawer
                </span>
                <h4 className="text-lg font-black font-display mt-1 leading-none">
                  Solar Booking: {checkoutProduct.capacityKw}kW Design Array
                </h4>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-950/20 hover:bg-slate-950/40 text-white flex items-center justify-center transition font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
              {checkoutSuccessfulMsg ? (
                <div className="space-y-4 py-4 text-center">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                    <Check className="w-6 h-6" />
                  </div>
                  <h5 className="font-extrabold text-white text-base">
                    Booking Initialized Successfully
                  </h5>
                  <p className="text-xs text-slate-450 leading-relaxed max-w-md mx-auto">
                    {checkoutSuccessfulMsg}
                  </p>
                  <button
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      window.location.hash = "account";
                    }}
                    className="bg-emerald-555 hover:bg-emerald-600 font-bold text-slate-105 text-xs uppercase px-6 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Open Project Tracking Dashboard
                  </button>
                </div>
              ) : (
                <form onSubmit={submitCheckoutForm} className="space-y-4">
                  {/* Financial Breakdown Info */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Kit Specification:</span>
                      <span className="font-bold text-white">
                        {checkoutProduct.title}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Gross Package Value (GEDA approved):</span>
                      <span className="font-mono font-bold text-white">
                        ₹{checkoutProduct.price.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Subsidy bracket calculation */}
                    {selectedSector === "residential" &&
                    checkoutProduct.isSubsidyEligible ? (
                      <div className="flex justify-between items-center text-emerald-400">
                        <span>PM Surya Ghar Federal Subsidy credit:</span>
                        <span className="font-mono font-bold">
                          -₹
                          {(checkoutProduct.capacityKw === 1
                            ? 30000
                            : checkoutProduct.capacityKw === 2
                              ? 60000
                              : 78000
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ) : null}

                    <div className="border-t border-slate-900 pt-2 flex justify-between items-center font-bold">
                      <span className="text-white">
                        Calculated Net Self-Fund:
                      </span>
                      <span className="text-solar-yellow font-mono font-black text-sm">
                        ₹
                        {(
                          checkoutProduct.price -
                          (selectedSector === "residential" &&
                          checkoutProduct.isSubsidyEligible
                            ? checkoutProduct.capacityKw === 1
                              ? 30000
                              : checkoutProduct.capacityKw === 2
                                ? 60000
                                : 78000
                            : 0)
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-450 font-bold mb-1 uppercase text-[9.5px]">
                        Representative Partner Installer
                      </label>
                      <select
                        value={assignedEpcName}
                        onChange={(e) => setAssignedEpcName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                      >
                        <option value="Ambika Solar Installers">
                          Ambika Solar Installers (hardikbhai Senior
                          Representative)
                        </option>
                        <option value="Vertex Power Systems">
                          Vertex Power Systems (Kiritbhai Lead Representative)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-450 font-bold mb-1 uppercase text-[9.5px]">
                        Homeowner Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter full name (must match light bill exactly)"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-650 outline-none focus:border-solar-yellow"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-450 font-bold mb-1 uppercase text-[9.5px]">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="Enter 10-digit mobile"
                          value={custPhone}
                          onChange={(e) => setCustPhone(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-650 outline-none focus:border-solar-yellow"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-450 font-bold mb-1 uppercase text-[9.5px]">
                          PGVCL / DISCOM Consumer ID
                        </label>
                        <input
                          type="text"
                          maxLength={11}
                          placeholder="e.g. 04602998811"
                          value={consumerCode}
                          onChange={(e) =>
                            setConsumerCode(e.target.value.replace(/\D/g, ""))
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-650 font-mono outline-none focus:border-solar-yellow"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-450 font-bold mb-1 uppercase text-[9.5px]">
                        Physical Installation Address
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Enter direct rooftop delivery address in Rajkot"
                        value={custAddress}
                        onChange={(e) => setCustAddress(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-650 outline-none focus:border-solar-yellow"
                        required
                      />
                    </div>
                  </div>

                  {checkoutErrorMsg && (
                    <p className="text-red-400 text-[10px] font-bold leading-tight flex items-center gap-1.5 pt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />{" "}
                      {checkoutErrorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-[#0081C9] hover:bg-[#006FA0] text-white font-black uppercase text-xs py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Confirm Booking & Open Ledger Profile
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
