import React, { useState, useEffect } from 'react';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4005';

const ProductConfigSettings = ({ selectedCountry, readOnly = false }) => {
  const [projectTypes, setProjectTypes] = useState([]);
  const [selectedProjectType, setSelectedProjectType] = useState('');
  const [productConfigs, setProductConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [productCategory, setProductCategory] = useState('Solar Panel');
  const [techSpec, setTechSpec] = useState('');
  const [capacity, setCapacity] = useState('');

  // Fetch Project Types when country changes
  useEffect(() => {
    if (selectedCountry) {
      fetchProjectTypes();
    } else {
      setProjectTypes([]);
      setSelectedProjectType('');
    }
  }, [selectedCountry]);

  // Fetch Product Configs when projectType or country changes
  useEffect(() => {
    if (selectedCountry && selectedProjectType) {
      fetchProductConfigs();
    } else {
      setProductConfigs([]);
    }
  }, [selectedCountry, selectedProjectType]);

  const fetchProjectTypes = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/project-types?country=${selectedCountry}`);
      if (!response.ok) throw new Error('Failed to fetch project types');
      const data = await response.json();
      if (data.success && data.data) {
        setProjectTypes(data.data);
      } else if (Array.isArray(data)) {
        setProjectTypes(data);
      } else {
        setProjectTypes([]);
      }
    } catch (err) {
      console.error(err);
      setError('Error loading project types.');
    }
  };

  const fetchProductConfigs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/product-configs?country=${selectedCountry}&projectType=${selectedProjectType}`);
      if (!response.ok) throw new Error('Failed to fetch product configs');
      const data = await response.json();
      if (data.success && data.data) {
        setProductConfigs(data.data);
      } else if (Array.isArray(data)) {
        setProductConfigs(data);
      } else {
        setProductConfigs([]);
      }
    } catch (err) {
      console.error(err);
      setError('Error loading product configs.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!selectedCountry || !selectedProjectType) {
      alert("Please select a country and project type first.");
      return;
    }

    try {
      const payload = {
        country: selectedCountry,
        projectType: selectedProjectType,
        productCategory,
        techSpec,
        capacity,
        isActive: true
      };
      
      const response = await fetch(`${backendUrl}/api/product-configs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error('Failed to create product config');
      
      // Clear form
      setTechSpec('');
      setCapacity('');
      
      // Refresh list
      fetchProductConfigs();
    } catch (err) {
      console.error(err);
      alert('Error adding product.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`${backendUrl}/api/product-configs/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete product config');
      fetchProductConfigs();
    } catch (err) {
      console.error(err);
      alert('Error deleting product.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
      <h2 className="text-xl font-semibold text-[#28377f] mb-4">Product Configurations</h2>
      
      {!selectedCountry ? (
        <p className="text-slate-500">Please select a country from the top settings bar to configure products.</p>
      ) : (
        <>
          <div className="mb-6">
  <label className="block text-sm font-medium text-slate-700 mb-3">Select Project Type</label>
  <div className="flex flex-wrap gap-3">
    {projectTypes.map(pt => {
      const ptValue = pt.key || pt.projectType;
      const isSelected = selectedProjectType === ptValue;
      return (
        <button
          key={pt._id || ptValue}
          onClick={() => setSelectedProjectType(ptValue)}
          className={`px-4 py-3 border rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center min-w-[140px] ${isSelected ? 'bg-[#28377f] text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
        >
          {pt.label || pt.projectTypeLabel || pt.projectType}
        </button>
      );
    })}
    {projectTypes.length === 0 && (
      <div className="text-slate-500 text-sm italic">No project types found for this country.</div>
    )}
  </div>
</div>

          {selectedProjectType && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Form Section */}
              {!readOnly && (
              <div className="md:col-span-1 bg-slate-50 p-4 rounded border border-slate-200 h-fit">
                <h3 className="text-lg font-medium text-slate-800 mb-3">Add New Product</h3>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select 
                      className="w-full p-2 border border-slate-300 rounded focus:ring-[#f97316] focus:border-[#f97316]"
                      value={productCategory}
                      onChange={(e) => setProductCategory(e.target.value)}
                      required
                    >
                      <option value="Solar Panel">Solar Panel</option>
                      <option value="Inverter">Inverter</option>
                      <option value="Battery">Battery</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tech Spec</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-slate-300 rounded focus:ring-[#f97316] focus:border-[#f97316]"
                      placeholder="e.g. Monocrystalline"
                      value={techSpec}
                      onChange={(e) => setTechSpec(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-slate-300 rounded focus:ring-[#f97316] focus:border-[#f97316]"
                      placeholder="e.g. 500W"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-[#f97316] hover:bg-orange-600 text-white font-medium py-2 px-4 rounded transition-colors"
                  >
                    Add Product
                  </button>
                </form>
              </div>
              )}

              {/* List Section */}
              <div className={readOnly ? "md:col-span-3" : "md:col-span-2"}>
                <h3 className="text-lg font-medium text-slate-800 mb-3">Configured Products</h3>
                {loading ? (
                  <p className="text-slate-500">Loading products...</p>
                ) : productConfigs.length === 0 ? (
                  <p className="text-slate-500 p-4 border border-dashed border-slate-300 rounded text-center">
                    No products configured for this project type.
                  </p>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200">
                          <th className="p-3 text-sm font-semibold text-slate-700">Category</th>
                          <th className="p-3 text-sm font-semibold text-slate-700">Tech Spec</th>
                          <th className="p-3 text-sm font-semibold text-slate-700">Capacity</th>
                          <th className="p-3 text-sm font-semibold text-slate-700 w-20 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productConfigs.map((config) => (
                          <tr key={config._id} className="border-b border-slate-200 hover:bg-slate-50">
                            <td className="p-3 text-sm text-slate-800">{config.productCategory}</td>
                            <td className="p-3 text-sm text-slate-600">{config.techSpec || '-'}</td>
                            <td className="p-3 text-sm text-slate-600">{config.capacity || '-'}</td>
                            <td className="p-3 text-center">
                              {!readOnly && (
                              <button 
                                onClick={() => handleDeleteProduct(config._id)}
                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                              >
                                Delete
                              </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductConfigSettings;
