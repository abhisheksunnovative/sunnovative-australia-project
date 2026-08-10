import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

export const TrustBadgeApplication = ({ epcData, onClose, onApplySuccess }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/epc/system-settings`);
        const data = await res.json();
        if (data && data.trustBadgeSettings) {
          setSettings(data.trustBadgeSettings);
        }
      } catch (err) {
        setError('Failed to load Trust Badge rules. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleApply = async () => {
    if (!agreed) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/epc/${epcData._id}/trust-badge`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Applied' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onApplySuccess && onApplySuccess();
      } else {
        setError(data.message || 'Failed to apply.');
      }
    } catch (err) {
      setError('An error occurred during application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 flex flex-col items-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-600 font-medium">Loading Trust Badge Information...</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <ShieldCheck className="w-48 h-48" />
          </div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider mb-4 border border-white/30 shadow-sm backdrop-blur-md">
                <ShieldCheck className="w-4 h-4" /> PREMIUM PARTNER
              </div>
              <h2 className="text-3xl font-bold mb-2">Trust Badge Application</h2>
              <p className="text-blue-100 max-w-lg leading-relaxed">Elevate your EPC profile and unlock exclusive benefits with the official EmergeSun Trust Badge.</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Benefits */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">1</span> 
                Exclusive Benefits
              </h3>
              <ul className="space-y-3">
                {settings?.benefits?.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rules */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">2</span> 
                Eligibility Criteria
              </h3>
              <ul className="space-y-3">
                {settings?.rules?.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <ChevronRight className="w-5 h-5 text-orange-400 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <hr className="border-slate-100 mb-8" />

          {/* Undertaking Box */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Official Undertaking & Agreement</h3>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 h-48 overflow-y-auto text-sm text-slate-600 leading-relaxed mb-4 shadow-inner">
              {settings?.acceptanceLetterText || "Loading terms..."}
            </div>
            
            <label className="flex items-start gap-3 cursor-pointer p-4 border border-blue-100 bg-blue-50/50 rounded-xl hover:bg-blue-50 transition-colors">
              <input 
                type="checkbox" 
                checked={agreed} 
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
              />
              <span className="text-sm font-semibold text-slate-800">
                I have read and agree to the above terms and conditions, and I authorize EmergeSun to verify my eligibility for the Trust Badge.
              </span>
            </label>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleApply}
              disabled={!agreed || submitting}
              className={`px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all ${agreed ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
