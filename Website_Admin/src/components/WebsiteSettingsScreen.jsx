/**
 * WebsiteSettingsScreen — Admin panel tab to manage public website content
 * API: GET/PUT /api/website-settings
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Globe,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

// Metadata for each sub-page (used for page header + save button label)
const SECTION_META = {
  brand: { title: "Brand & Logo", desc: "Company name, logo, tagline aur top banner manage karo." },
  hero: { title: "Hero Section", desc: "Homepage ka sabse upar wala banner section." },
  stats: { title: "Stats Bar", desc: "Hero ke neeche dikhne wale numbers/stats." },
  benefits: { title: "Benefits Section", desc: "Solar install karne ke benefits wala section." },
  howItWorks: { title: "How It Works", desc: "4-step process steps." },
  trust: { title: "Trust / About Section", desc: "Company ke trust points." },
  milestones: { title: "Milestones", desc: "Company ke stats/milestones (Trust ke neeche)." },
  faqs: { title: "FAQs", desc: "Website par dikhne wale FAQs." },
  footer: { title: "Footer Details", desc: "Address, phone, email, GEDA cert aur copyright text." },
  videos: { title: "Video Guides", desc: "Manage informational video links for Website and EPC Dashboard." },
};

// ── Tiny reusable components ──────────────────────────────────────────────────

const SectionCard = ({ title, icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-solar-yellow">{icon}</span>
          <span className="font-semibold text-slate-800 text-sm">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {open && <div className="px-6 pb-6 space-y-4 border-t border-slate-100">{children}</div>}
    </div>
  );
};

const Field = ({ label, value, onChange, multiline = false, placeholder = "" }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
    {multiline ? (
      <textarea
        className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-solar-yellow/40 resize-none"
        rows={3}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    ) : (
      <input
        className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-solar-yellow/40"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    )}
  </div>
);

// Deep clone utility
const clone = (obj) => JSON.parse(JSON.stringify(obj));

// ── Main Screen ───────────────────────────────────────────────────────────────

export const WebsiteSettingsScreen = ({ section }) => {
  const meta = SECTION_META[section] || { title: "Website Settings", desc: "Yahan se public website ka content manage karo" };
  // Show only the block matching `section`. If no section passed, show everything (legacy/all-in-one mode).
  const visible = (key) => !section || section === key;
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }
  const [selectedCountry, setSelectedCountry] = useState("india");

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch settings on mount
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/website-settings`, {
        headers: { 'x-country': selectedCountry }
      });
      const data = await res.json();
      if (data.success) setSettings(data.data);
      else showToast("error", "Failed to load settings");
    } catch (err) {
      showToast("error", "Cannot connect to backend. Make sure server is running.");
    } finally {
      setLoading(false);
    }
  }, [selectedCountry]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Deep path setter — set(settings, ['hero','badge'], 'new value')
  const updatePath = (path, value) => {
    setSettings((prev) => {
      const next = clone(prev);
      let ref = next;
      for (let i = 0; i < path.length - 1; i++) {
        ref = ref[path[i]];
      }
      ref[path[path.length - 1]] = value;
      return next;
    });
  };

  // Array item handlers
  const addItem = (path, template) => {
    setSettings((prev) => {
      const next = clone(prev);
      let ref = next;
      for (const key of path) ref = ref[key];
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

  // Save to backend
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/website-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", 'x-country': selectedCountry },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) showToast("success", data.message || "Saved!");
      else showToast("error", "Save failed");
    } catch {
      showToast("error", "Network error. Could not save.");
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    if (!window.confirm("Are you sure? This will reset ALL website content to default values.")) return;
    setResetting(true);
    try {
      const res = await fetch(`${API_BASE}/api/website-settings/reset`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        showToast("success", "Reset to defaults!");
      } else showToast("error", "Reset failed");
    } catch {
      showToast("error", "Network error");
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-solar-yellow" />
        <p className="text-sm font-medium">Loading website settings...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-red-500">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm font-medium">Could not load settings. Check backend connection.</p>
        <button
          onClick={fetchSettings}
          className="text-xs px-4 py-2 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-solar-yellow/10 border border-solar-yellow/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-solar-yellow" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">{meta.title}</h1>
            <p className="text-xs text-slate-500">{meta.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}
            className="text-sm font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40">
            <option value="india">India</option>
            <option value="australia">Australia</option>
            <option value="new_zealand">New Zealand</option>
          </select>
          {!section && (
            <button
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition disabled:opacity-50"
            >
              {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Reset to Defaults
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-900 bg-solar-yellow rounded-xl hover:bg-amber-400 transition shadow-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? "Saving..." : `Save ${meta.title}`}
          </button>
        </div>
      </div>

      {/* ── Info banner ── */}
      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <span>
          Yahan jo bhi changes karoge, wo live website par seedha reflect honge. Save karne ke baad
          frontend page refresh karo.
        </span>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all ${
            toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.msg}
        </div>
      )}

      {/* ──────────────────── BRAND ──────────────────────────────── */}
      {visible("brand") && (
      <SectionCard title="Brand & Header" icon={<Globe className="w-5 h-5" />} defaultOpen={true}>
        <div className="space-y-3 pt-4">
          <Field
            label="Logo Image URL"
            value={settings.brand?.logoUrl}
            onChange={(v) => updatePath(["brand", "logoUrl"], v)}
            placeholder="https://... (image link, e.g. from Cloudinary/Imgur)"
          />
          {settings.brand?.logoUrl && (
            <img
              src={settings.brand.logoUrl}
              alt="Logo preview"
              className="h-12 object-contain rounded-lg border border-slate-100 bg-slate-50 px-2"
              onError={(e) => (e.target.style.display = "none")}
            />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <Field
            label="Company Name"
            value={settings.brand?.companyName}
            onChange={(v) => updatePath(["brand", "companyName"], v)}
          />
          <Field
            label="Tagline"
            value={settings.brand?.tagline}
            onChange={(v) => updatePath(["brand", "tagline"], v)}
          />
          <Field
            label="Phone Number"
            value={settings.brand?.phone}
            onChange={(v) => updatePath(["brand", "phone"], v)}
          />
          <Field
            label="Hub Label"
            value={settings.brand?.hubLabel}
            onChange={(v) => updatePath(["brand", "hubLabel"], v)}
          />
        </div>
        <Field
          label="Top Banner Text"
          value={settings.brand?.topBannerText}
          onChange={(v) => updatePath(["brand", "topBannerText"], v)}
          multiline
        />
      </SectionCard>
      )}

      {/* ──────────────────── HERO ───────────────────────────────── */}
      {visible("hero") && (
      <SectionCard title="Hero Section" icon={<Globe className="w-5 h-5" />}>
        <div className="space-y-4 pt-4">
          <Field
            label="Badge Text"
            value={settings.hero?.badge}
            onChange={(v) => updatePath(["hero", "badge"], v)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Heading Line 1"
              value={settings.hero?.headingLine1}
              onChange={(v) => updatePath(["hero", "headingLine1"], v)}
            />
            <Field
              label="Heading Highlight (colored)"
              value={settings.hero?.headingHighlight}
              onChange={(v) => updatePath(["hero", "headingHighlight"], v)}
            />
          </div>
          <Field
            label="Subtext / Description"
            value={settings.hero?.subtext}
            onChange={(v) => updatePath(["hero", "subtext"], v)}
            multiline
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Primary CTA Button"
              value={settings.hero?.ctaPrimary}
              onChange={(v) => updatePath(["hero", "ctaPrimary"], v)}
            />
            <Field
              label="Secondary CTA Button"
              value={settings.hero?.ctaSecondary}
              onChange={(v) => updatePath(["hero", "ctaSecondary"], v)}
            />
          </div>
          <Field
            label="Floating Social Proof Text"
            value={settings.hero?.socialProofText}
            onChange={(v) => updatePath(["hero", "socialProofText"], v)}
          />
        </div>
      </SectionCard>
      )}

      {/* ──────────────────── STATS ──────────────────────────────── */}
      {visible("stats") && (
      <SectionCard title="Stats Bar (Numbers shown under Hero)" icon={<Globe className="w-5 h-5" />}>
        <div className="space-y-3 pt-4">
          {(settings.stats || []).map((stat, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <Field
                  label={`Stat ${i + 1} Value`}
                  value={stat.value}
                  onChange={(v) => updateItem(["stats"], i, "value", v)}
                  placeholder="e.g. 1200+"
                />
                <Field
                  label="Label"
                  value={stat.label}
                  onChange={(v) => updateItem(["stats"], i, "label", v)}
                  placeholder="e.g. Rajkot Homes Solarized"
                />
              </div>
              <button
                onClick={() => removeItem(["stats"], i)}
                className="mt-5 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => addItem(["stats"], { value: "", label: "" })}
            className="flex items-center gap-2 text-xs font-semibold text-solar-yellow hover:text-amber-600 transition"
          >
            <Plus className="w-4 h-4" /> Add Stat
          </button>
        </div>
      </SectionCard>
      )}

      {/* ──────────────────── BENEFITS ───────────────────────────── */}
      {visible("benefits") && (
      <SectionCard title="Benefits Section" icon={<Globe className="w-5 h-5" />}>
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Section Title"
              value={settings.benefits?.sectionTitle}
              onChange={(v) => updatePath(["benefits", "sectionTitle"], v)}
            />
            <Field
              label="Section Subtitle"
              value={settings.benefits?.sectionSubtitle}
              onChange={(v) => updatePath(["benefits", "sectionSubtitle"], v)}
            />
          </div>
          <Field
            label="Section Description"
            value={settings.benefits?.sectionDesc}
            onChange={(v) => updatePath(["benefits", "sectionDesc"], v)}
            multiline
          />

          <div className="space-y-4 mt-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Benefit Items</p>
            {(settings.benefits?.items || []).map((item, i) => (
              <div key={i} className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Benefit #{i + 1}</span>
                  <button
                    onClick={() => removeItem(["benefits", "items"], i)}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field
                    label="Title"
                    value={item.title}
                    onChange={(v) => updateItem(["benefits", "items"], i, "title", v)}
                  />
                  <Field
                    label="Subtitle"
                    value={item.subtitle}
                    onChange={(v) => updateItem(["benefits", "items"], i, "subtitle", v)}
                  />
                </div>
                <Field
                  label="Description"
                  value={item.desc}
                  onChange={(v) => updateItem(["benefits", "items"], i, "desc", v)}
                  multiline
                />
              </div>
            ))}
            <button
              onClick={() =>
                addItem(["benefits", "items"], { title: "", subtitle: "", desc: "", badge: "" })
              }
              className="flex items-center gap-2 text-xs font-semibold text-solar-yellow hover:text-amber-600 transition"
            >
              <Plus className="w-4 h-4" /> Add Benefit
            </button>
          </div>
        </div>
      </SectionCard>
      )}

      {/* ──────────────────── HOW IT WORKS ───────────────────────── */}
      {visible("howItWorks") && (
      <SectionCard title="How It Works — Steps" icon={<Globe className="w-5 h-5" />}>
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Section Title"
              value={settings.howItWorks?.sectionTitle}
              onChange={(v) => updatePath(["howItWorks", "sectionTitle"], v)}
            />
            <Field
              label="Section Subtitle"
              value={settings.howItWorks?.sectionSubtitle}
              onChange={(v) => updatePath(["howItWorks", "sectionSubtitle"], v)}
            />
          </div>

          {(settings.howItWorks?.steps || []).map((step, i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Step #{i + 1}</span>
                <button
                  onClick={() => removeItem(["howItWorks", "steps"], i)}
                  className="p-1 text-red-400 hover:text-red-600 rounded transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Step Number"
                  value={step.stepNum}
                  onChange={(v) => updateItem(["howItWorks", "steps"], i, "stepNum", v)}
                  placeholder="01"
                />
                <Field
                  label="Time Label"
                  value={step.timeLabel}
                  onChange={(v) => updateItem(["howItWorks", "steps"], i, "timeLabel", v)}
                  placeholder="In 2 Minutes"
                />
              </div>
              <Field
                label="Step Title"
                value={step.title}
                onChange={(v) => updateItem(["howItWorks", "steps"], i, "title", v)}
              />
              <Field
                label="Step Description"
                value={step.desc}
                onChange={(v) => updateItem(["howItWorks", "steps"], i, "desc", v)}
                multiline
              />
            </div>
          ))}
          <button
            onClick={() =>
              addItem(["howItWorks", "steps"], { stepNum: "", timeLabel: "", title: "", desc: "" })
            }
            className="flex items-center gap-2 text-xs font-semibold text-solar-yellow hover:text-amber-600 transition"
          >
            <Plus className="w-4 h-4" /> Add Step
          </button>
        </div>
      </SectionCard>
      )}

      {/* ──────────────────── TRUST SECTION ─────────────────────── */}
      {visible("trust") && (
      <SectionCard title="Trust / About Section" icon={<Globe className="w-5 h-5" />}>
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Section Title"
              value={settings.trust?.sectionTitle}
              onChange={(v) => updatePath(["trust", "sectionTitle"], v)}
            />
            <Field
              label="Section Subtitle"
              value={settings.trust?.sectionSubtitle}
              onChange={(v) => updatePath(["trust", "sectionSubtitle"], v)}
            />
          </div>
          <Field
            label="Section Description"
            value={settings.trust?.sectionDesc}
            onChange={(v) => updatePath(["trust", "sectionDesc"], v)}
            multiline
          />

          {(settings.trust?.points || []).map((pt, i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Point #{i + 1}</span>
                <button
                  onClick={() => removeItem(["trust", "points"], i)}
                  className="p-1 text-red-400 hover:text-red-600 rounded transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <Field
                label="Title"
                value={pt.title}
                onChange={(v) => updateItem(["trust", "points"], i, "title", v)}
              />
              <Field
                label="Description"
                value={pt.desc}
                onChange={(v) => updateItem(["trust", "points"], i, "desc", v)}
                multiline
              />
            </div>
          ))}
          <button
            onClick={() => addItem(["trust", "points"], { title: "", desc: "" })}
            className="flex items-center gap-2 text-xs font-semibold text-solar-yellow hover:text-amber-600 transition"
          >
            <Plus className="w-4 h-4" /> Add Trust Point
          </button>
        </div>
      </SectionCard>
      )}

      {/* ──────────────────── MILESTONES ─────────────────────────── */}
      {visible("milestones") && (
      <SectionCard title="Company Milestones (Stats below Trust)" icon={<Globe className="w-5 h-5" />}>
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Section Title"
              value={settings.milestones?.sectionTitle}
              onChange={(v) => updatePath(["milestones", "sectionTitle"], v)}
            />
            <Field
              label="Section Subtitle"
              value={settings.milestones?.sectionSubtitle}
              onChange={(v) => updatePath(["milestones", "sectionSubtitle"], v)}
            />
          </div>
          {(settings.milestones?.items || []).map((item, i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Milestone #{i + 1}</span>
                <button
                  onClick={() => removeItem(["milestones", "items"], i)}
                  className="p-1 text-red-400 hover:text-red-600 rounded transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field
                  label="Value"
                  value={item.value}
                  onChange={(v) => updateItem(["milestones", "items"], i, "value", v)}
                  placeholder="12+"
                />
                <Field
                  label="Label"
                  value={item.label}
                  onChange={(v) => updateItem(["milestones", "items"], i, "label", v)}
                  placeholder="Years of Experience"
                />
                <Field
                  label="Sub-label"
                  value={item.sublabel}
                  onChange={(v) => updateItem(["milestones", "items"], i, "sublabel", v)}
                  placeholder="Pioneering solar..."
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => addItem(["milestones", "items"], { value: "", label: "", sublabel: "" })}
            className="flex items-center gap-2 text-xs font-semibold text-solar-yellow hover:text-amber-600 transition"
          >
            <Plus className="w-4 h-4" /> Add Milestone
          </button>
        </div>
      </SectionCard>
      )}

      {/* ──────────────────── FAQs ───────────────────────────────── */}
      {visible("faqs") && (
      <SectionCard title="FAQs" icon={<Globe className="w-5 h-5" />}>
        <div className="space-y-4 pt-4">
          {(settings.faqs || []).map((faq, i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">FAQ #{i + 1}</span>
                <button
                  onClick={() => removeItem(["faqs"], i)}
                  className="p-1 text-red-400 hover:text-red-600 rounded transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <Field
                label="Question"
                value={faq.question}
                onChange={(v) => updateItem(["faqs"], i, "question", v)}
              />
              <Field
                label="Answer"
                value={faq.answer}
                onChange={(v) => updateItem(["faqs"], i, "answer", v)}
                multiline
              />
            </div>
          ))}
          <button
            onClick={() => addItem(["faqs"], { question: "", answer: "" })}
            className="flex items-center gap-2 text-xs font-semibold text-solar-yellow hover:text-amber-600 transition"
          >
            <Plus className="w-4 h-4" /> Add FAQ
          </button>
        </div>
      </SectionCard>
      )}

      {/* ──────────────────── FOOTER ─────────────────────────────── */}
      {visible("footer") && (
      <SectionCard title="Footer Details" icon={<Globe className="w-5 h-5" />}>
        <div className="space-y-4 pt-4">
          <Field
            label="Address"
            value={settings.footer?.address}
            onChange={(v) => updatePath(["footer", "address"], v)}
            multiline
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Phone"
              value={settings.footer?.phone}
              onChange={(v) => updatePath(["footer", "phone"], v)}
            />
            <Field
              label="Email"
              value={settings.footer?.email}
              onChange={(v) => updatePath(["footer", "email"], v)}
            />
          </div>
          <Field
            label="GEDA Certificate Number"
            value={settings.footer?.gedaCertNo}
            onChange={(v) => updatePath(["footer", "gedaCertNo"], v)}
          />
          <Field
            label="Footer Copyright Text"
            value={settings.footer?.copyrightText}
            onChange={(v) => updatePath(["footer", "copyrightText"], v)}
            multiline
          />
        </div>
      </SectionCard>
      )}

      {/* ──────────────────── VIDEO GUIDES ──────────────────────────── */}
      {visible("videos") && settings.videos && (
      <SectionCard title="Video Guides & Embedded URLs" icon={<Globe className="w-5 h-5" />}>
        <div className="space-y-6 pt-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm">Customer Website Video (How It Works)</h4>
              <label className="flex items-center cursor-pointer gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Enable</span>
                <input
                  type="checkbox"
                  checked={settings.videos.customerWebsiteVideo?.enabled ?? true}
                  onChange={(e) => updatePath(["videos", "customerWebsiteVideo", "enabled"], e.target.checked)}
                  className="w-4 h-4 rounded text-solar-yellow focus:ring-solar-yellow"
                />
              </label>
            </div>
            <Field
              label="YouTube / Vimeo Embed URL"
              value={settings.videos.customerWebsiteVideo?.url}
              onChange={(v) => updatePath(["videos", "customerWebsiteVideo", "url"], v)}
            />
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm">EPC Dashboard Video (Guide)</h4>
              <label className="flex items-center cursor-pointer gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Enable</span>
                <input
                  type="checkbox"
                  checked={settings.videos.epcDashboardVideo?.enabled ?? true}
                  onChange={(e) => updatePath(["videos", "epcDashboardVideo", "enabled"], e.target.checked)}
                  className="w-4 h-4 rounded text-solar-yellow focus:ring-solar-yellow"
                />
              </label>
            </div>
            <Field
              label="YouTube / Vimeo Embed URL"
              value={settings.videos.epcDashboardVideo?.url}
              onChange={(v) => updatePath(["videos", "epcDashboardVideo", "url"], v)}
            />
          </div>
        </div>
      </SectionCard>
      )}

      <div className="pb-8" />
    </div>
  );
};
