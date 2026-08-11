import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, Edit, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

export const DiscomManagementScreen = () => {
  const [countries, setCountries] = React.useState([]);
  const [selectedCountryObj, setSelectedCountryObj] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Discom Management</h1>
          <p className="text-slate-500">Select a country to manage its Distribution Companies.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {countries.map(country => (
            <div 
              key={country._id || country.code}
              onClick={() => setSelectedCountryObj(country)}
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

  return <DiscomManagementContent selectedCountryObj={selectedCountryObj} onBack={() => setSelectedCountryObj(null)} />;
};



export const DiscomManagementContent = ({ selectedCountryObj, onBack }) => {
  const selectedCountry = selectedCountryObj.code;
  const selectedCountryName = selectedCountryObj.name;

  const [discoms, setDiscoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    country: "India",
    state: "",
    districts: ""
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDiscoms();
  }, []);

  const fetchDiscoms = async () => {
    if (!selectedCountry) return;
    try {
      const res = await fetch(`${API_BASE}/api/discoms?country=${selectedCountry}`);
      const data = await res.json();
      if (data.success) {
        setDiscoms(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.state || !formData.districts) {
      alert("Please fill all required fields (Name, State, Districts)");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        country: formData.country,
        state: formData.state,
        districts: formData.districts.split(",").map(d => d.trim()).filter(Boolean)
      };

      const url = editingId ? `${API_BASE}/api/discoms/${editingId}` : `${API_BASE}/api/discoms`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        alert("Discom saved successfully!");
        setEditingId(null);
        setFormData({ name: "", country: "India", state: "", districts: "" });
        fetchDiscoms();
      } else {
        alert(data.message || "Failed to save Discom");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving Discom");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (discom) => {
    setEditingId(discom._id);
    setFormData({
      name: discom.name,
      country: discom.country,
      state: discom.state,
      districts: discom.districts.join(", ")
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Discom?")) return;
    try {
      await fetch(`${API_BASE}/api/discoms/${id}`, { method: "DELETE" });
      fetchDiscoms();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Discom Management</h1>
        <p className="text-sm text-slate-500">Manage Electricity Distribution Companies (Discoms) and map them to specific districts.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">
          {editingId ? "Edit Discom" : "Create New Discom"}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <input type="hidden" name="country" value={formData.country} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
            <input type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} placeholder="e.g. Maharashtra" className="w-full border p-2 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Districts (Comma separated)</label>
            <input type="text" value={formData.districts} onChange={(e) => setFormData({...formData, districts: e.target.value})} placeholder="e.g. Pune, Mumbai, Thane" className="w-full border p-2 rounded-xl text-sm" />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-3 border-t pt-4">
          {editingId && (
            <button onClick={() => { setEditingId(null); setFormData({ name: "", country: "India", state: "", districts: "" }); }} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
              Cancel
            </button>
          )}
          <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />)} 
            {editingId ? "Update Discom" : "Create Discom"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="p-4">Discom Name</th>
                <th className="p-4">Country</th>
                <th className="p-4">State</th>
                <th className="p-4">Mapped Districts</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {discoms.map((d) => (
                <tr key={d._id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800">{d.name}</td>
                  <td className="p-4 text-slate-600">{d.country}</td>
                  <td className="p-4 text-slate-600">{d.state}</td>
                  <td className="p-4 text-slate-600">
                    <div className="flex flex-wrap gap-1">
                      {d.districts.map(dist => (
                        <span key={dist} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold">{dist}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(d)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(d._id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {discoms.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No Discoms found. Create one above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
