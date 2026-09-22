import os

new_code = '''import React, { useState, useEffect } from "react";
import {
  Award, MapPin, ChevronRight, X, Settings2, Plus, Trash2
} from "lucide-react";
import { ToggleSwitch, EmptyState } from "./CommonUI";

export const QualificationScreen = () => {
  const [level, setLevel] = useState("country"); 
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  
  const [qualifications, setQualifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const liveCountries = [
    { name: "India", code: "IN", icon: "🇮🇳" },
    { name: "Australia", code: "AU", icon: "🇦🇺" }
  ];

  const getStates = (country) => {
    if (country === "India") return ["Delhi", "Maharashtra", "Karnataka", "Gujarat", "Rajasthan"];
    if (country === "Australia") return ["NSW", "VIC", "QLD", "WA", "SA"];
    return [];
  };

  const fetchQualifications = async (country, state) => {
    try {
      setLoading(true);
      const res = await fetch(/api/qualifications?country=&state=);
      const data = await res.json();
      setQualifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCountryClick = (countryName) => {
    setSelectedCountry(countryName);
    setLevel("state");
  };

  const handleStateClick = (stateName) => {
    setSelectedState(stateName);
    setLevel("rules");
    fetchQualifications(selectedCountry, stateName);
  };

  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  // Form State
  const [partnerType, setPartnerType] = useState("New EPC Partner");
  const [minExperienceYears, setMinExperienceYears] = useState(1);
  const [projectType, setProjectType] = useState("Residential");
  const [minKW, setMinKW] = useState(1);
  const [maxKW, setMaxKW] = useState(20);
  const [minInstallersRequired, setMinInstallersRequired] = useState(2);
  const [maxProjectsPerMonth, setMaxProjectsPerMonth] = useState(3);
  const [isActive, setIsActive] = useState(true);

  const openNewForm = () => {
    setEditingRule(null);
    setPartnerType("New EPC Partner");
    setMinExperienceYears(1);
    setProjectType("Residential");
    setMinKW(1);
    setMaxKW(20);
    setMinInstallersRequired(2);
    setMaxProjectsPerMonth(3);
    setIsActive(true);
    setShowForm(true);
  };

  const openEditForm = (rule) => {
    setEditingRule(rule);
    setPartnerType(rule.partnerType);
    setMinExperienceYears(rule.minExperienceYears);
    setProjectType(rule.projectType);
    setMinKW(rule.minKW);
    setMaxKW(rule.maxKW);
    setMinInstallersRequired(rule.minInstallersRequired);
    setMaxProjectsPerMonth(rule.maxProjectsPerMonth);
    setIsActive(rule.isActive);
    setShowForm(true);
  };

  const handleSaveRule = async () => {
    const payload = {
      country: selectedCountry,
      state: selectedState,
      partnerType,
      minExperienceYears,
      projectType,
      minKW,
      maxKW,
      minInstallersRequired,
      maxProjectsPerMonth,
      isActive
    };

    try {
      const token = localStorage.getItem("token") || "admin_super_secret_token_12345";
      const method = editingRule ? 'PUT' : 'POST';
      const url = editingRule ? /api/qualifications/ : '/api/qualifications';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: Bearer  },
        body: JSON.stringify(payload)
      });
      setShowForm(false);
      fetchQualifications(selectedCountry, selectedState);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token") || "admin_super_secret_token_12345";
      await fetch(/api/qualifications/, {
        method: 'DELETE',
        headers: { Authorization: Bearer  }
      });
      fetchQualifications(selectedCountry, selectedState);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-6">
        <button onClick={() => setLevel("country")} className="hover:text-solar-sky">Countries</button>
        {level !== "country" && (
          <>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => setLevel("state")} className="hover:text-solar-sky">{selectedCountry}</button>
          </>
        )}
        {level === "rules" && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900">{selectedState}</span>
          </>
        )}
      </div>

      {level === "country" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {liveCountries.map(c => (
            <div key={c.code} onClick={() => handleCountryClick(c.name)} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-solar-sky cursor-pointer transition-all flex flex-col items-center gap-4">
              <span className="text-5xl">{c.icon}</span>
              <h3 className="text-xl font-bold text-slate-800">{c.name}</h3>
            </div>
          ))}
        </div>
      )}

      {level === "state" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {getStates(selectedCountry).map(s => (
            <div key={s} onClick={() => handleStateClick(s)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-orange-500 cursor-pointer flex items-center gap-3">
              <MapPin className="w-6 h-6 text-slate-400" />
              <span className="font-semibold text-slate-700">{s}</span>
            </div>
          ))}
        </div>
      )}

      {level === "rules" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">Qualification Categories ({selectedState})</h2>
            <button onClick={openNewForm} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex gap-2 items-center">
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          {loading ? (
            <div className="text-center p-12">Loading...</div>
          ) : qualifications.length === 0 ? (
            <EmptyState icon={<Award />} title="No Categories Found" description={No EPC Qualification categories set up for  yet.} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {qualifications.map(rule => (
                <div key={rule._id} className={g-white rounded-2xl border  overflow-hidden}>
                  <div className={p-4 border-b  flex justify-between items-center}>
                    <h3 className="font-bold text-slate-800">{rule.partnerType}</h3>
                    <button onClick={() => openEditForm(rule)} className="p-1.5 text-slate-400 hover:text-solar-sky hover:bg-white rounded-md">
                      <Settings2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Project Type</span>
                      <span className="font-semibold text-slate-800">{rule.projectType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">KW Capacity</span>
                      <span className="font-semibold text-slate-800">{rule.minKW} - {rule.maxKW} KW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Min. Experience</span>
                      <span className="font-semibold text-slate-800">{rule.minExperienceYears} Yrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Max Projects/mo</span>
                      <span className="font-semibold text-slate-800">{rule.maxProjectsPerMonth}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{editingRule ? "Edit" : "Add"} Category</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-200 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category Name</label>
                  <input type="text" value={partnerType} onChange={e=>setPartnerType(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Type</label>
                  <select value={projectType} onChange={e=>setProjectType(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option>Residential</option>
                    <option>Commercial</option>
                    <option>Industrial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min KW</label>
                  <input type="number" value={minKW} onChange={e=>setMinKW(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max KW</label>
                  <input type="number" value={maxKW} onChange={e=>setMaxKW(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Experience (Years)</label>
                  <input type="number" value={minExperienceYears} onChange={e=>setMinExperienceYears(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Projects/Month</label>
                  <input type="number" value={maxProjectsPerMonth} onChange={e=>setMaxProjectsPerMonth(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mt-4 border border-slate-200">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Active Status</h4>
                  <p className="text-xs text-slate-500">Enable this category for new registrations</p>
                </div>
                <ToggleSwitch checked={isActive} onChange={() => setIsActive(!isActive)} />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              {editingRule ? (
                <button onClick={() => handleDelete(editingRule._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-5 h-5"/></button>
              ) : <div></div>}
              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl">Cancel</button>
                <button onClick={handleSaveRule} className="px-5 py-2.5 text-sm font-bold bg-slate-800 text-white rounded-xl">Save Category</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
'''

with open('Website_Admin/src/components/QualificationScreen.jsx', 'w', encoding='utf-8') as f:
    f.write(new_code)

print("QualificationScreen replaced with Dynamic Drill-down UI")
