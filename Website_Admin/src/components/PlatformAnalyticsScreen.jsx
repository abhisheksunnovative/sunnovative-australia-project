import React, { useState, useEffect } from "react";
import {
  Globe, ChevronRight, CheckCircle2, MapPin, Target,
  Zap, Play, Square, Settings, Users, Building, AlertTriangle, Briefcase, Activity
} from "lucide-react";
import { useGeography } from "../hooks/useGeography";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

export default function PlatformAnalyticsScreen() {
  // No longer destructuring missing properties from useGeography here
  
  const [activeTab, setActiveTab] = useState("Trial Analytics"); // "Trial Analytics" | "Business Analytics"

  // Hierarchical State
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedProjectType, setSelectedProjectType] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  // Analytics Data
  const [features, setFeatures] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const { states: stateList, districts: districtList, loading: geoLoading } = useGeography(
    selectedCountry?.name,
    selectedState
  );

  const [countries, setCountries] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);

  // Fetch Countries from backend
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/countries?isActive=true`);
        const data = await res.json();
        if (data.success) {
          setCountries(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch countries", err);
      }
    };
    fetchCountries();
  }, []);

  // Fetch Project Types when a country is selected
  useEffect(() => {
    if (!selectedCountry) {
      setProjectTypes([]);
      return;
    }
    const fetchProjectTypes = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/project-types?country=${selectedCountry.name}`);
        const data = await res.json();
        if (data.success) {
          const mapped = data.data.map(pt => ({
            label: pt.projectTypeLabel || pt.projectType,
            value: pt.projectType
          }));
          setProjectTypes(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch project types", err);
      }
    };
    fetchProjectTypes();
  }, [selectedCountry]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (selectedCountry) q.append("country", selectedCountry.name);
      if (selectedProjectType) q.append("projectType", selectedProjectType);
      if (selectedState) q.append("state", selectedState);
      if (selectedDistrict) q.append("district", selectedDistrict);

      const res = await fetch(`${API_BASE}/api/platform-analytics?${q.toString()}`);
      const data = await res.json();
      if (data.success) {
        setFeatures(data.features.filter(f => activeTab === "Trial Analytics" ? f.status === "Trial" : f.status === "Business"));
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedCountry, selectedProjectType, selectedState, selectedDistrict, activeTab]);

  const updateFeatureStatus = async (id, newStatus, newLocation = null) => {
    try {
      const payload = { status: newStatus };
      if (newLocation) {
        payload.activeLocations = [newLocation]; 
      }
      const res = await fetch(`${API_BASE}/api/platform-analytics/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) fetchAnalytics();
    } catch(err) { console.error(err); }
  };

  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [selectedFeatureDetails, setSelectedFeatureDetails] = useState(null);
  const [newFeature, setNewFeature] = useState({ name: "", description: "", targetAudience: "Both", trialDuration: "1 Month" });

  const handleAddFeature = async () => {
    if (!newFeature.name) return;
    try {
      const location = {};
      if (selectedCountry) location.country = selectedCountry.name;
      if (selectedProjectType) location.projectType = selectedProjectType;
      if (selectedState) location.state = selectedState;
      if (selectedDistrict) location.district = selectedDistrict;

      const res = await fetch(`${API_BASE}/api/platform-analytics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureName: newFeature.name,
          description: newFeature.description,
          targetAudience: newFeature.targetAudience,
          trialDuration: newFeature.trialDuration,
          status: activeTab === "Trial Analytics" ? "Trial" : "Business",
          location
        })
      });
      if (res.ok) {
         setIsFeatureModalOpen(false);
         setNewFeature({ name: "", description: "", targetAudience: "Both", trialDuration: "1 Month" });
         fetchAnalytics();
      }
    } catch(e) { console.error(e) }
  };

  // Reusable drill-down card (like BDE onboarding)
  const Card = ({ title, icon, onClick, count, subtitle, accent = "blue", countLabel = "Items" }) => {
    const border = { blue: "border-blue-100 hover:border-blue-300", green: "border-green-100 hover:border-green-300", amber: "border-amber-100 hover:border-amber-300" };
    const iconCls = { blue: "text-blue-400", green: "text-green-400", amber: "text-amber-400" };
    return (
      <div onClick={onClick} className={`cursor-pointer bg-white p-5 rounded-2xl border-2 shadow-sm hover:shadow-md transition-all duration-150 flex flex-col items-center justify-center min-h-[150px] relative select-none ${border[accent]}`}>
        <div className={`mb-2.5 ${iconCls[accent]}`}>{icon}</div>
        <h2 className="text-base font-black text-slate-800 text-center uppercase leading-tight">{title}</h2>
        {subtitle && <p className="text-slate-400 text-[11px] font-semibold uppercase mt-1">{subtitle}</p>}
        {count !== undefined && (
          <div className="absolute top-2.5 right-2.5">
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${count > 0 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"}`}>
              <Activity className="w-3 h-3"/> {count} {countLabel}
            </div>
          </div>
        )}
        <ChevronRight className="absolute bottom-2.5 right-2.5 w-4 h-4 text-slate-300"/>
      </div>
    );
  };

  const Breadcrumb = () => (
    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 flex-wrap mb-6">
      <button onClick={() => { setSelectedCountry(null); setSelectedProjectType(null); setSelectedState(null); setSelectedDistrict(null); }} className="text-blue-600 hover:underline">Countries</button>
      {selectedCountry && (<><span>/</span><button onClick={() => { setSelectedProjectType(null); setSelectedState(null); setSelectedDistrict(null); }} className="text-blue-600 hover:underline">{selectedCountry.name}</button></>)}
      {selectedProjectType && (<><span>/</span><button onClick={() => { setSelectedState(null); setSelectedDistrict(null); }} className="text-blue-600 hover:underline">{selectedProjectType}</button></>)}
      {selectedState && (<><span>/</span><button onClick={() => setSelectedDistrict(null)} className="text-blue-600 hover:underline">{selectedState}</button></>)}
      {selectedDistrict && (<><span>/</span><span className="text-slate-800">{selectedDistrict}</span></>)}
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-400"/> Platform Analytics
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Hierarchical Feature Rollout & Metrics Tracking</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button onClick={() => setActiveTab("Trial Analytics")} className={`px-6 py-3 font-bold text-sm uppercase transition-colors ${activeTab === "Trial Analytics" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-700"}`}>
          Trial Analytics (Districts)
        </button>
        <button onClick={() => setActiveTab("Business Analytics")} className={`px-6 py-3 font-bold text-sm uppercase transition-colors ${activeTab === "Business Analytics" ? "border-b-2 border-purple-600 text-purple-600" : "text-slate-500 hover:text-slate-700"}`}>
          Business Analytics (State/Country)
        </button>
      </div>

      <Breadcrumb />

      {/* Drill-Down UI */}
      {!selectedCountry && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {countries.map(c => (
            <Card 
              key={c._id || c.code} 
              title={`${c.flagEmoji || ''} ${c.name}`} 
              subtitle={(c.code || '').toUpperCase()} 
              icon={<Globe className="w-8 h-8"/>} 
              onClick={() => setSelectedCountry(c)} 
            />
          ))}
        </div>
      )}

      {selectedCountry && !selectedProjectType && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {projectTypes.map(pt => (
            <Card 
              key={pt.value} 
              title={pt.label} 
              icon={<Target className="w-8 h-8"/>} 
              onClick={() => setSelectedProjectType(pt.label)} 
              count={stateList?.length || 0}
              countLabel="States Available"
            />
          ))}
        </div>
      )}

      {selectedCountry && selectedProjectType && !selectedState && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stateList.map(st => (
            <Card 
              key={st} 
              title={st} 
              icon={<MapPin className="w-8 h-8"/>} 
              onClick={() => setSelectedState(st)} 
              count={1}
              countLabel="Active"
            />
          ))}
        </div>
      )}

      {selectedCountry && selectedProjectType && selectedState && !selectedDistrict && activeTab === "Trial Analytics" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {districtList.map(d => (
            <Card 
              key={d} 
              title={d} 
              icon={<MapPin className="w-8 h-8"/>} 
              onClick={() => setSelectedDistrict(d)} 
            />
          ))}
        </div>
      )}

      {/* Analytics Dashboard */}
      {(selectedState) && (
        <div className="space-y-6 mt-8 border-t border-slate-200 pt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-800 uppercase">
              {activeTab} - {selectedDistrict || selectedState}
            </h2>
          </div>

          {/* Connected Metrics (Demand & Supply) */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Users className="w-6 h-6"/></div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase">Customer Leads (Demand)</p>
                  <p className="text-2xl font-black text-slate-800">{analytics.demand.totalLeads} <span className="text-sm text-emerald-500 font-bold ml-2">({analytics.demand.conversionRate}% converted)</span></p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center"><Building className="w-6 h-6"/></div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase">EPC Installers (Supply)</p>
                  <p className="text-2xl font-black text-slate-800">{analytics.supply.totalEPCs} <span className="text-sm text-slate-400 font-bold ml-2">({analytics.supply.approvedEPCs} active)</span></p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center"><Briefcase className="w-6 h-6"/></div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase">Active BDEs (Workforce)</p>
                  <p className="text-2xl font-black text-slate-800">{analytics.workforce.totalBDEs}</p>
                </div>
              </div>
            </div>
          )}

          {/* State-wise Comparison (Only in Trial Analytics) */}
          {activeTab === "Trial Analytics" && analytics.stateComparison && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6 p-5">
              <h3 className="font-black text-slate-800 uppercase mb-4 text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500"/> State-wise Analytics Comparison
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Customer Conversion</p>
                  <div className="flex items-end gap-3 mt-1">
                    <p className="text-xl font-black text-slate-800">{analytics.stateComparison.trialConversion}% <span className="text-[10px] text-slate-400 uppercase">Trial</span></p>
                    <p className="text-xl font-black text-slate-400">vs {analytics.stateComparison.stateConversion}% <span className="text-[10px] text-slate-400 uppercase">State Avg</span></p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">EPC Acceptance</p>
                  <div className="flex items-end gap-3 mt-1">
                    <p className="text-xl font-black text-slate-800">{analytics.stateComparison.trialEpcs} <span className="text-[10px] text-slate-400 uppercase">Trial</span></p>
                    <p className="text-xl font-black text-slate-400">vs {analytics.stateComparison.stateEpcs} <span className="text-[10px] text-slate-400 uppercase">State Avg</span></p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Installed KW</p>
                  <div className="flex items-end gap-3 mt-1">
                    <p className="text-xl font-black text-slate-800">{analytics.stateComparison.trialKw} <span className="text-[10px] text-slate-400 uppercase">Trial</span></p>
                    <p className="text-xl font-black text-slate-400">vs {analytics.stateComparison.stateKw} <span className="text-[10px] text-slate-400 uppercase">State Avg</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* New Feature Tracking Tabs (Dashboard) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-black uppercase text-slate-600 flex justify-between items-center">
              <span>{activeTab === "Trial Analytics" ? "Active District Trials" : "Active State/Country Implementations"}</span>
            </div>
            <div className="p-4 space-y-4">
              {features.length === 0 ? (
                <p className="text-slate-400 italic">No features currently active here.</p>
              ) : features.map(f => (
                <div key={f._id} className="p-5 border border-slate-200 bg-white rounded-xl shadow-sm">
                  
                  <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-800">{f.featureName}</h3>
                      <p className="text-sm text-slate-500 mt-1">{f.description}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${f.metrics?.successStatus === 'Success' ? 'bg-emerald-100 text-emerald-700' : f.metrics?.successStatus === 'Failure' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {f.metrics?.successStatus || 'Evaluating'}
                      </span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">
                        Start: {new Date(f.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Exhaustive Dashboard Metrics */}
                  {f.metrics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-5">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Trial Location</p>
                        <p className="font-semibold text-slate-700 text-sm">{f.activeLocations?.[0]?.district || f.activeLocations?.[0]?.state || f.activeLocations?.[0]?.country}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Customers / EPCs</p>
                        <p className="font-semibold text-slate-700 text-sm">{f.metrics.customers} / {f.metrics.epcs}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Usage Count</p>
                        <p className="font-semibold text-slate-700 text-sm">{f.metrics.usageCount}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Orders / Conv. Rate</p>
                        <p className="font-semibold text-slate-700 text-sm">{f.metrics.ordersGenerated} ({f.metrics.conversionRate}%)</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Project KW</p>
                        <p className="font-semibold text-slate-700 text-sm">{f.metrics.projectKW} kW</p>
                      </div>
                      <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">Customer Response</p>
                        <p className="font-semibold text-emerald-700 text-sm">{f.metrics.customerResponse}</p>
                      </div>
                      <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                        <p className="text-[10px] font-bold text-blue-600 uppercase">EPC Response</p>
                        <p className="font-semibold text-blue-700 text-sm">{f.metrics.epcResponse}</p>
                      </div>
                    </div>
                  )}

                  {/* Implementation Workflow Controls */}
                  <div className="flex gap-3 justify-end items-center border-t border-slate-100 pt-4 mt-2 flex-wrap">
                    <button onClick={() => setSelectedFeatureDetails(f)} className="mr-auto px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs uppercase rounded-lg hover:bg-indigo-100 border border-indigo-200 transition flex items-center gap-2">
                      <Activity className="w-4 h-4" /> View Detailed Analytics
                    </button>
                    {activeTab === "Trial Analytics" ? (
                      <>
                        <button onClick={() => updateFeatureStatus(f._id, "Stopped")} className="px-4 py-2 bg-red-50 text-red-600 font-bold text-xs uppercase rounded-lg hover:bg-red-100 border border-red-200 transition">Stop Trial</button>
                        <button onClick={() => updateFeatureStatus(f._id, "Trial")} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs uppercase rounded-lg hover:bg-slate-200 border border-slate-200 transition">Modify Setting</button>
                        <button onClick={() => updateFeatureStatus(f._id, "Trial")} className="px-4 py-2 bg-blue-50 text-blue-600 font-bold text-xs uppercase rounded-lg hover:bg-blue-100 border border-blue-200 transition">Continue Trial</button>
                        <button onClick={() => updateFeatureStatus(f._id, "Business", { country: selectedCountry.name, state: selectedState, projectType: selectedProjectType })} className="px-4 py-2 bg-purple-600 text-white font-bold text-xs uppercase rounded-lg hover:bg-purple-700 shadow-sm transition">Implement for State</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => updateFeatureStatus(f._id, "Trial")} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs uppercase rounded-lg hover:bg-slate-200 border border-slate-200 transition">Downgrade to Trial</button>
                        <button onClick={() => updateFeatureStatus(f._id, "Business", { country: selectedCountry.name, projectType: selectedProjectType })} className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs uppercase rounded-lg hover:bg-emerald-700 shadow-sm transition">Implement for Country</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Add Feature Modal */}
      {isFeatureModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-100 bg-slate-50 font-black text-slate-700 uppercase">
              Add New {activeTab === "Trial Analytics" ? "Trial" : "Business"} Feature
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Feature Name</label>
                <input 
                  type="text" 
                  value={newFeature.name} 
                  onChange={e => setNewFeature({...newFeature, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="e.g. New AI Lead Gen"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Description</label>
                <textarea 
                  value={newFeature.description} 
                  onChange={e => setNewFeature({...newFeature, description: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="What does this feature do?"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Target Audience</label>
                <select 
                  value={newFeature.targetAudience} 
                  onChange={e => setNewFeature({...newFeature, targetAudience: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="Both">Both Customers & EPCs</option>
                  <option value="Customer">Customers Only</option>
                  <option value="EPC">EPCs Only</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Trial Duration</label>
                <select 
                  value={newFeature.trialDuration} 
                  onChange={e => setNewFeature({...newFeature, trialDuration: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="1 Week">1 Week</option>
                  <option value="1 Month">1 Month</option>
                  <option value="3 Months">3 Months</option>
                  <option value="1 Year">1 Year</option>
                  <option value="Ongoing">Ongoing</option>
                </select>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsFeatureModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddFeature}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Start Trial
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Detailed Feature Analytics Modal */}
      {selectedFeatureDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase">{selectedFeatureDetails.featureName}</h2>
                <p className="text-sm font-semibold text-slate-500 uppercase mt-1">
                  Detailed Impact Analysis • {selectedFeatureDetails.trialDuration || 'Ongoing'}
                </p>
              </div>
              <button onClick={() => setSelectedFeatureDetails(null)} className="text-slate-400 hover:text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-full p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-8 flex-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                  <p className="text-xs font-bold text-blue-600 uppercase">Customer Conversion</p>
                  <p className="text-2xl font-black text-blue-800 mt-1">+{selectedFeatureDetails.metrics?.customersCount || 0}</p>
                </div>
                <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl">
                  <p className="text-xs font-bold text-purple-600 uppercase">EPC Acceptance</p>
                  <p className="text-2xl font-black text-purple-800 mt-1">+{selectedFeatureDetails.metrics?.epcsCount || 0}</p>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                  <p className="text-xs font-bold text-emerald-600 uppercase">Project Orders</p>
                  <p className="text-2xl font-black text-emerald-800 mt-1">+{selectedFeatureDetails.metrics?.ordersGenerated || 0}</p>
                </div>
                <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl">
                  <p className="text-xs font-bold text-amber-600 uppercase">Installed KW</p>
                  <p className="text-2xl font-black text-amber-800 mt-1">+{selectedFeatureDetails.metrics?.projectKW || 0} kW</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-700 uppercase mb-4">Growth Trend (Simulated)</h3>
                <div className="h-72 w-full bg-white border border-slate-100 rounded-xl p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { name: 'W1', customers: 12, epcs: 2, orders: 3 },
                      { name: 'W2', customers: 25, epcs: 5, orders: 8 },
                      { name: 'W3', customers: 45, epcs: 12, orders: 15 },
                      { name: 'W4', customers: selectedFeatureDetails.metrics?.customersCount || 80, epcs: selectedFeatureDetails.metrics?.epcsCount || 20, orders: selectedFeatureDetails.metrics?.ordersGenerated || 25 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" />
                      <Line type="monotone" dataKey="customers" name="Customers Gained" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                      <Line type="monotone" dataKey="orders" name="Orders Closed" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                      <Line type="monotone" dataKey="epcs" name="EPCs Joined" stroke="#a855f7" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center sticky bottom-0">
              <button 
                onClick={() => { updateFeatureStatus(selectedFeatureDetails._id, "Stopped"); setSelectedFeatureDetails(null); }} 
                className="px-5 py-2.5 bg-red-100 text-red-600 font-bold text-sm uppercase rounded-xl hover:bg-red-200 transition"
              >
                {selectedFeatureDetails.status === 'Trial' ? 'Stop Trial' : 'Stop Feature'}
              </button>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => { /* Placeholder for modify */ setSelectedFeatureDetails(null); }} 
                  className="px-5 py-2.5 bg-slate-200 text-slate-700 font-bold text-sm uppercase rounded-xl hover:bg-slate-300 transition"
                >
                  Modify Setting
                </button>

                {selectedFeatureDetails.status === 'Trial' && (
                  <button 
                    onClick={() => { 
                      updateFeatureStatus(selectedFeatureDetails._id, "Business", { 
                        country: selectedCountry?.name, 
                        state: selectedState, 
                        projectType: selectedProjectType 
                        // Note: district is omitted, effectively rolling it out to the whole state
                      }); 
                      setSelectedFeatureDetails(null); 
                    }} 
                    className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm uppercase rounded-xl hover:bg-indigo-700 shadow-md transition"
                  >
                    Implement for State
                  </button>
                )}

                {selectedFeatureDetails.status === 'Business' && (
                  <button 
                    onClick={() => { 
                      updateFeatureStatus(selectedFeatureDetails._id, "Business", { 
                        country: selectedCountry?.name, 
                        projectType: selectedProjectType 
                        // Note: state and district omitted, effectively rolling it out to the whole country
                      }); 
                      setSelectedFeatureDetails(null); 
                    }} 
                    className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-sm uppercase rounded-xl hover:bg-emerald-700 shadow-md transition"
                  >
                    Implement for Country
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
