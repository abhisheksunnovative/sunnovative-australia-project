import React, { useState, useEffect, useCallback } from "react";
import {
  Save,
  Loader2,
  AlertCircle,
  Globe,
  Plus,
  Trash2,
  RefreshCw,
  Info,
  CheckCircle,
  ChevronRight,
  ArrowLeft,
  LayoutTemplate,
  Settings as SettingsIcon,
  Video,
  ListChecks,
  Image as ImageIcon,
  MessageSquare,
  MousePointerClick,
  Award
} from "lucide-react";

// Helper components inside the file for simplicity
const Field = ({ label, value = "", onChange, placeholder, type = "text", multiline = false }) => {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-sm font-medium border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-solar-yellow/40 focus:border-solar-yellow/40 transition-all min-h-[80px]"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-sm font-medium border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-solar-yellow/40 focus:border-solar-yellow/40 transition-all"
        />
      )}
    </div>
  );
};

const SectionCard = ({ title, icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition border-b border-slate-100"
      >
        <div className="flex items-center gap-3 text-primary font-bold text-sm">
          {icon}
          {title}
        </div>
        <ChevronRight
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
        />
      </button>
      {isOpen && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
};

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const COUNTRIES = [
  { id: "india", name: "India", flag: "🇮🇳" },
  { id: "australia", name: "Australia", flag: "🇦🇺" },
  { id: "new_zealand", name: "New Zealand", flag: "🇳🇿" },
  { id: "uk", name: "United Kingdom", flag: "🇬🇧" },
  { id: "usa", name: "USA", flag: "🇺🇸" }
];

// Moved outside component to avoid stale closure in useCallback
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

export default function WebsiteSettingsScreen() {
  const [activeCountry, setActiveCountry] = useState("india");
  const [projectTypes, setProjectTypes] = useState([]);
  const [ptLoading, setPtLoading] = useState(false);
  
  // null = Cards View, 'default' = Global Settings, other string = specific Project Type Editor
  const [selectedProjectType, setSelectedProjectType] = useState(null);
  
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Fetch Project Types for the country
  const fetchProjectTypes = useCallback(async () => {
    setPtLoading(true);
    setProjectTypes([]); // Clear while loading
    try {
      const res = await fetch(`${API_BASE}/api/order-journey-settings?country=${activeCountry}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && data.data && Array.isArray(data.data.journeys) && data.data.journeys.length > 0) {
        const pTypes = data.data.journeys.map(j => ({
            id: j.projectType,
            name: j.projectTypeLabel || j.projectType,
            enabled: j.enabled
        }));
        setProjectTypes(pTypes.filter(p => p.enabled));
      } else {
        setProjectTypes([]);
      }
    } catch (err) {
      console.error("Failed to fetch project types:", err);
      setProjectTypes([]);
    } finally {
      setPtLoading(false);
    }
  }, [activeCountry]);

  // 2. Fetch specific Website Settings
  const fetchSettings = useCallback(async (projectType) => {
    if (!projectType) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/website-settings/${activeCountry}/${projectType}`);
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
      } else {
        showToast("error", "Failed to load settings");
      }
    } catch (err) {
      showToast("error", "Cannot connect to backend.");
    } finally {
      setLoading(false);
    }
  }, [activeCountry, API_BASE]);

  useEffect(() => {
    fetchProjectTypes();
  }, [fetchProjectTypes]);

  useEffect(() => {
    if (selectedProjectType) {
      fetchSettings(selectedProjectType);
    }
  }, [selectedProjectType, fetchSettings]);

  // Handle Country Tab Change
  const handleCountryChange = (countryId) => {
    setActiveCountry(countryId);
    setSelectedProjectType(null);
    setSettings(null);
  };

  // State Updaters
  const updatePath = (path, value) => {
    setSettings((prev) => {
      const next = clone(prev);
      let ref = next;
      for (let i = 0; i < path.length - 1; i++) {
        if (!ref[path[i]]) ref[path[i]] = {}; // Auto initialize objects
        ref = ref[path[i]];
      }
      ref[path[path.length - 1]] = value;
      return next;
    });
  };

  const addItem = (path, template) => {
    setSettings((prev) => {
      const next = clone(prev);
      let ref = next;
      for (const key of path) {
        if (!ref[key]) ref[key] = [];
        ref = ref[key];
      }
      ref.push(clone(template));
      return next;
    });
  };

  const removeItem = (path, index) => {
    setSettings((prev) => {
      const next = clone(prev);
      let ref = next;
      for (const key of path) ref = ref[key];
      ref.splice(index, 1);
      return next;
    });
  };

  const updateItem = (path, index, field, value) => {
    setSettings((prev) => {
      const next = clone(prev);
      let ref = next;
      for (const key of path) ref = ref[key];
      ref[index][field] = value;
      return next;
    });
  };

  // Save Settings
  const handleSave = async () => {
    if (!settings || !selectedProjectType) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/website-settings/${activeCountry}/${selectedProjectType}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Saved Successfully!");
      } else {
        showToast("error", "Save failed");
      }
    } catch {
      showToast("error", "Network error. Could not save.");
    } finally {
      setSaving(false);
    }
  };

  // Reset Settings
  const handleReset = async () => {
    if (!window.confirm("Are you sure? This will reset the settings for this project type to default values.")) return;
    setResetting(true);
    try {
      // For simplicity, just refetching or creating a reset route
      const res = await fetch(`${API_BASE}/api/website-settings/${activeCountry}/${selectedProjectType}/reset`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        showToast("success", "Reset to defaults!");
      } else {
        // Fallback if reset route doesn't support project type yet
        showToast("error", "Reset not available yet for project types.");
      }
    } catch {
      showToast("error", "Network error");
    } finally {
      setResetting(false);
    }
  };

  const renderCardsView = () => {
    return (
      <div className="space-y-6">
        {/* Country Tabs */}
        <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-200">
          {COUNTRIES.map((c) => (
            <button
              key={c.id}
              onClick={() => handleCountryChange(c.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeCountry === c.id
                  ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>{c.flag}</span>
              {c.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Global Configuration Card */}
          <div
            onClick={() => setSelectedProjectType("default")}
            className="group relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <SettingsIcon className="w-24 h-24 text-white" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
              <div className="p-3 bg-white/10 rounded-xl w-fit">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Global Configuration</h3>
                <p className="text-xs font-medium text-slate-300 line-clamp-2">
                  Brand Logo, Header info, FAQs, Footer Details, and Video Guides for the entire country website.
                </p>
              </div>
            </div>
          </div>

          {/* Project Type Cards */}
          {projectTypes.map((pt) => (
            <div
              key={pt.id}
              onClick={() => setSelectedProjectType(pt.id)}
              className="group relative bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer hover:shadow-xl hover:shadow-solar-yellow/10 hover:border-solar-yellow/50 hover:-translate-y-1 transition-all"
            >
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div className="p-3 bg-solar-yellow/10 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  <LayoutTemplate className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{pt.name}</h3>
                  <p className="text-xs font-medium text-slate-500 line-clamp-2">
                    Edit Landing Page specific sections: Hero, Benefits, Video, Apply Form, Customer Journey, Testimonials, USPs.
                  </p>
                </div>
              </div>
            </div>
          ))}

          {ptLoading && (
            <div className="col-span-full py-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-solar-yellow mx-auto mb-2" />
              <p className="text-sm text-slate-400">Loading project types...</p>
            </div>
          )}

          {!ptLoading && projectTypes.length === 0 && (
             <div className="col-span-full py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
               <p className="text-sm font-semibold text-slate-500 mb-3">No project types configured for this country in Order Journey.</p>
               <button onClick={fetchProjectTypes} className="text-xs px-3 py-1.5 bg-solar-yellow/10 text-amber-600 border border-amber-200 rounded-lg hover:bg-solar-yellow/20 transition font-semibold flex items-center gap-1.5 mx-auto">
                 <RefreshCw className="w-3.5 h-3.5" /> Retry
               </button>
             </div>
          )}
        </div>
      </div>
    );
  };

  const renderEditorView = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-96 gap-4 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-solar-yellow" />
          <p className="text-sm font-medium">Loading settings...</p>
        </div>
      );
    }
    if (!settings) {
      return (
        <div className="flex flex-col items-center justify-center h-96 gap-4 text-red-500">
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm font-medium">Could not load settings.</p>
          <button
            onClick={() => fetchSettings(selectedProjectType)}
            className="text-xs px-4 py-2 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition"
          >
            Retry
          </button>
        </div>
      );
    }

    const isGlobal = selectedProjectType === "default";
    const ptName = isGlobal ? "Global Configuration" : projectTypes.find(p => p.id === selectedProjectType)?.name || selectedProjectType;

    return (
      <div className="space-y-6">
        {/* Editor Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedProjectType(null);
                setSettings(null);
              }}
              className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  {COUNTRIES.find(c => c.id === activeCountry)?.name}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] font-bold text-solar-yellow uppercase tracking-wider">
                  {isGlobal ? "Global" : "Project Type"}
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-800">{ptName} Editor</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-900 bg-solar-yellow rounded-xl hover:bg-amber-400 transition shadow-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Changes made here will be applied directly to the website for {COUNTRIES.find(c => c.id === activeCountry)?.name} 
            {!isGlobal && ` - ${ptName}`}.
          </span>
        </div>

        {/* --- GLOBAL CONFIGURATION SECTIONS --- */}
        {isGlobal && (
          <div className="space-y-6">
            <SectionCard title="Brand & Header" icon={<Globe className="w-5 h-5" />} defaultOpen={true}>
              <div className="space-y-3 pt-4">
                <Field label="Logo Image URL" value={settings.brand?.logoUrl} onChange={(v) => updatePath(["brand", "logoUrl"], v)} placeholder="https://..." />
                {settings.brand?.logoUrl && (
                  <img src={settings.brand.logoUrl} alt="Logo" className="h-12 object-contain rounded-lg border border-slate-100 bg-slate-50 px-2" onError={(e) => (e.target.style.display = "none")} />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <Field label="Company Name" value={settings.brand?.companyName} onChange={(v) => updatePath(["brand", "companyName"], v)} />
                <Field label="Tagline" value={settings.brand?.tagline} onChange={(v) => updatePath(["brand", "tagline"], v)} />
                <Field label="Phone Number" value={settings.brand?.phone} onChange={(v) => updatePath(["brand", "phone"], v)} />
                <Field label="Hub Label" value={settings.brand?.hubLabel} onChange={(v) => updatePath(["brand", "hubLabel"], v)} />
              </div>
              <Field label="Top Banner Text" value={settings.brand?.topBannerText} onChange={(v) => updatePath(["brand", "topBannerText"], v)} multiline />
            </SectionCard>

            <SectionCard title="FAQs" icon={<MessageSquare className="w-5 h-5" />}>
              <div className="space-y-4 pt-4">
                {(settings.faqs || []).map((faq, i) => (
                  <div key={i} className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">FAQ #{i + 1}</span>
                      <button onClick={() => removeItem(["faqs"], i)} className="p-1 text-red-400 hover:bg-red-50 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <Field label="Question" value={faq.question} onChange={(v) => updateItem(["faqs"], i, "question", v)} />
                    <Field label="Answer" value={faq.answer} onChange={(v) => updateItem(["faqs"], i, "answer", v)} multiline />
                  </div>
                ))}
                <button onClick={() => addItem(["faqs"], { question: "", answer: "" })} className="flex items-center gap-2 text-xs font-semibold text-solar-yellow hover:text-amber-600 transition">
                  <Plus className="w-4 h-4" /> Add FAQ
                </button>
              </div>
            </SectionCard>

            <SectionCard title="Footer Details" icon={<LayoutTemplate className="w-5 h-5" />}>
              <div className="space-y-4 pt-4">
                <Field label="Address" value={settings.footer?.address} onChange={(v) => updatePath(["footer", "address"], v)} multiline />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Phone" value={settings.footer?.phone} onChange={(v) => updatePath(["footer", "phone"], v)} />
                  <Field label="Email" value={settings.footer?.email} onChange={(v) => updatePath(["footer", "email"], v)} />
                </div>
                <Field label="GEDA Certificate Number" value={settings.footer?.gedaCertNo} onChange={(v) => updatePath(["footer", "gedaCertNo"], v)} />
                <Field label="Footer Copyright Text" value={settings.footer?.copyrightText} onChange={(v) => updatePath(["footer", "copyrightText"], v)} multiline />
              </div>
            </SectionCard>
          </div>
        )}

        {/* --- PROJECT TYPE SPECIFIC SECTIONS --- */}
        {!isGlobal && (
          <div className="space-y-6">
            
            <SectionCard title="1. Hero Section" icon={<Globe className="w-5 h-5 text-amber-500" />}>
              <div className="space-y-4 pt-4">
                <Field label="Badge Text" value={settings.hero?.badge} onChange={(v) => updatePath(["hero", "badge"], v)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Heading Line 1" value={settings.hero?.headingLine1} onChange={(v) => updatePath(["hero", "headingLine1"], v)} />
                  <Field label="Heading Highlight (colored)" value={settings.hero?.headingHighlight} onChange={(v) => updatePath(["hero", "headingHighlight"], v)} />
                </div>
                <Field label="Subtext / Description" value={settings.hero?.subtext} onChange={(v) => updatePath(["hero", "subtext"], v)} multiline />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Primary CTA Button" value={settings.hero?.ctaPrimary} onChange={(v) => updatePath(["hero", "ctaPrimary"], v)} />
                  <Field label="Secondary CTA Button" value={settings.hero?.ctaSecondary} onChange={(v) => updatePath(["hero", "ctaSecondary"], v)} />
                </div>
                <Field label="Floating Social Proof Text" value={settings.hero?.socialProofText} onChange={(v) => updatePath(["hero", "socialProofText"], v)} />
              </div>
            </SectionCard>

            <SectionCard title="2. Title and Description (Video)" icon={<Video className="w-5 h-5 text-amber-500" />}>
              <div className="space-y-4 pt-4">
                <Field label="Section Title" value={settings.projectTitle?.title} onChange={(v) => updatePath(["projectTitle", "title"], v)} />
                <Field label="Description" value={settings.projectTitle?.description} onChange={(v) => updatePath(["projectTitle", "description"], v)} multiline />
                <Field label="Video URL (YouTube/Vimeo Embed)" value={settings.projectTitle?.videoUrl} onChange={(v) => updatePath(["projectTitle", "videoUrl"], v)} />
              </div>
            </SectionCard>

            <SectionCard title="3. Form - Apply for Solar" icon={<ListChecks className="w-5 h-5 text-amber-500" />}>
              <div className="space-y-4 pt-4">
                <Field label="Form Title" value={settings.projectForm?.title} onChange={(v) => updatePath(["projectForm", "title"], v)} />
                <Field label="Form Subtitle" value={settings.projectForm?.subtitle} onChange={(v) => updatePath(["projectForm", "subtitle"], v)} />
                <Field label="Form Identifier (ID)" value={settings.projectForm?.formId} onChange={(v) => updatePath(["projectForm", "formId"], v)} />
                
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700 mb-3">Form Fields Builder</h4>
                  <div className="space-y-3">
                    {(settings.projectForm?.fields || []).map((field, i) => (
                      <div key={i} className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500">Field #{i + 1}</span>
                          <button onClick={() => {
                            const newFields = [...(settings.projectForm?.fields || [])];
                            newFields.splice(i, 1);
                            updatePath(["projectForm", "fields"], newFields);
                          }} className="text-red-500 hover:text-red-700 p-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Field label="Label (e.g. Full Name)" value={field.label} onChange={(v) => {
                            const newFields = [...(settings.projectForm?.fields || [])];
                            newFields[i].label = v;
                            updatePath(["projectForm", "fields"], newFields);
                          }} />
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Field Key (DB Mapping)</label>
                            <select
                              value={field.key || ""}
                              onChange={(e) => {
                                const newFields = [...(settings.projectForm?.fields || [])];
                                newFields[i].key = e.target.value;
                                updatePath(["projectForm", "fields"], newFields);
                              }}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-solar-yellow/20 focus:border-solar-yellow transition-all"
                            >
                              <option value="">Select Field Key...</option>
                              <option value="consumerNumber">Consumer Number</option>
                              <option value="fullName">Full Name</option>
                              <option value="mobileNumber">Mobile Number</option>
                              <option value="email">Email Address</option>
                              <option value="postcode">Postcode / Pincode</option>
                              <option value="city">City</option>
                              <option value="customerState">State</option>
                              <option value="monthlyBill">Average Monthly Bill</option>
                              <option value="ownsProperty">Do you own the property?</option>
                              <option value="billFile">Upload Bill (File)</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Input Type</label>
                            <select
                              value={field.type || "text"}
                              onChange={(e) => {
                                const newFields = [...(settings.projectForm?.fields || [])];
                                newFields[i].type = e.target.value;
                                updatePath(["projectForm", "fields"], newFields);
                              }}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-solar-yellow/20 focus:border-solar-yellow transition-all"
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="tel">Phone (Tel)</option>
                              <option value="email">Email</option>
                              <option value="select">Dropdown (Select)</option>
                              <option value="textarea">Textarea</option>
                              <option value="file">File Upload</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2 mt-6">
                            <input
                              type="checkbox"
                              checked={field.required || false}
                              onChange={(e) => {
                                const newFields = [...(settings.projectForm?.fields || [])];
                                newFields[i].required = e.target.checked;
                                updatePath(["projectForm", "fields"], newFields);
                              }}
                              className="w-4 h-4 text-solar-yellow rounded border-slate-300 focus:ring-solar-yellow"
                            />
                            <label className="text-sm font-medium text-slate-700">Required Field</label>
                          </div>
                        </div>
                        {field.type === "select" && (
                          <Field 
                            label="Dropdown Options (Comma separated)" 
                            value={(field.options || []).join(", ")} 
                            onChange={(v) => {
                              const newFields = [...(settings.projectForm?.fields || [])];
                              newFields[i].options = v.split(",").map(s => s.trim()).filter(s => s);
                              updatePath(["projectForm", "fields"], newFields);
                            }} 
                            placeholder="e.g. Yes, No, Maybe"
                          />
                        )}
                      </div>
                    ))}
                    <button onClick={() => {
                      const newFields = [...(settings.projectForm?.fields || []), { label: "", key: "", type: "text", required: false, options: [] }];
                      updatePath(["projectForm", "fields"], newFields);
                    }} className="flex items-center gap-2 text-xs font-semibold text-solar-yellow hover:text-amber-600 transition pt-2">
                      <Plus className="w-4 h-4" /> Add Form Field
                    </button>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="4. Customer Journey Snap" icon={<ImageIcon className="w-5 h-5 text-amber-500" />}>
              <div className="space-y-4 pt-4">
                <Field label="Title" value={settings.journeySnap?.title} onChange={(v) => updatePath(["journeySnap", "title"], v)} />
                <Field label="Image URL" value={settings.journeySnap?.imageUrl} onChange={(v) => updatePath(["journeySnap", "imageUrl"], v)} />
                {settings.journeySnap?.imageUrl && (
                  <img src={settings.journeySnap.imageUrl} alt="Journey Snap" className="h-32 object-contain rounded-lg border border-slate-100 bg-slate-50" />
                )}
              </div>
            </SectionCard>

            <SectionCard title="5. Testimonials (Video)" icon={<Video className="w-5 h-5 text-amber-500" />}>
              <div className="space-y-4 pt-4">
                <Field label="Title" value={settings.testimonials?.title} onChange={(v) => updatePath(["testimonials", "title"], v)} />
                <Field label="Testimonial Video URL (Embed)" value={settings.testimonials?.videoUrl} onChange={(v) => updatePath(["testimonials", "videoUrl"], v)} />
              </div>
            </SectionCard>

            <SectionCard title="6. Apply for Solar (CTA)" icon={<MousePointerClick className="w-5 h-5 text-amber-500" />}>
              <div className="space-y-4 pt-4">
                <Field label="Title" value={settings.applySolarCta?.title} onChange={(v) => updatePath(["applySolarCta", "title"], v)} />
                <Field label="Button Text" value={settings.applySolarCta?.buttonText} onChange={(v) => updatePath(["applySolarCta", "buttonText"], v)} />
              </div>
            </SectionCard>

            <SectionCard title="7. USPs (Why Choose Us)" icon={<Award className="w-5 h-5 text-amber-500" />}>
              <div className="space-y-4 pt-4">
                <Field label="Title" value={settings.usps?.title} onChange={(v) => updatePath(["usps", "title"], v)} />
                
                {(settings.usps?.items || []).map((usp, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1">
                      <Field label={`USP #${i+1}`} value={usp.text} onChange={(v) => updateItem(["usps", "items"], i, "text", v)} />
                    </div>
                    <button onClick={() => removeItem(["usps", "items"], i)} className="mt-5 p-2 text-red-400 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={() => addItem(["usps", "items"], { text: "" })} className="flex items-center gap-2 text-xs font-semibold text-solar-yellow hover:text-amber-600 transition">
                  <Plus className="w-4 h-4" /> Add USP
                </button>
              </div>
            </SectionCard>

            {/* Legacy Sections mapping */}
            <SectionCard title="Legacy: Benefits Section" icon={<Globe className="w-5 h-5" />} defaultOpen={false}>
               <div className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Section Title" value={settings.benefits?.sectionTitle} onChange={(v) => updatePath(["benefits", "sectionTitle"], v)} />
                  <Field label="Section Subtitle" value={settings.benefits?.sectionSubtitle} onChange={(v) => updatePath(["benefits", "sectionSubtitle"], v)} />
                </div>
                <Field label="Section Description" value={settings.benefits?.sectionDesc} onChange={(v) => updatePath(["benefits", "sectionDesc"], v)} multiline />
                
                {(settings.benefits?.items || []).map((item, i) => (
                  <div key={i} className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">Benefit #{i + 1}</span>
                      <button onClick={() => removeItem(["benefits", "items"], i)} className="p-1 text-red-400 hover:bg-red-50 rounded transition"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Field label="Title" value={item.title} onChange={(v) => updateItem(["benefits", "items"], i, "title", v)} />
                      <Field label="Subtitle" value={item.subtitle} onChange={(v) => updateItem(["benefits", "items"], i, "subtitle", v)} />
                    </div>
                    <Field label="Description" value={item.desc} onChange={(v) => updateItem(["benefits", "items"], i, "desc", v)} multiline />
                  </div>
                ))}
                <button onClick={() => addItem(["benefits", "items"], { title: "", subtitle: "", desc: "", badge: "" })} className="flex items-center gap-2 text-xs font-semibold text-solar-yellow hover:text-amber-600 transition">
                  <Plus className="w-4 h-4" /> Add Benefit
                </button>
               </div>
            </SectionCard>

            <SectionCard title="Legacy: Stats Bar" icon={<Globe className="w-5 h-5" />} defaultOpen={false}>
               <div className="space-y-3 pt-4">
                {(settings.stats || []).map((stat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <Field label={`Stat ${i + 1} Value`} value={stat.value} onChange={(v) => updateItem(["stats"], i, "value", v)} />
                      <Field label="Label" value={stat.label} onChange={(v) => updateItem(["stats"], i, "label", v)} />
                    </div>
                    <button onClick={() => removeItem(["stats"], i)} className="mt-5 p-2 text-red-400 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => addItem(["stats"], { value: "", label: "" })} className="flex items-center gap-2 text-xs font-semibold text-solar-yellow hover:text-amber-600 transition">
                  <Plus className="w-4 h-4" /> Add Stat
                </button>
               </div>
            </SectionCard>

            <SectionCard title="Legacy: How It Works" icon={<Globe className="w-5 h-5" />} defaultOpen={false}>
               <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Section Title" value={settings.howItWorks?.sectionTitle} onChange={(v) => updatePath(["howItWorks", "sectionTitle"], v)} />
                    <Field label="Section Subtitle" value={settings.howItWorks?.sectionSubtitle} onChange={(v) => updatePath(["howItWorks", "sectionSubtitle"], v)} />
                  </div>
                  {(settings.howItWorks?.steps || []).map((step, i) => (
                    <div key={i} className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Step #{i + 1}</span>
                        <button onClick={() => removeItem(["howItWorks", "steps"], i)} className="p-1 text-red-400 hover:bg-red-50 rounded transition"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Step Number" value={step.stepNum} onChange={(v) => updateItem(["howItWorks", "steps"], i, "stepNum", v)} />
                        <Field label="Time Label" value={step.timeLabel} onChange={(v) => updateItem(["howItWorks", "steps"], i, "timeLabel", v)} />
                      </div>
                      <Field label="Step Title" value={step.title} onChange={(v) => updateItem(["howItWorks", "steps"], i, "title", v)} />
                      <Field label="Step Description" value={step.desc} onChange={(v) => updateItem(["howItWorks", "steps"], i, "desc", v)} multiline />
                    </div>
                  ))}
                  <button onClick={() => addItem(["howItWorks", "steps"], { stepNum: "", timeLabel: "", title: "", desc: "" })} className="flex items-center gap-2 text-xs font-semibold text-solar-yellow hover:text-amber-600 transition">
                    <Plus className="w-4 h-4" /> Add Step
                  </button>
               </div>
            </SectionCard>

            <SectionCard title="Legacy: Trust / About Section" icon={<Globe className="w-5 h-5" />} defaultOpen={false}>
               <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Section Title" value={settings.trust?.sectionTitle} onChange={(v) => updatePath(["trust", "sectionTitle"], v)} />
                    <Field label="Section Subtitle" value={settings.trust?.sectionSubtitle} onChange={(v) => updatePath(["trust", "sectionSubtitle"], v)} />
                  </div>
                  <Field label="Section Description" value={settings.trust?.sectionDesc} onChange={(v) => updatePath(["trust", "sectionDesc"], v)} multiline />
                  {(settings.trust?.points || []).map((pt, i) => (
                    <div key={i} className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Point #{i + 1}</span>
                        <button onClick={() => removeItem(["trust", "points"], i)} className="p-1 text-red-400 hover:bg-red-50 rounded transition"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <Field label="Title" value={pt.title} onChange={(v) => updateItem(["trust", "points"], i, "title", v)} />
                      <Field label="Description" value={pt.desc} onChange={(v) => updateItem(["trust", "points"], i, "desc", v)} multiline />
                    </div>
                  ))}
                  <button onClick={() => addItem(["trust", "points"], { title: "", desc: "" })} className="flex items-center gap-2 text-xs font-semibold text-solar-yellow hover:text-amber-600 transition">
                    <Plus className="w-4 h-4" /> Add Trust Point
                  </button>
               </div>
            </SectionCard>

            <SectionCard title="Legacy: Milestones" icon={<Globe className="w-5 h-5" />} defaultOpen={false}>
               <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Section Title" value={settings.milestones?.sectionTitle} onChange={(v) => updatePath(["milestones", "sectionTitle"], v)} />
                    <Field label="Section Subtitle" value={settings.milestones?.sectionSubtitle} onChange={(v) => updatePath(["milestones", "sectionSubtitle"], v)} />
                  </div>
                  {(settings.milestones?.items || []).map((item, i) => (
                    <div key={i} className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Milestone #{i + 1}</span>
                        <button onClick={() => removeItem(["milestones", "items"], i)} className="p-1 text-red-400 hover:bg-red-50 rounded transition"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <Field label="Value" value={item.value} onChange={(v) => updateItem(["milestones", "items"], i, "value", v)} />
                        <Field label="Label" value={item.label} onChange={(v) => updateItem(["milestones", "items"], i, "label", v)} />
                        <Field label="Sub-label" value={item.sublabel} onChange={(v) => updateItem(["milestones", "items"], i, "sublabel", v)} />
                      </div>
                    </div>
                  ))}
                  <button onClick={() => addItem(["milestones", "items"], { value: "", label: "", sublabel: "" })} className="flex items-center gap-2 text-xs font-semibold text-solar-yellow hover:text-amber-600 transition">
                    <Plus className="w-4 h-4" /> Add Milestone
                  </button>
               </div>
            </SectionCard>

          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all ${
            toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
          }`}
        >
          {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {!selectedProjectType ? renderCardsView() : renderEditorView()}
      
      <div className="pb-12" />
    </div>
  );
}
