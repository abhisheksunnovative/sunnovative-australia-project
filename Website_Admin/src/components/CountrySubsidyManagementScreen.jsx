import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Plus, Trash2, Zap, MapPin, CheckCircle, Percent, DollarSign, Building, ArrowLeft } from 'lucide-react';

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

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4005';

  useEffect(() => { fetchCountries(); }, []);

  const fetchCountries = async () => {
    try {
      const res = await fetch(API_BASE + '/api/countries');
      const data = await res.json();
      const list = data.success ? data.data : Array.isArray(data) ? data : [];
      setCountries(list.filter(c => c.isActive));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading countries...</div>;

  if (!selectedCountry) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Subsidy Management</h1>
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
                {SUBSIDY_MODEL_MAP[country.code.toLowerCase()] === 'stc-zone' ? 'STC Rebate Config' : 'Subsidy Config'}
              </span>
            </div>
          ))}
          {countries.length === 0 && <p className="text-slate-400 col-span-full">No active countries. Configure them in Country Settings first.</p>}
        </div>
      </div>
    );
  }

  return <SubsidyStateSelector selectedCountry={selectedCountry} onBack={() => setSelectedCountry(null)} API_BASE={API_BASE} />;
};

const SubsidyStateSelector = ({ selectedCountry, onBack, API_BASE }) => {
  const [states, setStates] = useState([]);
  const [discoms, setDiscoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [distRes, discomRes] = await Promise.all([
          fetch(`${API_BASE}/api/districts?country=${selectedCountry.name}`),
          fetch(`${API_BASE}/api/discoms?country=${selectedCountry.name}`)
        ]);
        
        const distData = await distRes.json();
        const discomData = await discomRes.json();

        let districtsList = distData.data || distData;
        if (!Array.isArray(districtsList)) districtsList = [];
        
        const uniqueStates = [...new Set(districtsList.map(d => d.state).filter(Boolean))];
        setStates(uniqueStates);

        if (discomData.success) {
          setDiscoms(discomData.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCountry.name]);

  if (selectedState) {
    return <SubsidyDiscomSelector selectedCountry={selectedCountry} selectedState={selectedState} onBack={() => setSelectedState(null)} API_BASE={API_BASE} />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white rounded-full border shadow-sm hover:bg-slate-50">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Select State - {selectedCountry.name}</h1>
          <p className="text-slate-500">Select a state to configure subsidies for its Discoms.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-12">Loading states...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {states.map(state => {
            const stateDiscomCount = discoms.filter(d => (d.state || '').toLowerCase().trim() === state.toLowerCase().trim()).length;
            return (
            <div 
              key={state}
              onClick={() => setSelectedState(state)}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#28377f] cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                <MapPin className="w-6 h-6 text-rose-500" />
              </div>
              <span className="font-bold text-slate-700 group-hover:text-[#28377f]">{state}</span>
              <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full">{stateDiscomCount} Discom{stateDiscomCount !== 1 ? 's' : ''}</span>
            </div>
            );
          })}
          {states.length === 0 && (
            <p className="text-slate-500 col-span-full py-8 text-center bg-white rounded-xl border border-dashed">
              No states found. Please add them in Country Settings.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const SubsidyDiscomSelector = ({ selectedCountry, selectedState, onBack, API_BASE }) => {
  const [discoms, setDiscoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiscom, setSelectedDiscom] = useState(null);

  useEffect(() => {
    const fetchDiscoms = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/discoms?country=${selectedCountry.name}`);
        const data = await res.json();
        if (data.success) {
          setDiscoms(data.data.filter(d => (d.state || '').toLowerCase().trim() === (selectedState || '').toLowerCase().trim()));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscoms();
  }, [selectedCountry.name, selectedState]);

  if (selectedDiscom) {
    return <SubsidySettingsForm selectedCountry={selectedCountry} selectedState={selectedState} selectedDiscom={selectedDiscom} onBack={() => setSelectedDiscom(null)} API_BASE={API_BASE} />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white rounded-full border shadow-sm hover:bg-slate-50">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Select Discom - {selectedState}</h1>
          <p className="text-slate-500">Select a Discom to configure its specific subsidy rules.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-12">Loading discoms...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {discoms.map(discom => (
            <div 
              key={discom._id}
              onClick={() => setSelectedDiscom(discom)}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#28377f] cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group text-center"
            >
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <Zap className="w-6 h-6 text-amber-500" />
              </div>
              <span className="font-bold text-slate-700 group-hover:text-[#28377f]">{discom.name}</span>
            </div>
          ))}
          {discoms.length === 0 && (
            <p className="text-slate-500 col-span-full py-8 text-center bg-white rounded-xl border border-dashed">
              No Discoms found for this state. Add them in Discom Management first.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const SubsidySettingsForm = ({ selectedCountry, selectedState, selectedDiscom, onBack, API_BASE }) => {
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    const model = SUBSIDY_MODEL_MAP[selectedCountry.code.toLowerCase()] || 'none';
    const AUS_DEFAULTS = { stcSettings: { stcPrice: 38, deemingYears: 5, schemeEndYear: 2030, zones: { zone1: 1.622, zone2: 1.536, zone3: 1.382, zone4: 1.185 } } };
    const GENERIC_DEFAULTS = { eligibilityRules: { discomSubsidies: [], vatRate: 0, smartExportGuarantee: true, federalITC: 30, hasSubsidies: false } };
    try {
      const endpoint = model === 'stc-zone'
        ? API_BASE + '/api/country-website-settings/' + selectedCountry.code
        : API_BASE + '/api/eligibility-settings';
      const res = await fetch(endpoint, model === 'stc-zone' ? {} : { headers: { 'x-country': selectedCountry.code } });
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
    const model = SUBSIDY_MODEL_MAP[selectedCountry.code.toLowerCase()] || 'none';
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

  const model = SUBSIDY_MODEL_MAP[selectedCountry.code.toLowerCase()] || 'none';
  const stcSettings = settings.stcSettings || {};
  const rules = settings.eligibilityRules || {};
  const discomSubsidies = rules.discomSubsidies || [];

  // Find the specific subsidy for this discom, if it exists
  let currentDiscomSubsidy = discomSubsidies.find(d => d.discomId === selectedDiscom._id);
  
  const updateCurrentDiscomSubsidy = (key, value) => {
    setSettings(prev => {
      const next = clone(prev);
      if (!next.eligibilityRules) next.eligibilityRules = {};
      if (!next.eligibilityRules.discomSubsidies) next.eligibilityRules.discomSubsidies = [];
      
      let entry = next.eligibilityRules.discomSubsidies.find(d => d.discomId === selectedDiscom._id);
      if (!entry) {
        entry = { discomId: selectedDiscom._id, state: selectedState, discomName: selectedDiscom.name };
        next.eligibilityRules.discomSubsidies.push(entry);
      }
      entry[key] = value;
      return next;
    });
  };

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
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-500 border bg-white shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              {selectedDiscom.name} Subsidy Rules
              <span className="text-3xl">{selectedCountry.flagEmoji}</span>
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Configuring rules for {selectedDiscom.name}, {selectedState}.
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
              <h3 className="font-bold text-slate-800">STC Calculation Rules ({selectedDiscom.name})</h3>
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
                <h3 className="font-bold text-slate-800">Discom-Specific Subsidy ({selectedDiscom.name})</h3>
              </div>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Scheme Name" value={currentDiscomSubsidy?.schemeName || ''} onChange={v => updateCurrentDiscomSubsidy('schemeName', v)} placeholder="e.g. SURYA Gujarat" />
                <Field label="Subsidy Per kW (₹)" value={currentDiscomSubsidy?.subsidyPerKW || 0} onChange={v => updateCurrentDiscomSubsidy('subsidyPerKW', v)} type="number" />
                <Field label="Max Cap (₹)" value={currentDiscomSubsidy?.subsidyMax || 0} onChange={v => updateCurrentDiscomSubsidy('subsidyMax', v)} type="number" />
              </div>
              <p className="text-xs text-slate-500 mt-4">This extra subsidy will only apply to customers falling under <b>{selectedDiscom.name}</b> in <b>{selectedState}</b>.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
