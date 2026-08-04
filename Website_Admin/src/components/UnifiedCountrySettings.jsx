import React, { useState } from 'react';
import OrderJourneyScreen from './OrderJourneyScreen';
import CountryWebsiteScreen from './country/CountryWebsiteScreen';
import { Globe, GitBranch } from 'lucide-react';

export default function UnifiedCountrySettings() {
  const [tab, setTab] = useState('content'); // 'content' or 'journey'

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Unified Header Tab Switcher */}
      <div className="bg-white border-b px-6 py-4 flex gap-4">
        <button 
          onClick={() => setTab('content')} 
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${tab === 'content' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Globe className="w-4 h-4" />
          Landing Pages & SEO
        </button>
        <button 
          onClick={() => setTab('journey')} 
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${tab === 'journey' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <GitBranch className="w-4 h-4" />
          Order Journey & Project Types
        </button>
      </div>

      {/* Render selected module */}
      <div className="flex-1 overflow-auto">
        {tab === 'content' ? <CountryWebsiteScreen /> : <OrderJourneyScreen />}
      </div>
    </div>
  );
}
