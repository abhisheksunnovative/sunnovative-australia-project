import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2, Plus, Trash2, LayoutTemplate } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

export default function CountryContentEditor({ countryCode, onBack }) {
  const [settings, setSettings] = useState(null);
  const [journeySettings, setJourneySettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeProjectType, setActiveProjectType] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, [countryCode]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const [resSettings, resJourney] = await Promise.all([
        fetch(`${API_BASE}/api/country-settings/${countryCode}`),
        fetch(`${API_BASE}/api/order-journey-settings/${countryCode}`)
      ]);
      
      if (resSettings.ok) {
        const data = await resSettings.json();
        // Initialize projectTypeConfigs if not present
        if (!data.projectTypeConfigs) {
          data.projectTypeConfigs = [];
        }
        setSettings(data);
      }
      if (resJourney.ok) {
        const journeyData = await resJourney.json();
        setJourneySettings(journeyData);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      alert("Failed to load country settings");
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
        alert("Settings saved successfully");
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddOverrideDynamicSection = () => {
    const activeConfig = settings.projectTypeConfigs?.find(c => c.type === activeProjectType.projectType);
    const currentSections = activeConfig?.dynamicSections || [];
    if (currentSections.length >= 6) {
      alert("Maximum 6 sections allowed");
      return;
    }
    
    const newConfigs = [...(settings.projectTypeConfigs || [])];
    const configIndex = newConfigs.findIndex(c => c.type === activeProjectType.projectType);
    
    if (configIndex >= 0) {
      newConfigs[configIndex] = {
        ...newConfigs[configIndex],
        dynamicSections: [
          ...currentSections,
          {
            id: `sec_${Date.now()}`,
            type: "cards",
            title: "New Section",
            subtitle: "",
            isVisible: true,
            order: currentSections.length
          }
        ]
      };
    } else {
      newConfigs.push({
        type: activeProjectType.projectType,
        dynamicSections: [
          {
            id: `sec_${Date.now()}`,
            type: "cards",
            title: "New Section",
            subtitle: "",
            isVisible: true,
            order: 0
          }
        ]
      });
    }
    
    setSettings(prev => ({ ...prev, projectTypeConfigs: newConfigs }));
  };

  const handleOverrideDynamicSectionChange = (index, field, value) => {
    const newConfigs = [...(settings.projectTypeConfigs || [])];
    const configIndex = newConfigs.findIndex(c => c.type === activeProjectType.projectType);
    if (configIndex >= 0) {
      const sections = [...(newConfigs[configIndex].dynamicSections || [])];
      sections[index] = { ...sections[index], [field]: value };
      newConfigs[configIndex].dynamicSections = sections;
      setSettings(prev => ({ ...prev, projectTypeConfigs: newConfigs }));
    }
  };

  const handleRemoveOverrideDynamicSection = (index) => {
    const newConfigs = [...(settings.projectTypeConfigs || [])];
    const configIndex = newConfigs.findIndex(c => c.type === activeProjectType.projectType);
    if (configIndex >= 0) {
      const sections = [...(newConfigs[configIndex].dynamicSections || [])];
      sections.splice(index, 1);
      newConfigs[configIndex].dynamicSections = sections;
      setSettings(prev => ({ ...prev, projectTypeConfigs: newConfigs }));
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const availableProjectTypes = journeySettings?.projectTypes?.filter(pt => pt.enabled) || [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Edit {settings.countryName} Project Types
            </h1>
            <p className="text-sm text-gray-500 mt-1">Configure project-type specific landing pages.</p>
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

      {!activeProjectType ? (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Project Type</h2>
          {availableProjectTypes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No enabled project types found in Order Journey settings for this country.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableProjectTypes.map((pt) => {
                const configCount = settings.projectTypeConfigs?.find(c => c.type === pt.projectType)?.dynamicSections?.length || 0;
                return (
                  <div
                    key={pt.projectType}
                    onClick={() => setActiveProjectType(pt)}
                    className="border border-gray-200 p-5 rounded-xl hover:border-blue-500 hover:shadow-md cursor-pointer transition-all bg-gray-50 flex flex-col items-start gap-3 group"
                  >
                    <div className="p-3 bg-white rounded-lg border border-gray-100 group-hover:bg-blue-50">
                      <LayoutTemplate className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{pt.projectTypeLabel || pt.projectType}</h3>
                      <p className="text-sm text-gray-500 mt-1">{configCount} Custom Section(s) configured</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 p-6 flex justify-between items-center">
             <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Editing: {activeProjectType.projectTypeLabel || activeProjectType.projectType}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Configure specific dynamic sections for this project type. These will override global settings.
                </p>
             </div>
             <button 
              onClick={() => setActiveProjectType(null)}
              className="text-gray-500 hover:text-gray-800 text-sm font-medium flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Project Types
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-semibold text-gray-800">Dynamic Sections</h4>
              <button onClick={handleAddOverrideDynamicSection} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100">
                <Plus className="w-4 h-4" /> Add Section
              </button>
            </div>
            
            <div className="space-y-4">
              {(settings.projectTypeConfigs?.find(c => c.type === activeProjectType.projectType)?.dynamicSections || []).map((sec, idx) => (
                <div key={sec.id || idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4 items-center">
                      <span className="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded text-xs uppercase tracking-wider">
                        Type: {sec.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sec.isVisible !== false}
                          onChange={(e) => handleOverrideDynamicSectionChange(idx, "isVisible", e.target.checked)}
                          className="rounded text-blue-600"
                        />
                        <span className="text-sm font-medium text-gray-600">Visible</span>
                      </label>
                      <button 
                        onClick={() => handleRemoveOverrideDynamicSection(idx)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Section Type</label>
                      <select
                        value={sec.type}
                        onChange={(e) => handleOverrideDynamicSectionChange(idx, "type", e.target.value)}
                        className="w-full border-gray-300 rounded p-2 text-sm border"
                      >
                        <option value="text">Rich Text / Hero</option>
                        <option value="cards">Cards / Grid</option>
                        <option value="faq">FAQ Variant</option>
                        <option value="stats">Statistics</option>
                        <option value="cta">Call to Action</option>
                        <option value="video">Video Embed</option>
                        <option value="snap">Journey Snap</option>
                        <option value="form">Apply Form</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Display Order</label>
                      <input
                        type="number"
                        value={sec.order || 0}
                        onChange={(e) => handleOverrideDynamicSectionChange(idx, "order", parseInt(e.target.value))}
                        className="w-full border-gray-300 rounded p-2 text-sm border"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title</label>
                      <input
                        type="text"
                        value={sec.title || ""}
                        onChange={(e) => handleOverrideDynamicSectionChange(idx, "title", e.target.value)}
                        className="w-full border-gray-300 rounded p-2 text-sm border"
                        placeholder="Section title"
                      />
                    </div>
                    
                    {sec.type === 'video' ? (
                       <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">YouTube URL</label>
                        <input
                          type="text"
                          value={sec.videoUrl || ""}
                          onChange={(e) => handleOverrideDynamicSectionChange(idx, "videoUrl", e.target.value)}
                          className="w-full border-gray-300 rounded p-2 text-sm border"
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                       </div>
                    ) : sec.type === 'cards' || sec.type === 'snap' ? (
                       <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Subtitle / Description</label>
                        <textarea
                          value={sec.subtitle || ""}
                          onChange={(e) => handleOverrideDynamicSectionChange(idx, "subtitle", e.target.value)}
                          className="w-full border-gray-300 rounded p-2 text-sm border h-16"
                          placeholder="Brief description"
                        />
                       </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Subtitle / Content</label>
                        <textarea
                          value={sec.subtitle || ""}
                          onChange={(e) => handleOverrideDynamicSectionChange(idx, "subtitle", e.target.value)}
                          className="w-full border-gray-300 rounded p-2 text-sm border h-20"
                          placeholder="Section content..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {(!settings.projectTypeConfigs?.find(c => c.type === activeProjectType.projectType)?.dynamicSections || settings.projectTypeConfigs?.find(c => c.type === activeProjectType.projectType).dynamicSections.length === 0) && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
                  No dynamic sections configured for this project type.
                  <br /> Global website content will be used.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
