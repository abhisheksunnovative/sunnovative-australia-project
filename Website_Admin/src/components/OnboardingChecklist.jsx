import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4005';

export default function OnboardingChecklist({ selectedCountry }) {
  const [status, setStatus] = useState({
    projectTypes: { configured: false, count: 0 },
    districts: { configured: false, count: 0 },
    journeys: { configured: false, count: 0 },
    products: { configured: false, count: 0 },
    brands: { configured: false, count: 0 },
    demandSupply: { configured: false, count: 0 },
    discoms: { configured: false, count: 0 },
    bdes: { configured: false, count: 0 },
    eligibility: { configured: false, count: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCountry) return;
    
    const checkStatus = async () => {
      setLoading(true);
      try {
        const [ptRes, distRes, journeyRes, prodRes, brandRes, dsRes, discomRes, bdeRes, eligRes] = await Promise.all([
          fetch(`${API_BASE}/api/project-types?country=${selectedCountry}`),
          fetch(`${API_BASE}/api/districts?country=${selectedCountry}`),
          fetch(`${API_BASE}/api/order-journey/${selectedCountry}`),
          fetch(`${API_BASE}/api/product-configs?country=${selectedCountry}`),
          fetch(`${API_BASE}/api/brands?country=${selectedCountry}`),
          fetch(`${API_BASE}/api/demand-supply?country=${selectedCountry}`),
          fetch(`${API_BASE}/api/discoms?country=${selectedCountry}`),
          fetch(`${API_BASE}/api/bde?country=${selectedCountry}`),
          fetch(`${API_BASE}/api/eligibility-settings?country=${selectedCountry}`)
        ]);

        const pt = await ptRes.json();
        const dist = await distRes.json();
        const journey = await journeyRes.json();
        const prod = await prodRes.json();
        const brand = await brandRes.json();
        const ds = await dsRes.json();
        const discom = await discomRes.json();
        const bde = await bdeRes.json();
        const elig = await eligRes.json();

        setStatus({
          projectTypes: { configured: pt.data?.length > 0, count: pt.data?.length || 0 },
          districts: { configured: dist.data?.length > 0, count: dist.data?.length || 0 },
          journeys: { configured: journey.projectTypes?.length > 0, count: journey.projectTypes?.length || 0 },
          products: { configured: prod.data?.length > 0, count: prod.data?.length || 0 },
          brands: { configured: brand.data?.length > 0, count: brand.data?.length || 0 },
          demandSupply: { configured: true, count: ds.data?.regions?.filter(r => r.country.toLowerCase() === selectedCountry.toLowerCase()).length || 0 },
          discoms: { configured: discom.data?.length > 0, count: discom.data?.length || 0 },
          bdes: { configured: bde.bdes?.length > 0, count: bde.bdes?.length || 0 },
          eligibility: { configured: elig.data?.country?.toLowerCase() === selectedCountry.toLowerCase(), count: (elig.data?.country?.toLowerCase() === selectedCountry.toLowerCase()) ? 1 : 0 }
        });
      } catch (e) {
        console.error('Error fetching checklist status', e);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [selectedCountry]);

  if (loading) return <div className="flex justify-center items-center py-20"><Loader className="w-8 h-8 animate-spin text-slate-400" /></div>;

  const checks = [
    { key: 'projectTypes', label: 'Project Types', desc: 'Define residential, commercial, etc.' },
    { key: 'districts', label: 'Districts & Pincodes', desc: 'Define serviceable areas' },
    { key: 'journeys', label: 'Order Journeys', desc: 'Setup step-by-step workflows for each project type' },
    { key: 'products', label: 'Product Config', desc: 'Add Solar Panels, Inverters, etc.' },
    { key: 'brands', label: 'Brands', desc: 'Assign brands to the products' },
    { key: 'demandSupply', label: 'Demand & Supply Rules', desc: 'Configure regional rules' },
    { key: 'discoms', label: 'Discom Management', desc: 'Map Discoms to districts' },
    { key: 'bdes', label: 'BDE Management', desc: 'Add Business Development Executives' },
    { key: 'eligibility', label: 'Customer Eligibility', desc: 'Configure subsidy and criteria rules' }
  ];

  const total = checks.length;
  const completed = checks.filter(c => status[c.key].configured).length;
  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="bg-white rounded-2xl border p-6 shadow-sm mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Country Setup Progress</h2>
        <p className="text-slate-500 text-sm mb-6">Complete these steps to fully activate {selectedCountry.toUpperCase()} on the platform.</p>
        
        <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
          <div className="bg-green-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
        </div>
        <div className="flex justify-between text-xs font-bold text-slate-500">
          <span>{percentage}% Completed</span>
          <span>{completed} of {total} Steps</span>
        </div>
      </div>

      <div className="space-y-4">
        {checks.map(check => {
          const isDone = status[check.key].configured;
          const count = status[check.key].count;
          
          return (
            <div key={check.key} className={`flex items-center p-4 rounded-xl border transition-all ${isDone ? 'bg-green-50/50 border-green-100' : 'bg-white border-slate-200'}`}>
              <div className="mr-4">
                {isDone ? <CheckCircle className="w-6 h-6 text-green-500" /> : <AlertCircle className="w-6 h-6 text-amber-400" />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800">{check.label}</h3>
                <p className="text-sm text-slate-500">{check.desc}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${isDone ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {isDone ? (check.key === 'demandSupply' ? (count > 0 ? `${count} Regional Overrides` : 'Global Rules Active') : `${count} Configured`) : 'Not Configured'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
