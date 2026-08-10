import mongoose from "mongoose";

const websiteSettingsSchema = new mongoose.Schema(
  {
    // Country identifier (india, australia, new_zealand)
    country: { type: String, default: "india" },
    // Project Type (e.g. 'default' for global settings, 'residential_solar', etc.)
    projectType: { type: String, default: "default" },
    _settingsKey: { type: String, unique: true, sparse: true },

    // ── HEADER / BRAND ──────────────────────────────────────────
    brand: {
      companyName: { type: String, default: "SUNNOVATIVE" },
      tagline: { type: String, default: "SOLAR SYSTEM" },
      phone: { type: String, default: "+91 98982 31245" },
      hubLabel: { type: String, default: "Call Rajkot Hub" },
      topBannerText: {
        type: String,
        default: "PM Surya Ghar Yojana Empaneled Vendor | Up to ₹78,000 Govt Subsidy Guaranteed",
      },
    },

    // ── HERO SECTION ─────────────────────────────────────────────
    hero: {
      badge: { type: String, default: "PM Surya Ghar Yojana - Gujarat Resident Portal" },
      headingLine1: { type: String, default: "Surya Ghar Yojana ke liye" },
      headingHighlight: { type: String, default: "Rooftop Solar Lagvao!" },
      subtext: {
        type: String,
        default:
          "Bijli bill bachao, subsidy ka benefit lo, aur trusted solar expert ke saath solar installation karao. Get up to ₹78,000 subsidy transferred directly to your bank account with EmergeSun Solar System Pvt Ltd.",
      },
      ctaPrimary: { type: String, default: "Free Solar Consultation" },
      ctaSecondary: { type: String, default: "Check Eligibility (Guj)" },
      socialProofText: { type: String, default: "Rajkot Residents: Save up to ₹78,000 on Solar Subsidy!" },
    },

    // ── STATS BAR ────────────────────────────────────────────────
    stats: [
      {
        value: { type: String },
        label: { type: String },
      },
    ],

    // ── BENEFITS ─────────────────────────────────────────────────
    benefits: {
      sectionTitle: { type: String, default: "Why Install Solar Now?" },
      sectionSubtitle: { type: String, default: "PM Surya Ghar Yojana ke Benefits & Savings" },
      sectionDesc: {
        type: String,
        default:
          "Sarkari Subsidy and EmergeSun Solar System's advanced German engineering make Rooftop Solar the single smartest investment for every home in Rajkot.",
      },
      items: [
        {
          title: { type: String },
          subtitle: { type: String },
          desc: { type: String },
          badge: { type: String },
        },
      ],
    },

    // ── HOW IT WORKS ─────────────────────────────────────────────
    howItWorks: {
      sectionTitle: { type: String, default: "Easy 4-Step Process" },
      sectionSubtitle: { type: String, default: "Solar Installation Kaise Kaam Karta Hai?" },
      steps: [
        {
          stepNum: { type: String },
          timeLabel: { type: String },
          title: { type: String },
          desc: { type: String },
        },
      ],
    },

    // ── SUBSIDY CALCULATOR ───────────────────────────────────────
    calculator: {
      sectionTitle: { type: String, default: "Realtime Solar Simulator" },
      sectionSubtitle: { type: String, default: "Check Your Subsidy & Rooftop Solar Estimate" },
      demoConsumerNumbers: { type: String, default: "04602123456 or 04608987654" },
      tipText: {
        type: String,
        default:
          "Keep a PDF or photo of your latest PGVCL utility bill ready to streamline step 1 calculation!",
      },
    },

    // ── TRUST SECTION ────────────────────────────────────────────
    trust: {
      sectionTitle: { type: String, default: "Local Trusted Expert" },
      sectionSubtitle: { type: String, default: "EmergeSun Solar System Pvt Ltd" },
      sectionDesc: {
        type: String,
        default:
          "As the leading epc service firm in Rajkot & Saurashtra region, we combine world-class PV component logistics with rigorous local engineering standards.",
      },
      points: [
        {
          title: { type: String },
          desc: { type: String },
        },
      ],
    },

    // ── COMPANY MILESTONES ───────────────────────────────────────
    milestones: {
      sectionTitle: { type: String, default: "Empowering Saurashtra Since 2014" },
      sectionSubtitle: { type: String, default: "EPC Completed Projects & Real Client Testimonials" },
      items: [
        {
          value: { type: String },
          label: { type: String },
          sublabel: { type: String },
        },
      ],
    },

    // ── FAQs ─────────────────────────────────────────────────────
    faqs: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],

    // ── FOOTER ───────────────────────────────────────────────────
    footer: {
      address: {
        type: String,
        default: "302, Shivalik Corporate Park, Near Kalawad Road, Rajkot, Gujarat - 360005",
      },
      phone: { type: String, default: "+91 98982 31245" },
      email: { type: String, default: "info@sunnovative.com" },
      gedaCertNo: { type: String, default: "#RJK-20412" },
      copyrightText: {
        type: String,
        default:
          "EmergeSun Solar System Pvt Ltd is Rajkot's premium GEDA registered EPC service provider specialized in standard residential PM Surya Ghar Yojana.",
      },
    },

    // ── VIDEO GUIDES ─────────────────────────────────────────────
    videos: {
      customerWebsiteVideo: {
        url: { type: String, default: "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0" },
        enabled: { type: Boolean, default: true }
      },
      epcDashboardVideo: {
        url: { type: String, default: "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0" },
        enabled: { type: Boolean, default: true }
      }
    },
    // ── NEW: PROJECT SPECIFIC SECTIONS ───────────────────────────
    projectTitle: {
      title: { type: String },
      description: { type: String },
      videoUrl: { type: String }
    },
    projectForm: {
      title: { type: String, default: "Apply for Solar" },
      subtitle: { type: String },
      formId: { type: String },
      fields: [
        {
          label: { type: String },
          key: { type: String },
          type: { type: String, enum: ['text', 'email', 'number', 'tel', 'select', 'textarea', 'file'], default: 'text' },
          required: { type: Boolean, default: false },
          options: [{ type: String }]
        }
      ]
    },
    journeySnap: {
      title: { type: String, default: "Customer Journey Snap" },
      imageUrl: { type: String }
    },
    testimonials: {
      title: { type: String, default: "Testimonials" },
      videoUrl: { type: String }
    },
    applySolarCta: {
      title: { type: String, default: "Apply for Solar" },
      buttonText: { type: String, default: "Apply Now" }
    },
    usps: {
      title: { type: String, default: "Why Choose Us" },
      items: [{ text: { type: String } }]
    },
    userReviews: {
      sectionTitle: { type: String, default: "User Reviews" },
      reviews: [
        {
          userName: { type: String },
          userPhoto: { type: String },
          rating: { type: Number, min: 1, max: 5 },
          feedback: { type: String },
          epcName: { type: String },
          epcRating: { type: Number, min: 1, max: 5 }
        }
      ]
    }
  },
  { timestamps: true }
);

// Compound unique index for country + projectType
websiteSettingsSchema.index({ country: 1, projectType: 1 }, { unique: true });

export const WebsiteSettings = mongoose.model("WebsiteSettings", websiteSettingsSchema);
