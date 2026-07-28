import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

export default function CountryContentEditor({ countryCode, onBack }) {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [countryCode]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/country-settings/${countryCode}`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      toast.error("Failed to load country settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch(`${API_BASE}/api/country-settings/${countryCode}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success("Settings saved successfully");
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      websiteContent: { ...prev.websiteContent, [field]: value }
    }));
  };

  const handleAddFaq = () => {
    setSettings((prev) => ({
      ...prev,
      websiteContent: {
        ...prev.websiteContent,
        faqs: [...(prev.websiteContent?.faqs || []), { question: "", answer: "" }]
      }
    }));
  };

  const handleFaqChange = (index, field, value) => {
    const newFaqs = [...(settings.websiteContent?.faqs || [])];
    newFaqs[index][field] = value;
    setSettings((prev) => ({
      ...prev,
      websiteContent: { ...prev.websiteContent, faqs: newFaqs }
    }));
  };

  const handleRemoveFaq = (index) => {
    const newFaqs = [...(settings.websiteContent?.faqs || [])];
    newFaqs.splice(index, 1);
    setSettings((prev) => ({
      ...prev,
      websiteContent: { ...prev.websiteContent, faqs: newFaqs }
    }));
  };

  if (isLoading || !settings) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Edit {settings.countryName} Settings
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage localized content and SEO.</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Settings */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country Name</label>
              <input type="text" value={settings.countryName || ""} readOnly className="w-full border-gray-300 rounded-md bg-gray-50 text-gray-500 p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
              <input type="text" value={settings.currencySymbol || ""} readOnly className="w-full border-gray-300 rounded-md bg-gray-50 text-gray-500 p-2 border" />
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Hero Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
              <input 
                type="text" 
                value={settings.websiteContent?.heroTitle || ""} 
                onChange={(e) => handleContentChange("heroTitle", e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Switch to Solar in Australia"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
              <textarea 
                value={settings.websiteContent?.heroSubtitle || ""} 
                onChange={(e) => handleContentChange("heroSubtitle", e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 h-24"
                placeholder="e.g. Save on electricity bills with government rebates..."
              />
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Frequently Asked Questions</h2>
            <button onClick={handleAddFaq} className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800">
              <Plus className="w-4 h-4" /> Add FAQ
            </button>
          </div>
          <div className="space-y-4">
            {(settings.websiteContent?.faqs || []).map((faq, idx) => (
              <div key={idx} className="border border-gray-200 p-4 rounded-lg bg-gray-50 relative">
                <button onClick={() => handleRemoveFaq(idx)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="space-y-3 mr-8">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Question</label>
                    <input 
                      type="text" 
                      value={faq.question} 
                      onChange={(e) => handleFaqChange(idx, "question", e.target.value)}
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Answer</label>
                    <textarea 
                      value={faq.answer} 
                      onChange={(e) => handleFaqChange(idx, "answer", e.target.value)}
                      className="w-full border border-gray-300 rounded p-2 text-sm h-20"
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!settings.websiteContent?.faqs || settings.websiteContent.faqs.length === 0) && (
              <p className="text-sm text-gray-500 italic text-center py-4">No FAQs added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
