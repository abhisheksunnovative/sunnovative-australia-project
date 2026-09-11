import mongoose from "mongoose";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

import { WebsiteSettings } from "./src/models/WebsiteSettings.js";
import { OrderJourneySettings } from "./src/models/OrderJourneySettings.js";

const MONGO_URI = process.env.MONGODB_URL;

const AU_WEBSITE_SETTINGS = {
  _settingsKey: "australia_settings",
  country: "australia",
  hero: {
    title: "Switch to Solar & Claim Your Government Rebates Today",
    subtitle: "Australia's #1 Marketplace for Quality Solar Installations",
    badge: "CEC Accredited Installers Only",
  },
  stats: [
    { value: "50+", label: "Trusted Partners" },
    { value: "$4000+", label: "Avg. STC Rebate" },
    { value: "0", label: "Upfront Complexity" },
  ],
  features: {
    sectionTitle: "Why Choose Sunnovative Australia",
    sectionSubtitle: "Your End-to-End Solar Solution",
    items: [
      {
        title: "Federal STC Rebates",
        subtitle: "Point of Sale Discount",
        desc: "We calculate and apply your STC (Small-scale Technology Certificate) discount instantly upfront, slashing your system cost by thousands.",
        badge: "Federal Scheme",
      },
      {
        title: "CEC Accredited Installers",
        subtitle: "Safety & Quality Guaranteed",
        desc: "Every installation is completed by fully licensed and CEC-accredited electricians, ensuring full compliance with AS/NZS 5033 standards.",
        badge: "Certified",
      },
      {
        title: "Quarterly Bill Savings",
        subtitle: "Wipe Out Energy Debt",
        desc: "With high solar yields, your quarterly electricity bills will plummet. Send excess power back to your DNSP for Feed-in Tariffs (FiT).",
        badge: "Smart Savings",
      },
      {
        title: "DNSP Grid Approvals",
        subtitle: "We Handle The Paperwork",
        desc: "From Ausgrid to CitiPower, our platform automates grid connection approvals before we even set foot on your roof.",
        badge: "Zero Hassle",
      },
    ],
  },
  howItWorks: {
    sectionTitle: "Easy 4-Step Process",
    sectionSubtitle: "How Does Getting Solar Work in Australia?",
    steps: [
      {
        stepNum: "01",
        timeLabel: "In 2 Minutes",
        title: "Enter Your Postcode & Bill",
        desc: "Tell us your quarterly bill and postcode. Our engine instantly calculates your STC zone multiplier and recommended system size.",
      },
      {
        stepNum: "02",
        timeLabel: "Instant Quote",
        title: "Get Matched with Local Pros",
        desc: "Compare upfront pricing including the STC point-of-sale discount from CEC-accredited installers in your state.",
      },
      {
        stepNum: "03",
        timeLabel: "DNSP Approval",
        title: "Pre-Approval & Scheduling",
        desc: "Your chosen installer submits the grid connection application to your distributor (DNSP) for approval.",
      },
      {
        stepNum: "04",
        timeLabel: "Installation",
        title: "Install & Smart Meter Upgrade",
        desc: "Your system is installed, inspected, and your energy retailer upgrades your meter. Start saving immediately!",
      },
    ],
  },
  trust: {
    sectionTitle: "Trusted Australian Experts",
    sectionSubtitle: "Sunnovative Solar Marketplace",
    sectionDesc: "Connecting Australian homeowners with verified, high-quality solar installers.",
    points: [
      {
        title: "CEC Accredited Network",
        desc: "Every installer on our platform holds current Clean Energy Council accreditation.",
      },
      {
        title: "AS/NZS 5033 Compliant",
        desc: "Strict adherence to Australian standards for solar array installation and electrical safety.",
      },
      {
        title: "Tier-1 Components",
        desc: "We mandate Tier-1 panels and premium inverters for all marketplace quotes.",
      },
    ],
  },
  milestones: {
    sectionTitle: "Powering Australia",
    sectionSubtitle: "Real Results",
    items: [
      { value: "100+", label: "Verified Installers", sublabel: "Across all states" },
      { value: "$2M+", label: "STC Rebates Claimed", sublabel: "Saved for homeowners" },
    ],
  },
  faqs: [
    {
      question: "What is the STC Scheme?",
      answer: "The Small-scale Renewable Energy Scheme provides a financial incentive (STCs) which acts as an upfront discount on your solar system cost.",
    },
    {
      question: "Do I need to claim the rebate myself?",
      answer: "No. The STC value is applied as a point-of-sale discount by the installer. You just pay the lower net price.",
    },
    {
      question: "Will my distributor (DNSP) allow solar?",
      answer: "Most DNSPs allow solar, but export limits may apply depending on your local grid capacity. Your installer will manage this approval.",
    },
  ],
  footer: {
    address: "Sydney, NSW, Australia",
    phone: "1300 123 456",
    email: "hello@sunnovative.com.au",
    gedaCertNo: "ABN: 12 345 678 901",
    copyrightText: "Sunnovative Australia. Helping Aussies switch to solar.",
  },
};

const AU_12_STEPS = [
  { stepNumber: 1, title: "Customer Enquiry & Verification", description: "Customer submits interest. BDE verifies details and postcode.", assignedTo: "bde", enabled: true },
  { stepNumber: 2, title: "Initial Site Assessment", description: "EPC reviews roof via satellite or requests photos.", assignedTo: "epc", enabled: true },
  { stepNumber: 3, title: "Quote & STC Calculation Generation", description: "EPC generates a formal quote including the upfront STC discount.", assignedTo: "epc", enabled: true },
  { stepNumber: 4, title: "Customer Approval & Deposit", description: "Customer signs the contract and pays the initial deposit via Stripe.", assignedTo: "customer", enabled: true },
  { stepNumber: 5, title: "DNSP Grid Connection Application", description: "EPC applies to the local distributor (DNSP) for grid connection pre-approval.", assignedTo: "epc", enabled: true },
  { stepNumber: 6, title: "Material Procurement", description: "EPC orders Tier-1 panels, inverters, and mounting hardware.", assignedTo: "epc", enabled: true },
  { stepNumber: 7, title: "Installation Scheduling", description: "EPC sets a firm installation date with the customer.", assignedTo: "epc", enabled: true },
  { stepNumber: 8, title: "System Installation", description: "CEC accredited installer physically mounts and wires the system.", assignedTo: "epc", enabled: true },
  { stepNumber: 9, title: "Independent Electrical Inspection", description: "A certified electrical inspector signs off on the installation (CES/CCW).", assignedTo: "company", enabled: true },
  { stepNumber: 10, title: "Final Payment & STC Assignment", description: "Customer pays the balance and digitally signs the STC assignment form.", assignedTo: "customer", enabled: true },
  { stepNumber: 11, title: "Smart Meter Upgrade Request", description: "EPC/Customer notifies the energy retailer to upgrade the meter for solar exports.", assignedTo: "epc", enabled: true },
  { stepNumber: 12, title: "System Commissioning & Handover", description: "System is turned on, app is configured, and handover documents are provided.", assignedTo: "epc", enabled: true }
];

async function seed() {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGODB_URL is missing in .env");
    }
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    // Seed Website Settings
    await WebsiteSettings.findOneAndUpdate(
      { country: "australia" },
      AU_WEBSITE_SETTINGS,
      { upsert: true, new: true }
    );
    console.log("Australian Website Settings Seeded!");

    // Seed Order Journey
    // 12-Step Residential Australia
    const journey = await OrderJourneySettings.findOneAndUpdate(
      { country: "australia" },
      {
        country: "australia",
        journeys: [
          {
            projectType: "residential",
            projectTypeLabel: "Residential (STC)",
            steps: AU_12_STEPS.map((step, idx) => ({ ...step, id: `au-res-step-${idx+1}` }))
          }
        ]
      },
      { upsert: true, new: true }
    );
    console.log("Australian 12-Step Order Journey Seeded!");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
