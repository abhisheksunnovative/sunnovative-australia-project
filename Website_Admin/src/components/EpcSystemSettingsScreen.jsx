import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, ShieldCheck, Settings, CheckCircle, Plus, ChevronRight, ArrowLeft, MapPin, Briefcase } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

const EpcSystemSettingsScreen = ({ selectedCountryCode }) => {
  const [activeTab, setActiveTab] = useState('overdue'); // overdue, trustbadge, allocation
  const [settings, setSettings] = useState({ regionRules: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Drill-down selections and flow
  const [step, setStep] = useState(selectedCountryCode ? 2 : 1);
  const [selectedCountry, setSelectedCountry] = useState(selectedCountryCode || null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedProjectType, setSelectedProjectType] = useState(null);

  // Data fetching
  const [countries, setCountries] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [activeStates, setActiveStates] = useState([]);
  const [orderJourneyMode, setOrderJourneyMode] = useState('fcfs');

  useEffect(() => {
    if (selectedCountryCode) {
      setSelectedCountry(selectedCountryCode);
      setStep(2);
    }
  }, [selectedCountryCode]);

  useEffect(() => {
    fetchCountries();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchProjectTypes();
      fetchStates();
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCountry && selectedProjectType) {
      fetchOrderJourneyMode();
    }
  }, [selectedCountry, selectedProjectType]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchStates = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/districts?country=${selectedCountry}`);
      const data = await res.json();
      const districts = data.data || data || [];
      const uniqueStates = [...new Set(districts.map(d => d.state).filter(Boolean))];
      setActiveStates(uniqueStates.map(name => ({ name })));
    } catch (err) {
      console.error('Error fetching states:', err);
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/countries`);
      const data = await res.json();
      if (data.success && data.data) {
        setCountries(data.data);
      }
    } catch (err) {
      console.error('Error fetching countries:', err);
    }
  };

  const fetchProjectTypes = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/project-types?country=${selectedCountry}`);
      const data = await res.json();
      if (data.success && data.data) {
        setProjectTypes(data.data);
      } else if (Array.isArray(data)) {
        setProjectTypes(data);
      } else {
        setProjectTypes([]);
      }
    } catch (err) {
      console.error('Error fetching project types:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/epc/system-settings`);
      const data = await res.json();
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      showToast('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderJourneyMode = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/order-journey-settings?country=${selectedCountry}`);
      const result = await res.json();
      if (result.success && result.data && result.data.projectTypes) {
        const ptMatch = result.data.projectTypes.find(p => p.typeName === selectedProjectType);
        if (ptMatch) {
          setOrderJourneyMode(ptMatch.epcSelectionMode);
          return;
        }
      }
      setOrderJourneyMode(selectedCountry === 'India' ? 'fcfs' : 'customer-select');
    } catch (err) {
      setOrderJourneyMode(selectedCountry === 'India' ? 'fcfs' : 'customer-select');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API_BASE}/api/epc/system-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      showToast('success', 'Settings saved successfully');
    } catch (error) {
      showToast('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const currentRuleIndex = settings.regionRules?.findIndex(
    r => r.country === selectedCountry && r.state === selectedState && r.projectType === selectedProjectType
  ) ?? -1;

  const currentRule = currentRuleIndex >= 0 ? settings.regionRules[currentRuleIndex] : null;

  const handleAddRule = () => {
    const updated = { ...settings };
    if (!updated.regionRules) updated.regionRules = [];
    updated.regionRules.push({
      country: selectedCountry,
      state: selectedState,
      projectType: selectedProjectType,
      overdueSettings: { limit: 3, warningThresholds: 1, minimumRatingRequired: 3.5 },
      trustBadgeSettings: {
        counterEnabled: true,
        ratePerLead: 100,
        undertakingText: 'I agree to maintain a 3.0+ rating and zero overdue projects.',
        maxLeadsLimit: 50,
        priorityLeadAllocationMinutes: 60,
        maxProfileViewsLimit: 50
      },
      customerSelectEpcSettings: {
        totalEpcCards: 5,
        fairRotationEnabled: true
      }
    });
    setSettings(updated);
  };

  const updateCurrentRule = (section, field, value) => {
    if (currentRuleIndex < 0) return;
    const updated = { ...settings };
    if (!updated.regionRules[currentRuleIndex][section]) {
      updated.regionRules[currentRuleIndex][section] = {};
    }
    updated.regionRules[currentRuleIndex][section][field] = value;
    setSettings(updated);
  };

  const activeCountryObj = countries.find(c => c.name === selectedCountry || c.code === selectedCountry);

  return (
    <div className="p-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl text-white font-bold shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-3">
            <Settings className="w-7 h-7 text-blue-600" />
            EPC System Settings (Regional Rules)
          </h1>
          <p className="text-gray-500 mt-1">Configure allocation, trust badges, and overdue limits via drill-down.</p>
        </div>
        {step === 4 && (
          <button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-8 text-sm font-bold bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <button onClick={() => !selectedCountryCode && setStep(1)} className={`transition-colors ${step >= 1 ? 'text-blue-600' : 'text-slate-400'} ${selectedCountryCode ? 'cursor-default' : 'hover:underline'}`}>
          {selectedCountry ? (activeCountryObj?.name || selectedCountry) : 'Select Country'}
        </button>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        
        <button onClick={() => setStep(2)} disabled={!selectedCountry} className={`transition-colors ${step >= 2 ? 'text-blue-600' : 'text-slate-400'} hover:underline disabled:opacity-50 disabled:no-underline`}>
          {selectedState || 'Select State'}
        </button>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        
        <button onClick={() => setStep(3)} disabled={!selectedState} className={`transition-colors ${step >= 3 ? 'text-blue-600' : 'text-slate-400'} hover:underline disabled:opacity-50 disabled:no-underline`}>
          {selectedProjectType || 'Select Project Type'}
        </button>
        <ChevronRight className="w-4 h-4 text-slate-300" />

        <span className={step === 4 ? 'text-blue-600' : 'text-slate-400'}>
          Configure Settings
        </span>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {countries.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500 font-medium">Loading countries...</div>
          ) : (
            countries.map(c => (
              <button 
                key={c._id} 
                onClick={() => { setSelectedCountry(c.name); setSelectedState(null); setSelectedProjectType(null); setStep(2); }}
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-left flex flex-col items-start gap-3"
              >
                <span className="text-4xl">{c.flagEmoji}</span>
                <div>
                  <h3 className="font-black text-slate-800 text-lg">{c.name}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase mt-1">Code: {c.code}</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <button onClick={() => !selectedCountryCode && setStep(1)} className="text-blue-600 font-bold text-sm flex items-center gap-1.5 mb-6 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Countries
          </button>
          <h2 className="text-xl font-black text-slate-800 mb-4">Select State in {activeCountryObj?.name || selectedCountry}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {activeStates.length === 0 ? (
              <div className="col-span-full p-8 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-500 font-medium">
                No active states found for this country. Please configure them in Country Settings first.
              </div>
            ) : (
              activeStates.map(s => (
                <button 
                  key={s._id || s.name} 
                  onClick={() => { setSelectedState(s.name); setSelectedProjectType(null); setStep(3); }}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-left flex items-center justify-between group"
                >
                  <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{s.name}</span>
                  <MapPin className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <button onClick={() => setStep(2)} className="text-blue-600 font-bold text-sm flex items-center gap-1.5 mb-6 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to States
          </button>
          <h2 className="text-xl font-black text-slate-800 mb-4">Select Project Type in {selectedState}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {projectTypes.length === 0 ? (
              <div className="col-span-full p-8 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-500 font-medium">
                No project types found for this country. Please configure them in Project Configurations.
              </div>
            ) : (
              projectTypes.map((pt, i) => {
                const typeName = pt.typeName || pt.name || pt.projectType || pt;
                return (
                  <button 
                    key={i} 
                    onClick={() => { setSelectedProjectType(typeName); setStep(4); }}
                    className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-left flex items-center justify-between group"
                  >
                    <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{typeName}</span>
                    <Briefcase className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button onClick={() => setStep(3)} className="text-blue-600 font-bold text-sm flex items-center gap-1.5 mb-6 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Project Types
          </button>
          
          <div className="bg-blue-50 text-blue-900 px-5 py-4 rounded-xl border border-blue-100 font-bold mb-6 flex items-center justify-between shadow-sm">
            <span>Configuring: {activeCountryObj?.name || selectedCountry} &rarr; {selectedState} &rarr; {selectedProjectType}</span>
            <span className="bg-white px-3 py-1.5 rounded-lg text-xs font-black uppercase text-blue-600 tracking-wider border border-blue-200 shadow-sm flex items-center gap-2">
              Detected Mode: {orderJourneyMode === 'fcfs' ? 'FCFS' : 'Customer Select'}
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading settings...</div>
          ) : !currentRule ? (
            <div className="text-center p-12 bg-white rounded-xl border border-dashed border-gray-300">
              <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-800">No Rules Defined for this Selection</h3>
              <p className="text-gray-500 mt-2 mb-6">Create a configuration profile to set limits and badge rules.</p>
              <button onClick={handleAddRule} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium inline-flex items-center gap-2 shadow-md">
                <Plus className="w-4 h-4" /> Create Regional Rule
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-4 border-b border-gray-200 mb-6 px-2">
                <button
                  onClick={() => setActiveTab('overdue')}
                  className={`pb-3 px-4 font-semibold text-sm transition-colors ${activeTab === 'overdue' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Overdue Settings
                </button>
                <button
                  onClick={() => setActiveTab('trustbadge')}
                  className={`pb-3 px-4 font-semibold text-sm transition-colors ${activeTab === 'trustbadge' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Trust Badge Config
                </button>
                <button
                  onClick={() => setActiveTab('allocation')}
                  className={`pb-3 px-4 font-semibold text-sm transition-colors ${activeTab === 'allocation' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Customer Select & Allocation
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8">
                {activeTab === 'overdue' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-red-600 flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5"/> Overdue Limits</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Allowable Overdue Projects</label>
                        <input type="number" value={currentRule.overdueSettings?.limit || 0} onChange={e => updateCurrentRule('overdueSettings', 'limit', Number(e.target.value))} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Warning Threshold</label>
                        <input type="number" value={currentRule.overdueSettings?.warningThresholds || 0} onChange={e => updateCurrentRule('overdueSettings', 'warningThresholds', Number(e.target.value))} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating Required</label>
                        <input type="number" step="0.1" value={currentRule.overdueSettings?.minimumRatingRequired || 0} onChange={e => updateCurrentRule('overdueSettings', 'minimumRatingRequired', Number(e.target.value))} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'trustbadge' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-blue-600 flex items-center gap-2 mb-4"><ShieldCheck className="w-5 h-5"/> Trust Badge Limitations</h2>
                    
                    <div className="flex items-center gap-3 mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <input type="checkbox" id="counterEnabled" checked={currentRule.trustBadgeSettings?.counterEnabled || false} onChange={e => updateCurrentRule('trustBadgeSettings', 'counterEnabled', e.target.checked)} className="w-5 h-5 text-blue-600 rounded" />
                      <label htmlFor="counterEnabled" className="text-sm font-bold text-gray-800">Enable Badge Counters (FCFS / CS)</label>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max FCFS Leads Limit</label>
                        <input type="number" value={currentRule.trustBadgeSettings?.maxLeadsLimit || 0} onChange={e => updateCurrentRule('trustBadgeSettings', 'maxLeadsLimit', Number(e.target.value))} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rate Per Lead (Payment Gateway)</label>
                        <input type="number" value={currentRule.trustBadgeSettings?.ratePerLead || 0} onChange={e => updateCurrentRule('trustBadgeSettings', 'ratePerLead', Number(e.target.value))} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Customer Select Views</label>
                        <input type="number" value={currentRule.trustBadgeSettings?.maxProfileViewsLimit || 0} onChange={e => updateCurrentRule('trustBadgeSettings', 'maxProfileViewsLimit', Number(e.target.value))} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority Lead Delay (Minutes)</label>
                        <input type="number" value={currentRule.trustBadgeSettings?.priorityLeadAllocationMinutes || 0} onChange={e => updateCurrentRule('trustBadgeSettings', 'priorityLeadAllocationMinutes', Number(e.target.value))} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Undertaking Agreement Text</label>
                      <textarea value={currentRule.trustBadgeSettings?.undertakingText || ''} onChange={e => updateCurrentRule('trustBadgeSettings', 'undertakingText', e.target.value)} rows={3} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"></textarea>
                    </div>
                  </div>
                )}

                {activeTab === 'allocation' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-emerald-600 flex items-center gap-2 mb-4"><Briefcase className="w-5 h-5"/> Customer Select Allocation Rules</h2>
                    
                    {orderJourneyMode === 'fcfs' ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center max-w-2xl mx-auto shadow-sm">
                        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                        <h3 className="text-amber-900 font-black text-lg mb-2">Setting Not Allowed</h3>
                        <p className="text-sm text-amber-800 leading-relaxed">The Order Journey for <strong>{selectedCountry} ({selectedProjectType})</strong> strictly follows the <strong>First-Come-First-Serve (FCFS)</strong> method. Customer Select & Allocation Rules are only applicable to regions actively following the Customer Select routing model.</p>
                      </div>
                    ) : (
                      <div className="animate-in fade-in duration-300">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total EPC Cards to Show to Customer</label>
                            <input type="number" value={currentRule.customerSelectEpcSettings?.totalEpcCards || 5} onChange={e => updateCurrentRule('customerSelectEpcSettings', 'totalEpcCards', Number(e.target.value))} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                          </div>
                        </div>

                        <div className="flex items-start gap-3 mt-6 bg-emerald-50/50 p-5 rounded-xl border border-emerald-100">
                          <input type="checkbox" id="fairRotation" checked={currentRule.customerSelectEpcSettings?.fairRotationEnabled || false} onChange={e => updateCurrentRule('customerSelectEpcSettings', 'fairRotationEnabled', e.target.checked)} className="w-5 h-5 text-emerald-600 rounded mt-0.5" />
                          <div>
                            <label htmlFor="fairRotation" className="text-sm font-bold text-gray-800 block cursor-pointer">Enable Fair Rotation & Dynamic Ratios</label>
                            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">When enabled, the system automatically applies dynamic allocation ratios (50/50, 60/40, or 80/20) based on local Trust Badge availability. It also prevents monopolization by prioritizing EPCs with zero recent orders but highly competitive conversion rates.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EpcSystemSettingsScreen;
