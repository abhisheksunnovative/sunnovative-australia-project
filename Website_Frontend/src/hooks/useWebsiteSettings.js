/**
 * useWebsiteSettings
 * Frontend hook — fetches live website settings from backend
 * Falls back to hardcoded defaults if API is unavailable
 */

import { useState, useEffect } from "react";
import { useCountry } from "../context/CountryContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

// ── Fallback defaults (shown until API loads) ─────────────────────────────────
const DEFAULTS = {
  brand: {
    companyName: "SUNNOVATIVE",
    tagline: "SOLAR SYSTEM",
    phone: "+91 98982 31245",
    hubLabel: "Call Rajkot Hub",
    topBannerText:
      "PM Surya Ghar Yojana Empaneled Vendor | Up to ₹78,000 Govt Subsidy Guaranteed",
  },
  hero: {
    badge: "PM Surya Ghar Yojana - Gujarat Resident Portal",
    headingLine1: "Surya Ghar Yojana ke liye",
    headingHighlight: "Rooftop Solar Lagvao!",
    subtext:
      "Bijli bill bachao, subsidy ka benefit lo, aur trusted solar expert ke saath solar installation karao. Get up to ₹78,000 subsidy transferred directly to your bank account with Sunnovative Solar System Pvt Ltd.",
    ctaPrimary: "Free Solar Consultation",
    ctaSecondary: "Check Eligibility (Guj)",
    socialProofText: "Rajkot Residents: Save up to ₹78,000 on Solar Subsidy!",
  },
  stats: [
    { value: "1200+", label: "Rajkot Homes Solarized" },
    { value: "₹48 Lakh+", label: "Subsidy Disbursed" },
    { value: "3.8 MW", label: "Current Capacity" },
  ],
  benefits: {
    sectionTitle: "Why Install Solar Now?",
    sectionSubtitle: "PM Surya Ghar Yojana ke Benefits & Savings",
    sectionDesc:
      "Sarkari Subsidy and Sunnovative Solar System's advanced German engineering make Rooftop Solar the single smartest investment for every home in Rajkot.",
    items: [
      {
        title: "Government Subsidy Support",
        subtitle: "Up to ₹78,000 Direct Return",
        desc: "MNRE National Portal key direct integration: 1kW translates to ₹33,000, 2kW offers ₹66,000, and 3kW or above gains ₹78,000 maximum direct bank transfer.",
        badge: "Rajkot Authorized Geda vendor",
      },
      {
        title: "Zero Electricity Bill Savings",
        subtitle: "Save up to 90% Every Month",
        desc: "Free up to 300 units of energy monthly depending on panel size. Any extra energy generated goes back to PGVCL grid, lowering your electric tab to near-zero.",
        badge: "Rajkot Authorized Geda vendor",
      },
      {
        title: "End-to-End Installation",
        subtitle: "Tier-1 Components & Warranty",
        desc: "Complete rooftop mounting structure with wind-flow optimization (withstands Cyclone gusts in Saurashtra), structural safety certified by architects.",
        badge: "Rajkot Authorized Geda vendor",
      },
      {
        title: "Hassle-Free Liaisoning",
        subtitle: "Zero Red Tape or Document Stress",
        desc: "We fully manage documentation on the PGVCL portal, structural drawing submissions, subsidy eligibility approval, and regulatory liaisoning.",
        badge: "Rajkot Authorized Geda vendor",
      },
      {
        title: "Bi-directional Net-Metering",
        subtitle: "Turn Sun into Guaranteed Earnings",
        desc: "Full coordination with PGVCL division engineers to commission standard and secure bi-directional meters. Monitor production from your smartphone.",
        badge: "Rajkot Authorized Geda vendor",
      },
    ],
  },
  howItWorks: {
    sectionTitle: "Easy 4-Step Process",
    sectionSubtitle: "Solar Installation Kaise Kaam Karta Hai?",
    steps: [
      {
        stepNum: "01",
        timeLabel: "In 2 Minutes",
        title: "Light Bill Details Submit Kare",
        desc: "Hamari system me apna Consumer Number ya Average monthly bill enter kare. High-resolution utility bill upload option available.",
      },
      {
        stepNum: "02",
        timeLabel: "Within 1 Hour",
        title: "Team Eligibility Check Karegi",
        desc: "Sunnovative experts PGVCL database se load allocation aur sanjay-yojana slab details match karke optimal solar size estimate karenge.",
      },
      {
        stepNum: "03",
        timeLabel: "In 24 Hours",
        title: "Free Site Survey & Quotation",
        desc: "Rajkot ke field officers aapke rooftop area, shadow profiles aur tile strength check kareke high-durability customized quote design karenge.",
      },
      {
        stepNum: "04",
        timeLabel: "Direct Transfer",
        title: "Installation & Subsidy Credit",
        desc: "Within 10-15 days, structure setup and net-meter commissioning are finalized. Government subsidy amount directly transfers into your bank account.",
      },
    ],
  },
  trust: {
    sectionTitle: "Local Trusted Expert",
    sectionSubtitle: "Sunnovative Solar System Pvt Ltd",
    sectionDesc:
      "As the leading epc service firm in Rajkot & Saurashtra region, we combine world-class PV component logistics with rigorous local engineering standards.",
    points: [
      {
        title: "Empaneled Solar Contractor",
        desc: "Proud GEDA (Gujarat Energy Development Agency) authorized empanelled solar installer. Certified to load subsidy directly on the National Portal.",
      },
      {
        title: "Residential Solar Pioneers",
        desc: "Authorized partner in Rajkot for residential solar panels, supporting zero-overhead setups for single-family homes, complexes, and high-rise apartments.",
      },
      {
        title: "Commercial & Industrial Solar",
        desc: "Custom high-load commercial arrays with 40% accelerated depreciation tax benefits.",
      },
      {
        title: "Tier-1 Certified Components",
        desc: "We exclusively deploy ALMM-approved, ultra-high-efficiency Mono Perc and Bifacial panels with a 25-year performance warranty.",
      },
      {
        title: "Timely Local Maintenance",
        desc: "Based in Rajkot (Kalawad Road). Our mobile response team promises site checkups within 24 hours of call logged.",
      },
    ],
  },
  milestones: {
    sectionTitle: "Empowering Saurashtra Since 2014",
    sectionSubtitle: "EPC Completed Projects & Real Client Testimonials",
    items: [
      { value: "12+", label: "Years of Experience", sublabel: "Pioneering solar across Saurashtra" },
      { value: "1,500+", label: "Total Certified Projects", sublabel: "Rooftops turned into power plants" },
      { value: "45+", label: "Active EPC Partners", sublabel: "GEDA empanelled local installers" },
      { value: "8.5 Megawatts", label: "Active Clean Capacity", sublabel: "Offsetting million tons of carbon" },
    ],
  },
  faqs: [
    {
      question: "PM Surya Ghar: Muft Bijli Yojana kya hai?",
      answer:
        "Yeh scheme central government dwara launch ki gayi hai jisme residential households ko rooftop solar system lagvane par direct bank subsidy milti hai.",
    },
    {
      question: "Govt Subsidy kitni aur kaise milti hai?",
      answer:
        "1 kW ke liye ₹33,000, 2 kW ke liye ₹66,000 aur 3 kW ya usse bade ke liye ₹78,000 maximum direct bank transfer hoti hai.",
    },
    {
      question: "Kya Sunnovative GEDA/MNRE Empaneled Vendor hai?",
      answer: "Haan, Sunnovative Solar System Pvt Ltd ek authorized/empaneled vendor hai.",
    },
    {
      question: "Net-metering kya hota hai aur solar bill kaise reduce hota hai?",
      answer:
        "Bi-directional meter aapke solar system ko PGVCL grid ke sath jodta hai. Extra bijli automatically PGVCL me chali jaati hai aur bill se units subtract ho jaate hain.",
    },
    {
      question: "Solar Panel lagvane ke liye kitni chhat (rooftop area) honi chahiye?",
      answer: "1 kW solar lagvane ke liye 100 Sq. Ft shadow-free space chahiye. 3 kW ke liye 250-300 Sq. Ft.",
    },
    {
      question: "Rooftop solar panels ki maintenance kaise hoti hai?",
      answer:
        "Solar design highly strong hota hai. Sunnovative Solar aapko 5-years free maintenance response package deti hai.",
    },
  ],
  footer: {
    address: "302, Shivalik Corporate Park, Near Kalawad Road, Rajkot, Gujarat - 360005",
    phone: "+91 98982 31245",
    email: "info@sunnovative.com",
    gedaCertNo: "#RJK-20412",
    copyrightText:
      "Sunnovative Solar System Pvt Ltd is Rajkot's premium GEDA registered EPC service provider. Turns rooftop shadows into guaranteed cash savings.",
  },
};

// Module-level cache so all components share one fetch per country
let _cache = {};
let _listeners = [];
let _fetching = {};

const notify = (countryStr) => _listeners.forEach((fn) => fn(countryStr));

const fetchOnce = async (countryStr) => {
  if (_cache[countryStr] || _fetching[countryStr]) return;
  _fetching[countryStr] = true;
  try {
    let code = "india";
    if (countryStr === "AU") code = "australia";
    if (countryStr === "NZ") code = "new_zealand";

    const res = await fetch(`${API_BASE}/api/website-settings`, {
      headers: { 'x-country': code }
    });
    const data = await res.json();
    if (data.success && data.data) {
      _cache[countryStr] = data.data;
      notify(countryStr);
    }
  } catch {
    // silent fallback — components will use DEFAULTS
  } finally {
    _fetching[countryStr] = false;
  }
};

export function useWebsiteSettings() {
  const { country } = useCountry();
  const [data, setData] = useState(_cache[country] || DEFAULTS);

  useEffect(() => {
    // Reset data if country changes
    setData(_cache[country] || DEFAULTS);

    // If not cached, fetch it
    if (!_cache[country]) {
      fetchOnce(country);
    }

    // Register listener for this country
    const update = (updatedCountry) => {
      if (updatedCountry === country) {
        setData(_cache[country] || DEFAULTS);
      }
    };
    _listeners.push(update);

    return () => {
      _listeners = _listeners.filter((fn) => fn !== update);
    };
  }, [country]);

  return data;
}
