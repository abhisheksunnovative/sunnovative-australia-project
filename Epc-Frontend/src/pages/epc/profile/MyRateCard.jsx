import React, { useState, useEffect } from "react";
import { useEpcAuth } from "../../../context/EpcAuthContext";
import { Save, RefreshCw, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import epcApi from "../../../api/epcApi";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

export default function MyRateCard() {
  const { epc: user } = useEpcAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  
  const [guardrails, setGuardrails] = useState(null);
  const [rateCard, setRateCard] = useState({
    rates: [
      { projectType: "residential", pricePerKw: 0 },
      { projectType: "commercial", pricePerKw: 0 },
    ],
    status: "Pending"
  });

  const isAU = user?.country?.toLowerCase() === "australia";

  useEffect(() => {
    if (isAU) {
      fetchData();
    }
  }, [isAU]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Guardrails
      const gRes = await fetch(`${API_BASE}/api/epc-rates/guardrails`);
      const gData = await gRes.json();
      if (gData.success && gData.data) {
        setGuardrails(gData.data);
      }

      // Fetch My Rate Card
      const rRes = await epcApi.get(`/api/epc-rates/cards/my`);
      const rData = rRes.data;
      if (rData.success && rData.data) {
        setRateCard(rData.data);
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching rate card details");
    } finally {
      setLoading(false);
    }
  };

  const handleRateChange = (type, value) => {
    const updatedRates = rateCard.rates.map(r => 
      r.projectType === type ? { ...r, pricePerKw: Number(value) } : r
    );
    // If not exists, add it
    if (!updatedRates.find(r => r.projectType === type)) {
      updatedRates.push({ projectType: type, pricePerKw: Number(value) });
    }
    setRateCard({ ...rateCard, rates: updatedRates });
  };

  const getRate = (type) => {
    return rateCard.rates.find(r => r.projectType === type)?.pricePerKw || 0;
  };

  const handleSave = async () => {
    setError("");
    setMsg("");
    // Validate against guardrails
    if (guardrails) {
      for (const r of rateCard.rates) {
        if (r.pricePerKw < guardrails.minRatePerKw) {
          return setError(`${r.projectType} rate cannot be less than $${guardrails.minRatePerKw}`);
        }
        if (r.pricePerKw > guardrails.maxRatePerKw) {
          return setError(`${r.projectType} rate cannot be more than $${guardrails.maxRatePerKw}`);
        }
      }
    }

    try {
      setSaving(true);
      const res = await epcApi.post(`/api/epc-rates/cards/my`, { rates: rateCard.rates });
      const data = res.data;
      if (data.success) {
        setMsg("Rates submitted successfully!");
        setRateCard(data.data); // Update with new status
        setTimeout(() => setMsg(""), 3000);
      } else {
        setError(data.message || "Failed to save rates");
      }
    } catch (err) {
      setError("Network error saving rates");
    } finally {
      setSaving(false);
    }
  };

  if (!isAU) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 mt-6 max-w-4xl mx-auto shadow-sm">
        <Info className="w-12 h-12 mx-auto text-sky-500 mb-3" />
        <h2 className="text-xl font-black text-slate-800">Dynamic Rates Not Available</h2>
        <p className="text-sm text-slate-500 mt-2">Dynamic EPC rate management is currently only enabled for Australia.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="p-12 flex justify-center"><RefreshCw className="w-8 h-8 animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-6">
      <div>
        <h2 className="text-2xl font-black text-slate-800">My Rate Card</h2>
        <p className="text-sm text-slate-500 mt-1">Define your installation rates. These will be shown to customers in your service areas.</p>
      </div>

      {msg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 text-sm font-bold shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" /> {msg}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm font-bold shadow-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      {/* Guardrails Info */}
      {guardrails && (
        <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-sky-900">Admin Rate Guidelines</p>
            <p className="text-xs text-sky-700 mt-1">Your rates must be between <strong>${guardrails.minRatePerKw}</strong> and <strong>${guardrails.maxRatePerKw}</strong> per kW. {guardrails.requireAdminApproval && "Rates require admin approval before they go live."}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-slate-800">Rate Configuration (AUD)</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
            rateCard.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-200 border' :
            rateCard.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200 border' :
            'bg-yellow-100 text-yellow-700 border-yellow-200 border'
          }`}>
            Status: {rateCard.status || "Pending"}
          </span>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl">
            <label className="text-sm font-bold text-slate-700 block mb-2">Residential Installation (Per kW)</label>
            <div className="relative max-w-sm">
              <span className="absolute left-4 top-3 font-bold text-slate-400">$</span>
              <input 
                type="number" 
                value={getRate('residential')} 
                onChange={(e) => handleRateChange('residential', e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400" 
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl">
            <label className="text-sm font-bold text-slate-700 block mb-2">Commercial Installation (Per kW)</label>
            <div className="relative max-w-sm">
              <span className="absolute left-4 top-3 font-bold text-slate-400">$</span>
              <input 
                type="number" 
                value={getRate('commercial')} 
                onChange={(e) => handleRateChange('commercial', e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400" 
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="px-8 py-3.5 bg-yellow-400 text-yellow-900 font-black rounded-xl hover:bg-yellow-500 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Submit Rates
          </button>
        </div>
      </div>
    </div>
  );
}
