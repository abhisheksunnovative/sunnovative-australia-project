import React, { useState, useEffect } from 'react';
import { Eye, FileText, Search, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export default function ScannedBillsHistoryScreen() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/light-bill/history`);
      const data = await res.json();
      if (data.success) {
        setBills(data.bills);
      }
    } catch (err) {
      console.error('Failed to fetch scanned bills history:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const filteredBills = bills.filter(b => 
    b.job_id?.toLowerCase().includes(search.toLowerCase()) || 
    b.normalized_data_json?.consumerName?.toLowerCase().includes(search.toLowerCase()) ||
    b.normalized_data_json?.consumerNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Scanned Bills History</h2>
          <p className="text-sm text-slate-500">View recently scanned OCR bills and their extracted data.</p>
        </div>
        <button
          onClick={fetchBills}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, Name or Consumer No..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="px-6 py-4">Job ID / Date</th>
                <th className="px-6 py-4">Document</th>
                <th className="px-6 py-4">Consumer Details</th>
                <th className="px-6 py-4">Confidence</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && bills.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading bills...</td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No scanned bills found.</td>
                </tr>
              ) : (
                filteredBills.map((bill) => {
                  const d = bill.normalized_data_json || {};
                  return (
                    <tr key={bill._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{bill.job_id}</div>
                        <div className="text-xs text-slate-500">{new Date(bill.createdAt).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        {bill.bill_document_uri ? (
                          <a href={API_BASE + bill.bill_document_uri} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-2.5 py-1 rounded-md">
                            <FileText className="w-4 h-4" />
                            View File
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">No File</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900 font-medium">{d.consumerName || 'Unknown Name'}</div>
                        <div className="text-xs text-slate-500">{d.consumerNumber || d.accountNumber || 'Unknown No.'}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{d.discomId || d.retailer || 'Unknown Discom'} • {d.detectedState || d.state || 'Unknown State'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {bill.confidence >= 0.8 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            High ({Math.round(bill.confidence * 100)}%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                            <XCircle className="w-3 h-3" />
                            Low ({Math.round((bill.confidence || 0) * 100)}%)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedBill(bill)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Details Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedBill(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Bill Extraction Details</h3>
                <p className="text-sm text-slate-500">Job ID: {selectedBill.job_id}</p>
              </div>
              <button
                onClick={() => setSelectedBill(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-700 uppercase text-xs tracking-wider">Extracted Data</h4>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <pre className="text-[11px] font-mono text-slate-700 whitespace-pre-wrap break-words">
                      {JSON.stringify(selectedBill.normalized_data_json, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-700 uppercase text-xs tracking-wider">Raw Text (OCR)</h4>
                  <div className="bg-slate-900 rounded-xl p-4 shadow-sm h-full max-h-[400px] overflow-y-auto">
                    <pre className="text-[10px] font-mono text-emerald-400 whitespace-pre-wrap break-words">
                      {selectedBill.raw_text || 'No raw text available.'}
                    </pre>
                  </div>
                </div>

              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
              <button
                onClick={() => setSelectedBill(null)}
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
