import mongoose from "mongoose";

const stepSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  icon: { type: String }, // lucide react icon name
});

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const countryWebsiteSettingsSchema = new mongoose.Schema({
  countryCode: { 
    type: String, 
    required: true, 
    unique: true, 
    enum: ['IN', 'AU', 'NZ', 'UK', 'US'] 
  },
  countryName: { type: String, required: true },
  currency: { type: String, required: true },
  currencySymbol: { type: String, required: true },
  isEnabled: { type: Boolean, default: false },
  
  language: { type: [String], default: ['en'] },
  
  websiteContent: {
    heroTitle: { type: String, default: "" },
    heroSubtitle: { type: String, default: "" },
    bannerImage: { type: String, default: "" },
    stats: {
      installations: { type: String, default: "0+" },
      savings: { type: String, default: "0" },
      partners: { type: String, default: "0+" },
    },
    benefits: [
      {
        title: { type: String },
        description: { type: String }
      }
    ],
    faqs: [faqSchema],
    footerText: { type: String, default: "" }
  },

  projectTypes: { type: [String], default: [] },
  
  subsidyInfo: {
    schemeName: { type: String, default: "" },
    maxAmount: { type: String, default: "" },
    validUntil: { type: Date },
    description: { type: String, default: "" }
  },

  eligibilityRules: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  customerJourney: {
    steps: [stepSchema]
  },

  seoMetadata: {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    keywords: { type: [String], default: [] }
  },

  contactInfo: {
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" }
  },

  stcSettings: {
    schemeEnabled: { type: Boolean, default: true },
    currentDeemingYear: { type: Number, default: 2026 },
    deemingPeriodRemaining: { type: Number, default: 4 },
    schemeEndYear: { type: Number, default: 2030 },
    cerClearingHousePrice: { type: Number, default: 40.00 },
    defaultTradePrice: { type: Number, default: 38.00 },
    batteryStcsEnabled: { type: Boolean, default: false },
    zoneRatings: {
      zone1: { type: Number, default: 1.622 },
      zone2: { type: Number, default: 1.536 },
      zone3: { type: Number, default: 1.382 },
      zone4: { type: Number, default: 1.185 }
    }
  },

  isPublished: { type: Boolean, default: false }

}, { timestamps: true });

const CountryWebsiteSettings = mongoose.model("CountryWebsiteSettings", countryWebsiteSettingsSchema);
export default CountryWebsiteSettings;
