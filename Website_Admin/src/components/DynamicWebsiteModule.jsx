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
      const res = await fetch(`${API_BASE}/api/order-journey-settings?country=${country}`);
      if (res.ok) {
        const d = await res.json();
        const rawList = d.data?.journeys || d.journeys || d.projectTypes || [];
        const types = rawList.filter(j => j.enabled !== false);
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
            className={`pb-3 px-2 font-semibold text-sm capitalize ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : '        {/* ── GENERAL (GLOBAL: BRAND & LOGO ONLY) ── */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Global Brand &amp; Logo Settings</h2>
                <p className="text-xs text-slate-500">Ye brand details aur logo har landing page par global rehne wale hain.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Company / Brand Name</label>
                <input type="text" value={settings.websiteContent?.brandName || settings.countryName || ''} onChange={e => updateNested(['websiteContent', 'brandName'], e.target.value)} className="w-full border rounded-lg p-2.5 text-sm bg-slate-50" placeholder="e.g. Sunnovative Solar" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Brand Logo URL</label>
                <input type="text" value={settings.websiteContent?.brandLogoUrl || ''} onChange={e => updateNested(['websiteContent', 'brandLogoUrl'], e.target.value)} className="w-full border rounded-lg p-2.5 text-sm bg-slate-50" placeholder="https://example.com/logo.png" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Support Phone Number</label>
                <input type="text" value={settings.websiteContent?.supportPhone || ''} onChange={e => updateNested(['websiteContent', 'supportPhone'], e.target.value)} className="w-full border rounded-lg p-2.5 text-sm bg-slate-50" placeholder="+91 98982 12345" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Hub Location / Address</label>
                <input type="text" value={settings.websiteContent?.supportAddress || ''} onChange={e => updateNested(['websiteContent', 'supportAddress'], e.target.value)} className="w-full border rounded-lg p-2.5 text-sm bg-slate-50" placeholder="Rajkot Hub, Gujarat" />
              </div>
              <div className="col-span-2 flex items-center gap-2 mt-2">
                <input type="checkbox" checked={settings.isEnabled} onChange={e => updateNested(['isEnabled'], e.target.checked)} className="w-5 h-5 accent-blue-600"/>
                <label className="font-semibold text-sm text-slate-700">Enable website for {settings.countryName || country}</label>
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
                <h2 className="text-lg font-bold">Project Types, Journey Flowchart &amp; Overrides</h2>
                <p className="text-xs text-slate-500 mt-1">Har project type ke liye hero header, FAQs, footer, aur customer journey flowchart customizable hai.</p>
              </div>

              {/* Dropdown: Add only from OrderJourney-defined slugs */}
              {availableToAdd.length > 0 ? (
                <div className="flex items-center gap-2">
                  <select
                    id="add-project-type-select"
                    defaultValue=""
                    className="border-2 border-blue-200 text-sm rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 font-semibold"
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
                    className="flex items-center gap-1.5 text-sm text-white font-semibold bg-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm"
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

            <div className="space-y-6">
              {(settings.projectTypeConfigs || []).map((pt, idx) => {
                const isMatched = orderJourneyTypes.some(j => j.projectType === pt.type);
                const journeySteps = pt.journeyFlowchart || [
                  { title: "Lead Captured", desc: "Customer enquiry submitted", role: "Customer" },
                  { title: "Site Survey", desc: "Technical rooftop assessment", role: "EPC Partner" },
                  { title: "Installation Completed", desc: "Solar panels mounted & tested", role: "Installer" },
                ];
                const ptFaqs = pt.faqs || [];

                return (
                  <div key={idx} className={`p-5 border rounded-2xl relative shadow-sm ${isMatched ? 'bg-slate-50/60 border-slate-200' : 'bg-red-50/60 border-red-200'}`}>
                    {!isMatched && (
                      <div className="flex items-center gap-2 mb-3 p-2 bg-red-100 rounded-lg border border-red-200">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="text-xs font-semibold text-red-700">
                          ⚠️ Slug "<code>{pt.type}</code>" Order Journey se match nahi ho raha!
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-slate-800 uppercase">{pt.label || pt.type}</span>
                        <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">({pt.type})</span>
                      </div>
                      <button
                        onClick={() => {
                          const configs = [...settings.projectTypeConfigs];
                          configs.splice(idx, 1);
                          updateNested(['projectTypeConfigs'], configs);
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Max kW Limit (Upgrade)</label>
                        <input type="number" value={pt.maxKwLimit || 10} onChange={e => {
                          const configs = [...settings.projectTypeConfigs];
                          configs[idx].maxKwLimit = Number(e.target.value);
                          updateNested(['projectTypeConfigs'], configs);
                        }} className="w-full border rounded-lg p-2 font-bold text-sm bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Hero Title</label>
                        <input type="text" placeholder="e.g. Best Residential Solar Systems" value={pt.heroTitle || ''} onChange={e => {
                          const configs = [...settings.projectTypeConfigs];
                          configs[idx].heroTitle = e.target.value;
                          updateNested(['projectTypeConfigs'], configs);
                        }} className="w-full border rounded-lg p-2 text-sm bg-white" />
                      </div>
                    </div>

                    {/* Customer Journey Flowchart Editor */}
                    <div className="border-t border-slate-200 pt-3 mt-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider">Customer Journey Flowchart Steps</h4>
                        <button
                          type="button"
                          onClick={() => {
                            const configs = [...settings.projectTypeConfigs];
                            const currentFlow = configs[idx].journeyFlowchart || [];
                            configs[idx].journeyFlowchart = [
                              ...currentFlow,
                              { title: `Step ${currentFlow.length + 1}`, desc: "New step description", role: "Installer" }
                            ];
                            updateNested(['projectTypeConfigs'], configs);
                          }}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Step
                        </button>
                      </div>

                      <div className="space-y-2">
                        {journeySteps.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0">{sIdx + 1}</span>
                            <input type="text" placeholder="Step Title" value={step.title || ''} onChange={e => {
                              const configs = [...settings.projectTypeConfigs];
                              if (!configs[idx].journeyFlowchart) configs[idx].journeyFlowchart = [...journeySteps];
                              configs[idx].journeyFlowchart[sIdx].title = e.target.value;
                              updateNested(['projectTypeConfigs'], configs);
                            }} className="flex-1 border rounded px-2 py-1 font-bold text-slate-800" />
                            <input type="text" placeholder="Description" value={step.desc || ''} onChange={e => {
                              const configs = [...settings.projectTypeConfigs];
                              if (!configs[idx].journeyFlowchart) configs[idx].journeyFlowchart = [...journeySteps];
                              configs[idx].journeyFlowchart[sIdx].desc = e.target.value;
                              updateNested(['projectTypeConfigs'], configs);
                            }} className="flex-1 border rounded px-2 py-1 text-slate-600" />
                            <button type="button" onClick={() => {
                              const configs = [...settings.projectTypeConfigs];
                              const newFlow = [...(configs[idx].journeyFlowchart || journeySteps)];
                              newFlow.splice(sIdx, 1);
                              configs[idx].journeyFlowchart = newFlow;
                              updateNested(['projectTypeConfigs'], configs);
                            }} className="text-red-400 hover:text-red-600 p-1">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Project-Type Specific FAQs */}
                    <div className="border-t border-slate-200 pt-3 mt-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Project Type FAQs</h4>
                        <button
                          type="button"
                          onClick={() => {
                            const configs = [...settings.projectTypeConfigs];
                            const currentFaqs = configs[idx].faqs || [];
                            configs[idx].faqs = [...currentFaqs, { question: '', answer: '' }];
                            updateNested(['projectTypeConfigs'], configs);
                          }}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add FAQ
                        </button>
                      </div>
                      <div className="space-y-2">
                        {ptFaqs.map((faq, fIdx) => (
                          <div key={fIdx} className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                            <div className="flex items-center gap-2">
                              <input type="text" placeholder="Question" value={faq.question} onChange={e => {
                                const configs = [...settings.projectTypeConfigs];
                                configs[idx].faqs[fIdx].question = e.target.value;
                                updateNested(['projectTypeConfigs'], configs);
                              }} className="flex-1 border rounded px-2 py-1 font-bold text-slate-800" />
                              <button type="button" onClick={() => {
                                const configs = [...settings.projectTypeConfigs];
                                configs[idx].faqs.splice(fIdx, 1);
                                updateNested(['projectTypeConfigs'], configs);
                              }} className="text-red-400 hover:text-red-600 p-1">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <textarea placeholder="Answer" value={faq.answer} onChange={e => {
                              const configs = [...settings.projectTypeConfigs];
                              configs[idx].faqs[fIdx].answer = e.target.value;
                              updateNested(['projectTypeConfigs'], configs);
                            }} className="w-full border rounded px-2 py-1 text-slate-600 h-14" />
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}late-500 text-sm italic">No project types configured for {settings.countryName}. Use the dropdown above to add project types from Order Journey.</p>
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
