import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, CheckCircle2, CheckSquare, Settings, ArrowLeft } from 'lucide-react';

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
    fetchSettings(selectedCountry.code, ptName);
  };

  const fetchSettings = async (countryCode, ptName) => {
    try {
      setLoading(true);
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
      
      setSettings({ country: countryCode, projectConfigs: pConfigs });
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
      setMsg('Payment settings saved successfully!');
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
    } else {
      updatedConfigs[idx][keys[0]][keys[1]] = val;
    }
    setSettings({ ...settings, projectConfigs: updatedConfigs });
  };

  if (loading && !countries.length) return <div className="p-8 flex justify-center"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>;

  const currentConfig = settings?.projectConfigs?.find(c => c.projectType === selectedPt);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {!selectedCountry ? (
        // Level 1: Countries
        <div>
          <div className="mb-6 sticky top-0 z-10 bg-slate-50 pt-2 pb-4 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-800">Payment Settings</h1>
            <p className="text-slate-500 text-sm">Select a country to manage payment settings</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {countries.map(country => (
              <div 
                key={country.id} 
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
                <div key={ptName} onClick={() => handleSelectProjectType(ptName)} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="p-5 flex-1">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{ptName}</h3>
                  </div>
                  <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between items-center text-sm text-blue-600 font-bold">
                    Configure &rarr;
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // Level 3: Form
        <div className="space-y-6">
          <button 
            onClick={() => setSelectedPt(null)}
            className="mb-6 flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to {selectedCountry.name} Project Types
          </button>

          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-800">{selectedPt} Payment Settings</h2>
              <p className="text-sm text-slate-500 mt-1">Define how payments are collected for {selectedPt} in {selectedCountry.name}.</p>
            </div>
            <button onClick={handleSave} disabled={saving} className="bg-yellow-400 text-yellow-900 font-bold px-6 py-2.5 rounded-xl hover:bg-yellow-500 transition flex items-center gap-2 shadow-sm disabled:opacity-50">
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
                <Settings className="w-5 h-5 text-yellow-600" /> {selectedPt} Payment Logic
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Payment Collection Mode</label>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${currentConfig.paymentMode === 'PAYMENT_LATER' ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200 hover:border-yellow-200'}`}>
                      <input type="radio" checked={currentConfig.paymentMode === 'PAYMENT_LATER'} onChange={() => updateConfig('paymentMode', 'PAYMENT_LATER')} className="w-4 h-4 text-yellow-600 focus:ring-yellow-500" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">Payment Later</p>
                        <p className="text-[10px] text-slate-500">Skip platform escrow. EPC collects all payment directly.</p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${currentConfig.paymentMode === 'ADVANCE_ESCROW' ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200 hover:border-yellow-200'}`}>
                      <input type="radio" checked={currentConfig.paymentMode === 'ADVANCE_ESCROW'} onChange={() => updateConfig('paymentMode', 'ADVANCE_ESCROW')} className="w-4 h-4 text-yellow-600 focus:ring-yellow-500" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">Advance Escrow</p>
                        <p className="text-[10px] text-slate-500">Platform collects an initial amount during project creation.</p>
                      </div>
                    </label>
                  </div>
                </div>

                {currentConfig.paymentMode === 'ADVANCE_ESCROW' && (
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Escrow Calculation Mode</label>
                    <div className="flex gap-4 mb-5">
                      {['PERCENTAGE', 'TOKEN', 'FULL'].map(mode => (
                        <label key={mode} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" checked={currentConfig.escrow.mode === mode} onChange={() => updateConfig('escrow.mode', mode)} className="text-yellow-600 focus:ring-yellow-500" />
                          <span className="text-sm font-bold text-slate-700 capitalize">{mode.toLowerCase()}</span>
                        </label>
                      ))}
                    </div>

                    {currentConfig.escrow.mode === 'PERCENTAGE' && (
                      <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Percentage of Total Cost (%)</label>
                        <input type="number" min="0" max="100" value={currentConfig.escrow.percentage} onChange={e => updateConfig('escrow.percentage', Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-yellow-400" />
                      </div>
                    )}

                    {currentConfig.escrow.mode === 'TOKEN' && (
                      <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Fixed Token Amount (AUD)</label>
                        <input type="number" min="0" value={currentConfig.escrow.tokenAmount} onChange={e => updateConfig('escrow.tokenAmount', Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-yellow-400" />
                      </div>
                    )}

                    {currentConfig.escrow.mode === 'FULL' && (
                      <div className="p-3 bg-yellow-100/50 rounded-lg border border-yellow-200">
                        <p className="text-xs font-bold text-yellow-800 flex items-center gap-1.5"><CheckSquare className="w-4 h-4"/> 100% of the project cost will be collected upfront in escrow.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
