import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, ShieldCheck, Settings, CheckCircle, Plus, Trash2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

const EpcSystemSettingsScreen = () => {
  const [activeTab, setActiveTab] = useState('overdue');
  const [settings, setSettings] = useState({
    overdueSettings: {
      defaultMaxAllowableOverdueProjects: 3,
      warningThresholds: 1,
      minimumRatingRequired: 3.5,
      countryRules: []
    },
    trustBadgeSettings: {
      signupFee: 5000,
      validityMonths: 12,
      priorityLeadAllocationMinutes: 60,
      autoRenewal: false,
      benefits: ["Priority Lead Allocation", "Exclusive Support"],
      rules: ["Maintain 4.0+ Rating", "0 Overdue Projects"],
      acceptanceLetterText: "I hereby agree to the terms..."
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [newRule, setNewRule] = useState({ country: 'India', projectType: 'Residential', limit: 5 });

  const addOverrideRule = () => {
    if (!newRule.country || !newRule.projectType || !newRule.limit) return;
    const updated = { ...settings };
    if (!updated.overdueSettings.countryRules) updated.overdueSettings.countryRules = [];
    updated.overdueSettings.countryRules.push({ ...newRule });
    setSettings(updated);
  };

  const removeOverrideRule = (index) => {
    const updated = { ...settings };
    updated.overdueSettings.countryRules.splice(index, 1);
    setSettings(updated);
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/epc/system-settings`);
      const data = await res.json();
      if (data) {
        setSettings({
          overdueSettings: { ...settings.overdueSettings, ...data.overdueSettings },
          trustBadgeSettings: { ...settings.trustBadgeSettings, ...data.trustBadgeSettings },
        });
      }
    } catch (error) {
      showToast('error', 'Failed to load settings');
    } finally {
      setLoading(false);
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

  // Trust Badge Array Helpers
  const addTrustItem = (type) => {
    const updated = { ...settings };
    updated.trustBadgeSettings[type].push("");
    setSettings(updated);
  };
  const updateTrustItem = (type, index, val) => {
    const updated = { ...settings };
    updated.trustBadgeSettings[type][index] = val;
    setSettings(updated);
  };
  const removeTrustItem = (type, index) => {
    const updated = { ...settings };
    updated.trustBadgeSettings[type].splice(index, 1);
    setSettings(updated);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            EPC System Settings
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure global rules for Overdue Management & Trust Badges.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('overdue')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors ${activeTab === 'overdue' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Overdue / Override Settings
        </button>
        <button
          onClick={() => setActiveTab('badge')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors ${activeTab === 'badge' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Trust Badge Settings
        </button>
      </div>

      {activeTab === 'overdue' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-lg font-bold">Global Overdue & Red Alert Rules</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Max Allowable Overdue</label>
                <input
                  type="number"
                  value={settings.overdueSettings.defaultMaxAllowableOverdueProjects}
                  onChange={(e) => setSettings({
                    ...settings,
                    overdueSettings: { ...settings.overdueSettings, defaultMaxAllowableOverdueProjects: Number(e.target.value) }
                  })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warning Threshold (Projects)</label>
                <input
                  type="number"
                  value={settings.overdueSettings.warningThresholds}
                  onChange={(e) => setSettings({
                    ...settings,
                    overdueSettings: { ...settings.overdueSettings, warningThresholds: Number(e.target.value) }
                  })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating Required</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.overdueSettings.minimumRatingRequired}
                  onChange={(e) => setSettings({
                    ...settings,
                    overdueSettings: { ...settings.overdueSettings, minimumRatingRequired: Number(e.target.value) }
                  })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">EPC Override Settings (Project & Country Wise)</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Country</label>
                  <select 
                    value={newRule.country}
                    onChange={(e) => setNewRule({...newRule, country: e.target.value})}
                    className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm">
                    <option>India</option>
                    <option>UAE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Project Type</label>
                  <select 
                    value={newRule.projectType}
                    onChange={(e) => setNewRule({...newRule, projectType: e.target.value})}
                    className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm">
                    <option>Residential</option>
                    <option>Commercial</option>
                    <option>Industrial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Override Limit</label>
                  <input 
                    type="number" 
                    value={newRule.limit}
                    onChange={(e) => setNewRule({...newRule, limit: Number(e.target.value)})}
                    className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm" />
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={addOverrideRule}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 w-full">Add Rule</button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Country</th>
                      <th className="px-4 py-3 font-semibold">Project Type</th>
                      <th className="px-4 py-3 font-semibold">Max Overdue Allowed</th>
                      <th className="px-4 py-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.overdueSettings.countryRules?.map((rule, idx) => (
                      <tr key={idx} className="border-b border-slate-100 last:border-0">
                        <td className="px-4 py-3 font-medium text-slate-800">{rule.country}</td>
                        <td className="px-4 py-3 text-slate-600">{rule.projectType}</td>
                        <td className="px-4 py-3 text-blue-600 font-bold">{rule.limit}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => removeOverrideRule(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                    {(!settings.overdueSettings.countryRules || settings.overdueSettings.countryRules.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-slate-400">No override rules added yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit to Clear Overdue (Hours)</label>
                <p className="text-xs text-gray-500 mb-2">If an EPC exceeds their override limit, their account will be frozen if not cleared within this timeframe.</p>
                <input
                  type="number"
                  defaultValue={48}
                  className="w-full md:w-1/3 border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'badge' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="text-lg font-bold">Trust Badge Core Settings</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Signup Fee (₹)</label>
                <input
                  type="number"
                  value={settings.trustBadgeSettings.signupFee}
                  onChange={(e) => setSettings({
                    ...settings,
                    trustBadgeSettings: { ...settings.trustBadgeSettings, signupFee: Number(e.target.value) }
                  })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Validity (Months)</label>
                <input
                  type="number"
                  value={settings.trustBadgeSettings.validityMonths}
                  onChange={(e) => setSettings({
                    ...settings,
                    trustBadgeSettings: { ...settings.trustBadgeSettings, validityMonths: Number(e.target.value) }
                  })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority Lead (Mins)</label>
                <input
                  type="number"
                  value={settings.trustBadgeSettings.priorityLeadAllocationMinutes}
                  onChange={(e) => setSettings({
                    ...settings,
                    trustBadgeSettings: { ...settings.trustBadgeSettings, priorityLeadAllocationMinutes: Number(e.target.value) }
                  })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between mb-4">
                <h3 className="font-bold text-gray-800">Badge Benefits (Shown to EPC)</h3>
                <button onClick={() => addTrustItem('benefits')} className="text-blue-600 hover:text-blue-700"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="space-y-2">
                {settings.trustBadgeSettings.benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="text" value={b} onChange={(e) => updateTrustItem('benefits', i, e.target.value)} className="flex-1 border p-2 rounded-lg text-sm" />
                    <button onClick={() => removeTrustItem('benefits', i)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between mb-4">
                <h3 className="font-bold text-gray-800">Eligibility Rules</h3>
                <button onClick={() => addTrustItem('rules')} className="text-blue-600 hover:text-blue-700"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="space-y-2">
                {settings.trustBadgeSettings.rules.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="text" value={r} onChange={(e) => updateTrustItem('rules', i, e.target.value)} className="flex-1 border p-2 rounded-lg text-sm" />
                    <button onClick={() => removeTrustItem('rules', i)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-2">Undertaking / Acceptance Letter</h3>
            <p className="text-sm text-gray-500 mb-4">This is the text the EPC must agree to (digital checkbox) when applying.</p>
            <textarea 
              value={settings.trustBadgeSettings.acceptanceLetterText}
              onChange={(e) => setSettings({
                ...settings,
                trustBadgeSettings: { ...settings.trustBadgeSettings, acceptanceLetterText: e.target.value }
              })}
              className="w-full border border-gray-300 rounded-lg p-4 h-40 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            ></textarea>
          </div>
        </div>
      )}
    </div>
  );
};

export default EpcSystemSettingsScreen;
