import React, { useState, useEffect } from "react";
import { Save, RefreshCw, CheckCircle2, Building, AlertTriangle, Search } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

export default function AustraliaEpcRates() {
  const [guardrails, setGuardrails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [epcCards, setEpcCards] = useState([]);
  const [search, setSearch] = useState("");

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/epc-rates/guardrails`);
      const data = await res.json();
      if (data.success && data.data) {
        setGuardrails(data.data);
      } else {
        setGuardrails({
          country: 'australia',
          minRatePerKw: 500,
          maxRatePerKw: 2500,
          requireAdminApproval: true,
        });
      }

      const cardsRes = await fetch(`${API_BASE}/api/epc-rates/cards`);
      const cardsData = await cardsRes.json();
      if (cardsData.success) {
        setEpcCards(cardsData.data);
      }
    } catch (error) {
      console.error(error);
      setMsg("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/api/epc-rates/guardrails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guardrails)
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Guardrails saved successfully!");
        setTimeout(() => setMsg(""), 3000);
      } else {
        setMsg(data.message || "Failed to save guardrails");
      }
    } catch (e) {
      setMsg("Network error saving guardrails");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (cardId, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/epc-rates/cards/${cardId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchSettings();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>;

  const filteredCards = epcCards.filter(c => c.epcName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Australia EPC Rates</h2>
          <p className="text-sm text-slate-500 mt-1">Configure rate guardrails and review submitted EPC rate cards.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="bg-yellow-400 text-yellow-900 font-bold px-6 py-2.5 rounded-xl hover:bg-yellow-500 transition flex items-center gap-2 shadow-sm disabled:opacity-50">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Guardrails
        </button>
      </div>

      {msg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 text-sm font-bold">
          <CheckCircle2 className="w-5 h-5" /> {msg}
        </div>
      )}

      {/* GUARDRAILS CONFIG */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 mb-5">Global Rate Guardrails (AUD)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Minimum Rate (Per kW)</label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 font-bold text-slate-400">$</span>
              <input type="number" value={guardrails.minRatePerKw} onChange={(e) => setGuardrails({...guardrails, minRatePerKw: Number(e.target.value)})} className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400" />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">Any rate submitted below this will be rejected.</p>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Maximum Rate (Per kW)</label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 font-bold text-slate-400">$</span>
              <input type="number" value={guardrails.maxRatePerKw} onChange={(e) => setGuardrails({...guardrails, maxRatePerKw: Number(e.target.value)})} className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400" />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">Any rate submitted above this will be rejected.</p>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3 bg-slate-50 border border-slate-100 p-4 rounded-xl">
          <input type="checkbox" checked={guardrails.requireAdminApproval} onChange={(e) => setGuardrails({...guardrails, requireAdminApproval: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-yellow-500 focus:ring-yellow-500" id="req_app" />
          <label htmlFor="req_app" className="text-sm font-bold text-slate-700 cursor-pointer">Require Admin Approval for Rate Changes</label>
        </div>
      </div>

      {/* EPC RATE CARDS AUDIT */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 mb-4 gap-4">
          <div>
            <h3 className="text-base font-black text-slate-800">EPC Rate Cards Audit</h3>
            <p className="text-xs text-slate-500 mt-0.5">Review and approve rates submitted by Australian EPCs.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input type="text" placeholder="Search EPC..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-yellow-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">EPC Partner</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Residential / kW</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Commercial / kW</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCards.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-sm font-medium text-slate-500">
                    No rate cards found.
                  </td>
                </tr>
              ) : filteredCards.map(c => {
                const resRate = c.rates.find(r => r.projectType === 'residential')?.pricePerKw || 0;
                const comRate = c.rates.find(r => r.projectType === 'commercial')?.pricePerKw || 0;
                return (
                  <tr key={c._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800">{c.epcName || "Unknown EPC"}</p>
                          <p className="text-[10px] text-slate-500">Submitted: {new Date(c.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-700">${resRate.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-700">${comRate.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        c.status === 'Approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                        c.status === 'Rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                        'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {c.status === 'Pending' && (
                        <>
                          <button onClick={() => handleApprove(c._id, 'Approved')} className="px-3 py-1.5 bg-green-500 text-white font-bold text-xs rounded hover:bg-green-600 transition shadow-sm">Approve</button>
                          <button onClick={() => handleApprove(c._id, 'Rejected')} className="px-3 py-1.5 bg-red-50 text-red-600 font-bold text-xs rounded hover:bg-red-100 transition border border-red-200">Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
