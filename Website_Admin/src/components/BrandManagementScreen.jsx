import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { MasterFilterBar } from "./common/MasterFilterBar";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

export default function BrandManagementScreen() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Filters
  const [filterCountry, setFilterCountry] = useState('Australia');
  const [filterProduct, setFilterProduct] = useState('all');
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    products: ['Solar Panel'],
    country: ['australia'],
    logoUrl: '',
    district: 'all',
    wattage: '',
    technology: '',
    inverterType: '',
    availableKw: '',
    projectTypes: '',
    isActive: true
  });

  const fetchBrands = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/api/brands?country=${filterCountry.toLowerCase()}`;
      if (filterProduct !== 'all') url += `&products=${filterProduct}`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        let filteredBrands = data.data;
        if (search) {
          filteredBrands = filteredBrands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
        }
        setBrands(filteredBrands);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [filterCountry, filterProduct, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `${API_BASE}/api/brands/${editingId}`
        : `${API_BASE}/api/brands`;
      
      const method = editingId ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        availableKw: formData.availableKw ? formData.availableKw.split(',').map(s => s.trim()).filter(Boolean) : [],
        projectTypes: formData.projectTypes ? formData.projectTypes.split(',').map(s => s.trim()).filter(Boolean) : []
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
        products: brand.products || (brand.type ? [brand.type === 'Solar' ? 'Solar Panel' : brand.type] : []),
        country: brand.country ? (Array.isArray(brand.country) ? brand.country : [brand.country]) : [filterCountry.toLowerCase()],
        logoUrl: brand.logoUrl || '',
        district: brand.district || 'all',
        wattage: brand.wattage || '',
        technology: brand.technology || '',
        inverterType: brand.inverterType || '',
        availableKw: brand.availableKw ? brand.availableKw.join(',') : '',
        projectTypes: brand.projectTypes ? brand.projectTypes.join(',') : '',
        isActive: brand.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        products: ['Solar Panel'],
        country: [filterCountry.toLowerCase()],
        logoUrl: '',
        district: 'all',
        wattage: '',
        technology: '',
        inverterType: '',
        availableKw: '',
        projectTypes: '',
        isActive: true
      });
    }
    setShowModal(true);
  };


  return (
    <div className="p-6 max-w-7xl mx-auto pb-24">
      {/* Master Filter Bar Moved to Top */}
      <div className="mb-6 sticky top-0 z-10 bg-slate-50 pt-2 pb-4 border-b border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Brand Management</h1>
            <p className="text-slate-500 text-sm">Manage Solar and Inverter Brands per country</p>
          </div>
          <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Brand
          </button>
        </div>
        <MasterFilterBar
          search={search}
          setSearch={setSearch}
          countryFilter={filterCountry}
          setCountryFilter={setFilterCountry}
          onClear={() => { setFilterCountry('Australia'); setFilterProduct('all'); setSearch(''); }}
          extraFilters={[
            {
              isActive: filterProduct !== 'all',
              component: (
                <select value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)} 
                  className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium">
                  <option value="all">All Products</option>
                  <option value="Solar Panel">Solar Panels</option>
                  <option value="Inverter">Inverters</option>
                  <option value="Battery">Batteries</option>
                </select>
              )
            }
          ]}
        />
      </div>


      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b">
            <tr>
              <th className="p-4 font-semibold uppercase">Brand Name</th>
              <th className="p-4 font-semibold uppercase">Products</th>
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
                  <td className="p-4 text-slate-600">{brand.products ? brand.products.join(', ') : (brand.type || '')}</td>
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
                  <label className="block text-sm font-medium mb-1">Products</label>
                  <div className="flex flex-wrap gap-2">
                    {['Solar Panel', 'Inverter', 'Battery'].map(prod => (
                      <label key={prod} className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.products.includes(prod)}
                          onChange={e => {
                            if(e.target.checked) {
                              setFormData({...formData, products: [...formData.products, prod]});
                            } else {
                              setFormData({...formData, products: formData.products.filter(p => p !== prod)});
                            }
                          }}
                        />
                        <span className="text-xs">{prod}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Countries</label>
                  <div className="flex flex-wrap gap-2">
                    {['india', 'australia', 'newzealand', 'uk', 'usa'].map(c => (
                      <label key={c} className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.country.includes(c)}
                          onChange={e => {
                            if(e.target.checked) {
                              setFormData({...formData, country: [...formData.country, c]});
                            } else {
                              setFormData({...formData, country: formData.country.filter(x => x !== c)});
                            }
                          }}
                        />
                        <span className="text-xs capitalize">{c === 'newzealand' ? 'New Zealand' : c === 'uk' ? 'UK' : c === 'usa' ? 'USA' : c}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Logo URL</label>
                <input type="text" value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} placeholder="https://..." className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              
              {formData.products.includes('Solar Panel') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Wattage</label>
                    <input type="text" value={formData.wattage} onChange={e => setFormData({...formData, wattage: e.target.value})} placeholder="e.g. 500W" className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Technology</label>
                    <input type="text" value={formData.technology} onChange={e => setFormData({...formData, technology: e.target.value})} placeholder="e.g. Mono PERC" className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
              )}
              {formData.products.includes('Inverter') && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Inverter Type</label>
                    <input type="text" value={formData.inverterType} onChange={e => setFormData({...formData, inverterType: e.target.value})} placeholder="e.g. String" className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Available kW (comma separated)</label>
                <input type="text" value={formData.availableKw} onChange={e => setFormData({...formData, availableKw: e.target.value})} placeholder="e.g. 3, 5, 10" className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Project Types (comma separated)</label>
                <input type="text" value={formData.projectTypes} onChange={e => setFormData({...formData, projectTypes: e.target.value})} placeholder="e.g. residential, commercial" className="w-full border rounded-lg px-3 py-2 text-sm" />
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
