import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, CheckCircle2, CheckSquare, Settings, ArrowLeft, Landmark } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4005';

export default function PaymentSettingsTab() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  
  const [projectTypes, setProjectTypes] = useState([]);
  const [selectedPt, setSelectedPt] = useState(null);
  
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchCountries(); }, []);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/countries`);
      const data = await res.json();
      if (data.success) setCountries(data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSelectCountry = async (country) => {
    setSelectedCountry(country);
    setSelectedPt(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/project-types?country=${country.code}`);
      const data = await res.json();
      if (data.projectTypes) {
        setProjectTypes(data.projectTypes);
      } else if (data.success && data.data) {
        setProjectTypes(data.data);
      } else {
        setProjectTypes([]);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSelectProjectType = async (pt) => {
    const ptName = typeof pt === 'string' ? pt : (pt.projectType || pt.name || pt.type);
    setSelectedPt(ptName);
    // Pass full country name (lowercase) so backend DB query matches correctly
    const countryName = (selectedCountry.name || selectedCountry.code || '').toLowerCase();
    fetchSettings(countryName, ptName);
  };

  const [journeySteps, setJourneySteps] = useState([]);
  const [tokenInfo, setTokenInfo] = useState({ enabled: false, amount: 0 });

  const fetchSettings = async (countryCode, ptName) => {
    try {
      setLoading(true);
      
      // 1. Fetch Admin Payment Settings
      const res = await fetch(`${API_BASE}/api/admin/payment-settings/payment-settings?country=${countryCode}`);
      const data = await res.json();
      
      const pConfigs = data.projectConfigs || (data.data?.projectConfigs) || [];
      
      let config = pConfigs.find(c => c.projectType === ptName);
      if (!config) {
        config = {
          projectType: ptName,
          paymentMode: 'PAYMENT_LATER',
          escrow: { mode: 'PERCENTAGE', percentage: 10, tokenAmount: 0 }
        };
        pConfigs.push(config);
      }

      // Initialize dynamic signupToken & paymentStages defaults if not present
      if (!config.signupToken) {
        config.signupToken = {
          tokenType: "none",
          fixedAmount: 0
        };
      }
      if (!config.paymentStages || config.paymentStages.length === 0) {
        config.paymentStages = [
          {
            stageKey: "stage1",
            label: "Stage 1: Deposit / Booking",
            triggerStepId: "",
            valueType: "percentage",
            defaultValue: 10,
            maxLimit: 10,
            epcCanEdit: true
          },
          {
            stageKey: "stage2",
            label: "Stage 2: Pre-installation",
            triggerStepId: "",
            valueType: "percentage",
            defaultValue: 40,
            maxLimit: 40,
            epcCanEdit: true
          },
          {
            stageKey: "stage3",
            label: "Stage 3: Installation",
            triggerStepId: "",
            valueType: "percentage",
            defaultValue: 40,
            maxLimit: 40,
            epcCanEdit: true
          },
          {
            stageKey: "stage4",
            label: "Stage 4: Completion",
            triggerStepId: "",
            valueType: "percentage",
            defaultValue: 10,
            maxLimit: 10,
            epcCanEdit: true
          }
        ];
      }
      
      setSettings({ country: countryCode, projectConfigs: pConfigs });

      // 2. Fetch Order Journey steps
      const journeyRes = await fetch(`${API_BASE}/api/order-journey-settings?country=${countryCode}`);
      const journeyData = await journeyRes.json();
      console.log('--- [PaymentSettingsTab FETCH DEBUG] ---');
      console.log('1. API URL:', `${API_BASE}/api/order-journey-settings?country=${countryCode}`);
      console.log('2. Passed countryCode:', countryCode);
      console.log('3. Passed ptName:', ptName);
      
      const journeys = journeyData?.data?.journeys || journeyData?.journeys || [];
      console.log('4. Total Journeys from backend:', journeys.length);
      console.log('   Available projectTypes in response:', journeys.map(j => j.projectType));

      let matchingJourney = journeys.find(j => j.projectType.toLowerCase() === ptName.toLowerCase());
      
      // Fallback: Try fuzzy matching if exact match fails (e.g. 'residential-solar' -> 'residential')
      if (!matchingJourney) {
        const basePtName = ptName.toLowerCase().split(/[-_ ]/)[0]; // extracts 'residential' from 'residential-solar'
        matchingJourney = journeys.find(j => j.projectType.toLowerCase().includes(basePtName));
        if (matchingJourney) {
          console.log(`[PaymentSettingsTab] Fallback fuzzy match found! Mapped '${ptName}' to journey '${matchingJourney.projectType}'`);
        }
      }

      if (matchingJourney) {
        console.log('5. ? MATCH FOUND:', matchingJourney.projectTypeLabel || matchingJourney.projectType);
        console.log('   Total Steps in this journey:', matchingJourney.steps?.length);
        console.log('   First step ID example:', matchingJourney.steps?.[0]?.id || matchingJourney.steps?.[0]?._id);
        
        // Sometimes backend steps might have _id or id.
        setJourneySteps(matchingJourney.steps || []);
        setTokenInfo({
          enabled: !!matchingJourney.signupToken?.enabled,
          amount: matchingJourney.signupToken?.amount || 0
        });
      } else {
        console.warn('5. ? NO MATCH FOUND for projectType:', ptName);
        console.warn('   Make sure this project type exists and is active in Order Journey Settings!');
        setJourneySteps([]);
        setTokenInfo({ enabled: false, amount: 0 });
      }
      console.log('----------------------------------------');

    } catch (error) {
      console.error(error);
      setMsg('Error fetching payment settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/api/admin/payment-settings/payment-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: selectedCountry.code, projectConfigs: settings.projectConfigs })
      });
      const data = await res.json();
      setMsg('Customer payment stages settings saved successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setMsg('Network error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (field, val) => {
    const updatedConfigs = [...settings.projectConfigs];
    const idx = updatedConfigs.findIndex(c => c.projectType === selectedPt);
    if (idx === -1) return;
    
    const keys = field.split('.');
    if (keys.length === 1) {
      updatedConfigs[idx][keys[0]] = val;
    } else if (keys.length === 2) {
      if (!updatedConfigs[idx][keys[0]]) updatedConfigs[idx][keys[0]] = {};
      updatedConfigs[idx][keys[0]][keys[1]] = val;
    } else if (keys.length === 3) {
      if (!updatedConfigs[idx][keys[0]]) updatedConfigs[idx][keys[0]] = {};
      if (!updatedConfigs[idx][keys[0]][keys[1]]) updatedConfigs[idx][keys[0]][keys[1]] = {};
      updatedConfigs[idx][keys[0]][keys[1]][keys[2]] = val;
    }
    setSettings({ ...settings, projectConfigs: updatedConfigs });
  };

  const addPaymentStage = () => {
    const updatedConfigs = [...settings.projectConfigs];
    const idx = updatedConfigs.findIndex(c => c.projectType === selectedPt);
    if (idx === -1) return;
    
    if (!updatedConfigs[idx].paymentStages) updatedConfigs[idx].paymentStages = [];
    
    const nextNum = updatedConfigs[idx].paymentStages.length + 1;
    const newStage = {
      stageKey: `stage_${Date.now()}`,
      label: `Stage ${nextNum} Milestone`,
      triggerStepId: "",
      valueType: "percentage",
      defaultValue: 0,
      maxLimit: 100,
      isMandatory: true,
      epcCanEdit: true,
      recipientType: "epc",
      gatewayRequired: true
    };
    
    updatedConfigs[idx].paymentStages.push(newStage);
    setSettings({ ...settings, projectConfigs: updatedConfigs });
  };

  const removePaymentStage = (stageKey) => {
    const updatedConfigs = [...settings.projectConfigs];
    const idx = updatedConfigs.findIndex(c => c.projectType === selectedPt);
    if (idx === -1) return;
    
    updatedConfigs[idx].paymentStages = updatedConfigs[idx].paymentStages.filter(s => s.stageKey !== stageKey);
    setSettings({ ...settings, projectConfigs: updatedConfigs });
  };

  const updatePaymentStageField = (stageKey, field, val) => {
    const updatedConfigs = [...settings.projectConfigs];
    const idx = updatedConfigs.findIndex(c => c.projectType === selectedPt);
    if (idx === -1) return;
    
    const stageIdx = updatedConfigs[idx].paymentStages.findIndex(s => s.stageKey === stageKey);
    if (stageIdx === -1) return;
    
    updatedConfigs[idx].paymentStages[stageIdx][field] = val;
    setSettings({ ...settings, projectConfigs: updatedConfigs });
  };

  if (loading && !countries.length) return <div className="p-8 flex justify-center"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>;

  const currentConfig = settings?.projectConfigs?.find(c => c.projectType === selectedPt);

  const pctStages = (currentConfig?.paymentStages || []).filter(s => s.valueType === 'percentage');
  const totalSum = pctStages.reduce((sum, s) => sum + (s.defaultValue || 0), 0);
  const currency = selectedCountry?.code === 'au' ? 'AUD' : 'INR';
  const sampleCost = selectedCountry?.code === 'au' ? 8000 : 150000;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {!selectedCountry ? (
        // Level 1: Countries
        <div>
          <div className="mb-6 sticky top-0 z-10 bg-slate-50 pt-2 pb-4 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-800">Customer Payment Stages</h1>
            <p className="text-slate-500 text-sm">Select a country to manage customer payment settings</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {countries.map((country, idx) => (
              <div 
                key={country._id || country.code || `country-${idx}`} 
                onClick={() => handleSelectCountry(country)}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer transition-all hover:shadow-md hover:border-blue-300 group"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-4xl">{country.flag}</span>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{country.name}</h2>
                    <p className="text-xs text-slate-500">{country.desc}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm mt-6 border-t border-slate-100 pt-4">
                  <span className="text-blue-600 font-medium">Manage Settings &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !selectedPt ? (
        // Level 2: Project Types
        <div>
          <button 
            onClick={() => setSelectedCountry(null)}
            className="mb-6 flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Countries
          </button>
          
          <div className="flex items-center gap-4 mb-8">
            <span className="text-5xl">{selectedCountry.flag}</span>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{selectedCountry.name} Project Types</h1>
              <p className="text-slate-500">Select a project type to configure payments</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectTypes.map(pt => {
              const ptName = typeof pt === 'string' ? pt : pt.projectType || pt.name || pt.type;
              return (
                <div 
                  key={ptName} 
                  onClick={() => handleSelectProjectType(ptName)} 
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-md transition-shadow group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors capitalize">{ptName}</h3>
                    <Landmark className="w-5 h-5 text-blue-500" />
                  </div>
                  
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Configure Milestones
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // Level 3: Form
        <div className="space-y-6">
          <div className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md pb-4 pt-4 border-b border-slate-200 mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-start gap-3">
              <button 
                onClick={() => setSelectedPt(null)}
                className="mt-1 flex-shrink-0 p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
                title={`Back to ${selectedCountry.name} Project Types`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-black text-slate-800">{selectedPt} Payment Settings</h2>
                <p className="text-sm text-slate-500 mt-0.5">Define how payments are collected for {selectedPt} in {selectedCountry.name}.</p>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="bg-yellow-400 text-yellow-900 font-bold px-6 py-2.5 rounded-xl hover:bg-yellow-500 transition flex items-center gap-2 shadow-sm disabled:opacity-50 w-full md:w-auto justify-center">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Settings
            </button>
          </div>

          {msg && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5" /> {msg}
            </div>
          )}

          {loading ? (
            <div className="p-8 flex justify-center"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : currentConfig ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-black text-slate-800 capitalize border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                <Settings className="w-5 h-5 text-yellow-600" /> {selectedPt} Payment Stages & Trigger Config
              </h3>

              {/* ── Token Setting Info (Read Only) ── */}
              <div className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  🛡️ Order Journey Token Settings (Read-Only)
                </h4>
                
                <div className="space-y-4">
                  {tokenInfo.enabled ? (
                    <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                      ✅ Sign-up Token is <strong>ENABLED</strong> in Order Journey. Customer will pay a fixed amount of <strong>{selectedCountry?.code === 'au' ? 'AUD' : 'INR'} {tokenInfo.amount}</strong> at signup.
                    </p>
                  ) : (
                    <p className="text-xs text-slate-700 font-medium bg-white p-3 rounded-lg border border-slate-200">
                      ⭕ Sign-up Token is currently <strong>DISABLED</strong> or set to <strong>FREE</strong> in Order Journey Settings. Customers do not pay any token amount at signup.
                    </p>
                  )}
                </div>
              </div>
              {/* ── Dynamic Payment Stages List ── */}
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-black text-slate-800">Dynamic Milestone Stages</h4>
                  <p className="text-xs text-slate-500">Define dynamic payment events during the customer project journey.</p>
                </div>
                <button
                  type="button"
                  onClick={addPaymentStage}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold text-xs rounded-xl shadow-sm transition"
                >
                  + Add Payment Stage
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Stages */}
                <div className="lg:col-span-2 space-y-4">
                  {(!currentConfig.paymentStages || currentConfig.paymentStages.length === 0) ? (
                    <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                      No payment stages defined. Click "+ Add Payment Stage" to create one.
                    </div>
                  ) : (
                    currentConfig.paymentStages.map((stage, idx) => (
                      <div key={stage.stageKey || idx} className="p-5 bg-slate-50/50 border border-slate-200 rounded-2xl space-y-4 relative">
                        {/* Header & Remove */}
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Milestone Stage #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removePaymentStage(stage.stageKey)}
                            className="text-xs text-rose-500 hover:text-rose-700 font-bold"
                          >
                            Delete Stage
                          </button>
                        </div>

                        {/* Title, Step Trigger and Calculation Mode */}
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                            <label className="text-xs font-bold text-slate-500 w-full md:w-1/3">Stage Label *</label>
                            <input
                              type="text"
                              value={stage.label || ""}
                              onChange={e => updatePaymentStageField(stage.stageKey, 'label', e.target.value)}
                              className="w-full md:w-2/3 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400/50 bg-white"
                            />
                          </div>

                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                            <label className="text-xs font-bold text-slate-500 w-full md:w-1/3">Trigger Journey Step *</label>
                            <select
                              value={stage.triggerStepId || ""}
                              onChange={e => updatePaymentStageField(stage.stageKey, 'triggerStepId', e.target.value)}
                              className="w-full md:w-2/3 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400/50 bg-white"
                            >
                              <option value="">-- Select Step --</option>
                              {journeySteps.map((step, sIdx) => (
                                <option key={step._id || step.id || `step-${sIdx}`} value={step._id || step.id}>Step {step.stepNumber}: {step.title}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                            <label className="text-xs font-bold text-slate-500 w-full md:w-1/3">Calculation Type</label>
                            <select
                              value={stage.valueType || "percentage"}
                              onChange={e => updatePaymentStageField(stage.stageKey, 'valueType', e.target.value)}
                              className="w-full md:w-2/3 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400/50 bg-white"
                            >
                              <option value="percentage">Percentage (%) of Net Project Cost</option>
                              <option value="fixed">Fixed Cash Amount (AUD / INR)</option>
                            </select>
                          </div>

                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                            <label className="text-xs font-bold text-slate-500 w-full md:w-1/3">Platform Default Value</label>
                            <input
                              type="number"
                              min="0"
                              value={stage.defaultValue || 0}
                              onChange={e => updatePaymentStageField(stage.stageKey, 'defaultValue', Number(e.target.value))}
                              className="w-full md:w-2/3 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400/50 bg-white"
                            />
                          </div>

                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                            <label className="text-xs font-bold text-slate-500 w-full md:w-1/3">EPC Customisation</label>
                            <div className="w-full md:w-2/3 flex items-center justify-between gap-4">
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={!!stage.epcCanEdit}
                                  onChange={e => updatePaymentStageField(stage.stageKey, 'epcCanEdit', e.target.checked)}
                                  className="rounded text-yellow-600 focus:ring-yellow-500 w-3.5 h-3.5"
                                />
                                <span className="text-xs font-semibold text-slate-700">EPC Can Customise</span>
                              </label>

                              {stage.epcCanEdit ? (
                                <div className="flex items-center gap-2 flex-1 max-w-[150px]">
                                  <label className="text-[10px] font-bold text-slate-500 whitespace-nowrap">Max Limit:</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={stage.maxLimit || 0}
                                    onChange={e => updatePaymentStageField(stage.stageKey, 'maxLimit', Number(e.target.value))}
                                    className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400/50 bg-white"
                                  />
                                </div>
                              ) : (
                                <div className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                  🔒 Admin Fixed
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Right: Summary */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-start sticky top-6 h-fit">
                  <h4 className="text-sm font-black text-slate-700 flex items-center gap-1.5 mb-4">
                    <Landmark className="w-5 h-5 text-blue-600" /> Payment Allocation Summary
                  </h4>

                  {pctStages.length > 0 && (
                    <div className="h-4 w-full bg-slate-200 rounded-full flex overflow-hidden mb-5">
                      {pctStages.map((s, idx) => {
                        const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-sky-500', 'bg-emerald-500', 'bg-violet-500'];
                        const val   = s.defaultValue || 0;
                        const ratio = totalSum > 0 ? (val / totalSum) * 100 : 0;
                        return (
                          <div
                            key={s.stageKey}
                            className={`${colors[idx % colors.length]} h-full transition-all`}
                            style={{ width: `${ratio}%` }}
                            title={s.label}
                          />
                        );
                      })}
                    </div>
                  )}

                  <div className="space-y-3.5">
                    {(currentConfig.paymentStages || []).map((stage, idx) => {
                      const val     = stage.defaultValue || 0;
                      const isPerc  = stage.valueType === 'percentage';
                      const shown   = isPerc ? `${val}%` : `${currency}${(val||0).toLocaleString()}`;
                      const estCash = isPerc ? Math.round(sampleCost * (val / 100)) : val;
                      const colors  = ['bg-blue-500', 'bg-indigo-500', 'bg-sky-500', 'bg-emerald-500', 'bg-violet-500'];
                      return (
                        <div key={stage.stageKey || idx} className="flex justify-between items-center text-xs">
                          <span className="flex items-center gap-1.5 text-slate-600 truncate mr-2" style={{maxWidth: '180px'}}>
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors[idx % colors.length]}`} />
                            <span className="truncate">{stage.label || 'Unnamed Stage'}</span>
                          </span>
                          <span className="font-bold text-slate-800 shrink-0">
                            {shown} ≈ {currency}{(estCash||0).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 border-t border-slate-200 pt-5 flex items-center justify-between">
                    {pctStages.length > 0 ? (
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Total Platform Default</p>
                        <p className={`text-2xl font-black ${totalSum === 100 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {totalSum}%
                        </p>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Fixed value config</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
