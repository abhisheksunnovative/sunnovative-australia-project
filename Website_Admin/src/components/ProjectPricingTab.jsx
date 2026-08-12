import { useGeography } from "../hooks/useGeography";
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { MasterFilterBar } from "./common/MasterFilterBar";
import { SUPPORTED_COUNTRIES } from "../utils/geography";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

export default function ProjectPricingTab({ defaultCountry, defaultProjectType, hideFilters }) {
  const [pricing, setPricing] = useState([]);
  const [brands, setBrands] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [filterCountry, setFilterCountry] = useState(defaultCountry || 'australia');
  const [filterProjectType, setFilterProjectType] = useState(defaultProjectType || 'residential');
  const [filterRegion, setFilterRegion] = useState('');
  const { states: availableStates, districts: availableDistricts } = useGeography(filterCountry, filterRegion);
  const [filterDistrict, setFilterDistrict] = useState('');
  const [search, setSearch] = useState('');

  const [filterProjectTypesList, setFilterProjectTypesList] = useState([]);
  const [formProjectTypesList, setFormProjectTypesList] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    country: 'australia',
    region: '',
    district: '',
    projectType: 'residential',
    kw: "",
    panelBrand: '',
    inverterBrand: '',
    finalPrice: 0,
    pricingResponsibility: 'Company',
    allowEpcToSetPrice: false,
    isActive: true,
    // Bulk Add new fields
    panelBrands: [],
    inverterBrands: [],
    batteryBrands: [],
    dynamicBrands: {}
  });

  // For Bulk Add
  const [bulkPrices, setBulkPrices] = useState({});

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

    const getCurrencySymbol = (country) => {
      if (!country) return '$';
      const c = country.toLowerCase();
      if (c === 'india') return '₹';
      if (c === 'australia') return 'A$';
      if (c === 'uk' || c === 'united kingdom') return '£';
      return '$';
    };
    const currencySymbol = getCurrencySymbol(formData.country);

  useEffect(() => {
    const fetchConfigs = async () => {
      if (!formData.country || !formData.projectType) return;
      try {
        const res = await fetch(`${API_BASE}/api/product-configs?country=${formData.country.toLowerCase()}&projectType=${formData.projectType}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const uniqueCategories = [...new Set(data.map(item => item.productCategory))];
          setProductCategories(uniqueCategories);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (showModal) fetchConfigs();
  }, [formData.country, formData.projectType, showModal]);

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
        const res = await fetch(`${API_BASE}/api/project-types?country=${filterCountry.toLowerCase()}`);
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
        const res = await fetch(`${API_BASE}/api/project-types?country=${formData.country.toLowerCase()}`);
        const data = await res.json();
        if (data.success) {
          const list = data.data || [];
          setFormProjectTypesList(list);
          if (list.length > 0 && !formData.projectType) {
             setFormData(prev => ({ ...prev, projectType: list[0].projectType }));
          } else if (list.length > 0 && !list.some(p => p.projectType === formData.projectType)) {
             setFormData(prev => ({ ...prev, projectType: list[0].projectType }));
          }
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
      if (editingId) {
        // Edit Mode
        const url = `${API_BASE}/api/project-pricing/${editingId}`;
        const res = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          setShowModal(false);
          fetchPricing();
        }
      } else {
        // Bulk Add Mode
        const selectedPtObj = formProjectTypesList.find(pt => (pt.projectType || pt.name || pt) === formData.projectType);
        const availableKw = selectedPtObj?.availableKw || [];
        
        const promises = availableKw.map(kw => {
          const priceForKw = bulkPrices[kw] || 0;
          if (!priceForKw) return Promise.resolve({ success: true, skipped: true });
          
          const payload = {
            ...formData,
            kw: kw,
            finalPrice: priceForKw,
            panelBrand: formData.panelBrands[0] || null,
            inverterBrand: formData.inverterBrands[0] || null,
            panelBrands: formData.panelBrands,
            inverterBrands: formData.inverterBrands,
            batteryBrands: formData.batteryBrands,
            dynamicBrands: formData.dynamicBrands
          };
          return fetch(`${API_BASE}/api/project-pricing`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).then(res => res.json());
        });

        await Promise.all(promises);
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
      
      let mappedDynamicBrands = {};
      if (Array.isArray(p.dynamicBrands)) {
          p.dynamicBrands.forEach(db => {
              if (db.category && db.brandIds) {
                  // If brandIds is populated objects, map to _id, else take string
                  mappedDynamicBrands[db.category] = db.brandIds.map(b => b._id || b);
              }
          });
      }

      setFormData({
        country: p.country,
        region: p.region || '',
        district: p.district || '',
        projectType: p.projectType,
        kw: p.kw || "",
        panelBrand: p.panelBrand?._id || '',
        inverterBrand: p.inverterBrand?._id || '',
        finalPrice: p.projectPrice || p.finalPrice,
        pricingResponsibility: p.pricingResponsibility || 'Company',
        allowEpcToSetPrice: p.allowEpcToSetPrice || false,
        isActive: p.isActive,
        panelBrands: p.panelBrands || (p.panelBrand ? [p.panelBrand._id] : []),
        inverterBrands: p.inverterBrands || (p.inverterBrand ? [p.inverterBrand._id] : []),
        batteryBrands: p.batteryBrands || [],
        dynamicBrands: mappedDynamicBrands
      });
      setBulkPrices({});
    } else {
      setEditingId(null);
      setFormData({
        country: filterCountry.toLowerCase(),
        region: filterRegion || '',
        district: filterDistrict || '',
        projectType: filterProjectType || (formProjectTypesList.length > 0 ? formProjectTypesList[0].projectType : 'residential-solar'),
        kw: "",
        panelBrand: '',
        inverterBrand: '',
        finalPrice: 0,
        pricingResponsibility: 'Company',
        allowEpcToSetPrice: false,
        isActive: true,
        panelBrands: [],
        inverterBrands: [],
        batteryBrands: [],
        dynamicBrands: {}
      });
      setBulkPrices({});
    }
    setShowModal(true);
  };

  // derived lists
  const selectedPtObj = formProjectTypesList.find(pt => (pt.projectType || pt.name || pt) === formData.projectType);
  const availableKw = selectedPtObj?.availableKw || [];

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
                    {availableStates?.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                )
              },
              {
                isActive: Boolean(filterDistrict),
                component: (
                  <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} className="w-32 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/40 font-medium bg-white" disabled={!filterRegion}>
                    <option value="">District</option>
                    {availableDistricts?.map(d => <option key={d.district || d} value={d.district || d}>{d.district || d}</option>)}
                  </select>
                )
              },
              {
                isActive: Boolean(filterProjectType),
                component: (
                  <select value={filterProjectType} onChange={e => setFilterProjectType(e.target.value)} className="w-32 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/40 font-medium bg-white">
                    <option value="">Project Type</option>
                    {filterProjectTypesList.map(pt => {
                      const val = typeof pt === 'string' ? pt : pt.name || pt.projectType || pt.type;
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
              <th className="p-4 font-semibold uppercase">KW</th>
              <th className="p-4 font-semibold uppercase">Panel / Inverter</th>
              <th className="p-4 font-semibold uppercase">Price</th>
              <th className="p-4 font-semibold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan="4" className="text-center p-8 text-slate-500">Loading...</td></tr>
            ) : pricing.length === 0 ? (
              <tr><td colSpan="4" className="text-center p-8 text-slate-500">No pricing found.</td></tr>
            ) : (
              pricing.map(p => (
                <tr key={p._id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold">{p.kw} kW</td>
                  <td className="p-4 text-xs text-slate-600">
                    {p.dynamicBrands && p.dynamicBrands.length > 0 ? (
                      p.dynamicBrands.map((db, idx) => {
                        // skip invalid category
                        if (db.category === '0') return null;
                        return (
                          <div key={idx} className={idx === 0 ? "text-slate-800 font-medium" : "text-slate-500"}>
                            {idx > 0 && "+ "}{db.category}: {db.brandIds?.map(b => (b?.name || b)).join(', ')}
                          </div>
                        );
                      })
                    ) : (
                      <>
                        <div>{p.panelBrand?.name || 'N/A'}</div>
                        <div className="text-gray-400">{p.inverterBrand?.name || 'N/A'}</div>
                      </>
                    )}
                  </td>
                  <td className="p-4 font-semibold">{currencySymbol}{p.finalPrice}</td>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Pricing' : 'Add Bulk Pricing'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {!editingId && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Region</label>
                    <input required type="text" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} placeholder="Enter Region..." className="w-full border rounded-lg px-3 py-2 text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">District</label>
                    <input required type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} placeholder="Enter District..." className="w-full border rounded-lg px-3 py-2 text-sm bg-white" />
                  </div>
                </div>
              )}

              {!editingId ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800">Set Prices for Available kW Sizes</h3>
                  {availableKw.length === 0 && <p className="text-sm text-slate-500">No kW sizes available for this project type.</p>}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {availableKw.map(kw => (
                      <div key={kw} className="p-4 border rounded-lg bg-white shadow-sm">
                        <label className="block text-sm font-bold mb-2">{kw} kW Price ({currencySymbol})</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-slate-500">{currencySymbol}</span>
                          <input
                            type="number"
                            value={bulkPrices[kw] || ''}
                            onChange={e => setBulkPrices({...bulkPrices, [kw]: e.target.value})}
                            placeholder="e.g. 5000"
                            className="w-full border rounded-lg pl-8 pr-3 py-2 text-sm"
                            required={formData.pricingResponsibility !== 'EPC' && bulkPrices[kw] !== undefined && bulkPrices[kw] !== ''}
                            disabled={formData.pricingResponsibility === 'EPC'}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">System Size (kW)</label>
                    <input type="number" required value={formData.kw} onChange={e => setFormData({...formData, kw: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Final Price ({currencySymbol})</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-500">{currencySymbol}</span>
                      <input type="number" required={formData.pricingResponsibility !== 'EPC'} value={formData.finalPrice} onChange={e => setFormData({...formData, finalPrice: e.target.value})} disabled={formData.pricingResponsibility === 'EPC'} className="w-full border rounded-lg pl-8 pr-3 py-2 text-sm bg-white" />
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 border rounded-lg bg-slate-50 space-y-4">
                <h3 className="font-semibold text-slate-800">{editingId ? 'Edit Brands Selection' : 'Global Brands Selection'}</h3>
                <div className={`grid grid-cols-${Math.min(productCategories.length || 1, 4)} gap-4`}>
                  {productCategories.map(cat => (
                    <div key={cat}>
                      <label className="block text-sm font-medium mb-1">{cat} Brands</label>
                      <select value={formData.dynamicBrands[cat]?.[0] || ''} onChange={e => {
                        const val = e.target.value;
                        setFormData({...formData, dynamicBrands: {...formData.dynamicBrands, [cat]: val ? [val] : []}});
                      }} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                        <option value="">Select {cat} Brand...</option>
                        {brands.filter(b => b.products?.includes(cat)).map(b => (
                          <option key={b._id} value={b._id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
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
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                  {editingId ? 'Save Pricing' : 'Submit Bulk Pricing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
