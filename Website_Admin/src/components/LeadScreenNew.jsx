import React, { useState, useEffect } from 'react';
import LeadScreen from './LeadScreen';
import { useGeography } from '../hooks/useGeography';
import { useAdminSettings } from '../hooks/useAdminSettings';

export default function LeadScreenNew({ uploadSource = 'website' }) {
  const [countries, setCountries] = useState([]);
  const [hierarchy, setHierarchy] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(null);
  
  const { projectTypes } = useAdminSettings(selectedCountry ? selectedCountry.code : null);
  const [selectedProjectType, setSelectedProjectType] = useState(null);

  const { states } = useGeography(selectedCountry ? selectedCountry.code : null, null);
  const [selectedState, setSelectedState] = useState(null);

  const { districts: dbDistricts } = useGeography(selectedCountry ? selectedCountry.code : null, selectedState);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  
  // Merge official districts with actual districts from leads to show dirty data too
  const [districts, setDistricts] = useState([]);
  useEffect(() => {
    if (!selectedState || !hierarchy || !selectedCountry) {
      setDistricts(dbDistricts || []);
      return;
    }
    const cStr = (selectedCountry.code || '').toUpperCase();
    const sNameLower = (selectedState || '').toLowerCase().trim();
    const distMap = new Map();
    (dbDistricts || []).forEach(d => distMap.set(d.toUpperCase(), d));
    
    if (hierarchy[cStr]) {
      Object.keys(hierarchy[cStr]).forEach(pType => {
        if (selectedProjectType && pType !== selectedProjectType) return;
        Object.keys(hierarchy[cStr][pType] || {}).forEach(dKey => {
          const leads = hierarchy[cStr][pType][dKey];
          if (leads && leads.length > 0 && (leads[0].state || '').toLowerCase().trim() === sNameLower) {
             const keyUpper = dKey.toUpperCase();
             if (!distMap.has(keyUpper)) {
                 distMap.set(keyUpper, dKey.toUpperCase());
             }
          }
        });
      });
    }
    setDistricts(Array.from(distMap.values()));
  }, [dbDistricts, selectedState, hierarchy, selectedCountry, selectedProjectType]);
  
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4005';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, hRes] = await Promise.all([
          fetch(API_BASE + '/api/countries').then(r => r.json()),
          fetch(API_BASE + '/api/leads/hierarchy').then(r => r.json())
        ]);
        
        if (cRes.success) setCountries(cRes.data.filter(c => c.isActive));
        else if (Array.isArray(cRes)) setCountries(cRes.filter(c => c.isActive));
        
        if (hRes.success) setHierarchy(hRes.hierarchy);
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCount = (cCode, pType, sName, dName) => {
    const cStr = (cCode || '').toUpperCase();
    if (!hierarchy[cStr]) return 0;
    
    const safeStr = (s) => (s || '').toString().toLowerCase().trim();
    const safeSName = safeStr(sName);
    const safeDName = safeStr(dName);

    const countStateLeads = (leadsArray, stateStr) => {
        if (!stateStr) return leadsArray.length;
        return leadsArray.filter(l => safeStr(l.state) === stateStr).length;
    };

    let total = 0;

    if (dName) {
      Object.keys(hierarchy[cStr]).forEach(p => {
        if (pType && p !== pType) return;
        const pObj = hierarchy[cStr][p] || {};
        Object.keys(pObj).forEach(dKey => {
          if (safeStr(dKey) === safeDName) {
            total += countStateLeads(pObj[dKey], safeSName);
          }
        });
      });
      return total;
    }
    
    if (sName) {
      Object.keys(hierarchy[cStr]).forEach(p => {
        if (pType && p !== pType) return;
        const pObj = hierarchy[cStr][p] || {};
        Object.keys(pObj).forEach(dKey => {
          total += countStateLeads(pObj[dKey], safeSName);
        });
      });
      return total;
    }
    
    if (pType) {
      if(hierarchy[cStr][pType]) {
        Object.keys(hierarchy[cStr][pType]).forEach(dKey => {
          total += hierarchy[cStr][pType][dKey].length;
        });
      }
      return total;
    }

    if (cCode) {
      Object.keys(hierarchy[cStr]).forEach(p => {
        Object.keys(hierarchy[cStr][p]).forEach(d => {
          total += hierarchy[cStr][p][d].length;
        });
      });
      return total;
    }
    return 0;
  };

  if (loading) return <div className="p-6">Loading Configuration...</div>;

  if (selectedDistrict) {
    return (
      <div>
        <div className="p-4 bg-white border-b flex justify-between items-center shadow-sm mb-4">
           <button onClick={() => setSelectedDistrict(null)} className="text-blue-600 font-medium hover:underline">&larr; Back to Hierarchy</button>
           <div className="font-bold text-slate-700">{selectedCountry.name} &gt; {selectedProjectType} &gt; {selectedState} &gt; {selectedDistrict}</div>
        </div>
        <LeadScreen 
          uploadSource={uploadSource} 
          injectedFilters={{ country: selectedCountry.code, projectType: selectedProjectType, state: selectedState, district: selectedDistrict }}
          hideInjectedFilters={true} 
        />
      </div>
    );
  }

  const Card = ({ title, subtitle, count, onClick }) => (
    <div onClick={onClick} className="cursor-pointer bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-500 transition-all flex flex-col items-center justify-center min-h-[160px] relative">
      <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase text-center">{title}</h2>
      {subtitle && <p className="text-slate-500 font-medium text-sm uppercase">{subtitle}</p>}
      {count !== undefined && (
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold ${count > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-500'}`}>
          {count} Leads
        </div>
      )}
    </div>
  );

  if (selectedState) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex gap-2 text-sm font-bold text-slate-600 items-center flex-wrap">
          <button onClick={() => {setSelectedState(null); setSelectedProjectType(null); setSelectedCountry(null);}} className="text-blue-600 hover:underline">Countries</button>
          <span>/</span>
          <button onClick={() => {setSelectedState(null); setSelectedProjectType(null);}} className="text-blue-600 hover:underline">{selectedCountry.name}</button>
          <span>/</span>
          <button onClick={() => setSelectedState(null)} className="text-blue-600 hover:underline">{selectedProjectType}</button>
          <span>/</span>
          <span className="text-slate-800">{selectedState}</span>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Districts in {selectedState} ({selectedProjectType})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {districts.map(d => (
            <Card key={d} title={d} count={getCount(selectedCountry.code, selectedProjectType, selectedState, d)} onClick={() => setSelectedDistrict(d)} />
          ))}
          {districts.length === 0 && <div className="col-span-full p-4 text-slate-500">No districts configured.</div>}
        </div>
      </div>
    );
  }

  if (selectedProjectType) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex gap-2 text-sm font-bold text-slate-600 items-center flex-wrap">
          <button onClick={() => {setSelectedProjectType(null); setSelectedCountry(null);}} className="text-blue-600 hover:underline">Countries</button>
          <span>/</span>
          <button onClick={() => setSelectedProjectType(null)} className="text-blue-600 hover:underline">{selectedCountry.name}</button>
          <span>/</span>
          <span className="text-slate-800">{selectedProjectType}</span>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-slate-800">States in {selectedCountry.name} ({selectedProjectType})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {states.map(s => (
            <Card key={s} title={s} count={getCount(selectedCountry.code, selectedProjectType, s, null)} onClick={() => setSelectedState(s)} />
          ))}
          {states.length === 0 && <div className="col-span-full p-4 text-slate-500">No states configured for this country.</div>}
        </div>
      </div>
    );
  }

  if (selectedCountry) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex gap-2 text-sm font-bold text-slate-600 items-center flex-wrap">
          <button onClick={() => setSelectedCountry(null)} className="text-blue-600 hover:underline">Countries</button>
          <span>/</span>
          <span className="text-slate-800">{selectedCountry.name}</span>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Project Types in {selectedCountry.name}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {projectTypes.map(p => (
            <Card key={p.value} title={p.label} count={getCount(selectedCountry.code, p.value, null, null)} onClick={() => setSelectedProjectType(p.value)} />
          ))}
          {projectTypes.length === 0 && <div className="col-span-full p-4 text-slate-500">No active project types configured.</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Global Leads Hierarchy</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {countries.map(c => (
          <Card key={c._id} title={c.name} subtitle={c.name} count={getCount(c.code, null, null, null)} onClick={() => setSelectedCountry(c)} />
        ))}
        {countries.length === 0 && <div className="col-span-full p-4 text-slate-500">No active countries configured.</div>}
      </div>
    </div>
  );
}
