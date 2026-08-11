import React, { useState, useEffect } from 'react';
import { Plus, Globe, ChevronRight, Settings, Layout, MapPin, CheckCircle, Save, Trash2, Edit2, Package } from 'lucide-react';
import OrderJourneyScreen from './OrderJourneyScreen';
import ProjectTypeSettings from './ProjectTypeSettings';
import ProductConfigSettings from './ProductConfigSettings';
import DistrictPincodeSettings from './DistrictPincodeSettings';
import OnboardingChecklist from './OnboardingChecklist';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4005';

export default function UnifiedCountrySettings() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [activeTab, setActiveTab] = useState('checklist');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', flagEmoji: '', isActive: true });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/countries`);
      const data = await res.json();
      if (data.success) {
        setCountries(data.data);
      }
    } catch (error) {
      console.error("Error fetching countries", error);
    }
  };

  const handleSaveCountry = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/countries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({ name: '', code: '', flagEmoji: '', isActive: true });
        fetchCountries();
      }
    } catch (error) {
      console.error("Error saving country", error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedCountry) {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedCountry(null)} className="text-slate-500 hover:text-slate-800 font-medium">Countries</button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedCountry.flagEmoji}</span>
              <h1 className="text-xl font-bold text-slate-800">{selectedCountry.name} Settings</h1>
            </div>
          </div>
        </div>

        <div className="flex border-b bg-white px-6">
          <button 
            onClick={() => setActiveTab('checklist')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'checklist' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Onboarding Checklist</span>
          </button>
          <button 
            onClick={() => setActiveTab('orderJourney')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'orderJourney' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <span className="flex items-center gap-2"><Layout className="w-4 h-4" /> Order Journey</span>
          </button>
          <button 
            onClick={() => setActiveTab('projectTypes')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'projectTypes' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <span className="flex items-center gap-2"><Settings className="w-4 h-4" /> Project Type Settings</span>
          </button>
          <button 
            onClick={() => setActiveTab('districts')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'districts' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Districts & Pincodes</span>
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'products' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <span className="flex items-center gap-2"><Package className="w-4 h-4" /> Products</span>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'checklist' && <OnboardingChecklist selectedCountry={selectedCountry.code} />}
          {activeTab === 'orderJourney' && <OrderJourneyScreen selectedCountry={selectedCountry.code} readOnly={true} />}
          {activeTab === 'projectTypes' && <ProjectTypeSettings selectedCountry={selectedCountry.code} readOnly={true} />}
          {activeTab === 'products' && <ProductConfigSettings selectedCountry={selectedCountry.code} readOnly={true} />}
          {activeTab === 'districts' && <DistrictPincodeSettings selectedCountry={selectedCountry.code} />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Country Management</h1>
          <p className="text-slate-500 text-sm">Master source for all countries active on the platform</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary/90 shadow-sm transition-all">
          <Plus className="w-4 h-4" /> Add Country
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {countries.map(country => (
          <div key={country._id} onClick={() => setSelectedCountry(country)} className="bg-white p-5 rounded-2xl border hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-4xl">{country.flagEmoji || <Globe className="w-10 h-10 text-slate-300" />}</span>
              <span className={`px-2 py-1 rounded text-xs font-bold ${country.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {country.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors">{country.name}</h3>
            <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider">Code: {country.code}</p>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add New Country</h2>
            <form onSubmit={handleSaveCountry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Country Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Australia" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country Code *</label>
                <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toLowerCase()})} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. australia" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Flag Emoji</label>
                <input type="text" value={formData.flagEmoji} onChange={e => setFormData({...formData, flagEmoji: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. 🇦🇺" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                <label htmlFor="isActive" className="text-sm font-medium">Country is Active</label>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/90">
                  <Save className="w-4 h-4" /> Save Country
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
