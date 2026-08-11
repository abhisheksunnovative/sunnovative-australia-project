import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ArrowLeft, CheckCircle, Shield, Settings, Info } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4005';

const BrandAndPricing = () => {
    // 1. Data States
    const [projectTypes, setProjectTypes] = useState([]);
    const [systemSettings, setSystemSettings] = useState({});
    
    // 2. UI States
    const [selectedPt, setSelectedPt] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // 3. Form & Table States
    const [brands, setBrands] = useState([]);
    const [epcPrices, setEpcPrices] = useState([]);
    const [companyPrices, setCompanyPrices] = useState([]);
    
    const [formData, setFormData] = useState({
        kw: '',
        solarPanel: '',
        inverter: '',
        epcSubmittedPrice: ''
    });
    const [editingId, setEditingId] = useState(null);

    // Assume epcId and country are available in localStorage
    const epcId = localStorage.getItem('epcId') || 'test-epc-id';
    const country = localStorage.getItem('country') || 'australia';

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            // Fetch Project Types
            const ptRes = await fetch(`${API_BASE}/api/order-journey/project-types?country=${country}`);
            const ptData = await ptRes.json();
            if (ptData.projectTypes) {
                setProjectTypes(ptData.projectTypes);
            } else if (ptData.success && ptData.data) {
                setProjectTypes(ptData.data);
            }

            // Fetch System Settings
            const setRes = await fetch(`${API_BASE}/api/pricing-system-settings`);
            const setData = await setRes.json();
            if (setData.success) {
                const map = {};
                setData.data.forEach(s => {
                    if (s.country.toLowerCase() === country.toLowerCase()) {
                        map[s.projectType] = s.system;
                    }
                });
                setSystemSettings(map);
            }

            // Fetch Brands
            const bRes = await fetch(`${API_BASE}/api/brands?country=${country}&isActive=true`);
            const bData = await bRes.json();
            setBrands(bData.data || []);
            
        } catch (error) {
            console.error('Error fetching initial data:', error);
            toast.error('Failed to load initial data');
        }
    };

    const fetchPricesForPt = async (pt) => {
        setLoading(true);
        try {
            const sys = systemSettings[pt] || 'company';
            if (sys === 'epc') {
                const res = await fetch(`${API_BASE}/api/project-pricing?epcId=${epcId}&projectType=${pt}`);
                const data = await res.json();
                setEpcPrices(data.data || []);
            } else {
                const res = await fetch(`${API_BASE}/api/project-pricing?pricingResponsibility=Company&country=${country}&projectType=${pt}`);
                const data = await res.json();
                setCompanyPrices(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching prices:', error);
            toast.error('Failed to load prices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedPt) {
            fetchPricesForPt(selectedPt);
        }
    }, [selectedPt]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                projectType: selectedPt,
                epcId,
                pricingResponsibility: 'EPC',
                price: formData.epcSubmittedPrice, // Backwards compatibility
            };

            const method = editingId ? 'PUT' : 'POST';
            const url = editingId 
                ? `${API_BASE}/api/project-pricing/${editingId}`
                : `${API_BASE}/api/project-pricing`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (data.success) {
                toast.success(`Pricing ${editingId ? 'updated' : 'added'} successfully`);
                setFormData({
                    kw: '',
                    solarPanel: '',
                    inverter: '',
                    epcSubmittedPrice: ''
                });
                setEditingId(null);
                fetchPricesForPt(selectedPt);
            } else {
                toast.error(data.message || 'Error saving price');
            }
        } catch (error) {
            console.error('Error saving pricing:', error);
            toast.error('Failed to save pricing');
        }
    };

    const handleEdit = (price) => {
        setFormData({
            kw: price.systemSizeKW || price.kw,
            solarPanel: price.panelBrand?.name || price.solarPanel,
            inverter: price.inverterBrand?.name || price.inverter,
            epcSubmittedPrice: price.epcSubmittedPrice || price.price || price.finalPrice
        });
        setEditingId(price._id || price.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this pricing?')) return;
        try {
            const res = await fetch(`${API_BASE}/api/project-pricing/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Pricing deleted successfully');
                fetchPricesForPt(selectedPt);
            }
        } catch (error) {
            console.error('Error deleting pricing:', error);
            toast.error('Failed to delete pricing');
        }
    };

    // Render Logic
    if (!selectedPt) {
        return (
            <div className="p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Brand & Pricing Management</h2>
                    <p className="text-gray-500 text-sm mt-1">Select a project type to view or manage your rates.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projectTypes.map(pt => {
                        const ptName = typeof pt === 'string' ? pt : pt.projectType || pt.name || pt.type;
                        const isEpc = systemSettings[ptName] === 'epc';
                        
                        return (
                            <div 
                                key={ptName} 
                                onClick={() => setSelectedPt(ptName)}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors capitalize">{ptName}</h3>
                                    {isEpc ? (
                                        <Settings className="w-5 h-5 text-orange-500" />
                                    ) : (
                                        <Shield className="w-5 h-5 text-blue-500" />
                                    )}
                                </div>
                                
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    isEpc ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                    {isEpc ? 'You Set Pricing' : 'Company Fixed Pricing'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    const currentSystem = systemSettings[selectedPt] || 'company';
    const isEpcSystem = currentSystem === 'epc';

    return (
        <div className="p-6">
            <button 
                onClick={() => setSelectedPt(null)}
                className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Project Types
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 capitalize">{selectedPt} Pricing</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {isEpcSystem ? 'Submit your installation rates for admin approval.' : 'Pricing is fixed by the platform for this project type.'}
                        </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                        isEpcSystem ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                        {isEpcSystem ? 'EPC Self-Priced' : 'Company Fixed'}
                    </span>
                </div>

                {isEpcSystem ? (
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="mb-8 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">kW</label>
                                    <input
                                        type="number"
                                        name="kw"
                                        value={formData.kw}
                                        onChange={handleInputChange}
                                        required
                                        step="0.1"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border"
                                        placeholder="e.g. 6.6"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Solar Panel Brand</label>
                                    <select
                                        name="solarPanel"
                                        value={formData.solarPanel}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border"
                                    >
                                        <option value="">Select a brand</option>
                                        {brands.map((brand, idx) => (
                                            <option key={brand._id || brand.id || `brand-${idx}`} value={brand.name}>
                                                {brand.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Inverter Brand</label>
                                    <select
                                        name="inverter"
                                        value={formData.inverter}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border"
                                    >
                                        <option value="">Select a brand</option>
                                        {brands.map((brand, idx) => (
                                            <option key={brand._id || brand.id || `inv-${idx}`} value={brand.name}>
                                                {brand.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Your Final Price ($)</label>
                                    <input
                                        type="number"
                                        name="epcSubmittedPrice"
                                        value={formData.epcSubmittedPrice}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border"
                                        placeholder="e.g. 5000"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingId(null);
                                            setFormData({ kw: '', solarPanel: '', inverter: '', epcSubmittedPrice: '' });
                                        }}
                                        className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
                                >
                                    {editingId ? 'Update Rate' : 'Submit Rate for Approval'}
                                </button>
                            </div>
                        </form>

                        {/* EPC Submitted Rates Table */}
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Your Submitted Rates</h3>
                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">kW</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {loading ? (
                                            <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading your rates...</td></tr>
                                        ) : epcPrices.length === 0 ? (
                                            <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No rates submitted yet. Add one above.</td></tr>
                                        ) : epcPrices.map((price) => (
                                            <tr key={price._id || price.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{price.panelBrand?.name || price.solarPanel}</div>
                                                    <div className="text-sm text-gray-500">+ {price.inverterBrand?.name || price.inverter}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{price.systemSizeKW || price.kw} kW</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${price.epcSubmittedPrice || price.finalPrice || price.price}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {price.isApproved ? (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            Approved
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                            Pending Approval
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => handleEdit(price)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                                    <button onClick={() => handleDelete(price._id || price.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Company Fixed View (Read-Only)
                    <div className="p-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 mb-6">
                            <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            <p className="text-sm text-blue-800">
                                Rates for this project type are centrally managed by the company. You do not need to submit custom rates.
                                The approved company rates are displayed below for your reference.
                            </p>
                        </div>
                        
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System components</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">kW</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Fixed Price</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500">Loading company rates...</td></tr>
                                    ) : companyPrices.length === 0 ? (
                                        <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500">No company rates have been published for this project type yet.</td></tr>
                                    ) : companyPrices.map((price) => (
                                        <tr key={price._id || price.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{price.panelBrand?.name || price.solarPanel}</div>
                                                <div className="text-sm text-gray-500">+ {price.inverterBrand?.name || price.inverter}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{price.systemSizeKW || price.kw} kW</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">${price.finalPrice || price.price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrandAndPricing;
