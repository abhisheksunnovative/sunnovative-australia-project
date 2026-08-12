import React, { useState, useEffect } from "react";
import { Save, PlayCircle, PauseCircle, Loader2, Filter, AlertTriangle, Lightbulb, Settings, MapPin, ArrowLeft } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { useAdminSettings } from "../hooks/useAdminSettings";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

export const DemandSupplyScreen = () => {
  const [countries, setCountries] = React.useState([]);
  const [selectedCountryObj, setSelectedCountryObj] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/countries`);
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
    fetchCountries();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading countries...</div>;
  }

  if (!selectedCountryObj) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Demand & Supply Management</h1>
          <p className="text-slate-500">Select a country to manage its regional demand and supply rules.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {countries.map(country => (
            <div 
              key={country._id || country.code}
              onClick={() => setSelectedCountryObj(country)}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#28377f] cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{country.flagEmoji}</span>
              <span className="font-bold text-slate-700 group-hover:text-[#28377f]">{country.name}</span>
            </div>
          ))}
          {countries.length === 0 && (
            <p className="text-slate-500 col-span-full">No active countries found. Please configure them in Country Settings.</p>
          )}
        </div>
      </div>
    );
  }

  return <DemandSupplyContent selectedCountryObj={selectedCountryObj} onBack={() => setSelectedCountryObj(null)} />;
};



export const DemandSupplyContent = ({ selectedCountryObj, onBack }) => {
  const selectedCountry = selectedCountryObj.code;
  const selectedCountryName = selectedCountryObj.name;

  // Dynamic project types from OrderJourney settings
  const { projectTypes: dynamicProjectTypes } = useAdminSettings(selectedCountry);
  const projectTypeOptions = dynamicProjectTypes.length > 0
    ? dynamicProjectTypes.map(pt => pt.label || pt.value)
    : [];

  const [settings, setSettings] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [globalSuggestions, setGlobalSuggestions] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [districtsData, setDistrictsData] = useState([]);
  
  // Master Filters
  const [filters, setFilters] = useState({
    country: selectedCountry,
    state: "",
    district: "",
    projectType: "",
    startDate: "",
    endDate: ""
  });

  // Global Settings Form
  const [globalSettings, setGlobalSettings] = useState({
    rollingPeriodDays: 7,
    supplyLimitPercentage: 30,
    autoEnableWalletRecharge: true,
    autoEnableProjectAllocation: true
  });
  const [savingGlobal, setSavingGlobal] = useState(false);

  // Regional Rules Form
  const [ruleForm, setRuleForm] = useState({
    country: selectedCountry,
    state: "",
    district: "",
    projectType: "",
    supplyLimitPercentageOverride: "",
    isAcceptancePaused: false
  });
  const [savingRule, setSavingRule] = useState(false);
  const [activeTab, setActiveTab] = useState('global'); // 'global' or 'regional'

  useEffect(() => {
    fetchSettings();
  }, [filters]); 

  const fetchSettings = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.country) queryParams.append('country', filters.country);
      if (filters.state) queryParams.append('state', filters.state);
      if (filters.district) queryParams.append('district', filters.district);
      if (filters.projectType) queryParams.append('projectType', filters.projectType);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const res = await fetch(`${API_BASE}/api/demand-supply?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
        setGlobalSettings({
          rollingPeriodDays: data.data.rollingPeriodDays || 7,
          supplyLimitPercentage: data.data.supplyLimitPercentage || 30,
          autoEnableWalletRecharge: data.data.autoEnableWalletRecharge !== false,
          autoEnableProjectAllocation: data.data.autoEnableProjectAllocation !== false
        });
        setAnalytics(data.analytics || []);
        if (data.globalSuggestions) {
          setGlobalSuggestions(data.globalSuggestions);
          // Simple local storage logic to show popup once every 4 hours or first time
          const lastShown = localStorage.getItem('lastSuggestionPopup');
          const now = Date.now();
          if (!lastShown || now - parseInt(lastShown) > 4 * 60 * 60 * 1000) {
            setShowPopup(true);
            localStorage.setItem('lastSuggestionPopup', now.toString());
          }
        }
      }
      
      const distRes = await fetch(`${API_BASE}/api/districts?country=${selectedCountry}`);
      const distData = await distRes.json();
      setDistrictsData(distData.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGlobal = async () => {
    setSavingGlobal(true);
    try {
      const res = await fetch(`${API_BASE}/api/demand-supply/global`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(globalSettings),
      });
      if (res.ok) {
        alert("Global Demand & Supply Rules Updated!");
        fetchSettings();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingGlobal(false);
    }
  };

  const handleUpdateRegionalRule = async (e) => {
    e.preventDefault();
    if (!ruleForm.district) return alert("Please select a District.");
    setSavingRule(true);
    try {
      const res = await fetch(`${API_BASE}/api/demand-supply/region`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: ruleForm.country || "India",
          state: ruleForm.state,
          district: ruleForm.district,
          projectType: ruleForm.projectType || "All",
          supplyLimitPercentageOverride: ruleForm.supplyLimitPercentageOverride ? Number(ruleForm.supplyLimitPercentageOverride) : null,
          isAcceptancePaused: ruleForm.isAcceptancePaused
        }),
      });
      if (res.ok) {
        alert("Regional Rule Updated!");
        setRuleForm({ ...ruleForm, supplyLimitPercentageOverride: "", isAcceptancePaused: false });
        fetchSettings();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingRule(false);
    }
  };

  const togglePause = async (region) => {
    try {
      await fetch(`${API_BASE}/api/demand-supply/region`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          district: region.district,
          projectType: region.projectType,
          isAcceptancePaused: !region.isPaused,
        }),
      });
      fetchSettings();
    } catch (err) {
      console.error(err);
    }
  };

  const updateOverrideLimit = async (region, val) => {
    try {
      await fetch(`${API_BASE}/api/demand-supply/region`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          district: region.district,
          projectType: region.projectType,
          supplyLimitPercentageOverride: val ? Number(val) : null,
        }),
      });
      fetchSettings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    // Sync rule form with master filters if they change
    if (name === 'country' || name === 'state' || name === 'district' || name === 'projectType') {
       setRuleForm(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  // Use global suggestions from backend
  const suggestions = globalSuggestions.slice(0, 5); // top 5 suggestions

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 relative">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Demand & Supply - {selectedCountryName}</h1>
      </div>
      
      {/* ── POPUP NOTIFICATION ── */}
      {showPopup && suggestions.length > 0 && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">New Analytics Alerts</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">Our background job analyzed the demand and supply across all regions. Here are the latest insights:</p>
            <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-2">
              {suggestions.map((s, idx) => (
                <div key={idx} className={`p-3 rounded-xl border text-sm ${s.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-emerald-50 border-emerald-100 text-emerald-800'}`}>
                  <span className="font-bold block mb-1">{s.district}</span>
                  {s.text}
                </div>
              ))}
            </div>
            <button onClick={() => setShowPopup(false)} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors">
              Got it, close
            </button>
          </div>
        </div>
      )}

      {/* ── MASTER FILTERS ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative z-10">
        <div className="flex items-center gap-2 border-b pb-3 border-slate-100">
          <Filter className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold text-slate-800">Master Filters</h2>
        </div>
        
        {/* Country Tabs (Removed, locked to {selectedCountryName}) */}
        {/* State, District, Date Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <select name="state" value={filters.state} onChange={(e) => { handleFilterChange(e); setFilters(prev => ({...prev, state: e.target.value, district: ""})); setRuleForm(prev => ({...prev, state: e.target.value, district: ""})); }} className="border p-2.5 rounded-xl text-sm min-w-[150px] bg-white focus:ring-2 focus:ring-blue-100 outline-none">
            <option value="">All States</option>
            {[...new Set(districtsData.map(d => d.state))].map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          
          <select name="district" value={filters.district} onChange={handleFilterChange} className="border p-2.5 rounded-xl text-sm min-w-[150px] bg-white focus:ring-2 focus:ring-blue-100 outline-none">
            <option value="">All Districts</option>
            {[...new Set(districtsData.filter(d => (!filters.state || d.state === filters.state)).flatMap(d => d.pincodes && Array.isArray(d.pincodes) ? d.pincodes : (typeof d.pincodes === 'string' ? d.pincodes.split(",").map(p => p.trim()) : [d.district])))].map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>

          {filters.country && (
             <select name="projectType" value={filters.projectType} onChange={handleFilterChange} className="border p-2.5 rounded-xl text-sm min-w-[150px] bg-white focus:ring-2 focus:ring-blue-100 outline-none">
                <option value="">All Project Types</option>
                {projectTypeOptions.map(pt => (
                  <option key={pt} value={pt}>{pt}</option>
                ))}
             </select>
          )}

          <div className="flex items-center gap-1 bg-white border rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-100">
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="p-1 text-sm outline-none text-slate-600" />
            <span className="text-slate-300">-</span>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="p-1 text-sm outline-none text-slate-600" />
          </div>
        </div>
      </div>

      {/* ── ANALYTICS DASHBOARD (Chart & Suggestions) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Demand vs Supply Chart</h2>
          <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="district" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="demandKw" name="Demand (KW)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="supplyKw" name="Supply (KW)" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-800">Admin Suggestions</h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3">
            {suggestions.length > 0 ? suggestions.map((s, idx) => (
              <div key={idx} className={`p-3 rounded-xl border text-sm ${s.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-emerald-50 border-emerald-100 text-emerald-800'}`}>
                <span className="font-bold block mb-1">{s.district}</span>
                {s.text}
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 p-4">
                <Lightbulb className="w-8 h-8 opacity-20" />
                <p className="text-xs text-center">No immediate suggestions based on current filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── RULE SETTING SECTION ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('global')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'global' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Settings className="w-4 h-4" /> Global Rules
          </button>
          <button 
            onClick={() => setActiveTab('regional')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'regional' ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <MapPin className="w-4 h-4" /> Regional Rules (Overrides)
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'global' ? (
            <div className="animate-in fade-in duration-300">
              <p className="text-xs text-slate-500 mb-5">These rules apply by default to all regions unless a regional override exists.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Rolling Period (Days)</label>
                  <input type="number" value={globalSettings.rollingPeriodDays} onChange={(e) => setGlobalSettings({...globalSettings, rollingPeriodDays: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Default Supply Limit (%)</label>
                  <input type="number" value={globalSettings.supplyLimitPercentage} onChange={(e) => setGlobalSettings({...globalSettings, supplyLimitPercentage: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm" />
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={globalSettings.autoEnableWalletRecharge} onChange={(e) => setGlobalSettings({...globalSettings, autoEnableWalletRecharge: e.target.checked})} className="w-4 h-4 accent-blue-600" />
                  <label className="text-sm font-semibold text-slate-700">Auto Enable Wallet Recharge</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={globalSettings.autoEnableProjectAllocation} onChange={(e) => setGlobalSettings({...globalSettings, autoEnableProjectAllocation: e.target.checked})} className="w-4 h-4 accent-blue-600" />
                  <label className="text-sm font-semibold text-slate-700">Auto Enable New Project Allocation</label>
                </div>
                <div className="flex-1 flex justify-end">
                  <button onClick={handleUpdateGlobal} disabled={savingGlobal} className="bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                    {savingGlobal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Global Rules
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <p className="text-xs text-slate-500 mb-5">Set specific rules for a particular Country, District, and Project Type. Look at the chart and suggestions above to decide!</p>
              <form onSubmit={handleUpdateRegionalRule} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
                  <select value={ruleForm.state} onChange={(e) => setRuleForm({...ruleForm, state: e.target.value, district: ""})} className="w-full border p-2.5 rounded-xl text-sm bg-white" required>
                    <option value="">Select State</option>
                    {[...new Set(districtsData.map(d => d.state))].map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">District</label>
                  <select value={ruleForm.district} onChange={(e) => setRuleForm({...ruleForm, district: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm bg-white" required>
                    <option value="">Select District</option>
                    {[...new Set(districtsData.filter(d => d.state === ruleForm.state).flatMap(d => d.pincodes && Array.isArray(d.pincodes) ? d.pincodes : (typeof d.pincodes === 'string' ? d.pincodes.split(",").map(p => p.trim()) : [d.district])))].map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Project Type</label>
                   <select value={ruleForm.projectType} onChange={(e) => setRuleForm({...ruleForm, projectType: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm bg-white">
                    <option value="">All / Default</option>
                    {projectTypeOptions.map(pt => (
                      <option key={pt} value={pt}>{pt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Override Limit (%)</label>
                  <input type="number" placeholder="e.g. 50" value={ruleForm.supplyLimitPercentageOverride} onChange={(e) => setRuleForm({...ruleForm, supplyLimitPercentageOverride: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm" />
                </div>
                
                <div className="lg:col-span-4 flex items-center justify-between mt-2 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={ruleForm.isAcceptancePaused} onChange={(e) => setRuleForm({...ruleForm, isAcceptancePaused: e.target.checked})} className="w-4 h-4 accent-red-500" />
                    <label className="text-sm font-bold text-red-600">Force Pause Allocations Here</label>
                  </div>
                  <button type="submit" disabled={savingRule} className="bg-purple-600 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors">
                    {savingRule ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Regional Rule
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ── DATA TABLE ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Detailed Analytics Data</h2>
          <span className="text-xs text-slate-500">{analytics.length} Regions found</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-medium text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Region</th>
                <th className="p-4">Total Demand</th>
                <th className="p-4">Total Supply</th>
                <th className="p-4">Ratio</th>
                <th className="p-4">Forecast (30d)</th>
                <th className="p-4">Limit Override %</th>
                <th className="p-4">Recharge Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics.map((r, i) => {
                const isBlocked = r.isPaused || (r.supplyKw < (r.demandKw * ((r.overrideLimit || globalSettings.supplyLimitPercentage) / 100)));
                const hasExcessSupply = r.supplyKw > r.demandKw;

                return (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{r.district}</p>
                      <p className="text-[10px] text-slate-500">{r.projectType}</p>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">{r.demandKw} KW</td>
                    <td className="p-4 font-semibold text-slate-700">{r.supplyKw} KW</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${hasExcessSupply ? 'text-amber-500' : 'text-emerald-500'}`}>{r.matchPercent}%</span>
                        {hasExcessSupply && <AlertTriangle className="w-4 h-4 text-amber-500" title="Excess Supply Alert" />}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-xs text-slate-500">Dem: {r.demandForecast} KW</p>
                      <p className="text-xs text-slate-500">Sup: {r.supplyForecast} KW</p>
                    </td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        placeholder="Global"
                        defaultValue={r.overrideLimit || ''}
                        onBlur={(e) => updateOverrideLimit(r, e.target.value)}
                        className="w-20 border border-slate-200 p-1.5 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {isBlocked ? (
                           <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-[10px] font-bold uppercase tracking-wider">Blocked</span>
                        ) : (
                           <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-[10px] font-bold uppercase tracking-wider">Active</span>
                        )}
                        <button onClick={() => togglePause(r)} className={`p-1.5 rounded-lg border transition-colors ${r.isPaused ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-100'}`} title={r.isPaused ? "Remove Admin Pause" : "Force Pause Recharge"}>
                          {r.isPaused ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {analytics.length === 0 && (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">No data available for the selected filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

