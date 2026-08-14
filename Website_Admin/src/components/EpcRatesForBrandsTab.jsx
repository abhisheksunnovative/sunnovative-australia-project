import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Shield, Settings, CheckCircle, Search, Edit2 } from 'lucide-react';
import { MasterFilterBar } from "./common/MasterFilterBar";
import ProjectPricingTab from "./ProjectPricingTab";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

/* const mockCountries = [
  { id: 'AU', code: 'australia', name: 'Australia', flag: '🇦🇺', desc: 'Manage AU EPC and Company Rates' },
  { id: 'IN', code: 'india', name: 'India', flag: '🇮🇳', desc: 'Manage IN EPC and Company Rates' },
  { id: 'US', code: 'us', name: 'United States', flag: '🇺🇸', desc: 'Manage US EPC and Company Rates' },
]; */

export default function EpcRatesForBrandsTab() {
  const [settings, setSettings] = useState({});
  const [projectTypes, setProjectTypes] = useState({}); // { countryCode: [ types ] }
  const [countries, setCountries] = useState([]);
  const [districtsConfig, setDistrictsConfig] = useState([]);

  const fetchCountries = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/countries`);
      const data = await res.json();
      if (data.success) setCountries(data.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  
  const [selectedCountry, setSelectedCountry] = useState(null); // country object
  const [selectedPt, setSelectedPt] = useState(null); // string (e.g. 'Residential Solar')
  const [selectedStateAdmin, setSelectedStateAdmin] = useState(null); // string (e.g. 'Victoria')

  const [epcRates, setEpcRates] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filterKw, setFilterKw] = useState('All');
  const [filterState, setFilterState] = useState('All');
  const [filterDistrict, setFilterDistrict] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState('australia');
  const [sortOrder, setSortOrder] = useState('asc');

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
      const response = await fetch(`${API_BASE}/api/project-types?country=${countryCode}`);
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

  const fetchDistricts = async (countryCode) => {
    try {
      const response = await fetch(`${API_BASE}/api/districts?country=${countryCode}`);
      const data = await response.json();
      if (data.success && data.data) {
        setDistrictsConfig(data.data);
      }
    } catch (err) {
      console.error("Failed to load districts", err);
    }
  };

  useEffect(() => {
    if (selectedCountry) {
      fetchProjectTypes(selectedCountry.code);
      fetchDistricts(selectedCountry.code);
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

  // Helper function to determine if an EPC is active in a state
  const isEpcActiveInState = (epc, targetState) => {
    if (!epc) return false;
    if (epc.state === targetState) return true;
    if (epc.serviceAreas && epc.serviceAreas.includes(targetState)) return true;
    
    // Check if any of their activeDistricts belong to this state
    if (epc.activeDistricts && epc.activeDistricts.length > 0) {
      const districtsInTargetState = districtsConfig.filter(d => d.state === targetState).map(d => d.district);
      if (epc.activeDistricts.some(d => districtsInTargetState.includes(d))) return true;
    }
    return false;
  };

  // Compute filtering
  let filteredRates = epcRates.filter(rate => {
    if (filterKw !== 'All' && rate.kw !== Number(filterKw)) return false;
    if (selectedStateAdmin && !isEpcActiveInState(rate.epcId, selectedStateAdmin)) return false;
    if (filterDistrict !== 'All' && rate.epcId?.district !== filterDistrict) return false;
    if (minPrice && rate.finalPrice < Number(minPrice)) return false;
    if (maxPrice && rate.finalPrice > Number(maxPrice)) return false;
    if (search) {
      const q = search.toLowerCase();
      const epcName = (rate.epcId?.name || '').toLowerCase();
      const brandsStr = rate.dynamicBrands?.map(db => db.brandIds?.map(b => b?.name || '').join(' ')).join(' ').toLowerCase() || '';
      if (!epcName.includes(q) && !brandsStr.includes(q)) return false;
    }
    return true;
  });

  filteredRates.sort((a, b) => {
    return sortOrder === 'asc' ? (a.finalPrice || 0) - (b.finalPrice || 0) : (b.finalPrice || 0) - (a.finalPrice || 0);
  });

  const totalRates = filteredRates.length;
  const highestRate = totalRates > 0 ? Math.max(...filteredRates.map(r => r.finalPrice || 0)) : 0;
  const lowestRate = totalRates > 0 ? Math.min(...filteredRates.map(r => r.finalPrice || 0)) : 0;
  
  const avgPrice = filteredRates.length 
    ? (filteredRates.reduce((acc, r) => acc + (r.finalPrice || 0), 0) / filteredRates.length).toFixed(2)
    : 0;

  const currentPtConfig = projectTypes[selectedCountry?.code]?.find(pt => (pt.projectType || pt.name || pt.type) === selectedPt);
  const uniqueKws = currentPtConfig?.availableKw || [];
  const uniqueStates = [...new Set(districtsConfig.map(d => d.state).filter(Boolean))].sort();
  const uniqueDistricts = [...new Set(districtsConfig.map(d => d.district).filter(Boolean))].sort();

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
          {countries.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(country => (
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
            !selectedStateAdmin ? (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="bg-slate-100 p-2 rounded-lg"><Settings className="w-5 h-5 text-slate-600"/></span>
                  Select a State to view EPC Rates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {uniqueStates.map(state => {
                    // Count how many EPCs are active in this state
                    const stateRates = epcRates.filter(rate => isEpcActiveInState(rate.epcId, state));
                    // Count unique EPCs
                    const uniqueEpcs = new Set(stateRates.map(r => r.epcId?._id || r.epcId));
                    
                    return (
                      <div 
                        key={state}
                        onClick={() => setSelectedStateAdmin(state)}
                        className="bg-white p-6 rounded-2xl border hover:border-slate-300 hover:shadow-md cursor-pointer transition-all group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{state}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span className="font-bold text-blue-600">{uniqueEpcs.size}</span> EPCs
                          <span className="mx-2">•</span>
                          <span className="font-bold text-slate-700">{stateRates.length}</span> Rates
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
            <div className="space-y-6">
              <button 
                onClick={() => setSelectedStateAdmin(null)}
                className="mb-2 flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to States
              </button>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-slate-100 p-2 rounded-lg"><Settings className="w-5 h-5 text-slate-600"/></span>
                EPC Rates for {selectedStateAdmin}
              </h3>
              {/* Master Filters UI */}
              <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-3 rounded-xl border shadow-sm">
                <div className="flex-1 min-w-[150px]">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Search</label>
                  <div className="relative mt-1">
                    <Search className="w-4 h-4 absolute left-2.5 top-2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="EPC or Brand..." 
                      className="w-full pl-8 pr-2 py-1.5 border rounded-lg text-sm bg-slate-50"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="w-32">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">System Size</label>
                  <select 
                    className="w-full mt-1 border rounded-lg px-2 py-1.5 text-sm bg-slate-50"
                    value={filterKw}
                    onChange={e => setFilterKw(e.target.value)}
                  >
                    <option value="All">All Sizes</option>
                    {uniqueKws.map(kw => <option key={kw} value={kw}>{kw} kW</option>)}
                  </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">District</label>
                  <div className="flex gap-2 mt-1">
                    <select 
                      className="w-full border rounded-lg px-2 py-1.5 text-sm bg-slate-50"
                      value={filterDistrict}
                      onChange={e => setFilterDistrict(e.target.value)}
                    >
                      <option value="All">All Districts in {selectedStateAdmin}</option>
                      {districtsConfig.filter(d => d.state === selectedStateAdmin).map(d => d.district).sort().map(dt => <option key={dt} value={dt}>{dt}</option>)}
                    </select>
                  </div>
                </div>

                <div className="w-32">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Sort By</label>
                  <select 
                    className="w-full mt-1 border rounded-lg px-2 py-1.5 text-sm bg-slate-50"
                    value={sortOrder}
                    onChange={e => setSortOrder(e.target.value)}
                  >
                    <option value="asc">Low to High (Asc)</option>
                    <option value="desc">High to Low (Desc)</option>
                  </select>
                </div>

                <div className="w-36 bg-slate-800 text-white p-2 rounded-lg shadow-sm flex flex-col justify-center items-center self-stretch ml-auto">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Price</span>
                  <span className="text-lg font-bold text-emerald-400">${avgPrice}</span>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Rates</span>
                  <span className="text-2xl font-bold text-blue-600">{totalRates}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Highest Rate</span>
                  <span className="text-2xl font-bold text-rose-600">${highestRate.toFixed(2)}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Lowest Rate</span>
                  <span className="text-2xl font-bold text-emerald-600">${lowestRate.toFixed(2)}</span>
                </div>
              </div>

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
                    </tr>
                  </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr><td colSpan="5" className="p-8 text-center text-slate-500">Loading...</td></tr>
                      ) : filteredRates.length === 0 ? (
                        <tr><td colSpan="5" className="p-8 text-center text-slate-500">No EPC rates match the selected filters.</td></tr>
                      ) : (
                        filteredRates.map(rate => (
                          <tr key={rate._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-4">
                              <div className="font-bold text-slate-800">{rate.epcId?.name || `EPC-${(rate.epcId?._id || rate.epcId || '').toString().substring(0, 6)}`}</div>
                              <div className="text-xs text-slate-500">
                                {rate.epcId?.district ? `${rate.epcId.district}, ${rate.epcId.state}` : 'Location unknown'}
                              </div>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {rate.dynamicBrands?.length > 0 ? (
                                  rate.dynamicBrands.map((db, idx) => {
                                    if (db.category === '0') return null;
                                    return (
                                      <span key={idx} className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border">
                                        <span className="font-semibold">{db.category}:</span> {db.brandIds?.map(b => b.name).join(', ')}
                                      </span>
                                    )
                                  })
                                ) : (
                                  <span className="text-xs text-slate-500">Old format rate</span>
                                )}
                              </div>
                            </td>
                          <td className="px-4 py-4 font-medium">{rate.kw} kW</td>
                          <td className="px-4 py-4 font-bold text-emerald-600">${rate.finalPrice}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              </div>
            </div>
            )
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
