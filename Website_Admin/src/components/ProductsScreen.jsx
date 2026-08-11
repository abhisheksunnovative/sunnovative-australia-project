import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, X, Edit, Trash2, Globe, Home, Package, Zap } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4005';

const ProductsScreen = () => {
  const [level, setLevel] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedProjectType, setSelectedProjectType] = useState(null);

  const [countries, setCountries] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({ productCategory: 'Solar Panel', techSpec: '', capacity: '', allowedKw: [] });
  const [editingProductId, setEditingProductId] = useState(null);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/countries`);
      const data = await res.json();
      if (data.success && data.data) {
        setCountries(data.data);
      } else if (Array.isArray(data)) {
        setCountries(data);
      } else {
        setCountries([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectTypes = async (countryCode) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/project-types?country=${countryCode}`);
      const data = await res.json();
      if (data.success && data.data) {
        setProjectTypes(data.data);
      } else if (Array.isArray(data)) {
        setProjectTypes(data);
      } else {
        setProjectTypes([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (countryCode, projectTypeKey) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/product-configs?country=${countryCode}&projectType=${projectTypeKey}`);
      const data = await res.json();
      if (data.success && data.data) {
        setProducts(data.data);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setLevel(2);
    fetchProjectTypes(country.code);
  };

  const handleProjectTypeSelect = (pt) => {
    setSelectedProjectType(pt);
    setLevel(3);
    fetchProducts(selectedCountry.code, pt.projectType);
  };

  const resetToLevel = (targetLevel) => {
    setLevel(targetLevel);
    if (targetLevel === 1) {
      setSelectedCountry(null);
      setSelectedProjectType(null);
    } else if (targetLevel === 2) {
      setSelectedProjectType(null);
    }
  };

  const handleOpenProductModal = (prod = null) => {
    if (prod) {
      setEditingProductId(prod._id);
      setProductForm({
        productCategory: prod.productCategory,
        techSpec: prod.techSpec || '',
        capacity: prod.capacity || '',
        allowedKw: prod.allowedKw || []
      });
    } else {
      setEditingProductId(null);
      setProductForm({ productCategory: 'Solar Panel', techSpec: '', capacity: '', allowedKw: [] });
    }
    setIsProductModalOpen(true);
  };

  const handleToggleKw = (kw) => {
    setProductForm(prev => {
      const exists = prev.allowedKw.includes(kw);
      if (exists) {
        return { ...prev, allowedKw: prev.allowedKw.filter(k => k !== kw) };
      } else {
        return { ...prev, allowedKw: [...prev.allowedKw, kw] };
      }
    });
  };

  const handleSaveProduct = async () => {
    if (!productForm.productCategory) {
      alert('Category is required');
      return;
    }
    try {
      const payload = {
        country: selectedCountry.code,
        projectType: selectedProjectType.projectType,
        productCategory: productForm.productCategory,
        techSpec: productForm.techSpec,
        capacity: productForm.capacity,
        allowedKw: productForm.allowedKw,
        isActive: true
      };

      const method = editingProductId ? 'PUT' : 'POST';
      const url = editingProductId ? `${API_BASE}/api/product-configs/${editingProductId}` : `${API_BASE}/api/product-configs`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to save product');
      
      setIsProductModalOpen(false);
      fetchProducts(selectedCountry.code, selectedProjectType.projectType);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/product-configs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product');
      fetchProducts(selectedCountry.code, selectedProjectType.projectType);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 mb-8 text-sm font-semibold text-slate-500">
        <button onClick={() => resetToLevel(1)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${level === 1 ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-200'}`}> 
          <Globe className="w-4 h-4" /> Countries
        </button>
        
        {level > 1 && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <button onClick={() => resetToLevel(2)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${level === 2 ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-200'}`}> 
              <Home className="w-4 h-4" /> {selectedCountry?.name}
            </button>
          </>
        )}

        {level > 2 && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 transition-colors"> 
              <Zap className="w-4 h-4" /> {selectedProjectType?.projectTypeLabel} Products
            </button>
          </>
        )}
      </div>

      {loading && <div className="text-indigo-600 font-bold mb-4 animate-pulse">Loading data...</div>}
      {error && <div className="text-red-500 font-bold mb-4 bg-red-50 p-3 rounded-lg">{error}</div>}

      {/* Level 1: Countries */}
      {level === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Select Market</h2>
            <p className="text-slate-500 text-sm mt-1">Choose a country to configure its products.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {countries.map(c => (
              <button 
                key={c.code}
                onClick={() => handleCountrySelect(c)}
                className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{c.flagEmoji}</div>
                <h3 className="text-lg font-bold text-slate-800">{c.name}</h3>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">{c.code}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Level 2: Project Types */}
      {level === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Select Project Type</h2>
            <p className="text-slate-500 text-sm mt-1">Configuring products for {selectedCountry?.name}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {projectTypes.map(pt => (
              <button 
                key={pt._id}
                onClick={() => handleProjectTypeSelect(pt)}
                className="flex flex-col items-start justify-center p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  <Home className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{pt.projectTypeLabel}</h3>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">{pt.projectType}</p>
              </button>
            ))}
            {projectTypes.length === 0 && !loading && (
              <div className="col-span-full p-8 text-center border-2 border-dashed border-slate-300 rounded-2xl text-slate-500">
                No project types found for this country.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Level 3: Products */}
      {level === 3 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <Package className="w-6 h-6 text-indigo-600" />
                Products for {selectedProjectType?.projectTypeLabel}
              </h2>
              <p className="text-slate-500 text-sm mt-1">Configure technologies, capacities, and allowed system sizes.</p>
            </div>
            <button 
              onClick={() => handleOpenProductModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" /> Add Product
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(prod => (
              <div key={prod._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                  <div>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded-full">
                      {prod.productCategory}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 mt-2">{prod.techSpec || "No Tech Spec"}</h3>
                    <p className="text-sm text-slate-500 font-medium">Capacity: {prod.capacity || "N/A"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenProductModal(prod)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteProduct(prod._id)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-5 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Allowed System Sizes (kW)</p>
                  <div className="flex flex-wrap gap-2">
                    {prod.allowedKw && prod.allowedKw.length > 0 ? (
                      prod.allowedKw.map(kw => (
                        <span key={kw} className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-lg shadow-sm">
                          {kw} kW
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No sizes selected</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && !loading && (
              <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-300 rounded-2xl">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700">No Products Configured</h3>
                <p className="text-slate-500">Click "Add Product" to create one.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                {editingProductId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={productForm.productCategory}
                  onChange={(e) => setProductForm({...productForm, productCategory: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                >
                  <option value="Solar Panel">Solar Panel</option>
                  <option value="Inverter">Inverter</option>
                  <option value="Battery">Battery</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Technology / Specs</label>
                <input
                  type="text"
                  value={productForm.techSpec}
                  onChange={(e) => setProductForm({...productForm, techSpec: e.target.value})}
                  placeholder="e.g. Monocrystalline PERC"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Capacity</label>
                <input
                  type="text"
                  value={productForm.capacity}
                  onChange={(e) => setProductForm({...productForm, capacity: e.target.value})}
                  placeholder="e.g. 500W"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder-slate-400"
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Select Allowed System Sizes (kW)</label>
                <p className="text-xs text-slate-500 mb-3">These are the kW sizes defined in the Projects tab. Select which ones this product can be used for.</p>
                <div className="flex flex-wrap gap-3">
                  {selectedProjectType?.availableKw?.length > 0 ? (
                    selectedProjectType.availableKw.map(kw => {
                      const isSelected = productForm.allowedKw.includes(kw);
                      return (
                        <button
                          key={kw}
                          onClick={() => handleToggleKw(kw)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                            isSelected 
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' 
                              : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50'
                          }`}
                        >
                          {kw} kW
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-sm text-red-500 font-semibold">No kW sizes defined for this Project Type yet. Configure them in the Country Settings -&gt; Project Types tab first.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProduct}
                className="px-6 py-2.5 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-colors shadow-md shadow-indigo-600/20"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsScreen;
