/**
 * EpcWalletSettingsScreen — Admin panel tab
 * Boss yahan se configure karta hai:
 *  - Price per KW credit
 *  - Free trial KW limit per EPC partner
 *  - Recharge packages (name, KW, price, discount)
 * API: GET/PUT /api/epc/wallet/settings
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet, Save, RefreshCw, Plus, Trash2,
  ChevronDown, ChevronUp, AlertCircle, CheckCircle,
  Loader2, Info, ToggleLeft, ToggleRight, Star,
  IndianRupee, Zap, TrendingUp,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";
const clone = (obj) => JSON.parse(JSON.stringify(obj));

// ── Reusable UI ───────────────────────────────────────────────────────────────
const Field = ({ label, value, onChange, type = "text", placeholder = "", hint, prefix }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">{prefix}</span>
      )}
      <input
        type={type}
        className={`w-full text-sm border border-slate-200 rounded-xl py-2 pr-3 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 ${prefix ? "pl-7" : "px-3"}`}
        value={value ?? ""}
        onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder}
      />
    </div>
    {hint && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
  </div>
);

const Toggle = ({ label, checked, onChange, desc }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
    </div>
    <button onClick={() => onChange(!checked)} className="shrink-0 ml-4">
      {checked ? <ToggleRight className="w-8 h-8 text-yellow-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
    </button>
  </div>
);

const PROJECT_TYPES = [
  'Surya Ghar Yojana', 'Group Solar', 'Village Solar Campaign',
  'Commercial Solar', 'Residential Solar',
];

// ── Default fallback ──────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  pricePerKW: 500,
  freeTrialKwLimit: 10,
  minRechargeKW: 5,
  maxRechargeKW: 1000,
  lowBalanceAlertKW: 5,
  autoRefillEnabled: false,
  rechargePackages: [
    { id: 'starter', name: 'Starter Pack', kw: 20,  price: 9000,  discount: 10, popular: false, description: 'Small installs ke liye', enabled: true },
    { id: 'popular', name: 'Popular Pack', kw: 50,  price: 20000, discount: 20, popular: true,  description: 'Most preferred by EPC partners', enabled: true },
    { id: 'pro',     name: 'Pro Pack',     kw: 100, price: 35000, discount: 30, popular: false, description: 'High volume installers', enabled: true },
    { id: 'elite',   name: 'Elite Pack',   kw: 250, price: 75000, discount: 40, popular: false, description: 'Enterprise level', enabled: true },
  ],
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export const EpcWalletSettingsScreen = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/epc/wallet/settings`);
      const data = await res.json();
      if (data.success) { setSettings(data.data); setUsingFallback(false); }
      else { setSettings(clone(DEFAULT_SETTINGS)); setUsingFallback(true); }
    } catch {
      setSettings(clone(DEFAULT_SETTINGS));
      setUsingFallback(true);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const update = (key, value) => setSettings(prev => ({ ...clone(prev), [key]: value }));

  const updatePackage = (i, field, value) => {
    setSettings(prev => {
      const next = clone(prev);
      next.rechargePackages[i][field] = value;
      return next;
    });
  };

  const removePackage = (i) => {
    setSettings(prev => {
      const next = clone(prev);
      next.rechargePackages.splice(i, 1);
      return next;
    });
  };

  const addPackage = () => {
    setSettings(prev => {
      const next = clone(prev);
      next.rechargePackages.push({
        id: `pkg-${Date.now()}`,
        name: '',
        kw: 50,
        price: 20000,
        discount: 0,
        popular: false,
        description: '',
        enabled: true,
      });
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/epc/wallet/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) { showToast('success', 'Wallet settings saved!'); setUsingFallback(false); }
      else showToast('error', 'Save failed');
    } catch { showToast('error', 'Backend not connected.'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      <p className="text-sm font-medium">Loading wallet settings...</p>
    </div>
  );

  // Effective price per KW after volume (for preview)
  const effectivePrice = settings?.pricePerKW || 500;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">EPC Wallet Settings</h1>
            <p className="text-xs text-slate-500">KW credit pricing, free trial, aur recharge packages configure karo</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchSettings} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-900 bg-yellow-400 rounded-xl hover:bg-amber-400 transition shadow-sm disabled:opacity-50">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? "Saving..." : "Save Settings"}
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

      {/* ── Live Preview ── */}
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-yellow-600" />
          <h3 className="text-sm font-bold text-slate-800">Live Pricing Preview</h3>
          <span className="text-[10px] bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-bold">DYNAMIC</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-3 border border-yellow-100 text-center">
            <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Price / KW</p>
            <p className="text-xl font-black text-yellow-600">₹{(settings?.pricePerKW || 500).toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-blue-100 text-center">
            <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Free Trial</p>
            <p className="text-xl font-black text-blue-600">{settings?.freeTrialKwLimit || 10} KW</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-green-100 text-center">
            <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Min Purchase</p>
            <p className="text-xl font-black text-green-600">{settings?.minRechargeKW || 5} KW</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-purple-100 text-center">
            <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Low Balance Alert</p>
            <p className="text-xl font-black text-purple-600">{settings?.lowBalanceAlertKW || 5} KW</p>
          </div>
        </div>
      </div>

      {/* ── Core Pricing Settings ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <IndianRupee className="w-4 h-4 text-yellow-500" />
          <h3 className="text-sm font-bold text-slate-800">Core Pricing & Limits</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Price Per KW Credit (₹)"
            value={settings?.pricePerKW}
            onChange={(v) => update('pricePerKW', v)}
            type="number"
            prefix="₹"
            hint="Har 1 KW purchase ki price — EPC portal mein yahi dikhega"
          />
          <Field
            label="Free Trial KW Per EPC Partner"
            value={settings?.freeTrialKwLimit}
            onChange={(v) => update('freeTrialKwLimit', v)}
            type="number"
            hint="Naye EPC ko signup pe itna free KW milega (no payment needed)"
          />
          <Field
            label="Minimum Recharge (KW)"
            value={settings?.minRechargeKW}
            onChange={(v) => update('minRechargeKW', v)}
            type="number"
            hint="EPC isse kam KW purchase nahi kar sakta"
          />
          <Field
            label="Maximum Recharge (KW)"
            value={settings?.maxRechargeKW}
            onChange={(v) => update('maxRechargeKW', v)}
            type="number"
            hint="Single transaction mein max KW"
          />
          <Field
            label="Low Balance Alert (KW)"
            value={settings?.lowBalanceAlertKW}
            onChange={(v) => update('lowBalanceAlertKW', v)}
            type="number"
            hint="Wallet balance isse kam ho toh EPC ko notification jaega"
          />
        </div>
        <Toggle
          label="Auto Refill Enabled"
          checked={settings?.autoRefillEnabled}
          onChange={(v) => update('autoRefillEnabled', v)}
          desc="Jab balance low ho tab automatically minimum pack purchase karo (payment gateway integration needed)"
        />
      </div>

      {/* ── Recharge Packages ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <h3 className="text-sm font-bold text-slate-800">Recharge Packages</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
              {settings?.rechargePackages?.length || 0} Packages
            </span>
          </div>
          <button onClick={addPackage} className="flex items-center gap-2 text-xs font-semibold text-yellow-500 hover:text-amber-600 transition">
            <Plus className="w-4 h-4" /> Add Package
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Ye packages EPC portal ke "Buy Credits" screen mein dikhenge. Popular wala highlight hoga.
        </p>

        {/* Package Cards Preview Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
          {(settings?.rechargePackages || []).filter(p => p.enabled).map((pkg, i) => (
            <div key={i} className={`relative p-3 rounded-xl border text-center ${pkg.popular ? "border-yellow-400 bg-yellow-50 shadow-md" : "border-slate-200 bg-slate-50"}`}>
              {pkg.popular && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <span className="text-[9px] font-black bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-yellow-900" /> Popular
                  </span>
                </div>
              )}
              <p className="text-xs font-bold text-slate-700 mt-1">{pkg.name}</p>
              <p className="text-lg font-black text-yellow-600 mt-0.5">{pkg.kw} KW</p>
              <p className="text-xs font-bold text-slate-800">₹{pkg.price.toLocaleString('en-IN')}</p>
              {pkg.discount > 0 && <p className="text-[10px] text-green-600 font-semibold">{pkg.discount}% off</p>}
            </div>
          ))}
        </div>

        {/* Package Editor */}
        <div className="space-y-3">
          {(settings?.rechargePackages || []).map((pkg, i) => (
            <div key={pkg.id || i} className={`border rounded-xl p-4 space-y-3 ${pkg.enabled ? "border-slate-200 bg-slate-50" : "border-slate-100 bg-slate-50 opacity-60"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Package #{i + 1}</span>
                  {pkg.popular && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200 flex items-center gap-1"><Star className="w-2.5 h-2.5" />Popular</span>}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${pkg.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {pkg.enabled ? "Visible" : "Hidden"}
                  </span>
                </div>
                <button onClick={() => removePackage(i)} className="p-1 text-red-400 hover:text-red-600 rounded transition">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Package Name"
                  value={pkg.name}
                  onChange={(v) => updatePackage(i, 'name', v)}
                  placeholder="e.g. Starter Pack"
                />
                <Field
                  label="Description"
                  value={pkg.description}
                  onChange={(v) => updatePackage(i, 'description', v)}
                  placeholder="Short description"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Field
                  label="KW Credits"
                  value={pkg.kw}
                  onChange={(v) => updatePackage(i, 'kw', v)}
                  type="number"
                  hint="KW amount included"
                />
                <Field
                  label="Price (₹)"
                  value={pkg.price}
                  onChange={(v) => updatePackage(i, 'price', v)}
                  type="number"
                  prefix="₹"
                />
                <Field
                  label="Discount (%)"
                  value={pkg.discount}
                  onChange={(v) => updatePackage(i, 'discount', v)}
                  type="number"
                  hint="0 = no discount"
                />
              </div>

              {/* Effective price per KW calculation */}
              {pkg.kw > 0 && pkg.price > 0 && (
                <div className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-slate-100">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500">
                    Effective price: <strong className="text-slate-700">₹{Math.round(pkg.price / pkg.kw).toLocaleString('en-IN')} / KW</strong>
                    {pkg.discount > 0 && <span className="ml-1 text-green-600">({pkg.discount}% cheaper than base ₹{effectivePrice}/KW)</span>}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Toggle
                  label="Mark as Popular"
                  checked={pkg.popular}
                  onChange={(v) => updatePackage(i, 'popular', v)}
                  desc="Highlighted in EPC recharge screen"
                />
                <Toggle
                  label="Package Visible"
                  checked={pkg.enabled}
                  onChange={(v) => updatePackage(i, 'enabled', v)}
                  desc="Hide/show this package"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Project Type Info ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-yellow-500" />
          <h3 className="text-sm font-bold text-slate-800">Supported Project Types</h3>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Ye project types EPC wallet mein credits track karte hain — har type ke liye alag balance rakhte hain.
        </p>
        <div className="flex flex-wrap gap-2">
          {PROJECT_TYPES.map(pt => (
            <span key={pt} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              {pt}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
          <Info className="w-3 h-3" />
          Project types change karne ke liye backend mein PROJECT_TYPES array update karo (models/EpcWallet.js).
        </p>
      </div>

      {/* Bottom Save */}
      <div className="flex justify-end pb-8">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-8 py-3 text-sm font-bold text-slate-900 bg-yellow-400 rounded-xl hover:bg-amber-400 transition shadow-md disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save All Settings"}
        </button>
      </div>
    </div>
  );
};