import React, { useState, useEffect } from 'react';
import { ChevronRight, Globe, Home, Package, Zap } from 'lucide-react';
import ProjectTypeSettings from './ProjectTypeSettings';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4005';

const ProjectsScreen = () => {
  const [level, setLevel] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setLevel(2);
  };

  const resetToLevel = (targetLevel) => {
    setLevel(targetLevel);
    if (targetLevel === 1) {
      setSelectedCountry(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
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
      </div>

      {loading && <div className="text-indigo-600 font-bold mb-4 animate-pulse">Loading data...</div>}
      {error && <div className="text-red-500 font-bold mb-4 bg-red-50 p-3 rounded-lg">{error}</div>}

      {level === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Select Market</h2>
            <p className="text-slate-500 text-sm mt-1">Choose a country to configure its project types.</p>
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

      {level === 2 && selectedCountry && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <ProjectTypeSettings selectedCountry={selectedCountry.code} />
        </div>
      )}
    </div>
  );
};

export default ProjectsScreen;
