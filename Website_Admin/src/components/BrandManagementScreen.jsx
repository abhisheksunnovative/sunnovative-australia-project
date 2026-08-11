import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, X, Edit, Trash2, Globe, Home, Settings, Zap } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

const BrandManagementScreen = () => {
  // Navigation State
  const [level, setLevel] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedProjectType, setSelectedProjectType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Data State
  const [countries, setCountries] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [brandForm, setBrandForm] = useState({ name: '', logoUrl: '', isActive: true });
  const [editingBrandId, setEditingBrandId] = useState(null);

  // --- Fetching Logic ---
  
  const fetchCountries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/countries`);
      if (!res.ok) throw new Error('Failed to fetch countries');
      const data = await res.json();
      setCountries(data);
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
      if (!res.ok) throw new Error('Failed to fetch project types');
      const data = await res.json();
      setProjectTypes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductCategories = async (countryCode, projectType) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/product-configs?country=${countryCode}&projectType=${projectType}`);
      if (!res.ok) throw new Error('Failed to fetch product configs');
      const data = await res.json();
      
      // Extract unique categories
      const categories = [...new Set(data.map(item => item.productCategory))].filter(Boolean);
      setProductCategories(categories);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async (countryCode, projectType, category) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/brands?country=${countryCode}&projectTypes=${projectType}&products=${category}`);
      if (!res.ok) throw new Error('Failed to fetch brands');
      const data = await res.json();
      setBrands(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Initial Load ---
  useEffect(() => {
    fetchCountries();
  }, []);

  // --- Handlers ---
  
  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setLevel(2);
    fetchProjectTypes(country.code);
  };

  const handleProjectTypeSelect = (pt) => {
    setSelectedProjectType(pt);
    setLevel(3);
    fetchProductCategories(selectedCountry.code, pt.projectType);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setLevel(4);
    fetchBrands(selectedCountry.code, selectedProjectType.projectType, cat);
  };

  const handleBreadcrumbClick = (targetLevel) => {
    setLevel(targetLevel);
    if (targetLevel === 1) {
      setSelectedCountry(null);
      setSelectedProjectType(null);
      setSelectedCategory(null);
    } else if (targetLevel === 2) {
      setSelectedProjectType(null);
      setSelectedCategory(null);
    } else if (targetLevel === 3) {
      setSelectedCategory(null);
    }
  };

  const openAddModal = () => {
    setBrandForm({ name: '', logoUrl: '', isActive: true });
    setEditingBrandId(null);
    setIsBrandModalOpen(true);
  };

  const handleBrandSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...brandForm,
        country: [selectedCountry.code],
        projectTypes: [selectedProjectType.projectType],
        products: [selectedCategory]
      };

      const method = editingBrandId ? 'PUT' : 'POST';
      const url = editingBrandId ? `${API_BASE}/api/brands/${editingBrandId}` : `${API_BASE}/api/brands`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save brand');
      
      setIsBrandModalOpen(false);
      fetchBrands(selectedCountry.code, selectedProjectType.projectType, selectedCategory);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteBrand = async (id) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/brands/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete brand');
      fetchBrands(selectedCountry.code, selectedProjectType.projectType, selectedCategory);
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Render Helpers ---

  const renderBreadcrumbs = () => {
    return (
      <div className="flex items-center text-sm text-slate-500 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-sm">
        <button 
          onClick={() => handleBreadcrumbClick(1)}
          className={`hover:text-[#28377f] transition-colors flex items-center ${level === 1 ? 'font-semibold text-slate-800' : ''}`}
        >
          Countries
        </button>
        
        {selectedCountry && (
          <>
            <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
            <button 
              onClick={() => handleBreadcrumbClick(2)}
              className={`hover:text-[#28377f] transition-colors ${level === 2 ? 'font-semibold text-slate-800' : ''}`}
            >
              {selectedCountry.name}
            </button>
          </>
        )}
        
        {selectedProjectType && (
          <>
            <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
            <button 
              onClick={() => handleBreadcrumbClick(3)}
              className={`hover:text-[#28377f] transition-colors ${level === 3 ? 'font-semibold text-slate-800' : ''}`}
            >
              {selectedProjectType.name || selectedProjectType.projectType}
            </button>
          </>
        )}

        {selectedCategory && (
          <>
            <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
            <span className={`transition-colors ${level === 4 ? 'font-semibold text-slate-800' : ''}`}>
              {selectedCategory}
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-50">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Brand Management</h1>
        {level === 4 && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Brand
          </button>
        )}
      </div>
      <p className="text-slate-500 mb-6">Manage brands across regions, project types, and products.</p>

      {renderBreadcrumbs()}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center shadow-sm border border-red-100">
          <X className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#28377f]"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* LEVEL 1: Countries */}
          {level === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {countries.map(country => (
                <div 
                  key={country._id || country.code}
                  onClick={() => handleCountrySelect(country)}
                  className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-[#28377f] hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl group-hover:bg-[#28377f]/10 transition-colors">
                      {country.flag || <Globe className="w-6 h-6 text-slate-500 group-hover:text-[#28377f]" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{country.name}</h3>
                      <p className="text-sm text-slate-500">{country.code}</p>
                    </div>
                  </div>
                </div>
              ))}
              {countries.length === 0 && !loading && (
                 <p className="text-slate-500 italic col-span-3">No countries found.</p>
              )}
            </div>
          )}

          {/* LEVEL 2: Project Types */}
          {level === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projectTypes.map(pt => (
                <div 
                  key={pt._id || pt.projectType}
                  onClick={() => handleProjectTypeSelect(pt)}
                  className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-[#28377f] hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-[#28377f]/10 transition-colors">
                      <Home className="w-6 h-6 text-slate-500 group-hover:text-[#28377f]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{pt.name || pt.projectType}</h3>
                      {pt.description && <p className="text-sm text-slate-500 truncate max-w-[200px]">{pt.description}</p>}
                    </div>
                  </div>
                </div>
              ))}
               {projectTypes.length === 0 && !loading && (
                 <p className="text-slate-500 italic col-span-3">No project types found for this country.</p>
              )}
            </div>
          )}

          {/* LEVEL 3: Product Categories */}
          {level === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {productCategories.map(cat => (
                <div 
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-[#28377f] hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-[#28377f]/10 transition-colors">
                      <Settings className="w-6 h-6 text-slate-500 group-hover:text-[#28377f]" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{cat}</h3>
                  </div>
                </div>
              ))}
               {productCategories.length === 0 && !loading && (
                 <p className="text-slate-500 italic col-span-3">No product categories found.</p>
              )}
            </div>
          )}

          {/* LEVEL 4: Brands */}
          {level === 4 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {brands.map(brand => (
                <div key={brand._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  <div className="h-32 bg-slate-50 flex items-center justify-center border-b border-slate-100 p-4">
                    {brand.logoUrl ? (
                      <img src={brand.logoUrl} alt={brand.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                    ) : (
                      <Zap className="w-12 h-12 text-slate-300" />
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{brand.name}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`w-2 h-2 rounded-full ${brand.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-sm text-slate-500">{brand.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    
                    <div className="mt-auto flex justify-end gap-2 border-t border-slate-100 pt-3">
                      <button 
                        onClick={() => {
                          setBrandForm({ name: brand.name, logoUrl: brand.logoUrl || '', isActive: brand.isActive });
                          setEditingBrandId(brand._id);
                          setIsBrandModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-[#28377f] hover:bg-slate-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteBrand(brand._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
               {brands.length === 0 && !loading && (
                 <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500 mb-4">No brands found for this category.</p>
                    <button
                      onClick={openAddModal}
                      className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Brand
                    </button>
                 </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* BRAND MODAL */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {editingBrandId ? 'Edit Brand' : 'Add Brand'}
              </h2>
              <button 
                onClick={() => setIsBrandModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleBrandSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={brandForm.name}
                  onChange={(e) => setBrandForm({...brandForm, name: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#28377f] focus:border-[#28377f] outline-none"
                  placeholder="e.g. Tesla, Jinko"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
                <input
                  type="url"
                  value={brandForm.logoUrl}
                  onChange={(e) => setBrandForm({...brandForm, logoUrl: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#28377f] focus:border-[#28377f] outline-none"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={brandForm.isActive}
                  onChange={(e) => setBrandForm({...brandForm, isActive: e.target.checked})}
                  className="w-4 h-4 text-[#28377f] rounded focus:ring-[#28377f]"
                />
                <label htmlFor="isActive" className="text-sm text-slate-700">Active (visible to users)</label>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg mt-4 text-xs text-slate-500 border border-slate-100">
                <p>This brand will be attached to:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Country: <strong>{selectedCountry?.code}</strong></li>
                  <li>Project Type: <strong>{selectedProjectType?.projectType}</strong></li>
                  <li>Product: <strong>{selectedCategory}</strong></li>
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#28377f] hover:bg-[#1e295e] text-white rounded-lg font-medium transition-colors"
                >
                  {editingBrandId ? 'Save Changes' : 'Add Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandManagementScreen;
