import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X, Activity, UserCheck, MapPin, Building, ArrowLeft, Briefcase } from "lucide-react";

export default function BDEManagementScreen() {
  const [bdes, setBdes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Drill-down state
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [manualDistricts, setManualDistricts] = useState([]);
  
  // Modal state
  const [isEditing, setIsEditing] = useState(false);
  const [currentBde, setCurrentBde] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "", email: "", mobile: "", isActive: true,
    assignedCountries: "", assignedStates: "", assignedDistricts: "", assignedRegions: "", assignedPincodes: "",
    assignedProjectTypes: [], targetLeads: 0, targetConversions: 0,
    bdeType: "Employee", commissionType: "Fixed", commissionAmount: 0, projectTypeCommissions: []
  });

  const projectTypeOptions = ["residential", "commercial", "group", "common-meter", "surya-ghar", "au-small-home", "au-standard-family", "au-large-home", "au-ev-owners", "au-solar-battery"];
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

  useEffect(() => {
    fetchBDEs();
  }, []);

  const fetchBDEs = async () => {
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
      assignedCountries: bde.assignedCountries?.join(", ") || (selectedCountry || "india"),
      assignedStates: bde.assignedStates?.join(", ") || "",
      assignedDistricts: bde.assignedDistricts?.join(", ") || (selectedDistrict || ""),
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
      assignedCountries: selectedCountry || "india", assignedStates: "", 
      assignedDistricts: selectedDistrict || "", assignedRegions: "", assignedPincodes: "",
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

  // Grouping logic
  const countryMap = {
    "india": {
      districts: {
        "Uttar Pradesh": [], "Rajkot": [], "Ahmedabad": [], "Surat": [], "Vadodara": [], "Mumbai": [], "Delhi": [], "Bangalore": [], "Pune": [], "Jaipur": [], "Lucknow": []
      }
    },
    "australia": {
      districts: {
        "Sydney": [], "Melbourne": [], "Brisbane": [], "Perth": [], "Adelaide": [], "Hobart": [], "Darwin": [], "Canberra": []
      }
    },
    "new zealand": {
      districts: {
        "Auckland": [], "Wellington": [], "Christchurch": [], "Hamilton": [], "Tauranga": [], "Napier-Hastings": [], "Dunedin": []
      }
    },
    "uk": {
      districts: {
        "London": [], "Birmingham": [], "Manchester": [], "Glasgow": [], "Liverpool": [], "Edinburgh": [], "Bristol": []
      }
    },
    "usa": {
      districts: {
        "New York": [], "Los Angeles": [], "Chicago": [], "Houston": [], "Phoenix": [], "Philadelphia": [], "San Antonio": [], "San Diego": [], "Dallas": [], "Austin": []
      }
    }
  };

  manualDistricts.forEach(d => {
    if (!countryMap["india"].districts[d]) {
      countryMap["india"].districts[d] = [];
    }
  });

  bdes.forEach(bde => {
    // Default to "india" if older BDE records have no country assigned
    const countries = bde.assignedCountries?.length > 0 ? bde.assignedCountries : ["india"];
    countries.forEach(rawC => {
      const c = rawC.toLowerCase();
      if (!countryMap[c]) countryMap[c] = { districts: {} };
      
      const dists = bde.assignedDistricts?.length > 0 ? bde.assignedDistricts : ["unassigned"];
      dists.forEach(rawD => {
        let d = rawD;
        const existingKey = Object.keys(countryMap[c].districts).find(k => k.toLowerCase() === rawD.toLowerCase());
        if (existingKey) {
            d = existingKey;
        } else {
            d = rawD.charAt(0).toUpperCase() + rawD.slice(1).toLowerCase();
        }
        
        if (!countryMap[c].districts[d]) countryMap[c].districts[d] = [];
        countryMap[c].districts[d].push(bde);
      });
    });
  });

  const renderCountries = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Select Country</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.keys(countryMap).filter(c => c !== 'unassigned').map(c => {
          const totalBdes = Object.values(countryMap[c].districts).reduce((acc, curr) => acc + curr.length, 0);
          return (
            <div 
              key={c} 
              onClick={() => setSelectedCountry(c)}
              className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md cursor-pointer transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <MapPin className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold uppercase text-slate-800">{c}</h3>
                  <p className="text-sm text-slate-500">{totalBdes} active BDEs</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDistricts = () => {
    const distMap = countryMap[selectedCountry]?.districts || {};
    
    const filteredDistricts = Object.keys(distMap)
      .filter(d => d !== 'unassigned')
      .filter(d => d.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleAddDistrict = () => {
      const newD = prompt("Enter new district name:");
      if (newD && newD.trim()) {
        setManualDistricts([...manualDistricts, newD.trim()]);
        setSearchQuery("");
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => { setSelectedCountry(null); setSearchQuery(""); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold uppercase text-slate-800">Districts in {selectedCountry}</h2>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="text" 
              placeholder="Search district..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            />
            <button onClick={handleAddDistrict} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm transition-colors">
              <Plus className="w-4 h-4" /> Add District
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {filteredDistricts.map(d => (
            <div 
              key={d} 
              onClick={() => setSelectedDistrict(d)}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold capitalize text-slate-800">{d}</h3>
                </div>
                <span className="bg-blue-50 px-2.5 py-1 rounded-full text-xs font-bold text-blue-600">
                  {distMap[d].length}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBDEs = () => {
    const bdesList = countryMap[selectedCountry]?.districts[selectedDistrict] || [];
    const filteredBDEs = bdesList.filter(bde => bde.name.toLowerCase().includes(searchQuery.toLowerCase()) || bde.email.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => { setSelectedDistrict(null); setSearchQuery(""); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold uppercase text-slate-800">BDEs in {selectedDistrict}</h2>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="text" 
              placeholder="Search BDE..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            />
            <button onClick={handleAddNew} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm transition-colors">
              <Plus className="w-4 h-4" /> Add BDE
            </button>
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

  return (
    <div className="p-6 text-slate-800 max-w-7xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-blue-800 flex items-center gap-3">
          <UserCheck className="text-blue-600" /> BDE Network
        </h1>
        <p className="text-slate-500 mt-2">Manage Business Development Executives by region and project type.</p>
      </div>

      {!selectedCountry && renderCountries()}
      {selectedCountry && !selectedDistrict && renderDistricts()}
      {selectedCountry && selectedDistrict && renderBDEs()}

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
                      {selectedDistrict || formData.assignedDistricts}
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
