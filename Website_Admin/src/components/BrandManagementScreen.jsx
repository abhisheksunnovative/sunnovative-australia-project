import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';


const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

export default function BrandManagementScreen() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Filters
  const [filterCountry, setFilterCountry] = useState('australia');
  const [filterType, setFilterType] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    type: 'Solar',
    country: 'australia',
    logoUrl: '',
    isActive: true
  });

  const fetchBrands = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/api/brands?country=${filterCountry}`;
      if (filterType !== 'all') url += `&type=${filterType}`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setBrands(data.data);
      }
    } catch (err) {
      alert("error", "Failed to fetch brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [filterCountry, filterType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `${API_BASE}/api/brands/${editingId}`
        : `${API_BASE}/api/brands`;
      
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        alert("success", `Brand ${editingId ? 'updated' : 'added'} successfully!`);
        setShowModal(false);
        fetchBrands();
      } else {
        alert("error", data.message);
      }
    } catch (err) {
      alert("error", "Server error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this brand?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/brands/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert("success", "Brand deleted");
        fetchBrands();
      }
    } catch (err) {
      alert("error", "Server error");
    }
  };

  const openModal = (brand = null) => {
    if (brand) {
      setEditingId(brand._id);
      setFormData({
        name: brand.name,
        type: brand.type,
        country: brand.country,
        logoUrl: brand.logoUrl || '',
        isActive: brand.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        type: 'Solar',
        country: filterCountry,
        logoUrl: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Brand Management</h1>
          <p className="text-slate-500 text-sm">Manage Solar and Inverter Brands per country</p>
        </div>
        <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border flex gap-4 mb-6">
        <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-slate-50">
          <option value="india">India</option>
          <option value="australia">Australia</option>
          <option value="newzealand">New Zealand</option>
          <option value="uk">UK</option>
          <option value="usa">USA</option>
        </select>
        
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-slate-50">
          <option value="all">All Types</option>
          <option value="Solar">Solar Panels</option>
          <option value="Inverter">Inverters</option>
          <option value="Battery">Batteries</option>
        </select>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b">
            <tr>
              <th className="p-4 font-semibold uppercase">Brand Name</th>
              <th className="p-4 font-semibold uppercase">Type</th>
              <th className="p-4 font-semibold uppercase">Status</th>
              <th className="p-4 font-semibold uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan="4" className="text-center p-8 text-slate-500">Loading...</td></tr>
            ) : brands.length === 0 ? (
              <tr><td colSpan="4" className="text-center p-8 text-slate-500">No brands found for this filter.</td></tr>
            ) : (
              brands.map(brand => (
                <tr key={brand._id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800 flex items-center gap-3">
                    {brand.logoUrl ? (
                      <img src={brand.logoUrl} alt={brand.name} className="w-8 h-8 rounded bg-white border object-contain p-1" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-slate-100 border flex items-center justify-center text-slate-400 text-xs">IMG</div>
                    )}
                    {brand.name}
                  </td>
                  <td className="p-4 text-slate-600">{brand.type}</td>
                  <td className="p-4">
                    {brand.isActive ? (
                      <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold w-fit"><CheckCircle className="w-3 h-3"/> Active</span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold w-fit"><XCircle className="w-3 h-3"/> Disabled</span>
                    )}
                  </td>
                  <td className="p-4 flex gap-2 justify-end">
                    <button onClick={() => openModal(brand)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(brand._id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Brand' : 'Add Brand'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Brand Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="Solar">Solar Panel</option>
                    <option value="Inverter">Inverter</option>
                    <option value="Battery">Battery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="india">India</option>
                    <option value="australia">Australia</option>
                    <option value="newzealand">New Zealand</option>
                    <option value="uk">UK</option>
                    <option value="usa">USA</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Logo URL</label>
                <input type="text" value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} placeholder="https://..." className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} id="isAct" className="w-4 h-4" />
                <label htmlFor="isAct" className="text-sm font-medium">Brand is Active</label>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Save Brand</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
