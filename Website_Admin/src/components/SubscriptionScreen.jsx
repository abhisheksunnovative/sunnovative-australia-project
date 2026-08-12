/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Users, Zap, CheckCircle, Plus, ArrowRight, Globe, Settings, CreditCard, Edit2, Trash2, Wrench, X
} from "lucide-react";
import { StatusBadge } from "./CommonUI";

// --- Tab Button Helper ---
const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
      active
        ? "bg-secondary text-white shadow-sm"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

export const SubscriptionScreen = () => {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [activeTab, setActiveTab] = useState("base-plans");

  // Data states
  const [basePlans, setBasePlans] = useState([]);
  const [kwPackages, setKwPackages] = useState([]);
  const [installerConfig, setInstallerConfig] = useState(null);
  
  // Loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchDataForCountry(selectedCountry);
    }
  }, [selectedCountry]);

  const fetchCountries = async () => {
    try {
      const res = await fetch("http://localhost:4005/api/countries");
      const data = await res.json();
      if (data && data.length > 0) {
        setCountries(data);
        if (!selectedCountry) setSelectedCountry(data[0].name);
      } else {
        setCountries([{ name: "India" }, { name: "Australia" }]);
        setSelectedCountry("India");
      }
    } catch (e) {
      console.error(e);
      setCountries([{ name: "India" }, { name: "Australia" }]);
      setSelectedCountry("India");
    }
  };

  const fetchDataForCountry = async (country) => {
    setLoading(true);
    try {
      // Fetch Base Plans
      const plansRes = await fetch(`http://localhost:4005/api/epc-subscription-settings/plans?country=${country}`);
      if(plansRes.ok) {
        const plansData = await plansRes.json();
        setBasePlans(plansData.success ? plansData.data : []);
      }

      // Fetch KW Packages
      const kwRes = await fetch(`http://localhost:4005/api/epc-subscription-settings/packages?country=${country}`);
      if(kwRes.ok) {
        const kwData = await kwRes.json();
        setKwPackages(kwData.success ? kwData.data : []);
      }

      // Fetch Installer Config
      const instRes = await fetch(`http://localhost:4005/api/epc-subscription-settings/installer-configs?country=${country}`);
      if(instRes.ok) {
        const instData = await instRes.json();
        setInstallerConfig(instData.success ? (instData.data[0] || instData.data) : null);
      }
    } catch (e) {
      console.error("Error fetching data", e);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER / COUNTRY SELECTOR */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">EPC Plans & Subscriptions</h2>
            <p className="text-xs text-slate-500">Configure Base Tiers, KW Packs, and Installer Capacities by country</p>
          </div>
        </div>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="text-sm font-semibold border-slate-300 rounded-lg focus:ring-secondary focus:border-secondary shadow-sm px-4 py-2"
        >
          {countries.map(c => (
            <option key={c.name || c} value={c.name || c}>{c.name || c}</option>
          ))}
        </select>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl w-max">
        <TabButton
          active={activeTab === "base-plans"}
          onClick={() => setActiveTab("base-plans")}
          icon={Users}
          label="Base Subscription Plans"
        />
        <TabButton
          active={activeTab === "kw-packs"}
          onClick={() => setActiveTab("kw-packs")}
          icon={Zap}
          label="KW Credit Packs"
        />
        <TabButton
          active={activeTab === "installer-config"}
          onClick={() => setActiveTab("installer-config")}
          icon={Wrench}
          label="Installer Capacity Rules"
        />
      </div>

      {/* TAB CONTENT */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
        {loading ? (
           <div className="py-20 text-center text-slate-500 text-sm font-bold animate-pulse">Loading settings...</div>
        ) : (
          <>
            {activeTab === "base-plans" && <BasePlansTab plans={basePlans} country={selectedCountry} onRefresh={() => fetchDataForCountry(selectedCountry)} />}
            {activeTab === "kw-packs" && <KwPacksTab packages={kwPackages} country={selectedCountry} onRefresh={() => fetchDataForCountry(selectedCountry)} />}
            {activeTab === "installer-config" && <InstallerConfigTab config={installerConfig} country={selectedCountry} onRefresh={() => fetchDataForCountry(selectedCountry)} />}
          </>
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------------
// 1. BASE PLANS TAB
// ----------------------------------------------------------------------------------
const BasePlansTab = ({ plans, country, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "Standard", minYearsExperience: 1, maxDistricts: 1, maxOrdersPerMonth: 10,
    monthlyPrice: 0, annualPrice: 0, features: "Basic Support, Limited Leads"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, country, features: formData.features.split(',').map(f => f.trim()) };
      await fetch("http://localhost:4005/api/epc-subscription-settings/plans", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      setShowModal(false);
      onRefresh();
    } catch(err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Delete this plan?")) {
      await fetch(`http://localhost:4005/api/epc-subscription-settings/plans/${id}`, { method: "DELETE" });
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-md font-bold text-slate-800">Base Plans ({country})</h3>
          <p className="text-xs text-slate-500">These dictate experience rules and region access.</p>
        </div>
        <button onClick={() => { setEditingId(null); setFormData({ name: 'Standard', minYearsExperience: 1, maxDistricts: 1, maxOrdersPerMonth: 10, monthlyPrice: 0, annualPrice: 0, features: 'Basic Support, Limited Leads' }); setShowModal(true); }} className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-secondary/90 cursor-pointer">
          <Plus className="w-4 h-4" /> Add Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {plans.length === 0 ? (
          <p className="text-sm text-slate-500 col-span-3 py-8">No base plans created yet.</p>
        ) : (
          plans.map(p => (
            <div key={p._id} className="border border-slate-200 rounded-xl p-5 shadow-sm relative group hover:border-secondary transition-colors">
              <button onClick={() => handleDelete(p._id)} className="absolute top-3 right-3 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 cursor-pointer"><Trash2 className="w-4 h-4"/></button>
              <h4 className="font-bold text-slate-800 text-lg">{p.name}</h4>
              <p className="text-2xl font-black text-secondary mt-1">₹{p.monthlyPrice}<span className="text-xs text-slate-400 font-normal">/mo</span></p>
              
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600 font-medium">
                <p className="flex justify-between"><span>Min Experience:</span> <span>{p.minYearsExperience}+ yrs</span></p>
                <p className="flex justify-between"><span>Max Districts:</span> <span>{p.maxDistricts}</span></p>
                <p className="flex justify-between"><span>Max Orders:</span> <span>{p.maxOrdersPerMonth} /mo</span></p>
              </div>
              <div className="mt-4 space-y-1.5">
                {p.features?.map((f, i) => (
                  <p key={i} className="flex items-center gap-2 text-xs text-slate-500"><CheckCircle className="w-3.5 h-3.5 text-emerald-500"/> {f}</p>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            <h3 className="text-lg font-bold text-slate-800 mb-4">{editingId ? 'Edit Base Plan' : 'Create Base Plan'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Plan Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full text-sm font-semibold rounded-lg border-slate-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Min Exp (Yrs)</label>
                  <input required type="number" value={formData.minYearsExperience} onChange={e => setFormData({...formData, minYearsExperience: e.target.value})} className="w-full text-sm font-semibold rounded-lg border-slate-300" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Max Districts</label>
                  <input required type="number" value={formData.maxDistricts} onChange={e => setFormData({...formData, maxDistricts: e.target.value})} className="w-full text-sm font-semibold rounded-lg border-slate-300" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Monthly Price (₹)</label>
                  <input required type="number" value={formData.monthlyPrice} onChange={e => setFormData({...formData, monthlyPrice: e.target.value})} className="w-full text-sm font-semibold rounded-lg border-slate-300" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Annual Price (₹)</label>
                  <input required type="number" value={formData.annualPrice} onChange={e => setFormData({...formData, annualPrice: e.target.value})} className="w-full text-sm font-semibold rounded-lg border-slate-300" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Features (comma separated)</label>
                <textarea required rows="2" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full text-sm font-semibold rounded-lg border-slate-300"></textarea>
              </div>
              <button type="submit" className="w-full bg-secondary text-white py-2.5 rounded-lg text-sm font-bold">Save Plan</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------------------
// 2. KW PACKS TAB
// ----------------------------------------------------------------------------------
const KwPacksTab = ({ packages, country, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "Starter Pack", kwAmount: 20, basePrice: 10000, discountPercent: 10, isPopular: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalPrice = Math.round(formData.basePrice - (formData.basePrice * formData.discountPercent / 100));
      const payload = { ...formData, country, finalPrice };
      await fetch("http://localhost:4005/api/epc-subscription-settings/packages", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      setShowModal(false);
      onRefresh();
    } catch(err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Delete this package?")) {
      await fetch(`http://localhost:4005/api/epc-subscription-settings/packages/${id}`, { method: "DELETE" });
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-md font-bold text-slate-800">KW Credit Packs ({country})</h3>
          <p className="text-xs text-slate-500">Packs EPCs can buy to increase their order handling limits.</p>
        </div>
        <button onClick={() => { setEditingId(null); setFormData({ name: 'Standard', minYearsExperience: 1, maxDistricts: 1, maxOrdersPerMonth: 10, monthlyPrice: 0, annualPrice: 0, features: 'Basic Support, Limited Leads' }); setShowModal(true); }} className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-secondary/90 cursor-pointer">
          <Plus className="w-4 h-4" /> Add Pack
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        {packages.length === 0 ? (
          <p className="text-sm text-slate-500 col-span-4 py-8">No packages created yet.</p>
        ) : (
          packages.map(p => (
            <div key={p._id} className="border border-slate-200 rounded-xl p-5 shadow-sm text-center relative group">
              <button onClick={() => handleDelete(p._id)} className="absolute top-2 left-2 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 cursor-pointer"><Trash2 className="w-4 h-4"/></button>
              {p.isPopular && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full absolute top-2 right-2">Popular</span>}
              <h4 className="font-bold text-slate-600 text-sm mt-3">{p.name}</h4>
              <p className="text-3xl font-black text-blue-600 mt-2">{p.kwAmount} <span className="text-sm font-bold">KW</span></p>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-lg font-bold text-slate-800">₹{p.finalPrice}</p>
                {p.discountPercent > 0 && <p className="text-xs text-emerald-600 font-bold">{p.discountPercent}% OFF (Was ₹{p.basePrice})</p>}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            <h3 className="text-lg font-bold text-slate-800 mb-4">{editingId ? 'Edit KW Pack' : 'Create KW Pack'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pack Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full text-sm font-semibold rounded-lg border-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">KW Amount</label>
                <input required type="number" value={formData.kwAmount} onChange={e => setFormData({...formData, kwAmount: e.target.value})} className="w-full text-sm font-semibold rounded-lg border-slate-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Base Price (₹)</label>
                  <input required type="number" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} className="w-full text-sm font-semibold rounded-lg border-slate-300" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Discount %</label>
                  <input required type="number" value={formData.discountPercent} onChange={e => setFormData({...formData, discountPercent: e.target.value})} className="w-full text-sm font-semibold rounded-lg border-slate-300" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                <input type="checkbox" checked={formData.isPopular} onChange={e => setFormData({...formData, isPopular: e.target.checked})} className="rounded text-secondary focus:ring-secondary"/>
                Mark as Popular Tag
              </label>
              <button type="submit" className="w-full bg-secondary text-white py-2.5 rounded-lg text-sm font-bold">Save Pack</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------------------
// 3. INSTALLER CONFIG TAB
// ----------------------------------------------------------------------------------
const InstallerConfigTab = ({ config, country, onRefresh }) => {
  const [formData, setFormData] = useState({
    baseInstallersIncluded: config?.baseInstallersIncluded || 1,
    weeklyKwCapacityPerInstaller: config?.weeklyKwCapacityPerInstaller || 25,
    extraInstallerPrice: config?.extraInstallerPrice || 500
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if(config) {
      setFormData({
        baseInstallersIncluded: config.baseInstallersIncluded,
        weeklyKwCapacityPerInstaller: config.weeklyKwCapacityPerInstaller,
        extraInstallerPrice: config.extraInstallerPrice
      });
    }
  }, [config]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch("http://localhost:4005/api/epc-subscription-settings/installer-configs", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, country })
      });
      alert("Installer rules saved successfully!");
      onRefresh();
    } catch(err) { console.error(err); }
    setIsSaving(false);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <h3 className="text-md font-bold text-slate-800">Installer Capacity Rules ({country})</h3>
        <p className="text-xs text-slate-500">Configure bandwidth rules. 1 Installer = X KW handling capacity per week.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Base Installers Included</label>
            <input required type="number" value={formData.baseInstallersIncluded} onChange={e => setFormData({...formData, baseInstallersIncluded: e.target.value})} className="w-full text-sm font-semibold rounded-lg border-slate-300" />
            <p className="text-[10px] text-slate-400 mt-1">Default number of installers given on base plans.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Capacity / Installer (KW/Week)</label>
            <input required type="number" value={formData.weeklyKwCapacityPerInstaller} onChange={e => setFormData({...formData, weeklyKwCapacityPerInstaller: e.target.value})} className="w-full text-sm font-semibold rounded-lg border-slate-300" />
            <p className="text-[10px] text-slate-400 mt-1">Limits how many KW orders they can accept weekly.</p>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price per Extra Installer / mo (₹)</label>
          <div className="flex gap-2">
            <input required type="number" value={formData.extraInstallerPrice} onChange={e => setFormData({...formData, extraInstallerPrice: e.target.value})} className="w-full text-sm font-semibold rounded-lg border-slate-300" />
            <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer">
              {isSaving ? "Saving..." : "Save Config"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
