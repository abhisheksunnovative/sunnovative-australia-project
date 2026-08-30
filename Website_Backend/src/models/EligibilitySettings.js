import mongoose from "mongoose";

const billToKwRangeSchema = new mongoose.Schema({
  id: String,
  minBill: { type: Number, default: 0 },
  maxBill: { type: Number, default: 1000 },
  suggestedKW: { type: Number, default: 1 },
  label: { type: String, default: "" },
}, { _id: false });

const meterCategorySchema = new mongoose.Schema({
  category: { type: String, default: "" },
  eligible: { type: Boolean, default: true },
  minMonthlyBill: { type: Number, default: 500 },
  maxMonthlyBill: { type: Number, default: 50000 },
}, { _id: false });

const stateSubsidySchema = new mongoose.Schema({
  state: { type: String, required: true },
  stateSubsidyPerKW: { type: Number, default: 0 },
  stateSubsidyMax: { type: Number, default: 0 },
  stateScheme: { type: String, default: "" },
  agency: { type: String, default: "" },
}, { _id: false });

const centralSubsidyTierSchema = new mongoose.Schema({
  maxKW: { type: Number, required: true },
  ratePerKW: { type: Number, default: 0 },
  fixedBaseAmount: { type: Number, default: 0 },
}, { _id: false });

const projectCategorySchema = new mongoose.Schema({
  id: String,
  name: { type: String, default: "" },
  enabled: { type: Boolean, default: true },
  minKW: { type: Number, default: 1 },
  maxKW: { type: Number, default: 10 },
  subsidyEligible: { type: Boolean, default: false },
  maxSubsidyAmount: { type: Number, default: 0 },
  description: { type: String, default: "" },
}, { _id: false });

const inverterTypeSchema = new mongoose.Schema({
  id: String,
  name: { type: String, default: "" },
  enabled: { type: Boolean, default: true },
  efficiency: { type: Number, default: 97 },
  suitableFor: [String],
  description: { type: String, default: "" },
}, { _id: false });

const eligibilitySettingsSchema = new mongoose.Schema(
  {
    country: { type: String, default: "india", unique: true },
    projectCategories: { type: [projectCategorySchema], default: [] },
    inverterTypes: { type: [inverterTypeSchema], default: [] },
    eligibilityRules: {
      billToKwRanges: { type: [billToKwRangeSchema], default: [] },
      meterCategories: { type: [meterCategorySchema], default: [] },
      billStatusRules: {
        paidBillAllowed: { type: Boolean, default: true },
        dueBillAllowed: { type: Boolean, default: true },
        pendingBillAllowed: { type: Boolean, default: false },
        overdueMaxMonths: { type: Number, default: 2 },
      },
      subsidyCriteria: {
        minMonthlyUnits: { type: Number, default: 100 },
        maxMonthlyUnits: { type: Number, default: 10000 },
        pmSuryaGharEligibleCategories: { type: [String], default: ["Residential (LT-1)"] },
        maxSubsidyKW: { type: Number, default: 3 },
      },
      kwDerivationRules: {
        unitsPerKW: { type: Number, default: 90 },
        safetyBuffer: { type: Number, default: 1.1 },
        roundUpToNext: { type: Number, default: 0.5 },
        maxAutoSuggestKW: { type: Number, default: 10 },
      },
      dueAmountThreshold: {
        enabled: { type: Boolean, default: true },
        maxAllowedDueAmount: { type: Number, default: 5000 },
        blockIfExceeds: { type: Boolean, default: false },
        showWarningIfExceeds: { type: Boolean, default: true },
      },
      latestBillRules: {
        enabled: { type: Boolean, default: true },
        maxBillAgeMonths: { type: Number, default: 3 },
      },
      stateSubsidies: { type: [stateSubsidySchema], default: [] },
      centralSubsidyTiers: { type: [centralSubsidyTierSchema], default: [] },
    },
  },
  { timestamps: true }
);

export default mongoose.model("EligibilitySettings", eligibilitySettingsSchema);