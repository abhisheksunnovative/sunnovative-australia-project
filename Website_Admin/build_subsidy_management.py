import os
import re

print("Starting build...")

# 1. Create CountrySubsidyManagementScreen.jsx
content = """import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Plus, Trash2, Zap, MapPin, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const Field = ({ label, value, onChange, type = "text", placeholder, hint }) => (
  <div>
    {label && <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-[#28377f]/20 focus:border-[#28377f] transition-all outline-none"
    />
    {hint && <p className="text-[10px] text-slate-400 mt-1 font-medium">{hint}</p>}
  </div>
);

export const CountrySubsidyManagementScreen = () => {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [districtsData, setDistrictsData] = useState([]);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

  useEffect(() => {
    fetchCountries();
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (selectedCountry) fetchSettings(selectedCountry);
  }, [selectedCountry]);

  const fetchCountries = async () => {
    try {
      const res = await fetch(\/api/countries);
      const data = await res.json();
      if (data.success && data.data) {
        setCountries(data.data.filter(c => c.isActive));
      } else if (Array.isArray(data)) {
        setCountries(data.filter(c => c.isActive));
      }
    } catch (err) {
      console.error('Failed to fetch countries:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async () => {
    try {
      // Assuming Districts API exists and returns state names
      const res = await fetch(\/api/states-districts);
      const data = await res.json();
      if (data.success && data.data) {
        setDistrictsData(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch districts:', err);
    }
  };

  const fetchSettings = async (countryObj) => {
    try {
      const isAus = countryObj.code === 'australia';
      const endpoint = isAus 
        ? \/api/country-website-settings/\
        : \/api/eligibility-settings/\;
        
      const res = await fetch(endpoint);
      const data = await res.json();
      
      if (data.success && data.data) {
        if (isAus) {
           setSettings({
              stcSettings: data.data.stcSettings || {
                 stcPrice: 38, deemingYears: 5, schemeEndYear: 2030,
                 zones: { zone1: 1.622, zone2: 1.536, zone3: 1.382, zone4: 1.185 }
              }
           });
        } else {
           setSettings(data.data);
        }
      } else {
         // Defaults
         if (isAus) {
           setSettings({ stcSettings: { stcPrice: 38, deemingYears: 5, schemeEndYear: 2030, zones: { zone1: 1.622, zone2: 1.536, zone3: 1.382, zone4: 1.185 } } });
         } else {
           setSettings({ eligibilityRules: { stateSubsidies: [] } });
         }
      }
    } catch (err) {
      console.error('Failed to fetch settings', err);
      toast.error('Failed to load settings');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const isAus = selectedCountry.code === 'australia';
      const endpoint = isAus 
        ? \/api/country-website-settings/\
        : \/api/eligibility-settings/\;
      
      const payload = isAus ? { stcSettings: settings.stcSettings } : settings;
        
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Subsidy Rules Saved Successfully!');
      } else {
        toast.error('Failed to save rules');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error saving');
    } finally {
      setSaving(false);
    }
  };

  const updatePath = (pathArray, value) => {
    setSettings(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      let current = next;
      for (let i = 0; i < pathArray.length - 1; i++) {
        if (!current[pathArray[i]]) current[pathArray[i]] = {};
        current = current[pathArray[i]];
      }
      current[pathArray[pathArray.length - 1]] = value;
      return next;
    });
  };

  const updateItem = (pathArray, index, key, value) => {
    setSettings(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      let current = next;
      for (const k of pathArray) {
        if (!current[k]) current[k] = [];
        current = current[k];
      }
      if (current[index]) {
        current[index][key] = value;
      }
      return next;
    });
  };

  const addItem = (pathArray, defaultObj) => {
    setSettings(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      let current = next;
      for (const k of pathArray) {
        if (!current[k]) current[k] = [];
        current = current[k];
      }
      current.push(defaultObj);
      return next;
    });
  };

  const removeItem = (pathArray, index) => {
    setSettings(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      let current = next;
      for (const k of pathArray) {
        if (!current[k]) current[k] = [];
        current = current[k];
      }
      current.splice(index, 1);
      return next;
    });
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  if (!selectedCountry) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Country-wise Subsidy Management</h1>
          <p className="text-slate-500">Select a country to configure its active subsidy or STC rebate rules.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {countries.map(country => (
            <div 
              key={country.code}
              onClick={() => setSelectedCountry(country)}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#28377f] cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{country.flagEmoji}</span>
              <span className="font-bold text-slate-700 group-hover:text-[#28377f]">{country.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isAustralia = selectedCountry.code === 'australia';

  return (
    <div className="p-8 max-w-6xl mx-auto pb-32">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedCountry(null)} className="p-2 hover:bg-slate-100 rounded-xl transition">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              {isAustralia ? 'STC Rebate Configuration' : 'State-wise Subsidy'}
              <span className="text-3xl">{selectedCountry.flagEmoji}</span>
            </h1>
            <p className="text-sm text-slate-500">
              Configure {isAustralia ? 'Small-scale Technology Certificates (STC)' : 'Central and State-wise Subsidies'} for {selectedCountry.name}.
            </p>
          </div>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2 bg-[#28377f] hover:bg-[#1a2559] text-white px-6 py-2.5 rounded-xl font-semibold transition shadow-md disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Rules'}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        {isAustralia ? (
          /* AUSTRALIA STC CONFIG */
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
              <Zap className="w-5 h-5 text-sky-600" />
              <h3 className="text-lg font-bold text-slate-800">Australia STC Rules</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="STC Price per Certificate ($)" value={settings.stcSettings?.stcPrice || 38} onChange={(v) => updatePath(["stcSettings", "stcPrice"], Number(v))} type="number" hint="Current market STC price (default )" />
              <Field label="Deeming Period (Years)" value={settings.stcSettings?.deemingYears || 5} onChange={(v) => updatePath(["stcSettings", "deemingYears"], Number(v))} type="number" hint="2026 = 5 years, 2027 = 4 years" />
              <Field label="Scheme End Year" value={settings.stcSettings?.schemeEndYear || 2030} onChange={(v) => updatePath(["stcSettings", "schemeEndYear"], Number(v))} type="number" hint="SRES ends in 2030" />
            </div>

            <div className="mt-8">
              <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Zone Ratings</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-sky-50 p-5 rounded-xl border border-sky-100">
                <Field label="Zone 1 Rating" value={settings.stcSettings?.zones?.zone1 || 1.622} onChange={(v) => updatePath(["stcSettings", "zones", "zone1"], Number(v))} type="number" />
                <Field label="Zone 2 Rating" value={settings.stcSettings?.zones?.zone2 || 1.536} onChange={(v) => updatePath(["stcSettings", "zones", "zone2"], Number(v))} type="number" />
                <Field label="Zone 3 Rating" value={settings.stcSettings?.zones?.zone3 || 1.382} onChange={(v) => updatePath(["stcSettings", "zones", "zone3"], Number(v))} type="number" />
                <Field label="Zone 4 Rating" value={settings.stcSettings?.zones?.zone4 || 1.185} onChange={(v) => updatePath(["stcSettings", "zones", "zone4"], Number(v))} type="number" />
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 flex items-start gap-3">
               <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
               <div>
                 <strong>How is this used?</strong> The lead form calculates the discount automatically using: <br/>
                 <code className="bg-white px-2 py-1 rounded text-xs font-bold border border-blue-100 mt-2 inline-block">System Size (kW) × Zone Rating × Deeming Period × STC Price</code>
               </div>
            </div>
          </div>
        ) : (
          /* INDIA SUBSIDY CONFIG */
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold text-slate-800">State-wise Subsidy Configuration</h3>
              </div>
              <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200">
                {settings.eligibilityRules?.stateSubsidies?.length || 0} States Configured
              </span>
            </div>

            <div className="space-y-4">
              {(settings.eligibilityRules?.stateSubsidies || []).map((state, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-5 relative group">
                  <button onClick={() => removeItem(["eligibilityRules", "stateSubsidies"], i)} className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pr-12">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">State</label>
                      <select 
                        value={state.state || ""} 
                        onChange={(e) => updateItem(["eligibilityRules", "stateSubsidies"], i, "state", e.target.value)}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none"
                      >
                        <option value="">Select State</option>
                        {districtsData.map(d => (
                           <option key={d._id} value={d.state}>{d.state}</option>
                        ))}
                      </select>
                    </div>
                    <Field label="State Scheme Name" value={state.stateScheme || ""} onChange={(v) => updateItem(["eligibilityRules", "stateSubsidies"], i, "stateScheme", v)} placeholder="e.g. Mukhyamantri Solar" />
                    <Field label="Subsidy Per KW (?)" value={state.stateSubsidyPerKW || 0} onChange={(v) => updateItem(["eligibilityRules", "stateSubsidies"], i, "stateSubsidyPerKW", Number(v))} type="number" />
                    <Field label="Max Subsidy (?)" value={state.stateSubsidyMax || 0} onChange={(v) => updateItem(["eligibilityRules", "stateSubsidies"], i, "stateSubsidyMax", Number(v))} type="number" />
                  </div>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nodal Agency" value={state.agency || ""} onChange={(v) => updateItem(["eligibilityRules", "stateSubsidies"], i, "agency", v)} placeholder="Agency name" />
                    <Field label="Special Notes" value={state.notes || ""} onChange={(v) => updateItem(["eligibilityRules", "stateSubsidies"], i, "notes", v)} placeholder="Any special rules" />
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => addItem(["eligibilityRules", "stateSubsidies"], { state: "", stateScheme: "", stateSubsidyPerKW: 0, stateSubsidyMax: 0 })} className="flex items-center gap-2 text-sm font-semibold text-[#28377f] hover:text-[#1a2559] hover:bg-[#28377f]/5 px-4 py-2 rounded-lg transition border border-dashed border-[#28377f]/30 w-full justify-center">
              <Plus className="w-4 h-4" /> Add State Subsidy
            </button>
            
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-start gap-3">
               <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
               <div>
                 <strong>Central Subsidy Details:</strong> The PM Surya Ghar central subsidy is automatically calculated based on government rules (?30,000/kW up to 2kW, flat ?78,000 for 3kW+). You only need to configure additional State subsidies here.
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
"""

with open("D:/sunnovative-australia-website/Website_Admin/src/components/CountrySubsidyManagementScreen.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Created CountrySubsidyManagementScreen.jsx")

