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
  projectTypeConfigs: [
    { type: "Residential", isActive: true },
    { type: "Commercial", isActive: true },
    { type: "Group", isActive: true }
  ],
  brand: {
    companyName: "SUNNOVATIVE",
    tagline: "SOLAR SYSTEM",
    phone: "+61 400 000 000",
    hubLabel: "Call Australia Hub",
    topBannerText:
      "SAA Accredited Solar Retailer | Get up to $2,400 STC Upfront Discount",
  },
  hero: {
    badge: "Australia Solar Rebate Program",
    headingLine1: "Go Solar and",
    headingHighlight: "Slash Your Quarterly Bill!",
    subtext:
      "Save on your energy bills, claim your STC upfront discount, and get high-quality solar installed by SAA accredited experts. Lock in your solar investment today.",
    ctaPrimary: "Free Solar Quote",
    ctaSecondary: "Check STC Eligibility",
    socialProofText: "Australian Homeowners: Save up to $2,400 with STCs!",
  },
  stats: [
    { value: "1500+", label: "Australian Homes Solarized" },
    { value: "$2.5M+", label: "STC Rebates Claimed" },
    { value: "10 MW", label: "Clean Capacity Installed" },
  ],
  benefits: {
    sectionTitle: "Why Install Solar Now?",
    sectionSubtitle: "Federal STCs & State Rebates",
    sectionDesc:
      "Federal STC discounts and state rebates make solar the smartest investment for every home in Australia.",
    items: [
      {
        title: "Federal STC Discount",
        subtitle: "Up to $2,400 Upfront Savings",
        desc: "The Small-scale Renewable Energy Scheme (SRES) provides STCs based on your postcode zone, reducing your out-of-pocket costs on day one.",
        badge: "CEC/SAA Approved Products",
      },
      {
        title: "State Level Rebates",
        subtitle: "E.g., Solar Victoria Rebate",
        desc: "Depending on your state, you may be eligible for additional rebates (like VIC $1,400) or interest-free loans for battery systems.",
        badge: "CEC/SAA Approved Products",
      },
      {
        title: "Quarterly Bill Savings",
        subtitle: "Save up to 80% on Energy",
        desc: "Generate your own power and significantly reduce your quarterly electricity bills from retailers like AGL, Origin, or EnergyAustralia.",
        badge: "CEC/SAA Approved Products",
      },
      {
        title: "Feed-in Tariffs (FiT)",
        subtitle: "Earn from Exported Solar",
        desc: "Send excess energy back to the grid and earn credits (3c - 15c/kWh) on your bill from your energy retailer.",
        badge: "CEC/SAA Approved Products",
      },
      {
        title: "End-to-End Installation",
        subtitle: "Fully Managed Process",
        desc: "We handle DNSP pre-approvals, Certificate of Electrical Safety (CES), and smart meter upgrades. SAA-accredited installers guarantee quality.",
        badge: "CEC/SAA Approved Products",
      },
    ],
  },
  howItWorks: {
    sectionTitle: "Easy 4-Step Process",
    sectionSubtitle: "How Australian Solar Installation Works",
    steps: [
      {
        stepNum: "01",
        timeLabel: "Instant",
        title: "Enter Postcode & Details",
        desc: "Provide your postcode and quarterly bill amount to calculate your STC zone and estimated savings instantly.",
      },
      {
        stepNum: "02",
        timeLabel: "24 Hours",
        title: "Quote & DNSP Approval",
        desc: "Receive a tailored quote with STC upfront discount applied. We submit the grid connection application to your DNSP.",
      },
      {
        stepNum: "03",
        timeLabel: "1-2 Days",
        title: "Installation by SAA Experts",
        desc: "Our SAA/CEC accredited installers fit your system using approved panels and inverters. Certificate of Electrical Safety (CES) issued.",
      },
      {
        stepNum: "04",
        timeLabel: "Final",
        title: "Smart Meter & FiT Setup",
        desc: "Your retailer upgrades your meter. System is turned on, and you start earning Feed-in Tariffs and saving on quarterly bills.",
      },
    ],
  },
  trust: {
    sectionTitle: "Trusted Local Experts",
    sectionSubtitle: "Sunnovative Energy Systems",
    sectionDesc:
      "Fully accredited and compliant with all Australian standards (AS/NZS 5033). We ensure premium quality and safety.",
    points: [
      {
        title: "SAA Accredited Installers",
        desc: "All installations are performed by Solar Accreditation Australia (SAA) certified professionals.",
      },
      {
        title: "CEC Approved Products",
        desc: "We exclusively use Tier-1 solar panels and inverters approved by the Clean Energy Council.",
      },
      {
        title: "AS/NZS 5033 Compliant",
        desc: "Strict adherence to Australian installation and electrical safety standards.",
      },
      {
        title: "Hassle-free DNSP Processing",
        desc: "We handle all the paperwork with Ausgrid, Energex, CitiPower, or your local distributor.",
      },
      {
        title: "Comprehensive Warranty",
        desc: "25-year performance warranty on panels and comprehensive workmanship guarantees.",
      },
    ],
  },
  milestones: {
    sectionTitle: "Empowering Australia",
    sectionSubtitle: "Real Client Testimonials & EPC Projects",
    items: [
      { value: "10+", label: "Years in Solar", sublabel: "Trusted across states" },
      { value: "2,000+", label: "Systems Installed", sublabel: "Residential & Commercial" },
      { value: "50+", label: "Accredited Partners", sublabel: "SAA certified installers" },
      { value: "15 Megawatts", label: "Clean Capacity", sublabel: "Offsetting carbon footprint" },
    ],
  },
  faqs: [
    {
      question: "What are STCs and how do they reduce my cost?",
      answer:
        "Small-scale Technology Certificates (STCs) are a federal government incentive. The amount depends on your postcode zone and system size. The installer claims these and gives you an upfront discount on the system price.",
    },
    {
      question: "Do I need a CEC or SAA Accredited Installer?",
      answer:
        "Yes! To claim STCs and legally install solar in Australia, your installer must be accredited by Solar Accreditation Australia (SAA) or CEC.",
    },
    {
      question: "What is DNSP approval?",
      answer: "Before installation, we must apply to your local grid distributor (DNSP) to ensure the grid can handle your solar export. This sets your export limit.",
    },
    {
      question: "What Feed-in Tariff (FiT) rate will I get?",
      answer:
        "FiT rates vary by retailer (e.g., AGL, Origin) and state, typically ranging from 3c to 15c per kWh for the energy you send back to the grid.",
    },
    {
      question: "Is there a rebate for solar batteries in 2026?",
      answer: "Federal battery rebates are being phased in, but state-specific rebates (like in VIC or SA) often provide discounts or interest-free loans for batteries.",
    },
    {
      question: "How long does the whole process take?",
      answer:
        "Typically 45-70 days. DNSP approval takes 1-3 weeks. Installation is 1-2 days. The final step is your retailer upgrading the smart meter (2-4 weeks).",
    },
  ],
  footer: {
    address: "Level 12, 100 Collins Street, Melbourne, VIC 3000, Australia",
    phone: "+61 400 000 000",
    email: "info@sunnovative.com.au",
    gedaCertNo: "ABN: 12 345 678 910",
    copyrightText:
      "Sunnovative Energy Systems is an SAA accredited solar provider, helping Australians slash power bills with premium tier-1 solar solutions.",
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
