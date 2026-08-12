import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2, MapPin } from "lucide-react";

const DistrictPincodeSettings = ({ selectedCountry }) => {
  const [districts, setDistricts] = useState([]);
  const [formData, setFormData] = useState({ state: "", district: "", pincodes: "" });
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false); // true for new state, or string (state name) for new district
  const [expandedState, setExpandedState] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

  const fetchDistricts = async () => {
    if (!selectedCountry) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/districts?country=${selectedCountry}`);
      const data = await response.json();
      setDistricts(data.data || data);
    } catch (error) {
      console.error("Error fetching districts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistricts();
    setExpandedState(null);
  }, [selectedCountry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCountry) return alert("Please select a country first");
    try {
      const response = await fetch(`${API_BASE}/api/districts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: selectedCountry,
          state: formData.state,
          district: formData.district,
          pincodes: formData.pincodes
        })
      });
      if (response.ok) {
        setFormData({ state: "", district: "", pincodes: "" });
        
        // If we added a new state, automatically expand it
        if (showAddForm === true && formData.state) {
            setExpandedState(formData.state);
        }
        setShowAddForm(false);
        fetchDistricts();
      }
    } catch (error) {
      console.error("Error adding district:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/districts/${id}`, {
        method: "DELETE", });
      if (response.ok) fetchDistricts();
    } catch (error) {
      console.error("Error deleting district:", error);
    }
  };

  // Group by state
  const groupedDistricts = districts.reduce((acc, d) => {
    const stateName = d.state || "Unknown State";
    if (!acc[stateName]) acc[stateName] = [];
    acc[stateName].push(d);
    return acc;
  }, {});

  const openAddDistrict = (stateName, e) => {
    e.stopPropagation();
    setFormData({ state: stateName, district: "", pincodes: "" });
    setShowAddForm(stateName);
    setExpandedState(stateName); // Ensure the card is open so they see it
  };

  const openAddState = () => {
    setFormData({ state: "", district: "", pincodes: "" });
    setShowAddForm(true);
  };

  return (
    <div className="p-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">District & Pincode Settings</h2>
            {selectedCountry ? (
            <p className="text-slate-500 mt-1">Selected Country: <span className="font-bold text-slate-700 uppercase">{selectedCountry}</span></p>
            ) : (
            <p className="text-red-500 mt-1">Please select a country to view or add districts.</p>
            )}
        </div>
        
        {!showAddForm && selectedCountry && (
          <button
            onClick={openAddState}
            className="flex items-center gap-2 bg-[#28377f] hover:bg-blue-900 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} /> Add New State
          </button>
        )}
      </div>

      {showAddForm === true && (
        <div className="mb-8 p-6 bg-white border border-slate-200 rounded-xl shadow-sm relative">
          <button 
            type="button"
            onClick={() => setShowAddForm(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          >
            &#10005;
          </button>

          <h3 className="text-xl font-bold text-slate-800 mb-4">Add New State</h3>
          <p className="text-sm text-slate-500 mb-6">To create a new state, please add its first district.</p>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State Name</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                placeholder="e.g. Gujarat"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First District Name</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
                placeholder="e.g. Ahmedabad"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pincodes (comma-separated)</label>
              <textarea
                name="pincodes"
                value={formData.pincodes}
                onChange={handleChange}
                rows={2}
                placeholder="e.g. 380001, 380002"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
            <div className="md:col-span-3 flex justify-end mt-2">
              <button
                type="submit"
                className="bg-[#f57c00] hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-bold transition-colors"
              >
                Create State
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-8 text-slate-500">Loading configurations...</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedDistricts).map(([stateName, stateDistricts]) => {
            const isExpanded = expandedState === stateName;
            
            return (
              <div key={stateName} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* State Card Header */}
                <div 
                  className="flex items-center justify-between p-5 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
                  onClick={() => setExpandedState(isExpanded ? null : stateName)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                      <MapPin size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">{stateName}</h3>
                        <p className="text-sm text-slate-500">{stateDistricts.length} District{stateDistricts.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button
                        onClick={(e) => openAddDistrict(stateName, e)}
                        className="flex items-center gap-1.5 text-sm font-medium text-[#28377f] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors border border-blue-200"
                    >
                        <Plus size={16} /> Add District
                    </button>
                    {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                  </div>
                </div>

                {/* Expanded District Area */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-200 bg-white">
                    {/* Add District Form for this State */}
                    {showAddForm === stateName && (
                        <div className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-lg relative">
                             <button 
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                             >
                                &#10005;
                             </button>
                             <h4 className="font-bold text-slate-800 mb-4">Add District to {stateName}</h4>
                             <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">District Name</label>
                                    <input
                                        type="text"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Pincodes (comma-separated)</label>
                                    <input
                                        type="text"
                                        name="pincodes"
                                        value={formData.pincodes}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2 flex justify-end mt-2">
                                    <button
                                        type="submit"
                                        className="bg-[#28377f] hover:bg-blue-900 text-white px-5 py-2 rounded font-medium transition-colors"
                                    >
                                        Save District
                                    </button>
                                </div>
                             </form>
                        </div>
                    )}

                    {/* District Table */}
                    {stateDistricts.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">District</th>
                                        <th className="px-4 py-3 font-semibold">Pincodes</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {stateDistricts.map(d => (
                                        <tr key={d._id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3 font-medium text-slate-800">{d.district}</td>
                                            <td className="px-4 py-3 break-words max-w-xs">{d.pincodes.join(", ")}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${d.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {d.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleDelete(d._id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                                                    title="Delete District"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-4">No districts added yet.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {Object.keys(groupedDistricts).length === 0 && !showAddForm && (
            <div className="text-center py-12 bg-white border border-dashed border-slate-300 rounded-xl">
                <MapPin className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <h3 className="text-lg font-medium text-slate-800 mb-1">No States Found</h3>
                <p className="text-slate-500 mb-4">Start by adding a new state for this country.</p>
                <button
                    onClick={openAddState}
                    className="inline-flex items-center gap-2 bg-[#28377f] hover:bg-blue-900 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus size={18} /> Add New State
                </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DistrictPincodeSettings;
