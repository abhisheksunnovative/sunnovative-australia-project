import React, { createContext, useContext, useState } from "react";

const TRANSLATIONS = {
  IN: {
    country: "India", flag: "🇮🇳", currency: "₹", currencyCode: "INR",
    subsidy: "Subsidy", subsidyFull: "PM Surya Ghar Yojana Subsidy",
    centralSubsidy: "Central Government Subsidy", stateSubsidy: "State Government Subsidy",
    totalSubsidy: "Total Subsidy", netCost: "Net Cost After Subsidy",
    utilityBill: "Electricity Bill", utilityProvider: "DISCOM / Electricity Board",
    consumerNumber: "Consumer Number", meterCategory: "Meter Category",
    unit: "Units", unitLabel: "Units (kWh) per month",
    solarScheme: "PM Surya Ghar Yojana",
    certBody: "GEDA / MNRE Certified", certLabel: "GEDA Certified Partner",
    certNote: "Gujarat Energy Development Agency authorized",
    gridType: "Net Metering", installLabel: "Rooftop Solar Installation",
    applyBtn: "Check Eligibility & Apply", ctaLabel: "Free Consultation",
    heroBadge: "PM Surya Ghar Rooftop Scheme",
    heroSubsidyLine: "Save up to ₹78,000 on Solar Subsidy!",
    rebate: "Subsidy", feedInTariff: "Net Metering Earnings",
    savingsLabel: "Monthly Savings on Electricity Bill",
    packagesTitle: "Solar System Packages",
    packagesSubtitle: "Apni zaroorat ke hisaab se package chunko",
    subsidyBreakdown: "Subsidy Breakdown",
    youPay: "Aap Bharenge (Net Cost)",
    applyNow: "Apply Now",
    checkEligibility: "Check Eligibility",
    loginTitle: "Sunnovative Customer Portal",
    loginSubtitle: "Mobile number se login ya register karo",
    otpSent: "OTP bheja gaya",
    signupTitle: "Pehli baar? Register karo",
  },
  AU: {
    country: "Australia", flag: "🇦🇺", currency: "A$", currencyCode: "AUD",
    subsidy: "Rebate", subsidyFull: "Small-scale Technology Certificates (STCs)",
    centralSubsidy: "Federal STC Rebate", stateSubsidy: "State Incentive",
    totalSubsidy: "Total Rebates & Incentives", netCost: "Net Cost After Rebates",
    utilityBill: "Electricity / Utility Bill", utilityProvider: "Energy Retailer",
    consumerNumber: "Account Number", meterCategory: "Tariff Type",
    unit: "kWh", unitLabel: "kWh consumed per quarter",
    solarScheme: "Small-scale Renewable Energy Scheme (SRES)",
    certBody: "Clean Energy Council Accredited", certLabel: "CEC Accredited Installer",
    certNote: "Clean Energy Council accredited solar installer",
    gridType: "Feed-in Tariff (FiT)", installLabel: "Rooftop Solar PV System",
    applyBtn: "Get Free Quote", ctaLabel: "Get Free Quote",
    heroBadge: "Small-scale Renewable Energy Scheme",
    heroSubsidyLine: "Save up to A$3,500 with STC Rebates!",
    rebate: "STC Rebate", feedInTariff: "Feed-in Tariff Earnings",
    savingsLabel: "Quarterly Savings on Utility Bills",
    packagesTitle: "Solar PV System Options",
    packagesSubtitle: "Choose the right system for your home or business",
    subsidyBreakdown: "Rebate Breakdown",
    youPay: "You Pay (After Rebates)",
    applyNow: "Get Quote",
    checkEligibility: "Check Eligibility",
    loginTitle: "Sunnovative Solar Portal",
    loginSubtitle: "Sign in or create your account",
    otpSent: "OTP sent",
    signupTitle: "First time? Create account",
  },
  NZ: {
    country: "New Zealand", flag: "🇳🇿", currency: "NZ$", currencyCode: "NZD",
    subsidy: "Rebate", subsidyFull: "EECA Solar Rebate",
    centralSubsidy: "Federal Rebate", stateSubsidy: "Regional Incentive",
    totalSubsidy: "Total Rebates & Incentives", netCost: "Net Cost After Rebates",
    utilityBill: "Electricity Bill", utilityProvider: "Energy Retailer",
    consumerNumber: "ICP Number", meterCategory: "Tariff Type",
    unit: "kWh", unitLabel: "kWh consumed per month",
    solarScheme: "New Zealand Solar Scheme",
    certBody: "SEANZ Accredited", certLabel: "SEANZ Accredited Installer",
    certNote: "Sustainable Energy Association New Zealand",
    gridType: "Buy-back Rate", installLabel: "Rooftop Solar PV System",
    applyBtn: "Get Free Quote", ctaLabel: "Get Free Quote",
    heroBadge: "Clean Energy Scheme",
    heroSubsidyLine: "Save on energy bills with solar!",
    rebate: "Rebate", feedInTariff: "Buy-back Earnings",
    savingsLabel: "Monthly Savings on Utility Bills",
    packagesTitle: "Solar PV System Options",
    packagesSubtitle: "Choose the right system for your home",
    subsidyBreakdown: "Rebate Breakdown",
    youPay: "You Pay (After Rebates)",
    applyNow: "Get Quote",
    checkEligibility: "Check Eligibility",
    loginTitle: "Sunnovative Solar Portal",
    loginSubtitle: "Sign in or create your account",
    otpSent: "OTP sent",
    signupTitle: "First time? Create account",
  },
};

const CountryContext = createContext({ country: "IN", t: TRANSLATIONS.IN, setCountry: () => {} });

export const CountryProvider = ({ children, countryProp }) => {
  const [country, setCountry] = useState(() => countryProp || localStorage.getItem("sn_country") || "IN");

  // Sync state if URL prop changes
  React.useEffect(() => {
    if (countryProp && countryProp !== country) {
      setCountry(countryProp);
    }
  }, [countryProp]);

  const t = TRANSLATIONS[country] || TRANSLATIONS.IN;
  const changeCountry = (c) => { 
    setCountry(c); 
    localStorage.setItem("sn_country", c); 
    // Usually handled by router, but this is a fallback
  };
  return (
    <CountryContext.Provider value={{ country, t, setCountry: changeCountry, TRANSLATIONS }}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = () => useContext(CountryContext);