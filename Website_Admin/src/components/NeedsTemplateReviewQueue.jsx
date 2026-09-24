import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Clock, MapPin, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4005';

export default function NeedsTemplateReviewQueue({ country, onBuildTemplate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, [country]);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/v2/light-bill/needs-review?country=${country}`);
      if (res.data.success) {
        setItems(res.data.items);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (loading) return <div className="p-6 text-slate-500">Loading review queue...</div>;

  if (items.length === 0) {
    return (
      <div className="p-8 text-center bg-emerald-50 rounded-xl border border-emerald-100">
        <h3 className="text-emerald-700 font-bold text-lg">All caught up! 🎉</h3>
        <p className="text-emerald-600/80 mt-1">No failed bills waiting for template creation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-amber-800 font-bold">Unmatched Bills Queue ({items.length})</h3>
          <p className="text-amber-700 text-sm mt-1">These bills failed to scan because no template matched or critical fields were missing. Create a template from these real customer bills to ensure they scan automatically next time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map(item => (
          <div key={item._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div className="p-4 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 w-full md:w-64 shrink-0 flex flex-col justify-center">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Failed Scan</div>
              <div className="font-semibold text-slate-800">{new Date(item.createdAt).toLocaleString()}</div>
              <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
                {item.fallbackReason}
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="text-xs font-bold text-slate-500 mb-2">RAW TEXT PREVIEW</div>
              <div className="text-[10px] font-mono text-slate-600 bg-slate-100 p-3 rounded h-24 overflow-hidden relative">
                {item.rawText ? item.rawText.substring(0, 300) + '...' : 'No raw text available'}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-100 to-transparent"></div>
              </div>
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => onBuildTemplate(item)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
                >
                  Build Template <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
