import React, { useState, useEffect, useMemo } from "react";
import { Plus, Edit2, Trash2, Save, X, Activity, UserCheck, MapPin, Building, ArrowLeft, Briefcase, Map } from "lucide-react";
import { useGeography } from "../hooks/useGeography";
import { useAdminSettings } from "../hooks/useAdminSettings";

export default function BDEManagementScreen() {
  const [countries, setCountries] = React.useState([]);
  const [selectedCountryObj, setSelectedCountryFilterObj] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

  React.useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/countries`);
        const data = await res.json();
        if (data.success && data.data) {
          setCountries(data.data.filter(c => c.isActive));
        } else if (Array.isArray(data)) {
          setCountries(data.filter(c => c.isActive));
        }
      } catch (err) {
        console.error('Failed to fetch countries:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading countries...</div>;
  }

  if (!selectedCountryObj) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">BDE Management</h1>
          <p className="text-slate-500">Select a country to manage its Business Development Executives.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {countries.map(country => (
            <div 
              key={country._id || country.code}
              onClick={() => setSelectedCountryFilterObj(country)}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#28377f] cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{country.flagEmoji}</span>
              <span className="font-bold text-slate-700 group-hover:text-[#28377f]">{country.name}</span>
            </div>
          ))}
          {countries.length === 0 && (
            <p className="text-slate-500 col-span-full">No active countries found. Please configure them in Country Settings.</p>
          )}
        </div>
      </div>
    );
  }

  return <BDEManagementContent selectedCountryObj={selectedCountryObj} onBack={() => setSelectedCountryFilterObj(null)} />;
}

export function BDEManagementContent({ selectedCountryObj, onBack }) {
  const selectedCountry = selectedCountryObj.code;
  const selectedCountryName = selectedCountryObj.name;

  const [bdes, setBdes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Drill-down state
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); 
  
  // Modal state
  const [isEditing, setIsEditing] = useState(false);
  const [currentBde, setCurrentBde] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "", email: "", mobile: "", isActive: true,
    assignedCountries: "", assignedStates: "", assignedDistricts: "", assignedRegions: "", assignedPincodes: "",
    assignedProjectTypes: [], targetLeads: 0, targetConversions: 0,
    bdeType: "Employee", commissionType: "Fixed", commissionAmount: 0, projectTypeCommissions: []
  });

  const { projectTypes: dynamicProjectTypes } = useAdminSettings(selectedCountry);
  const projectTypeOptions = dynamicProjectTypes.length > 0
    ? dynamicProjectTypes.map(pt => pt.value)
    : ["residential", "commercial"];
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

  // Dynamic Geography Hook
  const { states: availableStates, districts: availableDistricts } = useGeography(selectedCountry, selectedState !== 'unassigned' ? selectedState : '');

  useEffect(() => {
    fetchBDEs();
  }, [selectedCountry]);

  const fetchBDEs = async () => {
    if (!selectedCountry) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/bde`);
      const data = await res.json();
      if (data.success) {
        setBdes(data.bdes);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleEdit = (bde) => {
    setCurrentBde(bde);
    setIsEditing(true);
    setFormData({
      name: bde.name,
      email: bde.email,
      mobile: bde.mobile,
      isActive: bde.isActive,
      assignedCountries: bde.assignedCountries?.join(", ") || selectedCountry,
      assignedStates: bde.assignedStates?.join(", ") || (selectedState && selectedState !== 'unassigned' ? selectedState : ""),
      assignedDistricts: bde.assignedDistricts?.join(", ") || (selectedDistrict && selectedDistrict !== 'unassigned' ? selectedDistrict : ""),
      assignedRegions: bde.assignedRegions?.join(", ") || "",
      assignedPincodes: bde.assignedPincodes?.join(", ") || "",
      assignedProjectTypes: bde.assignedProjectTypes || [],
      targetLeads: bde.targets?.leads || 0,
      targetConversions: bde.targets?.conversions || 0,
      bdeType: bde.bdeType || "Employee",
      commissionType: bde.freelancerSettings?.commissionType || "Fixed",
      commissionAmount: bde.freelancerSettings?.commissionAmount || 0,
      projectTypeCommissions: bde.freelancerSettings?.projectTypeCommissions || []
    });
  };

  const handleAddNew = () => {
    setCurrentBde(null);
    setIsEditing(true);
    setFormData({
      name: "", email: "", mobile: "", isActive: true,
      assignedCountries: selectedCountry, 
      assignedStates: selectedState && selectedState !== 'unassigned' ? selectedState : "", 
      assignedDistricts: selectedDistrict && selectedDistrict !== 'unassigned' ? selectedDistrict : "", 
      assignedRegions: "", assignedPincodes: "",
      assignedProjectTypes: ["residential"], targetLeads: 0, targetConversions: 0,
      bdeType: "Employee", commissionType: "Fixed", commissionAmount: 0, projectTypeCommissions: []
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this BDE?")) return;
    try {
      await fetch(`${API_BASE}/api/bde/${id}`, { method: "DELETE" });
      fetchBDEs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        isActive: formData.isActive,
        bdeType: formData.bdeType,
        freelancerSettings: formData.bdeType === "Freelancer" ? {
          commissionType: formData.commissionType,
          commissionAmount: formData.commissionAmount,
          projectTypeCommissions: formData.projectTypeCommissions
        } : undefined,
        assignedCountries: formData.assignedCountries.split(",").map(s => s.trim().toLowerCase()).filter(Boolean),
        assignedStates: formData.assignedStates.split(",").map(s => s.trim()).filter(Boolean),
        assignedDistricts: formData.assignedDistricts.split(",").map(s => s.trim()).filter(Boolean),
        assignedRegions: formData.assignedRegions.split(",").map(s => s.trim()).filter(Boolean),
        assignedPincodes: formData.assignedPincodes.split(",").map(s => s.trim()).filter(Boolean),
        assignedProjectTypes: formData.assignedProjectTypes,
        targets: { leads: formData.targetLeads, conversions: formData.targetConversions }
      };

      if (!currentBde) {
        await fetch(`${API_BASE}/api/bde`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
        });
      } else {
        await fetch(`${API_BASE}/api/bde/${currentBde._id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
        });
      }
      setIsEditing(false);
      fetchBDEs();
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving BDE");
    }
  };

  const handleProjectTypeToggle = (type) => {
    setFormData(prev => {
      const types = prev.assignedProjectTypes.includes(type)
        ? prev.assignedProjectTypes.filter(t => t !== type)
        : [...prev.assignedProjectTypes, type];
      return { ...prev, assignedProjectTypes: types };
    });
  };

  // ----- DYNAMIC FILTERING LOGIC -----
  
  // 1. Get country BDEs
  const countryBDEs = bdes.filter(bde => {
    const assignedC = bde.assignedCountries || [];
    if (assignedC.length === 0 && selectedCountry === 'india') return true; 
    return assignedC.map(c => c.toLowerCase()).includes(selectedCountry.toLowerCase());
  });

  // 2. Get state BDEs
  const stateBDEs = selectedState ? countryBDEs.filter(bde => {
    const bdeStates = bde.assignedStates || [];
    if (selectedState === 'unassigned') {
       return bdeStates.length === 0 || !bdeStates.some(bs => availableStates.find(a => a.toLowerCase() === bs.toLowerCase()));
    }
    return bdeStates.some(bs => bs.toLowerCase() === selectedState.toLowerCase());
  }) : countryBDEs;

  // 3. Get district BDEs
  const districtBDEs = selectedDistrict ? stateBDEs.filter(bde => {
    const bdeDists = bde.assignedDistricts || [];
    if (selectedDistrict === 'unassigned') return bdeDists.length === 0;
    return bdeDists.some(bd => bd.toLowerCase() === selectedDistrict.toLowerCase());
  }) : stateBDEs;

  // Scoped list for summaries
  const currentScopedBDEs = districtBDEs;

  const renderStates = () => {
    const statesToRender = [...availableStates, 'unassigned'];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold uppercase text-slate-800">States in {selectedCountryName}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statesToRender.map(stateName => {
            // Count BDEs in this state
            const count = countryBDEs.filter(bde => {
              const bdeStates = bde.assignedStates || [];
              if (stateName === 'unassigned') {
                 // Unassigned BDEs: those with no state assigned OR a state not in the available list
                 return bdeStates.length === 0 || !bdeStates.some(bs => availableStates.find(a => a.toLowerCase() === bs.toLowerCase()));
              }
              return bdeStates.some(bs => bs.toLowerCase() === stateName.toLowerCase());
            }).length;

            return (
              <div 
                key={stateName} 
                onClick={() => setSelectedState(stateName)}
                className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stateName === 'unassigned' ? 'bg-slate-50 text-slate-500' : 'bg-blue-50 text-blue-600'}`}>
                    <Map className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase text-slate-800">
                      {stateName === 'unassigned' ? "Unassigned / Other" : stateName}
                    </h3>
                    <p className="text-sm text-slate-500">{count} active BDEs</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDistricts = () => {
    // If selectedState is unassigned, we look for BDEs that fell into the unassigned state bucket
    // (We now use stateBDEs calculated at the top)

    // Determine district categories to show: Database districts + any distinct strings from the old BDEs
    let allDistrictNames = new Set(availableDistricts);
    stateBDEs.forEach(b => {
       const dists = b.assignedDistricts || [];
       dists.forEach(d => allDistrictNames.add(d));
    });

    const distsToRender = [...Array.from(allDistrictNames), 'unassigned'].filter(d => d.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => { setSelectedState(null); setSearchQuery(""); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold uppercase text-slate-800">
              Districts in {selectedState === 'unassigned' ? "Unassigned" : selectedState}
            </h2>
          </div>

        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {distsToRender.map(d => {
            // Count BDEs
            const count = stateBDEs.filter(bde => {
              const bdeDists = bde.assignedDistricts || [];
              if (d === 'unassigned') {
                 return bdeDists.length === 0;
              }
              return bdeDists.some(bd => bd.toLowerCase() === d.toLowerCase());
            }).length;

            return (
              <div 
                key={d} 
                onClick={() => { setSelectedDistrict(d); setSearchQuery(""); }}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building className={`w-5 h-5 ${d === 'unassigned' ? 'text-slate-400' : 'text-blue-500'}`} />
                    <h3 className="font-bold capitalize text-slate-800">
                      {d === 'unassigned' ? "Unassigned / Other" : d}
                    </h3>
                  </div>
                  <span className="bg-blue-50 px-2.5 py-1 rounded-full text-xs font-bold text-blue-600">
                    {count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderBDEs = () => {
    // We now use districtBDEs calculated at the top
    const filteredBDEs = districtBDEs.filter(bde => bde.name.toLowerCase().includes(searchQuery.toLowerCase()) || bde.email.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => { setSelectedDistrict(null); setSearchQuery(""); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold uppercase text-slate-800">BDEs in {selectedDistrict === 'unassigned' ? "Unassigned" : selectedDistrict}</h2>
          </div>

        </div>

        {filteredBDEs.length === 0 && (
          <div className="text-center py-10 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-slate-500 mb-2">No BDEs found here.</p>
            <button onClick={handleAddNew} className="text-blue-600 font-bold hover:underline">Register first BDE</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredBDEs.map(bde => {
            const isAU = selectedCountry === "australia" || bde.assignedCountries?.includes("australia");
            const currencySymbol = isAU ? "AUD $" : "₹";
            const isFreelancer = bde.bdeType === "Freelancer";
            const commType = bde.freelancerSettings?.commissionType || "Fixed";
            const commAmt = bde.freelancerSettings?.commissionAmount || 0;
            const totalEarned = bde.freelancerSettings?.totalEarnings || 0;

            return (
              <div key={bde._id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-slate-800">{bde.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        isFreelancer ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}>
                        {isFreelancer ? "Freelancer" : "Employee"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{bde.email}</p>
                    <p className="text-xs text-slate-500">{bde.mobile}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(bde)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(bde._id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {bde.assignedProjectTypes?.map(pt => (
                      <span key={pt} className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] uppercase rounded-full">
                        {pt}
                      </span>
                    ))}
                    {(!bde.assignedProjectTypes || bde.assignedProjectTypes.length === 0) && (
                      <span className="text-[10px] text-slate-500">No project types</span>
                    )}
                  </div>

                  {isFreelancer && (
                    <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between text-amber-900 font-medium">
                        <span>Config:</span>
                        <span className="font-bold">
                          {commType === "PerKW" ? `${currencySymbol}${commAmt} / kW` : `${currencySymbol}${commAmt} / conv`}
                        </span>
                      </div>
                      <div className="flex justify-between text-amber-900 border-t border-amber-200/60 pt-1 font-bold">
                        <span>Accrued Earnings:</span>
                        <span className="text-emerald-700 text-sm font-black">{currencySymbol}{totalEarned.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500">Leads</p>
                      <p className="font-bold text-slate-800">{bde.performance?.leadsAcquired || 0} / {bde.targets?.leads || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Converted</p>
                      <p className="font-bold text-slate-800">{bde.performance?.leadsConverted || 0} / {bde.targets?.conversions || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const activeBdesCount = currentScopedBDEs.filter(b => b.isActive).length;
  const freelancerBdesCount = currentScopedBDEs.filter(b => b.bdeType === "Freelancer").length;
  const employeeBdesCount = currentScopedBDEs.filter(b => b.bdeType === "Employee").length;
  const totalLeads = currentScopedBDEs.reduce((acc, curr) => acc + (curr.performance?.leadsAcquired || 0), 0);
  const totalConversions = currentScopedBDEs.reduce((acc, curr) => acc + (curr.performance?.leadsConverted || 0), 0);
  const conversionRatio = totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : "0.0";
  const totalCommissions = currentScopedBDEs.reduce((acc, curr) => acc + (curr.freelancerSettings?.totalEarnings || 0), 0);
  const indiaConversions = currentScopedBDEs.filter(b => b.assignedCountries?.includes("india")).reduce((acc, curr) => acc + (curr.performance?.leadsConverted || 0), 0);
  const ausConversions = currentScopedBDEs.filter(b => b.assignedCountries?.includes("australia")).reduce((acc, curr) => acc + (curr.performance?.leadsConverted || 0), 0);

  const getFilteredBdesList = () => {
    let list = currentScopedBDEs;
    if (filterType === "active") list = currentScopedBDEs.filter(b => b.isActive);
    if (filterType === "freelancer") list = currentScopedBDEs.filter(b => b.bdeType === "Freelancer");
    if (filterType === "employee") list = currentScopedBDEs.filter(b => b.bdeType === "Employee");
    if (filterType === "india") list = currentScopedBDEs.filter(b => b.assignedCountries?.includes("india"));
    if (filterType === "australia") list = currentScopedBDEs.filter(b => b.assignedCountries?.includes("australia"));
    if (filterType === "commission") list = currentScopedBDEs.filter(b => b.bdeType === "Freelancer" && (b.freelancerSettings?.totalEarnings || 0) > 0);
    return list;
  };

  return (
    <div className="p-6 text-slate-800 max-w-7xl mx-auto font-sans">
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-blue-800 flex items-center gap-3">
            <UserCheck className="text-blue-600" /> BDE Network
          </h1>
          <p className="text-slate-500 mt-2">Manage Business Development Executives by region and project type.</p>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex justify-end items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search BDEs or Districts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm w-64 shadow-sm"
        />
        <button onClick={handleAddNew} className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center gap-2 text-sm transition-all shadow-md">
          <Plus className="w-4 h-4" /> Add New BDE
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div 
          onClick={() => {
            setFilterType(filterType === "active" ? "all" : "active");
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            filterType === "active" ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500/20" : "bg-white border-slate-200 hover:border-blue-300"
          }`}
        >
          <p className="text-[10px] uppercase font-extrabold text-slate-400">Active BDEs</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{activeBdesCount}</p>
          <span className="text-[9px] text-slate-500 font-semibold">Status: Active</span>
        </div>

        <div 
          onClick={() => {
            setFilterType(filterType === "freelancer" ? "all" : "freelancer");
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            filterType === "freelancer" ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500/20" : "bg-white border-slate-200 hover:border-amber-300"
          }`}
        >
          <p className="text-[10px] uppercase font-extrabold text-slate-400">Freelancers</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{freelancerBdesCount}</p>
          <span className="text-[9px] text-slate-500 font-semibold">Type: Commission</span>
        </div>

        <div 
          onClick={() => {
            setFilterType(filterType === "employee" ? "all" : "employee");
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            filterType === "employee" ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20" : "bg-white border-slate-200 hover:border-emerald-300"
          }`}
        >
          <p className="text-[10px] uppercase font-extrabold text-slate-400">Employees</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{employeeBdesCount}</p>
          <span className="text-[9px] text-slate-500 font-semibold">Type: Salaried</span>
        </div>

        <div className="p-4 rounded-2xl border bg-white border-slate-200 shadow-sm">
          <p className="text-[10px] uppercase font-extrabold text-slate-400">Conversion Ratio</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{conversionRatio}%</p>
          <span className="text-[9px] text-slate-500 font-semibold">{totalConversions} / {totalLeads} Converted</span>
        </div>

        <div 
          onClick={() => {
            setFilterType(filterType === "australia" ? "india" : filterType === "india" ? "all" : "australia");
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            filterType === "australia" || filterType === "india" ? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20" : "bg-white border-slate-200 hover:border-indigo-300"
          }`}
        >
          <p className="text-[10px] uppercase font-extrabold text-slate-400">Country Performance</p>
          <p className="text-xs font-black text-slate-700 mt-1 flex flex-col">
            <span>🇮🇳 India: {indiaConversions} conv</span>
            <span>🇦🇺 Aust: {ausConversions} conv</span>
          </p>
        </div>

        <div 
          onClick={() => {
            setFilterType(filterType === "commission" ? "all" : "commission");
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            filterType === "commission" ? "bg-rose-50 border-rose-500 ring-2 ring-rose-500/20" : "bg-white border-slate-200 hover:border-rose-300"
          }`}
        >
          <p className="text-[10px] uppercase font-extrabold text-slate-400">Commissions Summary</p>
          <p className="text-base font-black text-rose-700 mt-1 flex items-center gap-0.5">
            <span>₹{totalCommissions.toLocaleString()}</span>
          </p>
          <span className="text-[9px] text-slate-500 font-semibold">Total Paid out</span>
        </div>
      </div>

      {filterType !== "all" ? (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center bg-slate-50 p-4 border border-slate-200 rounded-2xl text-slate-700">
            <p className="text-sm font-bold capitalize">
              Showing Filtered BDE list: <span className="text-blue-700 font-black">{filterType} BDEs</span> ({getFilteredBdesList().length} found)
            </p>
            <button 
              onClick={() => setFilterType("all")} 
              className="text-xs font-black bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition shadow-sm cursor-pointer"
            >
              Clear Filter
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getFilteredBdesList().map(bde => {
              const isFreelancer = bde.bdeType === "Freelancer";
              const commType = bde.freelancerSettings?.commissionType || "Fixed";
              const commAmt = bde.freelancerSettings?.commissionAmount || 0;
              const totalEarned = bde.freelancerSettings?.totalEarnings || 0;

              return (
                <div key={bde._id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-slate-800">{bde.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          isFreelancer ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}>
                          {isFreelancer ? "Freelancer" : "Employee"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{bde.email}</p>
                      <p className="text-xs text-slate-500">{bde.mobile}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(bde)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(bde._id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {bde.assignedProjectTypes?.map(pt => (
                        <span key={pt} className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] uppercase rounded-full">
                          {pt}
                        </span>
                      ))}
                    </div>

                    {isFreelancer && (
                      <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between text-amber-900 font-bold">
                          <span>Accrued Earnings:</span>
                          <span className="text-emerald-700 text-sm font-black">₹{totalEarned.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-slate-500">Leads</p>
                        <p className="font-bold text-slate-800">{bde.performance?.leadsAcquired || 0} / {bde.targets?.leads || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Converted</p>
                        <p className="font-bold text-slate-800">{bde.performance?.leadsConverted || 0} / {bde.targets?.conversions || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {!selectedState && renderStates()}
          {selectedState && !selectedDistrict && renderDistricts()}
          {selectedState && selectedDistrict && renderBDEs()}
        </>
      )}

      {/* Slide-over / Modal for Edit */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-slate-200 overflow-y-auto">
            <div className="p-6 sticky top-0 bg-white border-b border-slate-200 z-10 flex justify-between items-center shadow-sm">
              <h2 className="text-xl font-bold text-slate-800">{currentBde ? "Edit BDE" : "Register BDE"}</h2>
              <button onClick={() => setIsEditing(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {!currentBde && (
                <div className="p-3 bg-blue-50 border border-blue-100 text-blue-700 text-sm rounded-lg">
                  Passwords are no longer set by Admin. BDEs will set their own password securely via OTP sent to their email during first login.
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Mobile</label>
                  <input type="text" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:border-blue-500" />
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="font-bold text-blue-600 mb-3">Employment Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">BDE Type</label>
                      <select value={formData.bdeType} onChange={e => setFormData({...formData, bdeType: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:border-blue-500">
                        <option value="Employee">Full-time Employee</option>
                        <option value="Freelancer">Freelancer / Affiliate</option>
                      </select>
                    </div>
                  </div>
                </div>

                {formData.bdeType === "Freelancer" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h4 className="font-bold text-amber-800 mb-3 text-sm">Freelancer Commission Config</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-amber-700 uppercase mb-1">Commission Type</label>
                        <select value={formData.commissionType} onChange={e => setFormData({...formData, commissionType: e.target.value})} className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none font-bold text-xs">
                          <option value="Fixed">Fixed Amount per Conversion</option>
                          <option value="PerKW">Pay per kW</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-amber-700 uppercase mb-1">
                          {formData.commissionType === "PerKW" ? "Amount per kW" : "Amount per Conversion"}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            {selectedCountry === "australia" ? "AUD $" : "₹"}
                          </span>
                          <input type="number" value={formData.commissionAmount} onChange={e => setFormData({...formData, commissionAmount: Number(e.target.value)})} className="w-full bg-white border border-amber-200 rounded-lg pl-14 pr-3 py-2 text-slate-800 focus:outline-none font-bold text-sm" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-amber-600 mt-2">
                      {formData.commissionType === "PerKW" 
                        ? `Commission will credit ${selectedCountry === "australia" ? "AUD $" : "₹"}${formData.commissionAmount} × System kW for every confirmed conversion.`
                        : `Commission will credit fixed ${selectedCountry === "australia" ? "AUD $" : "₹"}${formData.commissionAmount} for every confirmed conversion.`
                      }
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="font-bold text-blue-600 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4"/> Territories (Auto-assigned)</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
                    <span className="font-semibold text-slate-800 capitalize">{selectedCountry || "India"}</span>
                    <span>→</span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {formData.assignedStates}
                    </span>
                    <span>→</span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {formData.assignedDistricts}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Region / City (Comma separated)</label>
                    <input type="text" value={formData.assignedRegions} onChange={e => setFormData({...formData, assignedRegions: e.target.value})} placeholder="e.g. Navrangpura, Bopal" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="font-bold text-blue-600 mb-3 flex items-center gap-2"><Briefcase className="w-4 h-4"/> Project Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {projectTypeOptions.map(pt => {
                      const isSelected = formData.assignedProjectTypes.includes(pt);
                      return (
                        <button 
                          key={pt}
                          onClick={() => handleProjectTypeToggle(pt)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase border transition-colors ${isSelected ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'}`}
                        >
                          {pt}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="font-bold text-blue-600 mb-3 flex items-center gap-2"><Activity className="w-4 h-4"/> Monthly Targets</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Leads</label>
                      <input type="number" value={formData.targetLeads} onChange={e => setFormData({...formData, targetLeads: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Conversions</label>
                      <input type="number" value={formData.targetConversions} onChange={e => setFormData({...formData, targetConversions: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>
                </div>
                
                <label className="flex items-center gap-2 mt-4">
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-semibold text-slate-600">Active Account</span>
                </label>

              </div>
              
              <div className="pt-6">
                <button onClick={handleSave} className="w-full py-3 bg-blue-600 hover:bg-blue-700 shadow-md rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all">
                  <Save className="w-5 h-5" /> {currentBde ? "Update BDE" : "Register BDE"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
