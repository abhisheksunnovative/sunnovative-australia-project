import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { MasterFilterBar } from "./common/MasterFilterBar";
import { SUPPORTED_COUNTRIES, getStatesForCountry, getDistrictsForState } from "../utils/geography";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

export default function ProjectPricingTab({ defaultCountry, defaultProjectType, hideFilters }) {
  const [pricing, setPricing] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [filterCountry, setFilterCountry] = useState(defaultCountry || 'australia');
  const [filterProjectType, setFilterProjectType] = useState(defaultProjectType || 'residential');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterKw, setFilterKw] = useState('');
  const [search, setSearch] = useState('');

  const [filterProjectTypesList, setFilterProjectTypesList] = useState([]);
  const [formProjectTypesList, setFormProjectTypesList] = useState([]);

  const [formData, setFormData] = useState({
    country: 'australia',
    region: '',
    district: '',
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
      if (filterRegion) url += `&region=${filterRegion}`;
      if (filterDistrict) url += `&district=${filterDistrict}`;
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
  }, [filterCountry, filterRegion, filterDistrict, filterProjectType, search]);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchTypes = async () => {
      if (!filterCountry) {
        setFilterProjectTypesList([]);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/order-journey/project-types?country=${filterCountry.toLowerCase()}`);
        const data = await res.json();
        if (data.success) {
          setFilterProjectTypesList(data.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTypes();
  }, [filterCountry]);

  useEffect(() => {
    const fetchTypes = async () => {
      if (!formData.country) {
        setFormProjectTypesList([]);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/order-journey/project-types?country=${formData.country.toLowerCase()}`);
        const data = await res.json();
        if (data.success) {
          setFormProjectTypesList(data.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (showModal) fetchTypes();
  }, [formData.country, showModal]);

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
        region: p.region || '',
        district: p.district || '',
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
        region: filterRegion || '',
        district: filterDistrict || '',
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
          {!hideFilters && (
            <>
              <h1 className="text-xl font-bold text-slate-800">Project Pricing</h1>
              <p className="text-sm text-slate-500">Configure prices based on Country, Project Type, and KW</p>
            </>
          )}
        </div>
        <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Pricing
        </button>
      </div>

      {!hideFilters && (
        <div className="mb-6">
          <MasterFilterBar
            search={search}
            setSearch={setSearch}
            countryFilter={filterCountry}
            setCountryFilter={setFilterCountry}
            onClear={() => { setFilterCountry('australia'); setFilterRegion(''); setFilterDistrict(''); setFilterProjectType(''); setSearch(''); }}
            extraFilters={[
              {
                isActive: Boolean(filterRegion),
                component: (
                  <select value={filterRegion} onChange={e => { setFilterRegion(e.target.value); setFilterDistrict(''); }} className="w-32 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/40 font-medium bg-white">
                    <option value="">Region</option>
                    {getStatesForCountry(filterCountry).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                )
              },
              {
                isActive: Boolean(filterDistrict),
                component: (
                  <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} className="w-32 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/40 font-medium bg-white" disabled={!filterRegion}>
                    <option value="">District</option>
                    {getDistrictsForState(filterCountry, filterRegion).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                )
              },
              {
                isActive: Boolean(filterProjectType),
                component: (
                  <select value={filterProjectType} onChange={e => setFilterProjectType(e.target.value)} className="w-32 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/40 font-medium bg-white">
                    <option value="">Project Type</option>
                    {filterProjectTypesList.map(pt => {
                      const val = typeof pt === 'string' ? pt : pt.name || pt.type;
                      return <option key={val} value={val}>{val}</option>;
                    })}
                  </select>
                )
              }
            ]}
          />
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-hidden mt-6">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b">
            <tr>
              <th className="p-4 font-semibold uppercase">Project</th>
              <th className="p-4 font-semibold uppercase">KW</th>
              <th className="p-4 font-semibold uppercase">Panel / Inverter</th>
              <th className="p-4 font-semibold uppercase">Price</th>
              <th className="p-4 font-semibold uppercase">Responsibility</th>
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
                  <td className="p-4">
                    {p.pricingResponsibility === 'EPC' ? (
                      <span className="px-2 py-1 rounded bg-orange-100 text-orange-800 text-xs font-medium">EPC</span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">Company</span>
                    )}
                  </td>
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
                  <select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value, region: '', district: ''})} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">Select Country</option>
                    {SUPPORTED_COUNTRIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Project Type</label>
                  <select required value={formData.projectType} onChange={e => setFormData({...formData, projectType: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="">Select Project Type</option>
                    {formProjectTypesList.map(pt => {
                      const val = typeof pt === 'string' ? pt : pt.name || pt.type;
                      return <option key={val} value={val}>{val}</option>;
                    })}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Region</label>
                  <select value={formData.region} onChange={e => setFormData({...formData, region: e.target.value, district: ''})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="">Select Region</option>
                    {getStatesForCountry(formData.country).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">District</label>
                  <select value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white" disabled={!formData.region}>
                    <option value="">Select District</option>
                    {getDistrictsForState(formData.country, formData.region).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">KW Size</label>
                  <input required type="number" step="0.1" value={formData.kw} onChange={e => setFormData({...formData, kw: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Final Price</label>
                  <input 
                    required={formData.pricingResponsibility !== 'EPC'}
                    disabled={formData.pricingResponsibility === 'EPC'} 
                    type="number" 
                    value={formData.finalPrice} 
                    onChange={e => setFormData({...formData, finalPrice: e.target.value})} 
                    className={`w-full border rounded-lg px-3 py-2 text-sm ${formData.pricingResponsibility === 'EPC' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                  />
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
