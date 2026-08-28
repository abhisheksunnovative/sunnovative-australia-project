import { WebsiteSettings } from "../models/WebsiteSettings.js";

// Default seed data (same as hardcoded frontend)
const DEFAULT_SETTINGS = {
  _settingsKey: "main",
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
      "Bijli bill bachao, subsidy ka benefit lo, aur trusted solar expert ke saath solar installation karao. Get up to ₹78,000 subsidy transferred directly to your bank account with EmergeSun Solar System Pvt Ltd.",
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
      "Sarkari Subsidy and EmergeSun Solar System's advanced German engineering make Rooftop Solar the single smartest investment for every home in Rajkot.",
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
        desc: "EmergeSun experts PGVCL database se load allocation aur sanjay-yojana slab details match karke optimal solar size estimate karenge.",
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
  calculator: {
    sectionTitle: "Realtime Solar Simulator",
    sectionSubtitle: "Check Your Subsidy & Rooftop Solar Estimate",
    demoConsumerNumbers: "04602123456 or 04608987654",
    tipText:
      "Keep a PDF or photo of your latest PGVCL utility bill ready to streamline step 1 calculation!",
  },
  trust: {
    sectionTitle: "Local Trusted Expert",
    sectionSubtitle: "EmergeSun Solar System Pvt Ltd",
    sectionDesc:
      "As the leading epc service firm in Rajkot & Saurashtra region, we combine world-class PV component logistics with rigorous local engineering standards, protecting families against volatile power rates for the next 25+ years.",
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
        desc: "Custom high-load commercial arrays with 40% accelerated depreciation tax benefits, bringing down corporate, hospital, and factory energy bills significantly.",
      },
      {
        title: "Tier-1 Certified Components",
        desc: "We exclusively deploy ALMM-approved, ultra-high-efficiency Mono Perc and Bifacial panels with a 25-year performance warranty.",
      },
      {
        title: "Timely Local Maintenance",
        desc: "Based in Rajkot (Kalawad Road). Our mobile response team promises site checkups and cleanup services within 24 hours of call logged.",
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
        "Yeh scheme central government dwara launch ki gayi hai jisme residential households ko rooftop solar system lagvane par direct bank subsidy milti hai. Iska main aim 1 Crore homes ko up to 300 units free electricity monthly provide karna hai.",
    },
    {
      question: "Govt Subsidy kitni aur kaise milti hai?",
      answer:
        "Subsidy rules bohot simple hain: 1 kW ke liye ₹33,000, 2 kW ke liye ₹66,000 aur 3 kW ya usse bade rooftop solar system ke liye maximum ₹78,000 direct bank transfer hoti hai.",
    },
    {
      question: "Kya EmergeSun GEDA/MNRE Empaneled Vendor hai?",
      answer:
        "Haan, EmergeSun Solar System Pvt Ltd ek authorized/empaneled vendor hai. Hamari empanelment se system lagvane par hi aap central government subsidy ke liye eligible honge.",
    },
    {
      question: "Net-metering kya hota hai aur solar bill kaise reduce hota hai?",
      answer:
        "Bil-directional meter aapke solar system ko normal PGVCL mesh grid ke sath jodta hai. Jab din me aapka solar panel extra bijli generate karta hai to woh automatically PGVCL me chali jaati hai aur aapke bill invoice se units subtract ho jaate hain.",
    },
    {
      question: "Solar Panel lagvane ke liye kitni chhat (rooftop area) honi chahiye?",
      answer:
        "Normally, 1 kW solar lagvane ke liye 100 Sq. Ft shadow-free space (chhat) chahiye. 3 kW system lagvane ke liye lagbhag 250-300 Sq. Ft space ki avashyakta hoti hai.",
    },
    {
      question: "Rooftop solar panels ki maintenance kaise hoti hai?",
      answer:
        "Solar design highly strong hota hai kyunki isme moving mechanical parts nahi hote. EmergeSun Solar aapko 5-years free maintenance response package deti hai.",
    },
  ],
  footer: {
    address: "302, Shivalik Corporate Park, Near Kalawad Road, Rajkot, Gujarat - 360005",
    phone: "+91 98982 31245",
    email: "info@sunnovative.com",
    gedaCertNo: "#RJK-20412",
    copyrightText: "EmergeSun Solar System Pvt Ltd is Rajkot's premium GEDA registered EPC service provider specialized in standard residential PM Surya Ghar Yojana. Turns rooftop shadows into guaranteed cash savings.",
  },
  projectForm: {
    title: "Apply for Solar",
    subtitle: "Fill in your details for an instant quote.",
    formId: "default_lead_form",
    fields: [
      { label: "Consumer Number (For Auto-Scan)", key: "consumerNumber", type: "text", required: true, options: [] },
      { label: "Full Name", key: "fullName", type: "text", required: true, options: [] },
      { label: "Mobile Number", key: "mobileNumber", type: "tel", required: true, options: [] },
      { label: "Email Address", key: "email", type: "email", required: true, options: [] },
      { label: "Postcode / Pincode", key: "postcode", type: "number", required: true, options: [] },
      { label: "City", key: "city", type: "text", required: true, options: [] },
      { label: "State", key: "customerState", type: "select", required: true, options: ["Gujarat", "Maharashtra", "Rajasthan", "New South Wales", "Victoria", "Queensland"] },
      { label: "Average Monthly Bill", key: "monthlyBill", type: "number", required: true, options: [] },
      { label: "Tariff", key: "tariffDesc", type: "text", required: false, options: [] },
      { label: "Meter Category", key: "meterCategory", type: "text", required: false, options: [] },
      { label: "Discom / Retailer", key: "discom", type: "text", required: false, options: [] },
      { label: "Do you own the property?", key: "ownsProperty", type: "select", required: true, options: ["Yes", "No"] },
      { label: "Upload Electricity Bill", key: "billFile", type: "file", required: false, options: [] }
    ]
  },
  videos: {
    customerWebsiteVideo: {
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0",
      enabled: true
    },
    epcDashboardVideo: {
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0",
      enabled: true
    }
  }
};

// GET /api/website-settings/:country/:projectType — returns settings (auto-seeds defaults if empty)
export const getWebsiteSettings = async (req, res) => {
  try {
    const country = (req.params.country || req.country || "india").toLowerCase();
    const projectType = req.params.projectType || "default";
    let settings = await WebsiteSettings.findOne({ country, projectType });

    if (!settings) {
      // First time — seed with defaults safely using upsert
      settings = await WebsiteSettings.findOneAndUpdate(
        { country, projectType },
        { ...DEFAULT_SETTINGS, country, projectType, _settingsKey: `${country}_${projectType}_${Math.random()}` },
        { new: true, upsert: true }
      );
    }

    res.json({ success: true, data: settings });
  } catch (err) {
    console.error("getWebsiteSettings error:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message, stack: err.stack });
  }
};

// PUT /api/website-settings/:country/:projectType — full upsert (admin saves)
export const updateWebsiteSettings = async (req, res) => {
  try {
    const country = (req.params.country || req.country || "india").toLowerCase();
    const projectType = req.params.projectType || "default";
    
    const updated = await WebsiteSettings.findOneAndUpdate(
      { country, projectType },
      { ...req.body, country, projectType },
      { new: true, upsert: true, runValidators: false }
    );

    res.json({ success: true, data: updated, message: "Website settings saved successfully!" });
  } catch (err) {
    console.error("updateWebsiteSettings error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/website-settings/reset — reset to defaults
export const resetWebsiteSettings = async (req, res) => {
  try {
    const reset = await WebsiteSettings.findOneAndUpdate(
      { country: req.country },
      { ...DEFAULT_SETTINGS, country: req.country },
      { new: true, upsert: true, runValidators: false }
    );
    res.json({ success: true, data: reset, message: "Settings reset to defaults!" });
  } catch (err) {
    console.error("resetWebsiteSettings error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
