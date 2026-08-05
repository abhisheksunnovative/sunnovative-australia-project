import React, { useState, useEffect } from "react";
import { Loader2, Globe, CheckCircle, XCircle, Edit3, Layers, ArrowRight, LayoutTemplate, AlertTriangle } from "lucide-react";
import CountryContentEditor from "./CountryContentEditor";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

const COUNTRIES = [
  { code: "IN", name: "India", currency: "INR", slug: "india" },
  { code: "AU", name: "Australia", currency: "AUD", slug: "australia" },
  { code: "NZ", name: "New Zealand", currency: "NZD", slug: "newzealand" },
  { code: "UK", name: "United Kingdom", currency: "GBP", slug: "uk" },
  { code: "US", name: "United States", currency: "USD", slug: "us" },
];

export default function CountryWebsiteScreen() {
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCountry, setEditingCountry] = useState(null);
  // Expanded project-type card view for a selected country
  const [expandedCountry, setExpandedCountry] = useState(null);
  const [projectTypes, setProjectTypes] = useState([]);
  const [ptLoading, setPtLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const promises = COUNTRIES.map(c =>
        fetch(`${API_BASE}/api/country-settings/${c.code}`).then(res => res.json())
      );
      const results = await Promise.all(promises);
      setCountries(results);
    } catch (err) {
      console.error("Failed to fetch country settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch project types for a country from its OrderJourney settings
  const fetchProjectTypes = async (countryCode) => {
    setPtLoading(true);
    setProjectTypes([]);
    try {
      const res = await fetch(`${API_BASE}/api/order-journey-settings/${countryCode}`);
      if (res.ok) {
        const d = await res.json();
        const types = (d.projectTypes || d.journeys || []).filter(j => j.enabled !== false);
        setProjectTypes(types);
      }
    } catch (err) {
      console.error("Failed to fetch project types:", err);
    } finally {
      setPtLoading(false);
    }
  };

  const handleExpandCountry = (countryCode) => {
    if (expandedCountry === countryCode) {
      setExpandedCountry(null);
      setProjectTypes([]);
    } else {
      setExpandedCountry(countryCode);
      fetchProjectTypes(countryCode);
    }
  };

  const toggleStatus = async (countryCode, currentStatus, type) => {
    try {
      const payload = type === 'enabled' ? { isEnabled: !currentStatus } : { isPublished: !currentStatus };
      const res = await fetch(`${API_BASE}/api/country-settings/${countryCode}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) fetchSettings();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  if (editingCountry) {
    return <CountryContentEditor countryCode={editingCountry} onBack={() => setEditingCountry(null)} />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            Country Website Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage landing pages, project types, and content for multiple countries.
          </p>
        </div>
      </div>

      {/* Country Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 font-medium">
            <tr>
              <th className="px-6 py-4">Country</th>
              <th className="px-6 py-4">Currency</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Visibility</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {countries.map((country) => (
              <React.Fragment key={country.countryCode}>
                <tr className={`hover:bg-gray-50/50 transition-colors ${expandedCountry === country.countryCode ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                        {country.countryCode}
                      </div>
                      <div>
                        <div>{country.countryName}</div>
                        <button
                          onClick={() => handleExpandCountry(country.countryCode)}
                          className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 mt-0.5"
                        >
                          <Layers className="w-3 h-3" />
                          {expandedCountry === country.countryCode ? 'Hide' : 'View'} Project Types
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{country.currencySymbol} {country.currency}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleStatus(country.countryCode, country.isEnabled, 'enabled')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        country.isEnabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {country.isEnabled ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {country.isEnabled ? "Enabled" : "Disabled"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleStatus(country.countryCode, country.isPublished, 'published')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        country.isPublished ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {country.isPublished ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setEditingCountry(country.countryCode)}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Content
                    </button>
                  </td>
                </tr>

                {/* ── Expanded Project Type Cards Row ── */}
                {expandedCountry === country.countryCode && (
                  <tr>
                    <td colSpan={5} className="px-6 py-5 bg-blue-50/40 border-t border-blue-100">
                      <div className="mb-3 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <h3 className="font-bold text-sm text-blue-800">
                          {country.countryName} — Order Journey Project Types
                        </h3>
                      </div>

                      {ptLoading ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
                          <Loader2 className="w-4 h-4 animate-spin" /> Loading project types...
                        </div>
                      ) : projectTypes.length === 0 ? (
                        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          No enabled project types found in Order Journey for {country.countryName}.
                          Configure them in the <strong>Order Journey Settings</strong> screen first.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {projectTypes.map(pt => {
                            // Check if this type has landing page config in projectTypeConfigs
                            // We'll just show the card — clicking it opens the CountryContentEditor
                            return (
                              <div
                                key={pt.projectType}
                                onClick={() => setEditingCountry(country.countryCode)}
                                className="group border border-blue-200 bg-white rounded-xl p-4 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all flex flex-col gap-2"
                              >
                                <div className="w-10 h-10 rounded-lg bg-blue-100 group-hover:bg-blue-500 flex items-center justify-center transition-colors">
                                  <LayoutTemplate className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-gray-800 group-hover:text-blue-700 transition-colors">
                                    {pt.projectTypeLabel || pt.projectType}
                                  </h4>
                                  <p className="text-[10px] font-mono text-gray-400 mt-0.5">{pt.projectType}</p>
                                  {pt.description && (
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{pt.description}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-blue-600 font-medium mt-auto">
                                  Edit Landing Page <ArrowRight className="w-3 h-3" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
