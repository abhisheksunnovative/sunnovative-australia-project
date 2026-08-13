import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Plus, Trash2, Zap, MapPin, CheckCircle, Percent, DollarSign, Building } from 'lucide-react';

const SUBSIDY_MODEL_MAP = {
  'india': 'tiered-state',
  'australia': 'stc-zone',
  'united-kingdom': 'vat-seg',
  'united-states': 'federal-plus-state-table',
  'new-zealand': 'none',
};

const Field = ({ label, value, onChange, type = 'text', placeholder, hint }) => (
  <div>
    {label && <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">{label}</label>}
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
      placeholder={placeholder}
      step={type === 'number' ? '0.001' : undefined}
      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-[#28377f]/20 focus:border-[#28377f] transition-all outline-none"
    />
    {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
  </div>
);

export const CountrySubsidyManagementScreen = () => {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [districtsData, setDistrictsData] = useState([]);
  const [toast, setToast] = useState(null);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4005';

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => { fetchCountries(); fetchDistricts(); }, []);
  useEffect(() => { if (selectedCountry) fetchSettings(selectedCountry); }, [selectedCountry]);

  const fetchCountries = async () => {
    try {
      const res = await fetch(API_BASE + '/api/countries');
      const data = await res.json();
      const list = data.success ? data.data : Array.isArray(data) ? data : [];
      setCountries(list.filter(c => c.isActive));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchDistricts = async () => {
    try {
      const res = await fetch(API_BASE + '/api/states-districts');
      const data = await res.json();
      if (data.success && data.data) setDistrictsData(data.data);
    } catch (e) { console.error(e); }
  };

  const fetchSettings = async (country) => {
    const model = SUBSIDY_MODEL_MAP[country.code] || 'none';
    const AUS_DEFAULTS = { stcSettings: { stcPrice: 38, deemingYears: 5, schemeEndYear: 2030, zones: { zone1: 1.622, zone2: 1.536, zone3: 1.382, zone4: 1.185 } } };
    const GENERIC_DEFAULTS = { eligibilityRules: { stateSubsidies: [], vatRate: 0, smartExportGuarantee: true, federalITC: 30, hasSubsidies: false } };
    try {
      const endpoint = model === 'stc-zone'
        ? API_BASE + '/api/country-website-settings/' + country.code
        : API_BASE + '/api/eligibility-settings';
      const res = await fetch(endpoint, model === 'stc-zone' ? {} : { headers: { 'x-country': country.code } });
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(model === 'stc-zone' ? { stcSettings: data.data.stcSettings || AUS_DEFAULTS.stcSettings } : { ...GENERIC_DEFAULTS, ...data.data });
      } else {
        setSettings(model === 'stc-zone' ? AUS_DEFAULTS : GENERIC_DEFAULTS);
      }
    } catch { setSettings(model === 'stc-zone' ? AUS_DEFAULTS : GENERIC_DEFAULTS); }
  };

  const handleSave = async () => {
    setSaving(true);
    const model = SUBSIDY_MODEL_MAP[selectedCountry.code] || 'none';
    try {
      const endpoint = model === 'stc-zone'
        ? API_BASE + '/api/country-website-settings/' + selectedCountry.code
        : API_BASE + '/api/eligibility-settings';
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(model === 'stc-zone' ? {} : { 'x-country': selectedCountry.code }) },
        body: JSON.stringify(model === 'stc-zone' ? { stcSettings: settings.stcSettings } : settings)
      });
      const data = await res.json();
      data.success ? showToast('success', 'Saved successfully!') : showToast('error', 'Save failed');
    } catch { showToast('error', 'Backend error'); }
    finally { setSaving(false); }
  };

  const clone = o => JSON.parse(JSON.stringify(o));

  const updatePath = (path, value) => {
    setSettings(prev => {
      const next = clone(prev);
      let ref = next;
      for (let i = 0; i < path.length - 1; i++) { if (!ref[path[i]]) ref[path[i]] = {}; ref = ref[path[i]]; }
      ref[path[path.length - 1]] = value;
      return next;
    });
  };

  const updateItem = (arrPath, index, key, value) => {
    setSettings(prev => {
      const next = clone(prev);
      let ref = next;
      for (const k of arrPath) { if (!ref[k]) ref[k] = []; ref = ref[k]; }
      if (ref[index]) ref[index][key] = value;
      return next;
    });
  };

  const removeItem = (arrPath, index) => {
    setSettings(prev => {
      const next = clone(prev);
      let ref = next;
      for (const k of arrPath) { if (!ref[k]) ref[k] = []; ref = ref[k]; }
      ref.splice(index, 1);
      return next;
    });
  };

  const addItem = (arrPath, defaultObj) => {
    setSettings(prev => {
      const next = clone(prev);
      let ref = next;
      for (const k of arrPath) { if (!ref[k]) ref[k] = []; ref = ref[k]; }
      ref.push(defaultObj);
      return next;
    });
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading countries...</div>;

  if (!selectedCountry) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Country-wise Subsidy Management</h1>
          <p className="text-slate-500">Select a country to configure its active subsidy or rebate rules.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {countries.map(country => (
            <div
              key={country.code}
              onClick={() => setSelectedCountry(country)}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-lg hover:border-[#28377f] cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{country.flagEmoji}</span>
              <span className="font-bold text-slate-700 group-hover:text-[#28377f] text-base">{country.name}</span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                {SUBSIDY_MODEL_MAP[country.code] === 'stc-zone' ? 'STC Rebate Config' : 'Subsidy Config'}
              </span>
            </div>
          ))}
          {countries.length === 0 && <p className="text-slate-400 col-span-full">No active countries. Configure them in Country Settings first.</p>}
        </div>
      </div>
    );
  }

  const model = SUBSIDY_MODEL_MAP[selectedCountry.code] || 'none';
  const stcSettings = settings.stcSettings || {};
  const rules = settings.eligibilityRules || {};
  const stateSubsidies = rules.stateSubsidies || [];

  const exampleKw = 6.6;
  const zone3Rating = stcSettings.zones?.zone3 || 1.382;
  const deemingYears = stcSettings.deemingYears || 5;
  const stcPrice = stcSettings.stcPrice || 38;
  const exampleStcCount = Math.floor(exampleKw * zone3Rating * deemingYears);

  return (
    <div className="p-8 max-w-5xl mx-auto pb-32">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedCountry(null)} className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              {model === 'stc-zone' ? 'STC Rebate Configuration' : 'Subsidy Configuration'}
              <span className="text-3xl">{selectedCountry.flagEmoji}</span>
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {model === 'stc-zone' ? 'Configure STC zone ratings, deeming period & price.' : 'Configure national & local subsidies.'}
            </p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#28377f] hover:bg-[#1a2559] text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition shadow-md disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Rules'}
        </button>
      </div>

      {model === 'stc-zone' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <Zap className="w-5 h-5 text-sky-500" />
              <h3 className="font-bold text-slate-800">STC Calculation Rules</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Field label="STC Price per Certificate ($)" value={stcSettings.stcPrice || 38} onChange={v => updatePath(['stcSettings', 'stcPrice'], v)} type="number" />
              <Field label="Deeming Period (Years)" value={stcSettings.deemingYears || 5} onChange={v => updatePath(['stcSettings', 'deemingYears'], v)} type="number" />
              <Field label="Scheme End Year" value={stcSettings.schemeEndYear || 2030} onChange={v => updatePath(['stcSettings', 'schemeEndYear'], v)} type="number" />
            </div>
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Zone Ratings</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-sky-50 p-5 rounded-xl border border-sky-100">
                <Field label="Zone 1" value={stcSettings.zones?.zone1 || 1.622} onChange={v => updatePath(['stcSettings', 'zones', 'zone1'], v)} type="number" />
                <Field label="Zone 2" value={stcSettings.zones?.zone2 || 1.536} onChange={v => updatePath(['stcSettings', 'zones', 'zone2'], v)} type="number" />
                <Field label="Zone 3" value={stcSettings.zones?.zone3 || 1.382} onChange={v => updatePath(['stcSettings', 'zones', 'zone3'], v)} type="number" />
                <Field label="Zone 4" value={stcSettings.zones?.zone4 || 1.185} onChange={v => updatePath(['stcSettings', 'zones', 'zone4'], v)} type="number" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200 rounded-xl p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Live Preview — Example 6.6 kW System (Zone 3)</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-xl p-4 border border-sky-100">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">STC Count</p>
                  <p className="text-2xl font-black text-sky-600">{exampleStcCount}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-emerald-100">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">STC Rebate Value</p>
                  <p className="text-2xl font-black text-emerald-600"></p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Formula Used</p>
                  <p className="text-xs font-bold text-indigo-600 mt-1">6.6 × {zone3Rating} × {deemingYears}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {model === 'tiered-state' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-800">Central Subsidy (PM Surya Ghar)</h3>
              <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-bold">READ ONLY</span>
            </div>
            <p className="text-sm text-slate-600 mb-3">Hardcoded as per government rules.</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-3 border border-amber-100 text-center">
                <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Up to 2 kW</p>
                <p className="text-lg font-black text-amber-600">₹30,000<span className="text-xs font-medium">/kW</span></p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-amber-100 text-center">
                <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">2 kW to 3 kW</p>
                <p className="text-lg font-black text-amber-600">₹18,000<span className="text-xs font-medium">/kW</span></p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-amber-100 text-center">
                <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Above 3 kW</p>
                <p className="text-lg font-black text-amber-600">₹78,000</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-slate-800">State-wise Additional Subsidy</h3>
              </div>
            </div>
            <div className="space-y-3">
              {stateSubsidies.map((state, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-5 relative group">
                  <button onClick={() => removeItem(['eligibilityRules', 'stateSubsidies'], i)} className="absolute top-4 right-4 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pr-10">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">State</label>
                      <input value={state.state || ''} onChange={e => updateItem(['eligibilityRules', 'stateSubsidies'], i, 'state', e.target.value)} placeholder="e.g. Gujarat" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none" />
                    </div>
                    <Field label="Scheme Name" value={state.stateScheme || ''} onChange={v => updateItem(['eligibilityRules', 'stateSubsidies'], i, 'stateScheme', v)} placeholder="e.g. SURYA Gujarat" />
                    <Field label="Subsidy Per kW (₹)" value={state.stateSubsidyPerKW || 0} onChange={v => updateItem(['eligibilityRules', 'stateSubsidies'], i, 'stateSubsidyPerKW', v)} type="number" />
                    <Field label="Max Cap (₹)" value={state.stateSubsidyMax || 0} onChange={v => updateItem(['eligibilityRules', 'stateSubsidies'], i, 'stateSubsidyMax', v)} type="number" />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => addItem(['eligibilityRules', 'stateSubsidies'], { state: '', stateScheme: '', stateSubsidyPerKW: 0, stateSubsidyMax: 0, agency: '', notes: '' })} className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#28377f] hover:bg-[#28377f]/5 px-4 py-3 rounded-xl transition border border-dashed border-[#28377f]/30 w-full justify-center"><Plus className="w-4 h-4" /> Add State Subsidy</button>
          </div>
        </div>
      )}

      {model === 'vat-seg' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <Percent className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-800">UK VAT & Smart Export Guarantee</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Field label="VAT Rate (%)" value={rules.vatRate ?? 0} onChange={v => updatePath(['eligibilityRules', 'vatRate'], v)} type="number" hint="Currently 0% for solar installations" />
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={rules.smartExportGuarantee ?? true} onChange={e => updatePath(['eligibilityRules', 'smartExportGuarantee'], e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-[#28377f]" />
                <label className="text-sm font-semibold text-slate-700">Eligible for Smart Export Guarantee (SEG)</label>
              </div>
            </div>
          </div>
        </div>
      )}

      {model === 'federal-plus-state-table' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-slate-800">Federal ITC & State Rebates</h3>
            </div>
            <div className="mb-8 w-1/3">
              <Field label="Federal ITC (%)" value={rules.federalITC ?? 30} onChange={v => updatePath(['eligibilityRules', 'federalITC'], v)} type="number" hint="Federal Investment Tax Credit (e.g. 30%)" />
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">State & Local Rebates</label>
              {stateSubsidies.map((state, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-5 relative group">
                  <button onClick={() => removeItem(['eligibilityRules', 'stateSubsidies'], i)} className="absolute top-4 right-4 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-10">
                    <Field label="State/Utility" value={state.state || ''} onChange={v => updateItem(['eligibilityRules', 'stateSubsidies'], i, 'state', v)} placeholder="e.g. California" />
                    <Field label="Rebate Name" value={state.stateScheme || ''} onChange={v => updateItem(['eligibilityRules', 'stateSubsidies'], i, 'stateScheme', v)} placeholder="e.g. SGIP" />
                    <Field label="Rebate Amount ($)" value={state.stateSubsidyMax || 0} onChange={v => updateItem(['eligibilityRules', 'stateSubsidies'], i, 'stateSubsidyMax', v)} type="number" />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => addItem(['eligibilityRules', 'stateSubsidies'], { state: '', stateScheme: '', stateSubsidyMax: 0 })} className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#28377f] hover:bg-[#28377f]/5 px-4 py-3 rounded-xl transition border border-dashed border-[#28377f]/30 w-full justify-center"><Plus className="w-4 h-4" /> Add Rebate</button>
          </div>
        </div>
      )}

      {model === 'none' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center py-12">
            <Building className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-bold text-slate-800 text-lg mb-2">No Central Subsidies Applicable</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">This country relies on regional feed-in tariffs, export guarantees, or direct bank financing. There are no direct upfront federal subsidies to configure.</p>
          </div>
        </div>
      )}
    </div>
  );
};
