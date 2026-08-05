import React, { useState, useEffect } from 'react';
import { Save, Globe, Image, Eye, AlertTriangle, CheckCircle2, Plus, Trash2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

const COUNTRY_CODE_MAP = { india: 'IN', australia: 'AU', newzealand: 'NZ' };

export default function DynamicWebsiteModule() {
  const [country, setCountry] = useState('australia');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [orderJourneyTypes, setOrderJourneyTypes] = useState([]); // Valid project types from OrderJourney

  // ── Fetch country website settings ──────────────────────────────────────────
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/country-website-settings/${country}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      } else {
        setSettings({
          countryCode: COUNTRY_CODE_MAP[country] || 'AU',
          countryName: country === 'australia' ? 'Australia' : country === 'india' ? 'India' : 'New Zealand',
          currency: country === 'australia' ? 'AUD' : 'INR',
          currencySymbol: country === 'australia' ? '$' : '₹',
          isEnabled: true,
          websiteContent: { heroTitle: 'Go Solar', heroSubtitle: 'Save on bills', bannerImage: '', faqs: [], videos: [] },
          projectTypes: ['residential', 'commercial'],
          projectTypeConfigs: [],
          seoMetadata: { title: '', description: '', keywords: [] }
        });
      }
    } catch (err) {
      alert("Error fetching website settings");
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch OrderJourney project types for this country ───────────────────────
  const fetchOrderJourneyTypes = async () => {
    try {
      const countryCode = COUNTRY_CODE_MAP[country] || 'AU';
      const res = await fetch(`${API_BASE}/api/order-journey-settings/${countryCode}`);
      if (res.ok) {
        const d = await res.json();
        // d.projectTypes is an array of { projectType, projectTypeLabel, enabled }
        const types = (d.projectTypes || d.journeys || []).filter(j => j.enabled !== false);
        setOrderJourneyTypes(types);
      }
    } catch (e) {
      console.error("Error fetching order journey types:", e);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchOrderJourneyTypes();
  }, [country]);

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/country-website-settings/${country}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        alert("Dynamic website settings saved!");
      }
    } catch (err) {
      alert("Failed to save settings");
    }
  };

  const updateNested = (path, value) => {
    setSettings(prev => {
      const updated = { ...prev };
      let current = updated;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return updated;
    });
  };

  const addFaq = () => {
    const faqs = settings.websiteContent.faqs || [];
    updateNested(['websiteContent', 'faqs'], [...faqs, { question: '', answer: '' }]);
  };

  // ── Add a project type config using an OrderJourney slug ──────────────────
  const addProjectTypeConfig = (slug, label) => {
    const configs = settings.projectTypeConfigs || [];
    if (configs.find(c => c.type === slug)) {
      alert(`"${slug}" is already added.`);
      return;
    }
    updateNested(['projectTypeConfigs'], [...configs, { type: slug, label: label || slug, maxKwLimit: 10, heroTitle: '', heroSubtitle: '', bannerImage: '' }]);
  };

  if (!settings && loading) return <div className="p-8 text-center">Loading...</div>;
  if (!settings) return null;

  // Slugs already in projectTypeConfigs
  const existingSlugs = (settings.projectTypeConfigs || []).map(c => c.type);
  // Slugs available to add (exist in OrderJourney but not yet in configs)
  const availableToAdd = orderJourneyTypes.filter(j => !existingSlugs.includes(j.projectType));

  return (
    <div className="p-6 max-w-6xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dynamic Website Builder</h1>
          <p className="text-slate-500 text-sm">Configure landing pages, content, videos, and SEO per country</p>
        </div>
        <div className="flex gap-3">
          <select value={country} onChange={e => setCountry(e.target.value)} className="border-2 border-slate-200 rounded-xl px-4 py-2 font-bold bg-white text-slate-700">
            <option value="india">India</option>
            <option value="australia">Australia</option>
            <option value="newzealand">New Zealand</option>
          </select>
          <button onClick={() => window.open(`/?country=${country}`, '_blank')} className="px-4 py-2 bg-slate-100 text-slate-700 border rounded-xl font-medium flex items-center gap-2 hover:bg-slate-200">
            <Eye className="w-4 h-4"/> Preview Site
          </button>
          <button onClick={handleSave} className="px-5 py-2 bg-blue-600 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-blue-700 shadow-sm">
            <Save className="w-4 h-4"/> Publish Changes
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b mb-6">
        {['general', 'landing', 'project-types', 'faqs', 'seo'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 font-semibold text-sm capitalize ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border p-6 shadow-sm">

        {/* ── GENERAL ── */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold mb-4">Regional & Product Settings</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Country Name</label>
                <input type="text" value={settings.countryName} onChange={e => updateNested(['countryName'], e.target.value)} className="w-full border rounded-lg p-2 bg-slate-50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Currency Code</label>
                <input type="text" value={settings.currency} onChange={e => updateNested(['currency'], e.target.value)} className="w-full border rounded-lg p-2 bg-slate-50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Allowed Project Types (comma separated)</label>
                <input type="text" value={settings.projectTypes?.join(', ')} onChange={e => updateNested(['projectTypes'], e.target.value.split(',').map(s=>s.trim()))} className="w-full border rounded-lg p-2 bg-slate-50" />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" checked={settings.isEnabled} onChange={e => updateNested(['isEnabled'], e.target.checked)} className="w-5 h-5"/>
                <label className="font-medium">Country Enabled</label>
              </div>
            </div>
          </div>
        )}

        {/* ── EPC / INSTALLER (Australia) ── */}
        {activeTab === 'epc' && <p className="text-slate-500 text-sm italic">EPC/Installer configuration is managed in the Order Journey settings screen.</p>}

        {/* ── PROJECT TYPES ── */}
        {activeTab === 'project-types' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold">Project Types &amp; Upgrade Limits</h2>
                <p className="text-xs text-slate-500 mt-1">Only project types defined in <span className="font-semibold">Order Journey Settings</span> can be added here.</p>
              </div>

              {/* Dropdown: Add only from OrderJourney-defined slugs */}
              {availableToAdd.length > 0 ? (
                <div className="flex items-center gap-2">
                  <select
                    id="add-project-type-select"
                    defaultValue=""
                    className="border-2 border-blue-200 text-sm rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="" disabled>Select project type to add...</option>
                    {availableToAdd.map(j => (
                      <option key={j.projectType} value={j.projectType} data-label={j.projectTypeLabel || j.projectType}>
                        {j.projectTypeLabel || j.projectType} ({j.projectType})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const sel = document.getElementById('add-project-type-select');
                      const slug = sel.value;
                      const selectedOpt = sel.options[sel.selectedIndex];
                      const label = selectedOpt?.dataset?.label || slug;
                      if (slug) addProjectTypeConfig(slug, label);
                    }}
                    className="flex items-center gap-1.5 text-sm text-white font-semibold bg-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">
                  {orderJourneyTypes.length === 0
                    ? '⚠️ No project types found in Order Journey for this country'
                    : 'All Order Journey project types already added'}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {(settings.projectTypeConfigs || []).map((pt, idx) => {
                // Check if this config's slug matches any OrderJourney type
                const isMatched = orderJourneyTypes.some(j => j.projectType === pt.type);
                return (
                  <div key={idx} className={`p-4 border rounded-xl relative mb-4 ${isMatched ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-200'}`}>
                    {/* Mismatch Warning */}
                    {!isMatched && (
                      <div className="flex items-center gap-2 mb-3 p-2 bg-red-100 rounded-lg border border-red-200">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="text-xs font-semibold text-red-700">
                          ⚠️ Slug "<code>{pt.type}</code>" Order Journey se match nahi ho raha! Iska koi active journey nahi hai.
                        </span>
                      </div>
                    )}
                    {isMatched && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-wide">Matched with Order Journey</span>
                      </div>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={() => {
                        const configs = [...settings.projectTypeConfigs];
                        configs.splice(idx, 1);
                        updateNested(['projectTypeConfigs'], configs);
                      }}
                      className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Project Type Slug <span className="text-slate-400">(from Order Journey)</span></label>
                        <input
                          type="text"
                          value={pt.type}
                          readOnly
                          className="w-full border rounded-lg p-2 font-mono text-sm bg-slate-100 text-slate-500 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Max kW Limit (Upgrade)</label>
                        <input type="number" value={pt.maxKwLimit || 10} onChange={e => {
                          const configs = [...settings.projectTypeConfigs];
                          configs[idx].maxKwLimit = Number(e.target.value);
                          updateNested(['projectTypeConfigs'], configs);
                        }} className="w-full border rounded-lg p-2" />
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-slate-700 mt-2 mb-2 border-t pt-3">Landing Page Overrides</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <input type="text" placeholder="Hero Title (e.g. Best Residential Solar)" value={pt.heroTitle || ''} onChange={e => {
                          const configs = [...settings.projectTypeConfigs];
                          configs[idx].heroTitle = e.target.value;
                          updateNested(['projectTypeConfigs'], configs);
                      }} className="w-full border rounded-lg p-2 text-sm" />
                      <textarea placeholder="Hero Subtitle" value={pt.heroSubtitle || ''} onChange={e => {
                          const configs = [...settings.projectTypeConfigs];
                          configs[idx].heroSubtitle = e.target.value;
                          updateNested(['projectTypeConfigs'], configs);
                      }} className="w-full border rounded-lg p-2 text-sm h-16" />
                      <input type="text" placeholder="Banner Image URL" value={pt.bannerImage || ''} onChange={e => {
                          const configs = [...settings.projectTypeConfigs];
                          configs[idx].bannerImage = e.target.value;
                          updateNested(['projectTypeConfigs'], configs);
                      }} className="w-full border rounded-lg p-2 text-sm" />
                    </div>
                  </div>
                );
              })}
              {(!settings.projectTypeConfigs || settings.projectTypeConfigs.length === 0) && (
                <p className="text-slate-500 text-sm italic">No project types configured for {settings.countryName}. Use the dropdown above to add project types from Order Journey.</p>
              )}
            </div>
          </div>
        )}

        {/* ── LANDING ── */}
        {activeTab === 'landing' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Landing Page Content</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Hero Title</label>
              <input type="text" value={settings.websiteContent?.heroTitle} onChange={e => updateNested(['websiteContent', 'heroTitle'], e.target.value)} className="w-full border rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hero Subtitle</label>
              <textarea value={settings.websiteContent?.heroSubtitle} onChange={e => updateNested(['websiteContent', 'heroSubtitle'], e.target.value)} className="w-full border rounded-lg p-2 h-20" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Banner Image URL</label>
              <div className="flex gap-2">
                <input type="text" value={settings.websiteContent?.bannerImage} onChange={e => updateNested(['websiteContent', 'bannerImage'], e.target.value)} className="flex-1 border rounded-lg p-2" />
                <button className="px-3 bg-slate-100 border rounded-lg"><Image className="w-4 h-4 text-slate-500"/></button>
              </div>
            </div>
          </div>
        )}

        {/* ── FAQS ── */}
        {activeTab === 'faqs' && (
          <div>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Country-specific FAQs</h2>
                <button onClick={addFaq} className="text-sm text-blue-600 font-semibold">+ Add FAQ</button>
             </div>
             <div className="space-y-4">
               {settings.websiteContent?.faqs?.map((faq, idx) => (
                 <div key={idx} className="p-3 border rounded-lg bg-slate-50">
                   <input type="text" placeholder="Question" value={faq.question} onChange={e => {
                     const faqs = [...settings.websiteContent.faqs];
                     faqs[idx].question = e.target.value;
                     updateNested(['websiteContent', 'faqs'], faqs);
                   }} className="w-full border rounded p-2 mb-2 text-sm" />
                   <textarea placeholder="Answer" value={faq.answer} onChange={e => {
                     const faqs = [...settings.websiteContent.faqs];
                     faqs[idx].answer = e.target.value;
                     updateNested(['websiteContent', 'faqs'], faqs);
                   }} className="w-full border rounded p-2 text-sm h-16" />
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* ── SEO ── */}
        {activeTab === 'seo' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">SEO Metadata</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Page Title</label>
              <input type="text" value={settings.seoMetadata?.title || ''} onChange={e => updateNested(['seoMetadata', 'title'], e.target.value)} className="w-full border rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Meta Description</label>
              <textarea value={settings.seoMetadata?.description || ''} onChange={e => updateNested(['seoMetadata', 'description'], e.target.value)} className="w-full border rounded-lg p-2 h-20" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Keywords (comma separated)</label>
              <input type="text" value={settings.seoMetadata?.keywords?.join(', ') || ''} onChange={e => updateNested(['seoMetadata', 'keywords'], e.target.value.split(',').map(s => s.trim()))} className="w-full border rounded-lg p-2" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
