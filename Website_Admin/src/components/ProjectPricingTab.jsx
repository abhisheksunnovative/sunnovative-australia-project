import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { MasterFilterBar } from "./common/MasterFilterBar";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

export default function ProjectPricingTab() {
  const [pricing, setPricing] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [filterCountry, setFilterCountry] = useState('Australia');
  const [filterProjectType, setFilterProjectType] = useState('');
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    country: 'australia',
    projectType: 'residential',
    kw: 5,
    panelBrand: '',
    inverterBrand: '',
    finalPrice: 0,
    pricingResponsibility: 'Company',
    allowEpcToSetPrice: false,
    isActive: true
  });

  const fetchPricing = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/api/project-pricing?country=${filterCountry.toLowerCase()}`;
      if (filterProjectType) url += `&projectType=${filterProjectType}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPricing(data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchBrands = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/brands`);
      const data = await res.json();
      if (data.success) {
        setBrands(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, [filterCountry, filterProjectType, search]);

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `${API_BASE}/api/project-pricing/${editingId}` : `${API_BASE}/api/project-pricing`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchPricing();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this pricing?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/project-pricing/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchPricing();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (p = null) => {
    if (p) {
      setEditingId(p._id);
      setFormData({
        country: p.country,
        projectType: p.projectType,
        kw: p.kw,
        panelBrand: p.panelBrand?._id || '',
        inverterBrand: p.inverterBrand?._id || '',
        finalPrice: p.projectPrice || p.finalPrice, // Mapping new schema field
        pricingResponsibility: p.pricingResponsibility || 'Company',
        allowEpcToSetPrice: p.allowEpcToSetPrice || false,
        isActive: p.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        country: filterCountry.toLowerCase(),
        projectType: filterProjectType || 'residential',
        kw: 5,
        panelBrand: '',
        inverterBrand: '',
        finalPrice: 0,
        pricingResponsibility: 'Company',
        allowEpcToSetPrice: false,
        isActive: true
      });
    }
    setShowModal(true);
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Project Pricing</h2>
          <p className="text-sm text-slate-500">Configure prices based on Country, Project Type, and KW</p>
        </div>
        <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Pricing
        </button>
      </div>

      <MasterFilterBar
        search={search}
        setSearch={setSearch}
        countryFilter={filterCountry}
        setCountryFilter={setFilterCountry}
        onClear={() => { setFilterCountry('Australia'); setFilterProjectType(''); setSearch(''); }}
        extraFilters={[
          {
            isActive: Boolean(filterProjectType),
            component: (
              <input type="text" value={filterProjectType} onChange={e => setFilterProjectType(e.target.value)} placeholder="Project Type"
                className="w-32 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/40 font-medium" />
            )
          }
        ]}
      />

      <div className="bg-white border rounded-xl overflow-hidden mt-6">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b">
            <tr>
              <th className="p-4 font-semibold uppercase">Project</th>
              <th className="p-4 font-semibold uppercase">KW</th>
              <th className="p-4 font-semibold uppercase">Panel / Inverter</th>
              <th className="p-4 font-semibold uppercase">Price</th>
              <th className="p-4 font-semibold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan="5" className="text-center p-8 text-slate-500">Loading...</td></tr>
            ) : pricing.length === 0 ? (
              <tr><td colSpan="5" className="text-center p-8 text-slate-500">No pricing found.</td></tr>
            ) : (
              pricing.map(p => (
                <tr key={p._id} className="hover:bg-slate-50">
                  <td className="p-4">{p.projectType}</td>
                  <td className="p-4 font-bold">{p.kw} kW</td>
                  <td className="p-4 text-xs text-slate-600">
                    <div>{p.panelBrand?.name || 'N/A'}</div>
                    <div className="text-gray-400">{p.inverterBrand?.name || 'N/A'}</div>
                  </td>
                  <td className="p-4 font-semibold">${p.finalPrice}</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => openModal(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p._id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Pricing' : 'Add Pricing'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="australia">Australia</option>
                    <option value="india">India</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Project Type</label>
                  <input required type="text" value={formData.projectType} onChange={e => setFormData({...formData, projectType: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">KW Size</label>
                  <input required type="number" step="0.1" value={formData.kw} onChange={e => setFormData({...formData, kw: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Final Price</label>
                  <input required type="number" value={formData.finalPrice} onChange={e => setFormData({...formData, finalPrice: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Panel Brand</label>
                  <select value={formData.panelBrand} onChange={e => setFormData({...formData, panelBrand: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">Select Panel</option>
                    {brands.filter(b => b.type === 'Solar').map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Inverter Brand</label>
                  <select value={formData.inverterBrand} onChange={e => setFormData({...formData, inverterBrand: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">Select Inverter</option>
                    {brands.filter(b => b.type === 'Inverter').map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Pricing Responsibility</label>
                  <select value={formData.pricingResponsibility} onChange={e => setFormData({...formData, pricingResponsibility: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="Company">Company Pricing (Admin sets fixed price)</option>
                    <option value="EPC">EPC Pricing (EPC sets the price)</option>
                  </select>
                </div>
                {formData.pricingResponsibility === 'EPC' && (
                  <div className="flex items-center gap-2 mt-6">
                    <input type="checkbox" id="allowEpc" checked={formData.allowEpcToSetPrice} onChange={e => setFormData({...formData, allowEpcToSetPrice: e.target.checked})} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="allowEpc" className="text-sm font-medium text-slate-700">Allow EPC to set Price</label>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Save Pricing</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
