import React, { useState, useEffect } from "react";
import { Save, RefreshCw, CheckCircle2, CheckSquare, Settings } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

export default function PaymentSettingsTab() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const defaultProjects = ['residential', 'commercial'];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/customer-payment-settings/australia`);
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      } else {
        // Fallback to default structure
        setSettings({
          country: 'australia',
          projectConfigs: defaultProjects.map(pt => ({
            projectType: pt,
            paymentMode: 'PAYMENT_LATER',
            escrow: { mode: 'PERCENTAGE', percentage: 10, tokenAmount: 0 }
          }))
        });
      }
    } catch (error) {
      console.error(error);
      setMsg("Error fetching payment settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/api/customer-payment-settings/australia`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectConfigs: settings.projectConfigs })
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Payment settings saved successfully!");
        setTimeout(() => setMsg(""), 3000);
      } else {
        setMsg(data.message || "Failed to save settings");
      }
    } catch (e) {
      setMsg("Network error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (idx, field, val) => {
    const updated = [...settings.projectConfigs];
    const keys = field.split('.');
    if (keys.length === 1) {
      updated[idx][keys[0]] = val;
    } else {
      updated[idx][keys[0]][keys[1]] = val;
    }
    setSettings({ ...settings, projectConfigs: updated });
  };

  if (loading) return <div className="p-8 flex justify-center"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Australia Payment Settings</h2>
          <p className="text-sm text-slate-500 mt-1">Define how payments are collected for different project types.</p>
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

      <div className="space-y-6">
        {settings?.projectConfigs.map((config, idx) => (
          <div key={config.projectType} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-800 capitalize border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
              <Settings className="w-5 h-5 text-yellow-600" /> {config.projectType} Solar
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Payment Collection Mode</label>
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${config.paymentMode === 'PAYMENT_LATER' ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200 hover:border-yellow-200'}`}>
                    <input type="radio" checked={config.paymentMode === 'PAYMENT_LATER'} onChange={() => updateConfig(idx, 'paymentMode', 'PAYMENT_LATER')} className="w-4 h-4 text-yellow-600 focus:ring-yellow-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">Payment Later</p>
                      <p className="text-[10px] text-slate-500">Skip platform escrow. EPC collects all payment directly.</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${config.paymentMode === 'ADVANCE_ESCROW' ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200 hover:border-yellow-200'}`}>
                    <input type="radio" checked={config.paymentMode === 'ADVANCE_ESCROW'} onChange={() => updateConfig(idx, 'paymentMode', 'ADVANCE_ESCROW')} className="w-4 h-4 text-yellow-600 focus:ring-yellow-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">Advance Escrow</p>
                      <p className="text-[10px] text-slate-500">Platform collects an initial amount during project creation.</p>
                    </div>
                  </label>
                </div>
              </div>

              {config.paymentMode === 'ADVANCE_ESCROW' && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Escrow Calculation Mode</label>
                  <div className="flex gap-4 mb-5">
                    {['PERCENTAGE', 'TOKEN', 'FULL'].map(mode => (
                      <label key={mode} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={config.escrow.mode === mode} onChange={() => updateConfig(idx, 'escrow.mode', mode)} className="text-yellow-600 focus:ring-yellow-500" />
                        <span className="text-sm font-bold text-slate-700 capitalize">{mode.toLowerCase()}</span>
                      </label>
                    ))}
                  </div>

                  {config.escrow.mode === 'PERCENTAGE' && (
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Percentage of Total Cost (%)</label>
                      <input type="number" min="0" max="100" value={config.escrow.percentage} onChange={e => updateConfig(idx, 'escrow.percentage', Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-yellow-400" />
                    </div>
                  )}

                  {config.escrow.mode === 'TOKEN' && (
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Fixed Token Amount (AUD)</label>
                      <input type="number" min="0" value={config.escrow.tokenAmount} onChange={e => updateConfig(idx, 'escrow.tokenAmount', Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-yellow-400" />
                    </div>
                  )}

                  {config.escrow.mode === 'FULL' && (
                    <div className="p-3 bg-yellow-100/50 rounded-lg border border-yellow-200">
                      <p className="text-xs font-bold text-yellow-800 flex items-center gap-1.5"><CheckSquare className="w-4 h-4"/> 100% of the project cost will be collected upfront in escrow.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
