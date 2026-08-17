import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

export const TrustBadgeApplication = ({ epcData, onClose, onApplySuccess }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [applicationDetails, setApplicationDetails] = useState({});
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dynamicProjectTypes, setDynamicProjectTypes] = useState([]);
  const [selectedProjectTypes, setSelectedProjectTypes] = useState(epcData?.qualifiedProjectTypes || []);

  const getEpcToken = () => {
    try {
      const epc = localStorage.getItem('epcPartner');
      if (epc) return JSON.parse(epc).token;
    } catch {}
    return localStorage.getItem('epcToken') || '';
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/api/upload-file`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        setApplicationDetails(prev => ({ ...prev, paymentSlipUrl: `${API_BASE}${data.fileUrl}` }));
      }
    } catch (err) {
      setError('Failed to upload payment slip. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const countryName = epcData?.country?.toLowerCase() || 'india';
        
        // Fetch trust badge rules
        const res = await fetch(`${API_BASE}/api/epc/system-settings`);
        const data = await res.json();
        if (data && data.trustBadgeSettings) {
          setSettings(data.trustBadgeSettings);
        }
        
        // Fetch project types
        const ptRes = await fetch(`${API_BASE}/api/order-journey-settings?country=${countryName}`);
        const ptData = await ptRes.json();
        if (ptData && ptData.projectTypes && ptData.projectTypes.length > 0) {
          setDynamicProjectTypes(ptData.projectTypes.map(p => p.value));
          // Provide a default selection if EPC has none
          if (!epcData?.qualifiedProjectTypes || epcData.qualifiedProjectTypes.length === 0) {
            setSelectedProjectTypes([ptData.projectTypes[0].value]);
          }
        } else {
          setDynamicProjectTypes(["Residential", "Commercial", "Group Solar", "Village Solar Campaign"]);
          if (!epcData?.qualifiedProjectTypes || epcData.qualifiedProjectTypes.length === 0) {
            setSelectedProjectTypes(["Residential"]);
          }
        }
      } catch (err) {
        setError('Failed to load Trust Badge rules. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [epcData]);

  const isFCFS = epcData?.country?.toLowerCase() === 'india';

  const fcfsBenefits = [
    "Priority Lead Allocation (Zero Delay)",
    "Instant access to fresh leads before Normal EPCs",
    "Exclusive Trust Badge icon on profile",
    "Boosted conversion rates"
  ];

  const csBenefits = [
    "Prominent placement in Customer 'Select EPC' screen",
    "Official 'Trust Badge' icon next to your name",
    "Higher profile visibility over Normal EPCs",
    "Priority Customer Trust and Selection Rate"
  ];

  const displayBenefits = settings?.benefits?.length > 0 ? settings.benefits : (isFCFS ? fcfsBenefits : csBenefits);

  const handleApply = async () => {
    if (isFCFS && !agreed) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/epc/auth/trust-badge/apply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getEpcToken()}`
        },
        body: JSON.stringify({ applicationDetails, qualifiedProjectTypes: selectedProjectTypes })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onApplySuccess && onApplySuccess();
      } else {
        setError(data.message || 'Failed to apply. Please try again.');
      }
    } catch (err) {
      setError('Network error occurred.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl flex flex-col">
        
        <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-8 text-white flex-shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 text-blue-200 text-sm font-bold tracking-widest uppercase mb-3">
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
                {displayBenefits.map((b, i) => (
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

          {/* FCFS Undertaking Box */}
          {isFCFS && (
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
          )}

          {/* Project Types Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Select Project Categories</h3>
            <p className="text-sm text-slate-500 mb-3">Select the project categories you want the Trust Badge to be active for.</p>
            <div className="grid grid-cols-2 gap-3">
              {dynamicProjectTypes.map(pt => (
                <label key={pt} className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedProjectTypes.includes(pt)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedProjectTypes([...selectedProjectTypes, pt]);
                      else setSelectedProjectTypes(selectedProjectTypes.filter(t => t !== pt));
                    }}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
                  />
                  <span className="text-sm font-semibold text-slate-800">{pt}</span>
                </label>
              ))}
            </div>
            {selectedProjectTypes.length === 0 && <p className="text-xs text-red-500 mt-2 font-medium">Please select at least one project type.</p>}
          </div>

          {/* Payment / Application Details */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Payment Reference / Notes</h3>
            <textarea
              value={applicationDetails.paymentReference || ''}
              onChange={(e) => setApplicationDetails({ ...applicationDetails, paymentReference: e.target.value })}
              placeholder="Enter transaction ID, reference number, or any notes for the admin..."
              className="w-full border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 h-24 resize-none"
            ></textarea>

            {/* Payment Slip Upload */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Upload Payment Slip / Screenshot
              </label>
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-blue-200 rounded-xl cursor-pointer bg-blue-50/40 hover:bg-blue-50 transition-colors">
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
                {uploading ? (
                  <div className="flex flex-col items-center gap-2 text-blue-500">
                    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    <span className="text-xs font-semibold">Uploading...</span>
                  </div>
                ) : slipPreview ? (
                  <div className="relative w-full h-full flex items-center justify-center p-2">
                    <img src={slipPreview} alt="Payment Slip" className="max-h-28 rounded-lg object-contain shadow-sm" />
                    <span className="absolute bottom-1 right-2 text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">✓ Uploaded</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                    <span className="text-xs font-semibold">Click to upload payment slip</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, PDF supported</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button 
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleApply}
              disabled={submitting || (isFCFS && !agreed) || selectedProjectTypes.length === 0}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black text-white transition-all
                ${submitting || (isFCFS && !agreed) || selectedProjectTypes.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-xl hover:-translate-y-0.5'}`}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
