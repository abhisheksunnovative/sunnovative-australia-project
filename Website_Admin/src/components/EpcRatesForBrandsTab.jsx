import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Shield, Settings, CheckCircle, Search, Edit2 } from 'lucide-react';
import { MasterFilterBar } from "./common/MasterFilterBar";
import ProjectPricingTab from "./ProjectPricingTab";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

const mockCountries = [
  { id: 'AU', code: 'australia', name: 'Australia', flag: '🇦🇺', desc: 'Manage AU EPC and Company Rates' },
  { id: 'IN', code: 'india', name: 'India', flag: '🇮🇳', desc: 'Manage IN EPC and Company Rates' },
  { id: 'US', code: 'us', name: 'United States', flag: '🇺🇸', desc: 'Manage US EPC and Company Rates' },
];

export default function EpcRatesForBrandsTab() {
  const [settings, setSettings] = useState({});
  const [projectTypes, setProjectTypes] = useState({}); // { countryCode: [ types ] }
  
  const [selectedCountry, setSelectedCountry] = useState(null); // country object
  const [selectedPt, setSelectedPt] = useState(null); // string (e.g. 'Residential Solar')

  const [epcRates, setEpcRates] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filterCountry, setFilterCountry] = useState('australia');
  const [search, setSearch] = useState('');

  // Fetch Pricing System Settings
  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/pricing-system-settings`);
      const resData = await response.json();
      if (resData.success) {
        // Build a map of countryCode -> projectType -> system
        const map = {};
        resData.data.forEach(s => {
          const c = s.country.toLowerCase();
          if (!map[c]) map[c] = {};
          map[c][s.projectType || 'default'] = s.system; // 'company' or 'epc'
        });
        setSettings(map);
      }
    } catch (err) {
      console.error("Failed to load settings", err);
    }
  };

  // Fetch Project Types for a country
  const fetchProjectTypes = async (countryCode) => {
    try {
      const response = await fetch(`${API_BASE}/api/order-journey/project-types?country=${countryCode}`);
      const data = await response.json();
      if (data.projectTypes) {
        setProjectTypes(prev => ({ ...prev, [countryCode]: data.projectTypes }));
      } else if (data.success && data.data) {
        setProjectTypes(prev => ({ ...prev, [countryCode]: data.data }));
      }
    } catch (err) {
      console.error("Failed to load project types", err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchProjectTypes(selectedCountry.code);
    }
  }, [selectedCountry]);

  // Toggle System
  const toggleSystem = async (countryCode, projectType, currentSystem) => {
    const newSystem = currentSystem === 'company' ? 'epc' : 'company';
    try {
      await fetch(`${API_BASE}/api/pricing-system-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: countryCode,
          projectType: projectType,
          system: newSystem
        })
      });
      fetchSettings(); // Refresh
    } catch (err) {
      console.error("Failed to toggle system", err);
      alert("Failed to save changes. Ensure backend is running.");
    }
  };

  // EPC Rates View
  const fetchEpcRates = async (countryCode, projectType) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/project-pricing?pricingResponsibility=EPC&country=${countryCode}&projectType=${projectType}`);
      const resData = await response.json();
      if (resData.success) {
        setEpcRates(resData.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedCountry && selectedPt) {
      const sys = settings[selectedCountry.code]?.[selectedPt] || 'company';
      if (sys === 'epc') {
        fetchEpcRates(selectedCountry.code, selectedPt);
      }
    }
  }, [selectedCountry, selectedPt, settings]);

  const approveRate = async (rateId) => {
    try {
      await fetch(`${API_BASE}/api/project-pricing/${rateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: true })
      });
      fetchEpcRates(selectedCountry.code, selectedPt);
    } catch (err) {
      console.error("Failed to approve", err);
    }
  };

  // Render
  return (
    <div className="p-6 max-w-7xl mx-auto pb-24">
      {/* Top Navbar Area */}
      {!selectedCountry && (
        <div className="mb-6 sticky top-0 z-10 bg-slate-50 pt-2 pb-4 border-b border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">EPC Rates for Brands</h1>
              <p className="text-slate-500 text-sm">Select a country to manage its pricing systems</p>
            </div>
          </div>
          <MasterFilterBar
            search={search}
            setSearch={setSearch}
            countryFilter={filterCountry}
            setCountryFilter={setFilterCountry}
            onClear={() => { setFilterCountry('australia'); setSearch(''); }}
          />
        </div>
      )}

      {/* Main Content */}
      {!selectedCountry ? (
        // 1. Country Cards View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCountries.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(country => (
            <div 
              key={country.id} 
              onClick={() => setSelectedCountry(country)}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer transition-all hover:shadow-md hover:border-blue-300 group"
            >
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-4xl">{country.flag}</span>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{country.name}</h2>
                  <p className="text-xs text-slate-500">{country.desc}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm mt-6 border-t border-slate-100 pt-4">
                <span className="text-blue-600 font-medium">Manage Rates &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      ) : !selectedPt ? (
        // 2. Project Types View for Selected Country
        <div>
          <button 
            onClick={() => setSelectedCountry(null)}
            className="mb-6 flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Countries
          </button>
          
          <div className="flex items-center gap-4 mb-8">
            <span className="text-5xl">{selectedCountry.flag}</span>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{selectedCountry.name} Pricing</h1>
              <p className="text-slate-500">Configure pricing system (Company Fixed vs EPC Self-Priced) per project type.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(projectTypes[selectedCountry.code] || []).map(pt => {
              const ptName = typeof pt === 'string' ? pt : pt.projectType || pt.name || pt.type;
              const currentSystem = settings[selectedCountry.code]?.[ptName] || 'company';
              const isCompany = currentSystem === 'company';

              return (
                <div key={ptName} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
                  <div className="p-5 flex-1">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{ptName}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                        isCompany ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {isCompany ? 'Company Fixed' : 'EPC Self-Priced'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 border-t border-slate-100 p-4 flex gap-3">
                    <button 
                      onClick={() => toggleSystem(selectedCountry.code, ptName, currentSystem)}
                      className="flex-1 bg-white border border-slate-300 text-slate-700 text-xs font-bold py-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      Switch System
                    </button>
                    <button 
                      onClick={() => setSelectedPt(ptName)}
                      className="flex-1 bg-blue-600 text-white text-xs font-bold py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
                    >
                      Configure
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // 3. Configuration Detail View for Project Type
        <div>
          <button 
            onClick={() => setSelectedPt(null)}
            className="mb-6 flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to {selectedCountry.name} Project Types
          </button>
          
          <div className="mb-6 bg-slate-800 rounded-2xl p-6 text-white flex justify-between items-center shadow-lg">
            <div>
              <h2 className="text-2xl font-bold mb-1">{selectedPt} <span className="text-slate-400 font-normal">in {selectedCountry.name}</span></h2>
              <p className="text-slate-400 text-sm">Active System: <span className="font-bold text-white">{settings[selectedCountry.code]?.[selectedPt] === 'epc' ? 'EPC Self-Priced' : 'Company Fixed'}</span></p>
            </div>
            <button 
              onClick={() => toggleSystem(selectedCountry.code, selectedPt, settings[selectedCountry.code]?.[selectedPt] || 'company')}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Switch System
            </button>
          </div>

          {settings[selectedCountry.code]?.[selectedPt] === 'epc' ? (
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Settings className="w-4 h-4 text-slate-400"/> EPC Submitted Rates</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 text-slate-500 border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium uppercase">EPC / Brand</th>
                      <th className="px-4 py-3 font-medium uppercase">KW</th>
                      <th className="px-4 py-3 font-medium uppercase">Total Price</th>
                      <th className="px-4 py-3 font-medium uppercase">Status</th>
                      <th className="px-4 py-3 font-medium uppercase text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr><td colSpan="5" className="p-8 text-center text-slate-500">Loading...</td></tr>
                    ) : epcRates.length === 0 ? (
                      <tr><td colSpan="5" className="p-8 text-center text-slate-500">No EPC rates submitted for this project type yet.</td></tr>
                    ) : (
                      epcRates.map(rate => (
                        <tr key={rate._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="font-bold text-slate-800">EPC-{rate.epcId?.substring(0, 6) || 'Unknown'}</div>
                            <div className="text-xs text-slate-500">{rate.panelBrand?.name} + {rate.inverterBrand?.name}</div>
                          </td>
                          <td className="px-4 py-4 font-medium">{rate.systemSizeKW} kW</td>
                          <td className="px-4 py-4 font-bold text-emerald-600">${rate.finalPrice}</td>
                          <td className="px-4 py-4">
                            {rate.isApproved ? (
                              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded w-fit"><CheckCircle className="w-3 h-3"/> Approved</span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded w-fit">Pending</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {!rate.isApproved && (
                              <button 
                                onClick={() => approveRate(rate._id)}
                                className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors"
                              >
                                Approve Rate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm p-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b pb-4"><Shield className="w-4 h-4 text-blue-500"/> Company Fixed Pricing Engine</h3>
              {/* Reuse ProjectPricingTab but pass props to hide filters and hardcode country/pt */}
              <ProjectPricingTab 
                defaultCountry={selectedCountry.code} 
                defaultProjectType={selectedPt} 
                hideFilters={true} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
