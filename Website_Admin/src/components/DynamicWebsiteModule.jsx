import React, { useState, useEffect } from 'react';
import { Save, Globe, Play, Image, Settings, Eye } from 'lucide-react';


const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

export default function DynamicWebsiteModule() {
  const [country, setCountry] = useState('australia');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/country-website-settings/${country}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      } else {
        // Defaults if not exist
        setSettings({
          countryCode: country === 'australia' ? 'AU' : 'IN',
          countryName: country === 'australia' ? 'Australia' : 'India',
          currency: country === 'australia' ? 'AUD' : 'INR',
          currencySymbol: country === 'australia' ? '$' : '₹',
          isEnabled: true,
          websiteContent: {
            heroTitle: 'Go Solar',
            heroSubtitle: 'Save on bills',
            bannerImage: '',
            faqs: [],
            videos: [], // new
          },
          projectTypes: ['residential', 'commercial'],
          seoMetadata: { title: '', description: '', keywords: [] }
        });
      }
    } catch (err) {
      alert("error", "Error fetching website settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [country]);

  const handleSave = async () => {
    try {
      // Assuming a PUT route handles upsert
      const res = await fetch(`${API_BASE}/api/country-website-settings/${country}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        alert("success", "Dynamic website settings saved!");
      }
    } catch (err) {
      alert("error", "Failed to save settings");
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

  if (!settings && loading) return <div className="p-8 text-center">Loading...</div>;
  if (!settings) return null;

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
        {['general', 'landing', 'faqs', 'seo'].map(tab => (
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
                <label className="font-semibold text-slate-700">Enable this country website</label>
              </div>
            </div>
          </div>
        )}

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
            {/* Can add Explainer Video logic here */}
          </div>
        )}

        {activeTab === 'faqs' && (
          <div>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Country-specific FAQs</h2>
                <button onClick={addFaq} className="text-sm text-blue-600 font-semibold">+ Add FAQ</button>
             </div>
             <div className="space-y-4">
               {settings.websiteContent?.faqs?.map((faq, idx) => (
                 <div key={idx} className="p-4 border rounded-xl bg-slate-50">
                    <input type="text" placeholder="Question" value={faq.question} onChange={e => {
                      const newFaqs = [...settings.websiteContent.faqs];
                      newFaqs[idx].question = e.target.value;
                      updateNested(['websiteContent', 'faqs'], newFaqs);
                    }} className="w-full border rounded p-2 mb-2 bg-white font-medium" />
                    <textarea placeholder="Answer" value={faq.answer} onChange={e => {
                      const newFaqs = [...settings.websiteContent.faqs];
                      newFaqs[idx].answer = e.target.value;
                      updateNested(['websiteContent', 'faqs'], newFaqs);
                    }} className="w-full border rounded p-2 bg-white text-sm" />
                 </div>
               ))}
             </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold mb-4">SEO Configuration</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Page Title</label>
              <input type="text" value={settings.seoMetadata?.title} onChange={e => updateNested(['seoMetadata', 'title'], e.target.value)} className="w-full border rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Meta Description</label>
              <textarea value={settings.seoMetadata?.description} onChange={e => updateNested(['seoMetadata', 'description'], e.target.value)} className="w-full border rounded-lg p-2 h-20" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Keywords (comma separated)</label>
              <input type="text" value={settings.seoMetadata?.keywords?.join(', ')} onChange={e => updateNested(['seoMetadata', 'keywords'], e.target.value.split(',').map(s=>s.trim()))} className="w-full border rounded-lg p-2" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
