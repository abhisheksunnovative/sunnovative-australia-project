/**
 * CustomerEligibilityScreen — Admin panel tab
 * section prop: projectCategories | inverterTypes | meterCategories |
 *               billStatusRules | kwDerivationRules | subsidyCriteria |
 *               dueAmountThreshold | stateSubsidy | null (show all)
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Zap, Save, RefreshCw, Plus, Trash2,
  ChevronDown, ChevronUp, AlertCircle, CheckCircle,
  Loader2, Info, ToggleLeft, ToggleRight, SlidersHorizontal,
  MapPin, IndianRupee,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

// ── Reusable UI ───────────────────────────────────────────────────────────────

const SectionCard = ({ title, icon, children, defaultOpen = true, badge }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-yellow-500">{icon}</span>
          <span className="font-semibold text-slate-800 text-sm">{title}</span>
          {badge && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">{badge}</span>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-6 pb-6 space-y-4 border-t border-slate-100">{children}</div>}
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text", placeholder = "", hint }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
    <input type={type} className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400/40" value={value ?? ""} onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)} placeholder={placeholder} />
    {hint && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
  </div>
);

const Toggle = ({ label, checked, onChange, desc }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
    <div>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
    </div>
    <button onClick={() => onChange(!checked)} className="shrink-0 ml-4">
      {checked ? <ToggleRight className="w-8 h-8 text-yellow-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
    </button>
  </div>
);

const clone = (obj) => JSON.parse(JSON.stringify(obj));

// Central subsidy calculator (formula-based fallback)
const calcCentralSubsidy = (kw) => {
  if (kw <= 0) return 0;
  if (kw <= 2) return Math.round(kw * 30000);
  if (kw < 3) return Math.round(60000 + (kw - 2) * 18000);
  return 78000; // capped at 3kW
};

// ── Default settings ──────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  projectCategories: [
    { id: "residential", name: "Residential Solar", enabled: true, minKW: 1, maxKW: 10, subsidyEligible: true, maxSubsidyAmount: 78000, description: "Single family homes, apartments" },
    { id: "group", name: "Group Solar", enabled: true, minKW: 5, maxKW: 50, subsidyEligible: true, maxSubsidyAmount: 78000, description: "Housing societies, RWAs" },
    { id: "commercial", name: "Commercial Solar", enabled: true, minKW: 10, maxKW: 500, subsidyEligible: false, maxSubsidyAmount: 0, description: "Shops, offices, factories" },
    { id: "common-meter", name: "Common Meter Solar", enabled: true, minKW: 2, maxKW: 20, subsidyEligible: true, maxSubsidyAmount: 78000, description: "Common area meter installations" },
  ],
  inverterTypes: [
    { id: "string", name: "String Inverter", enabled: true, efficiency: 97, suitableFor: ["Residential Solar", "Commercial Solar"], description: "Most common, cost-effective for standard rooftops" },
    { id: "micro", name: "Micro Inverter", enabled: true, efficiency: 99, suitableFor: ["Residential Solar", "Group Solar"], description: "Panel-level optimization, ideal for shaded rooftops" },
    { id: "hybrid", name: "Hybrid Inverter", enabled: true, efficiency: 98, suitableFor: ["Residential Solar", "Group Solar", "Commercial Solar"], description: "Battery + grid compatible, future-ready" },
  ],
  eligibilityRules: {
    billToKwRanges: [
      { id: "r1", minBill: 0, maxBill: 500, suggestedKW: 0.5, label: "Very Low (₹0–₹500)" },
      { id: "r2", minBill: 501, maxBill: 1000, suggestedKW: 1, label: "Low (₹501–₹1,000)" },
      { id: "r3", minBill: 1001, maxBill: 1500, suggestedKW: 1.5, label: "Low-Medium (₹1,001–₹1,500)" },
      { id: "r4", minBill: 1501, maxBill: 2500, suggestedKW: 2, label: "Medium (₹1,501–₹2,500)" },
      { id: "r5", minBill: 2501, maxBill: 4000, suggestedKW: 3, label: "Medium-High (₹2,501–₹4,000)" },
      { id: "r6", minBill: 4001, maxBill: 6000, suggestedKW: 4, label: "High (₹4,001–₹6,000)" },
      { id: "r7", minBill: 6001, maxBill: 9000, suggestedKW: 6, label: "Very High (₹6,001–₹9,000)" },
      { id: "r8", minBill: 9001, maxBill: 99999, suggestedKW: 10, label: "Ultra High (₹9,001+)" },
    ],
    meterCategories: [
      { category: "Residential (LT-1)", eligible: true, minMonthlyBill: 500, maxMonthlyBill: 50000 },
      { category: "Commercial (LT-2)", eligible: true, minMonthlyBill: 1000, maxMonthlyBill: 500000 },
      { category: "Industrial (HT)", eligible: false, minMonthlyBill: 0, maxMonthlyBill: 0 },
      { category: "Agricultural", eligible: false, minMonthlyBill: 0, maxMonthlyBill: 0 },
    ],
    billStatusRules: { paidBillAllowed: true, dueBillAllowed: true, pendingBillAllowed: false, overdueMaxMonths: 2 },
    subsidyCriteria: { minMonthlyUnits: 100, maxMonthlyUnits: 10000, pmSuryaGharEligibleCategories: ["Residential (LT-1)"], maxSubsidyKW: 3 },
    kwDerivationRules: { unitsPerKW: 90, safetyBuffer: 1.1, roundUpToNext: 0.5, maxAutoSuggestKW: 10 },
    dueAmountThreshold: { enabled: true, maxAllowedDueAmount: 5000, blockIfExceeds: false, showWarningIfExceeds: true },
    stateSubsidies: [
      { state: "Gujarat", stateSubsidyPerKW: 13333, stateSubsidyMax: 40000, stateScheme: "SURYA Gujarat", agency: "MGVCL" }
    ],
    centralSubsidyTiers: [
      { maxKW: 2, ratePerKW: 30000, fixedBaseAmount: 0 },
      { maxKW: 3, ratePerKW: 18000, fixedBaseAmount: 60000 },
      { maxKW: 100, ratePerKW: 0, fixedBaseAmount: 78000 }
    ],
  },
};

const SECTION_TITLES = {
  projectCategories: "Project Categories",
  inverterTypes: "Inverter Types",
  meterCategories: "Meter Category Eligibility",
  billStatusRules: "Bill Status Rules",
  kwDerivationRules: "KW Derivation Rules",
  subsidyCriteria: "Subsidy Criteria",
  dueAmountThreshold: "Due Amount Threshold",
  billToKwRanges: "Bill → KW Mapping",
  stateSubsidy: "State-wise Subsidy",
};

// ── Main Component ────────────────────────────────────────────────────────────

export const CustomerEligibilityScreen = ({ section = null }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("india");
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/countries`);
        const data = await res.json();
        if (data.success) {
          setCountries(data.data.map(c => ({ code: c.code, label: `${c.flagEmoji || ""} ${c.name}` })));
        }
      } catch (err) {
        console.error("Error fetching countries:", err);
      }
    };
    fetchCountries();
  }, []);

  const [previewState, setPreviewState] = useState("Gujarat");
  const [previewBill, setPreviewBill] = useState(2500);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, typesRes] = await Promise.all([
        fetch(`${API_BASE}/api/eligibility-settings`, {
          headers: { 'x-country': selectedCountry }
        }),
        fetch(`${API_BASE}/api/project-types?country=${selectedCountry}`)
      ]);

      const data = await settingsRes.json();
      const typesData = await typesRes.json();

      let dbProjectTypes = [];
      if (typesData.success && typesData.data) {
        dbProjectTypes = typesData.data;
      }

      const existingSettingsCategories = data.success ? data.data?.projectCategories : [];
      const baseCategories = (existingSettingsCategories?.length > 0) ? existingSettingsCategories : clone(DEFAULT_SETTINGS.projectCategories);

      let countryCategories = dbProjectTypes.map(pt => {
        const existing = baseCategories.find(c => c.id === (pt.id || pt._id) || c.name === pt.name) || {};
        return {
          id: pt.id || pt._id,
          name: pt.name,
          description: pt.description || existing.description || "",
          enabled: existing.enabled !== undefined ? existing.enabled : true,
          minKW: existing.minKW !== undefined ? existing.minKW : 1,
          maxKW: existing.maxKW !== undefined ? existing.maxKW : 10,
          subsidyEligible: existing.subsidyEligible !== undefined ? existing.subsidyEligible : false,
          maxSubsidyAmount: existing.maxSubsidyAmount !== undefined ? existing.maxSubsidyAmount : 0
        };
      });

      if (countryCategories.length === 0) {
        countryCategories = selectedCountry === 'india' 
          ? [
              { id: "residential", name: "Residential Solar", enabled: true, minKW: 1, maxKW: 10, subsidyEligible: true, maxSubsidyAmount: 78000, description: "Single family homes, apartments" },
              { id: "commercial", name: "Commercial Solar", enabled: true, minKW: 10, maxKW: 500, subsidyEligible: false, maxSubsidyAmount: 0, description: "Shops, offices, factories" }
            ]
          : selectedCountry === 'australia'
          ? [
              { id: "residential", name: "Residential Solar", enabled: true, minKW: 1, maxKW: 10, subsidyEligible: true, maxSubsidyAmount: 0, description: "Residential solar systems (CEC 12 Steps)" },
              { id: "commercial", name: "Commercial Solar", enabled: true, minKW: 10, maxKW: 500, subsidyEligible: false, maxSubsidyAmount: 0, description: "Commercial rooftop solar (14 Steps)" },
              { id: "solar-battery", name: "Solar + Battery", enabled: true, minKW: 5, maxKW: 50, subsidyEligible: true, maxSubsidyAmount: 0, description: "Solar PV + BESS battery storage (13 Steps)" },
              { id: "farm-rural", name: "Farm / Rural Solar", enabled: true, minKW: 10, maxKW: 500, subsidyEligible: false, maxSubsidyAmount: 0, description: "Agricultural, rural & off-grid solar (14 Steps)" },
              { id: "community-strata", name: "Community / Strata Solar", enabled: true, minKW: 20, maxKW: 1000, subsidyEligible: false, maxSubsidyAmount: 0, description: "Multi-tenant body corporate embedded network (15 Steps)" }
            ]
          : clone(DEFAULT_SETTINGS.projectCategories);
      }

      if (data.success) {
        const merged = {
          ...clone(DEFAULT_SETTINGS),
          ...data.data,
          projectCategories: countryCategories,
          eligibilityRules: {
            ...clone(DEFAULT_SETTINGS.eligibilityRules),
            ...(data.data?.eligibilityRules || {}),
          },
        };
        setSettings(merged);
        setUsingFallback(false);
      } else {
        const fallback = clone(DEFAULT_SETTINGS);
        fallback.projectCategories = countryCategories;
        setSettings(fallback);
        setUsingFallback(true);
      }
    } catch {
      const fallback = clone(DEFAULT_SETTINGS);
      fallback.projectCategories = selectedCountry === 'india' 
        ? [
            { id: "residential", name: "Residential Solar", enabled: true, minKW: 1, maxKW: 10, subsidyEligible: true, maxSubsidyAmount: 78000, description: "Single family homes, apartments" },
            { id: "commercial", name: "Commercial Solar", enabled: true, minKW: 10, maxKW: 500, subsidyEligible: false, maxSubsidyAmount: 0, description: "Shops, offices, factories" }
          ]
        : [
            { id: "residential", name: "Residential Solar", enabled: true, minKW: 1, maxKW: 10, subsidyEligible: true, maxSubsidyAmount: 0, description: "Residential solar systems (CEC 12 Steps)" },
            { id: "commercial", name: "Commercial Solar", enabled: true, minKW: 10, maxKW: 500, subsidyEligible: false, maxSubsidyAmount: 0, description: "Commercial rooftop solar (14 Steps)" },
            { id: "solar-battery", name: "Solar + Battery", enabled: true, minKW: 5, maxKW: 50, subsidyEligible: true, maxSubsidyAmount: 0, description: "Solar PV + BESS battery storage (13 Steps)" },
            { id: "farm-rural", name: "Farm / Rural Solar", enabled: true, minKW: 10, maxKW: 500, subsidyEligible: false, maxSubsidyAmount: 0, description: "Agricultural, rural & off-grid solar (14 Steps)" },
            { id: "community-strata", name: "Community / Strata Solar", enabled: true, minKW: 20, maxKW: 1000, subsidyEligible: false, maxSubsidyAmount: 0, description: "Multi-tenant body corporate embedded network (15 Steps)" }
          ];
      setSettings(fallback);
      setUsingFallback(true);
    }
    finally { setLoading(false); }
  }, [selectedCountry]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const updatePath = (path, value) => {
    setSettings((prev) => {
      const next = clone(prev);
      let ref = next;
      for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
      ref[path[path.length - 1]] = value;
      return next;
    });
  };

  const updateItem = (arrayPath, index, field, value) => {
    setSettings((prev) => {
      const next = clone(prev);
      let ref = next;
      for (const key of arrayPath) ref = ref[key];
      ref[index][field] = value;
      return next;
    });
  };

  const removeItem = (arrayPath, index) => {
    setSettings((prev) => {
      const next = clone(prev);
      let ref = next;
      for (const key of arrayPath) ref = ref[key];
      ref.splice(index, 1);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/eligibility-settings`, { 
        method: "PUT", 
        headers: { "Content-Type": "application/json", 'x-country': selectedCountry }, 
        body: JSON.stringify(settings) 
      });
      const data = await res.json();
      if (data.success) { showToast("success", "Settings saved!"); setUsingFallback(false); }
      else showToast("error", "Save failed");
    } catch { showToast("error", "Backend not connected. Saved locally only."); }
    finally { setSaving(false); }
  };

  const show = (s) => !section || section === s;

  const getKwForBill = (bill) => {
    if (!settings) return 1;
    const ranges = settings.eligibilityRules?.billToKwRanges || DEFAULT_SETTINGS.eligibilityRules.billToKwRanges;
    const match = ranges.find(r => bill >= r.minBill && bill <= r.maxBill);
    return match ? match.suggestedKW : 1;
  };



  const getSubsidyPreview = () => {
    const kw = getKwForBill(previewBill);
    const central = calcCentralSubsidy(Math.min(kw, 3));
    const stateData = settings.eligibilityRules?.stateSubsidies?.find(s => s.state.toLowerCase() === previewState.toLowerCase()) || { stateSubsidyPerKW: 0, stateSubsidyMax: 0 };
    const stateSubsidy = Math.min(stateData.stateSubsidyPerKW * Math.min(kw, 3), stateData.stateSubsidyMax);
    const total = central + stateSubsidy;
    return { kw, central, stateSubsidy, total, stateData };
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      <p className="text-sm font-medium">Loading eligibility settings...</p>
    </div>
  );

  const pageTitle = section ? SECTION_TITLES[section] || "Customer Eligibility" : "Customer Eligibility Settings";
  const preview = getSubsidyPreview();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      {/* ── Country Pill Selector Bar (Matching Image 2) ────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100/80 p-2 rounded-2xl border border-slate-200">
        {countries.map((c) => (
          <button
            key={c.code}
            onClick={() => setSelectedCountry(c.code)}
            className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${
              selectedCountry === c.code
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-[1.02]"
                : "bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200/60"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center">
            <Zap className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">{pageTitle} — {selectedCountry.toUpperCase()}</h1>
            <p className="text-xs text-slate-500">{section ? `Customer Eligibility → ${SECTION_TITLES[section]}` : `Configure solar recommendation, kW derivation & ${selectedCountry === 'australia' ? 'STC rebate' : 'subsidy'} rules`}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchSettings} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-900 bg-yellow-400 rounded-xl hover:bg-amber-400 transition shadow-sm disabled:opacity-50">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? "Saving..." : `Save ${selectedCountry.toUpperCase()} Settings`}
          </button>
        </div>
      </div>

      {usingFallback && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Backend connect nahi hua — default settings dikh rahi hain. Save karne pe store ho jayega.</span>
        </div>
      )}

      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* ── LIVE SUBSIDY PREVIEW CARD ─────────────────────────── */}
      {(!section || section === "stateSubsidy" || section === "billToKwRanges") && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee className="w-5 h-5 text-yellow-600" />
            <h3 className="text-sm font-bold text-slate-800">Live Subsidy Preview</h3>
            <span className="text-[10px] bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-bold">DYNAMIC</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Monthly Bill (₹)</label>
              <input type="number" value={previewBill} onChange={(e) => setPreviewBill(Number(e.target.value))}
                className="w-full text-sm border border-yellow-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40" placeholder="2500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">State</label>
              <select value={previewState} onChange={(e) => setPreviewState(e.target.value)}
                className="w-full text-sm border border-yellow-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40">
                {(settings?.eligibilityRules?.stateSubsidies || DEFAULT_SETTINGS.eligibilityRules.stateSubsidies).map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-3 border border-yellow-100 text-center">
              <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Suggested KW</p>
              <p className="text-xl font-black text-yellow-600">{preview.kw} kW</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-blue-100 text-center">
              <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Central Subsidy</p>
              <p className="text-base font-black text-blue-600">₹{preview.central.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-green-100 text-center">
              <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">{previewState} State</p>
              <p className="text-base font-black text-green-600">₹{preview.stateSubsidy.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-yellow-400 rounded-xl p-3 text-center">
              <p className="text-[10px] text-yellow-900 font-bold uppercase mb-1">Total Subsidy</p>
              <p className="text-base font-black text-yellow-900">₹{preview.total.toLocaleString("en-IN")}</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            <span className="font-semibold">{previewState}:</span> {preview.stateData.stateScheme} • Agency: {preview.stateData.agency} • {preview.stateData.notes}
          </p>
        </div>
      )}

      {/* ── LIVE STC REBATE PREVIEW CARD FOR AUSTRALIA ────────────────── */}
      {selectedCountry === "australia" && (
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-800">Australia STC Rebate Config & Live Preview</h3>
            <span className="text-[10px] bg-sky-200 text-sky-800 px-2 py-0.5 rounded-full font-bold">AUSTRALIA LIVE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Field label="STC Price per Certificate ($)" value={settings.stcRules?.stcPrice || 38} onChange={(v) => updatePath(["stcRules", "stcPrice"], v)} type="number" hint="Current market STC price (default $38)" />
            <Field label="Deeming Period (Years)" value={settings.stcRules?.deemingYears || 5} onChange={(v) => updatePath(["stcRules", "deemingYears"], v)} type="number" hint="Remaining STC deeming years" />
            <Field label="System Cost per kW ($)" value={settings.stcRules?.systemCostPerKw || 1100} onChange={(v) => updatePath(["stcRules", "systemCostPerKw"], v)} type="number" hint="Base install cost per kW (default $1,100)" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-sky-100 mb-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Zone 1 Rating</label>
              <input type="number" step="0.001" value={settings.stcRules?.zones?.zone1 || 1.622} onChange={(v) => updatePath(["stcRules", "zones", "zone1"], Number(v.target.value))} className="w-full text-xs font-bold border border-slate-200 rounded-lg px-2.5 py-1.5 mt-1" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Zone 2 Rating</label>
              <input type="number" step="0.001" value={settings.stcRules?.zones?.zone2 || 1.536} onChange={(v) => updatePath(["stcRules", "zones", "zone2"], Number(v.target.value))} className="w-full text-xs font-bold border border-slate-200 rounded-lg px-2.5 py-1.5 mt-1" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Zone 3 Rating</label>
              <input type="number" step="0.001" value={settings.stcRules?.zones?.zone3 || 1.382} onChange={(v) => updatePath(["stcRules", "zones", "zone3"], Number(v.target.value))} className="w-full text-xs font-bold border border-slate-200 rounded-lg px-2.5 py-1.5 mt-1" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Zone 4 Rating</label>
              <input type="number" step="0.001" value={settings.stcRules?.zones?.zone4 || 1.185} onChange={(v) => updatePath(["stcRules", "zones", "zone4"], Number(v.target.value))} className="w-full text-xs font-bold border border-slate-200 rounded-lg px-2.5 py-1.5 mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-3 border border-sky-100 text-center">
              <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Example 6.6 kW System</p>
              <p className="text-xl font-black text-sky-600">6.6 kW</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-emerald-100 text-center">
              <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Zone 3 STC Count</p>
              <p className="text-xl font-black text-emerald-600">{Math.floor(6.6 * (settings.stcRules?.zones?.zone3 || 1.382) * (settings.stcRules?.deemingYears || 5))} STCs</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-blue-100 text-center">
              <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Est. STC Rebate Value</p>
              <p className="text-xl font-black text-blue-700">${(Math.floor(6.6 * (settings.stcRules?.zones?.zone3 || 1.382) * (settings.stcRules?.deemingYears || 5)) * (settings.stcRules?.stcPrice || 38)).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── 1. BILL → KW MAPPING ──────────────────────────────── */}
      {show("billToKwRanges") && (
        <SectionCard title="Bill Amount → KW Auto-Suggest Rules" icon={<SlidersHorizontal className="w-5 h-5" />} badge={`${settings.eligibilityRules?.billToKwRanges?.length || 0} Ranges`}>
          <div className="space-y-3 pt-4">
            <p className="text-xs text-slate-500">User ka monthly bill jis range mein aata hai, ussi hisaab se auto-suggest kW milega. Ye ranges admin set karta hai.</p>
            <div className="grid grid-cols-4 gap-2 px-2 py-1 bg-slate-50 rounded-lg">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Min Bill (₹)</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Max Bill (₹)</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Suggest KW</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Label</span>
            </div>
            {(settings.eligibilityRules?.billToKwRanges || []).map((range, i) => (
              <div key={range.id || i} className="grid grid-cols-4 gap-2 items-end bg-slate-50 rounded-xl p-3 border border-slate-100">
                <Field label="" value={range.minBill} onChange={(v) => updateItem(["eligibilityRules", "billToKwRanges"], i, "minBill", v)} type="number" placeholder="0" />
                <Field label="" value={range.maxBill} onChange={(v) => updateItem(["eligibilityRules", "billToKwRanges"], i, "maxBill", v)} type="number" placeholder="1000" />
                <Field label="" value={range.suggestedKW} onChange={(v) => updateItem(["eligibilityRules", "billToKwRanges"], i, "suggestedKW", v)} type="number" placeholder="1" />
                <div className="flex items-end gap-2">
                  <Field label="" value={range.label} onChange={(v) => updateItem(["eligibilityRules", "billToKwRanges"], i, "label", v)} placeholder="Low range" />
                  <button onClick={() => removeItem(["eligibilityRules", "billToKwRanges"], i)} className="mb-0.5 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button onClick={() => {
              setSettings((prev) => {
                const next = clone(prev);
                if (!next.eligibilityRules) next.eligibilityRules = {};
                if (!next.eligibilityRules.billToKwRanges) next.eligibilityRules.billToKwRanges = [];
                next.eligibilityRules.billToKwRanges.push({ id: `r-${Date.now()}`, minBill: 0, maxBill: 1000, suggestedKW: 1, label: "" });
                return next;
              });
            }} className="flex items-center gap-2 text-xs font-semibold text-yellow-500 hover:text-amber-600 transition">
              <Plus className="w-4 h-4" /> Add Range
            </button>
          </div>
        </SectionCard>
      )}

      {/* ── 2. STATE-WISE SUBSIDY ─────────────────────────────── */}
      {show("stateSubsidy") && (
        <SectionCard title="State-wise Subsidy Configuration" icon={<MapPin className="w-5 h-5" />} badge={`${settings?.eligibilityRules?.stateSubsidies?.length || 0} States`}>
          <div className="space-y-3 pt-4">
            <p className="text-xs text-slate-500">
              Har state ka 1kW, 2kW, 3kW ke liye total subsidy (Central + State) dikh raha hai.
              Central subsidy formula-based hai: ₹30,000/kW upto 2kW, ₹18,000 3rd kW, max ₹78,000.
            </p>

            {/* Legend */}
            <div className="flex items-center gap-4 flex-wrap text-[11px]">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-300 inline-block" /><span className="text-slate-500">Central Subsidy (same for all states)</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-100 border border-green-300 inline-block" /><span className="text-slate-500">+ State Extra Subsidy (add hogi upar se)</span></div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 rounded-lg">
                    <th className="text-left px-3 py-2 font-bold text-slate-500 uppercase">State</th>
                    <th className="text-right px-3 py-2 font-bold text-blue-500 uppercase">1 kW Central</th>
                    <th className="text-right px-3 py-2 font-bold text-blue-600 uppercase">2 kW Central</th>
                    <th className="text-right px-3 py-2 font-bold text-blue-700 uppercase">3 kW Central</th>
                    <th className="text-right px-3 py-2 font-bold text-green-600 uppercase">+ State Subsidy</th>
                    <th className="text-left px-3 py-2 font-bold text-slate-500 uppercase">Agency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(settings.eligibilityRules?.stateSubsidies || []).map((s, idx) => {
                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-yellow-50/50 transition ${previewState === s.state ? "bg-yellow-50 border-l-2 border-yellow-400" : ""}`}
                      >
                        <td className="px-2 py-2.5 font-semibold text-slate-700">
                          <input type="text" value={s.state} onChange={(e) => updateItem(["eligibilityRules", "stateSubsidies"], idx, "state", e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400" />
                        </td>
                        <td className="px-2 py-2.5 text-right font-bold text-blue-500">₹30,000</td>
                        <td className="px-2 py-2.5 text-right font-bold text-blue-600">₹60,000</td>
                        <td className="px-2 py-2.5 text-right font-black text-blue-700">₹78,000</td>
                        <td className="px-2 py-2.5 text-right font-bold">
                          <div className="flex flex-col gap-1 items-end">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-normal text-slate-400">Max ₹</span>
                              <input type="number" value={s.stateSubsidyMax} onChange={(e) => updateItem(["eligibilityRules", "stateSubsidies"], idx, "stateSubsidyMax", Number(e.target.value))}
                                className="w-20 text-xs border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-green-400 text-right" />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-normal text-slate-400">Per kW ₹</span>
                              <input type="number" value={s.stateSubsidyPerKW} onChange={(e) => updateItem(["eligibilityRules", "stateSubsidies"], idx, "stateSubsidyPerKW", Number(e.target.value))}
                                className="w-20 text-xs border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-green-400 text-right" />
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2.5 flex items-center justify-between gap-2">
                          <div className="flex flex-col gap-1 w-full">
                            <input type="text" value={s.stateScheme} onChange={(e) => updateItem(["eligibilityRules", "stateSubsidies"], idx, "stateScheme", e.target.value)}
                                className="w-full text-[10px] border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400" placeholder="Scheme Name" />
                            <input type="text" value={s.agency} onChange={(e) => updateItem(["eligibilityRules", "stateSubsidies"], idx, "agency", e.target.value)}
                                className="w-full text-[10px] border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400" placeholder="Agency" />
                          </div>
                          <button onClick={() => removeItem(["eligibilityRules", "stateSubsidies"], idx)} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-2">
              <Info className="w-3 h-3 shrink-0" />
              Values are automatically saved when you click "Save Changes" at the top.
            </p>
            <button onClick={() => setSettings((prev) => { const next = clone(prev); if (!next.eligibilityRules.stateSubsidies) next.eligibilityRules.stateSubsidies = []; next.eligibilityRules.stateSubsidies.push({ state: "New State", stateSubsidyPerKW: 0, stateSubsidyMax: 0, stateScheme: "", agency: "" }); return next; })} className="mt-3 flex items-center gap-2 text-xs font-semibold text-yellow-500 hover:text-amber-600 transition">
              <Plus className="w-4 h-4" /> Add State Subsidy
            </button>
          </div>
        </SectionCard>
      )}

      {/* ── 3. PROJECT CATEGORIES ─────────────────────────────── */}
      {show("projectCategories") && (
        <SectionCard title="Project Category Configuration" icon={<SlidersHorizontal className="w-5 h-5" />} badge={`${settings.projectCategories?.length || 0} Categories`}>
          <div className="space-y-4 pt-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs flex items-center justify-between text-blue-800">
              <span className="font-bold">⚡ AUTO-SYNC CONNECTED:</span>
              <span className="text-[11px]">Yhan naye project categories add/edit karne par vo automatically <strong className="underline">Order Journey Settings</strong> aur <strong className="underline">Website CMS</strong> me ({selectedCountry.toUpperCase()}) sync ho jayenge.</span>
            </div>
            {(settings.projectCategories || []).map((cat, i) => (
              <div key={cat.id || i} className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Category #{i + 1}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${cat.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{cat.enabled ? "Enabled" : "Disabled"}</span>
                  </div>
                  <button onClick={() => removeItem(["projectCategories"], i)} className="p-1 text-red-400 hover:text-red-600 rounded transition"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Category Name" value={cat.name} onChange={(v) => updateItem(["projectCategories"], i, "name", v)} placeholder="e.g. Residential Solar" />
                  <Field label="Description" value={cat.description} onChange={(v) => updateItem(["projectCategories"], i, "description", v)} placeholder="Short description" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Min KW" value={cat.minKW} onChange={(v) => updateItem(["projectCategories"], i, "minKW", v)} type="number" />
                  <Field label="Max KW" value={cat.maxKW} onChange={(v) => updateItem(["projectCategories"], i, "maxKW", v)} type="number" />
                  <Field label="Max Subsidy (₹)" value={cat.maxSubsidyAmount} onChange={(v) => updateItem(["projectCategories"], i, "maxSubsidyAmount", v)} type="number" />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Toggle label="Category Enabled" checked={cat.enabled} onChange={(v) => updateItem(["projectCategories"], i, "enabled", v)} />
                  <Toggle label="Subsidy Eligible" checked={cat.subsidyEligible} onChange={(v) => updateItem(["projectCategories"], i, "subsidyEligible", v)} desc="PM Surya Ghar subsidy applicable" />
                </div>
              </div>
            ))}
            <button onClick={() => setSettings((prev) => { const next = clone(prev); if (!next.projectCategories) next.projectCategories = []; next.projectCategories.push({ id: `cat-${Date.now()}`, name: "", enabled: true, minKW: 1, maxKW: 10, subsidyEligible: false, maxSubsidyAmount: 0, description: "" }); return next; })} className="flex items-center gap-2 text-xs font-semibold text-yellow-500 hover:text-amber-600 transition">
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>
        </SectionCard>
      )}

      {/* ── 4. INVERTER TYPES ─────────────────────────────────── */}
      {show("inverterTypes") && (
        <SectionCard title="Inverter Type Settings" icon={<Zap className="w-5 h-5" />} badge={`${settings.inverterTypes?.length || 0} Types`}>
          <div className="space-y-4 pt-4">
            {(settings.inverterTypes || []).map((inv, i) => (
              <div key={inv.id || i} className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Inverter #{i + 1}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${inv.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{inv.enabled ? "Active" : "Inactive"}</span>
                  </div>
                  <button onClick={() => removeItem(["inverterTypes"], i)} className="p-1 text-red-400 hover:text-red-600 rounded transition"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Inverter Name" value={inv.name} onChange={(v) => updateItem(["inverterTypes"], i, "name", v)} placeholder="e.g. String Inverter" />
                  <Field label="Efficiency (%)" value={inv.efficiency} onChange={(v) => updateItem(["inverterTypes"], i, "efficiency", v)} type="number" />
                </div>
                <Field label="Description" value={inv.description} onChange={(v) => updateItem(["inverterTypes"], i, "description", v)} placeholder="Brief description" />
                <Toggle label="Inverter Enabled" checked={inv.enabled} onChange={(v) => updateItem(["inverterTypes"], i, "enabled", v)} desc="Disable to hide from customer project selection" />
              </div>
            ))}
            <button onClick={() => setSettings((prev) => { const next = clone(prev); if (!next.inverterTypes) next.inverterTypes = []; next.inverterTypes.push({ id: `inv-${Date.now()}`, name: "", enabled: true, efficiency: 97, suitableFor: [], description: "" }); return next; })} className="flex items-center gap-2 text-xs font-semibold text-yellow-500 hover:text-amber-600 transition">
              <Plus className="w-4 h-4" /> Add Inverter Type
            </button>
          </div>
        </SectionCard>
      )}

      {/* ── 5. METER CATEGORIES ───────────────────────────────── */}
      {show("meterCategories") && (
        <SectionCard title="Customer Meter Category Wise Eligibility" icon={<SlidersHorizontal className="w-5 h-5" />}>
          <div className="space-y-4 pt-4">
            {(settings.eligibilityRules?.meterCategories || []).map((mc, i) => (
              <div key={i} className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Meter Category #{i + 1}</span>
                  <button onClick={() => removeItem(["eligibilityRules", "meterCategories"], i)} className="p-1 text-red-400 hover:text-red-600 rounded transition"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Category Name" value={mc.category} onChange={(v) => updateItem(["eligibilityRules", "meterCategories"], i, "category", v)} placeholder="e.g. Residential (LT-1)" />
                  <Field label="Min Monthly Bill (₹)" value={mc.minMonthlyBill} onChange={(v) => updateItem(["eligibilityRules", "meterCategories"], i, "minMonthlyBill", v)} type="number" />
                  <Field label="Max Monthly Bill (₹)" value={mc.maxMonthlyBill} onChange={(v) => updateItem(["eligibilityRules", "meterCategories"], i, "maxMonthlyBill", v)} type="number" />
                </div>
                <Toggle label="Eligible for Solar" checked={mc.eligible} onChange={(v) => updateItem(["eligibilityRules", "meterCategories"], i, "eligible", v)} />
              </div>
            ))}
            <button onClick={() => setSettings((prev) => { const next = clone(prev); if (!next.eligibilityRules) next.eligibilityRules = {}; if (!next.eligibilityRules.meterCategories) next.eligibilityRules.meterCategories = []; next.eligibilityRules.meterCategories.push({ category: "", eligible: true, minMonthlyBill: 500, maxMonthlyBill: 50000 }); return next; })} className="flex items-center gap-2 text-xs font-semibold text-yellow-500 hover:text-amber-600 transition">
              <Plus className="w-4 h-4" /> Add Meter Category
            </button>
          </div>
        </SectionCard>
      )}

      {/* ── 6. BILL STATUS RULES ──────────────────────────────── */}
      {show("billStatusRules") && (
        <SectionCard title="Bill Status Validation Rules" icon={<SlidersHorizontal className="w-5 h-5" />}>
          <div className="space-y-1 pt-4">
            <Toggle label="Paid Bill Allowed" checked={settings.eligibilityRules?.billStatusRules?.paidBillAllowed} onChange={(v) => updatePath(["eligibilityRules", "billStatusRules", "paidBillAllowed"], v)} desc="Cleared bills wale apply kar sakte hain" />
            <Toggle label="Due Bill Allowed" checked={settings.eligibilityRules?.billStatusRules?.dueBillAllowed} onChange={(v) => updatePath(["eligibilityRules", "billStatusRules", "dueBillAllowed"], v)} desc="Current month due wale apply kar sakte hain" />
            <Toggle label="Pending Bill Allowed" checked={settings.eligibilityRules?.billStatusRules?.pendingBillAllowed} onChange={(v) => updatePath(["eligibilityRules", "billStatusRules", "pendingBillAllowed"], v)} desc="Pending payment wale apply kar sakte hain" />
            <div className="pt-3">
              <Field label="Max Overdue Months Allowed" value={settings.eligibilityRules?.billStatusRules?.overdueMaxMonths} onChange={(v) => updatePath(["eligibilityRules", "billStatusRules", "overdueMaxMonths"], v)} type="number" hint="Isse zyada months overdue ho toh block karein" />
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── 7. KW DERIVATION RULES ────────────────────────────── */}
      {show("kwDerivationRules") && (
        <SectionCard title="KW Derivation & Auto-Suggest Rules" icon={<Zap className="w-5 h-5" />}>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Field label="Units Per KW Per Month" value={settings.eligibilityRules?.kwDerivationRules?.unitsPerKW} onChange={(v) => updatePath(["eligibilityRules", "kwDerivationRules", "unitsPerKW"], v)} type="number" hint="1 KW panel ≈ 90 units/month" />
            <Field label="Safety Buffer Multiplier" value={settings.eligibilityRules?.kwDerivationRules?.safetyBuffer} onChange={(v) => updatePath(["eligibilityRules", "kwDerivationRules", "safetyBuffer"], v)} type="number" hint="1.1 = 10% extra capacity buffer" />
            <Field label="Round Up To Nearest (KW)" value={settings.eligibilityRules?.kwDerivationRules?.roundUpToNext} onChange={(v) => updatePath(["eligibilityRules", "kwDerivationRules", "roundUpToNext"], v)} type="number" hint="0.5 = round to nearest 0.5 KW" />
            <Field label="Max Auto-Suggest KW" value={settings.eligibilityRules?.kwDerivationRules?.maxAutoSuggestKW} onChange={(v) => updatePath(["eligibilityRules", "kwDerivationRules", "maxAutoSuggestKW"], v)} type="number" hint="System se zyada suggest nahi karega" />
          </div>
        </SectionCard>
      )}

      {/* ── 8. SUBSIDY CRITERIA ───────────────────────────────── */}
      {show("subsidyCriteria") && (
        <SectionCard title="Subsidy Eligibility Criteria" icon={<Zap className="w-5 h-5" />}>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Field label="Min Monthly Units for Subsidy" value={settings.eligibilityRules?.subsidyCriteria?.minMonthlyUnits} onChange={(v) => updatePath(["eligibilityRules", "subsidyCriteria", "minMonthlyUnits"], v)} type="number" />
            <Field label="Max Monthly Units for Subsidy" value={settings.eligibilityRules?.subsidyCriteria?.maxMonthlyUnits} onChange={(v) => updatePath(["eligibilityRules", "subsidyCriteria", "maxMonthlyUnits"], v)} type="number" />
            <Field label="Max Subsidy KW (PM Surya Ghar)" value={settings.eligibilityRules?.subsidyCriteria?.maxSubsidyKW} onChange={(v) => updatePath(["eligibilityRules", "subsidyCriteria", "maxSubsidyKW"], v)} type="number" hint="3 KW tak hi central subsidy milti hai" />
          </div>
        </SectionCard>
      )}

      {/* ── 9. DUE AMOUNT THRESHOLD ───────────────────────────── */}
      {show("dueAmountThreshold") && (
        <SectionCard title="Due Amount Threshold Settings" icon={<AlertCircle className="w-5 h-5" />}>
          <div className="space-y-1 pt-4">
            <Toggle label="Due Amount Check Enabled" checked={settings.eligibilityRules?.dueAmountThreshold?.enabled} onChange={(v) => updatePath(["eligibilityRules", "dueAmountThreshold", "enabled"], v)} />
            <div className="py-2">
              <Field label="Max Allowed Due Amount (₹)" value={settings.eligibilityRules?.dueAmountThreshold?.maxAllowedDueAmount} onChange={(v) => updatePath(["eligibilityRules", "dueAmountThreshold", "maxAllowedDueAmount"], v)} type="number" hint="Isse zyada due ho toh action lena" />
            </div>
            <Toggle label="Block Application if Exceeds" checked={settings.eligibilityRules?.dueAmountThreshold?.blockIfExceeds} onChange={(v) => updatePath(["eligibilityRules", "dueAmountThreshold", "blockIfExceeds"], v)} desc="Hard block — application submit nahi hogi" />
            <Toggle label="Show Warning if Exceeds" checked={settings.eligibilityRules?.dueAmountThreshold?.showWarningIfExceeds} onChange={(v) => updatePath(["eligibilityRules", "dueAmountThreshold", "showWarningIfExceeds"], v)} desc="Soft warning — apply kar sakta hai phir bhi" />
          </div>
        </SectionCard>
      )}

      {/* ── Bottom Save ───────────────────────────────────────── */}
      <div className="flex justify-end pb-8">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-8 py-3 text-sm font-bold text-slate-900 bg-yellow-400 rounded-xl hover:bg-amber-400 transition shadow-md disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>
    </div>
  );
};