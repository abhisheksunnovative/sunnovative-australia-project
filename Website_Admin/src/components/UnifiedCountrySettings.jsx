import React from 'react';
import OrderJourneyScreen from './OrderJourneyScreen';

export default function UnifiedCountrySettings() {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-auto">
        <OrderJourneyScreen />
      </div>
    </div>
  );
}
