import React, { useState, useEffect } from "react";
import { Loader2, Globe, CheckCircle, XCircle, Settings, Edit3 } from "lucide-react";
import CountryContentEditor from "./CountryContentEditor";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

const COUNTRIES = [
  { code: "IN", name: "India", currency: "INR" },
  { code: "AU", name: "Australia", currency: "AUD" },
  { code: "NZ", name: "New Zealand", currency: "NZD" },
  { code: "UK", name: "United Kingdom", currency: "GBP" },
  { code: "US", name: "United States", currency: "USD" },
];

export default function CountryWebsiteScreen() {
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCountry, setEditingCountry] = useState(null); // stores countryCode when editing

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      // We need to fetch each country individually from the admin endpoint to initialize them if they don't exist
      const promises = COUNTRIES.map(c => fetch(`${API_BASE}/api/country-settings/${c.code}`).then(res => res.json()));
      const results = await Promise.all(promises);
      setCountries(results);
    } catch (err) {
      console.error("Failed to fetch country settings:", err);
    } finally {
      setIsLoading(false);
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
      if (res.ok) {
        fetchSettings();
      }
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            Country Website Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage landing pages, subsidies, and content for multiple countries.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 font-medium">
            <tr>
              <th className="px-6 py-4">Country</th>
              <th className="px-6 py-4">Currency</th>
              <th className="px-6 py-4 text-center">Status (Enabled)</th>
              <th className="px-6 py-4 text-center">Visibility (Published)</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {countries.map((country) => (
              <tr key={country.countryCode} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {country.countryCode}
                  </div>
                  {country.countryName}
                </td>
                <td className="px-6 py-4">
                  {country.currencySymbol} {country.currency}
                </td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
