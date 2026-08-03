import React, { useState, useEffect } from "react";
import { Loader2, Search, ArrowDownToLine, AlertCircle, FileText } from "lucide-react";


const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

export default function StcManagementDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStcOrders();
  }, [statusFilter, searchTerm]);

  const fetchStcOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ country: "Australia" });
      if (statusFilter) params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);
      
      const res = await fetch(`${API_BASE}/api/project-orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data.filter(o => o.stcDetails && o.stcDetails.stcs > 0));
      }
    } catch (err) {
      alert("Failed to load STC data");
    } finally {
      setLoading(false);
    }
  };

  const pendingStcs = orders.filter(o => !o.stcStatus?.stcsCreatedInRegistry).length;
  const tradedStcs = orders.filter(o => o.stcStatus?.stcsTraded).length;
  const totalRecovered = orders.reduce((sum, o) => sum + (o.stcStatus?.amountRecovered || 0), 0);
  const totalStcs = orders.reduce((sum, o) => sum + (o.stcDetails?.stcs || 0), 0);

  const exportToCsv = () => {
    const csvContent = [
      ["Order ID", "Customer Name", "System Size", "Postcode", "Zone", "STCs", "Assignment Signed", "STCs Created", "Traded", "Recovered"],
      ...orders.map(o => [
        o.orderNumber,
        o.customerName,
        o.stcDetails?.systemSizeKw || 0,
        o.stcDetails?.postcode || "",
        o.stcDetails?.zone || "",
        o.stcDetails?.stcs || 0,
        o.stcStatus?.assignmentFormSigned ? "Yes" : "No",
        o.stcStatus?.stcsCreatedInRegistry ? "Yes" : "No",
        o.stcStatus?.stcsTraded ? "Yes" : "No",
        o.stcStatus?.amountRecovered || 0
      ])
    ].map(e => e.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `stc_claims_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            STC Management Dashboard
          </h1>
          <p className="text-sm text-slate-500">Track all Australian Small-scale Technology Certificates.</p>
        </div>
        <button 
          onClick={exportToCsv}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <ArrowDownToLine className="w-4 h-4" />
          Export Claims CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-bold text-slate-400 uppercase">Total AU Projects</p>
          <p className="text-2xl font-black text-slate-700">{orders.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm text-center bg-amber-50">
          <p className="text-xs font-bold text-amber-500 uppercase">STC Pending Creation</p>
          <p className="text-2xl font-black text-amber-700">{pendingStcs}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm text-center bg-emerald-50">
          <p className="text-xs font-bold text-emerald-500 uppercase">STCs Traded</p>
          <p className="text-2xl font-black text-emerald-700">{tradedStcs}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm text-center bg-blue-50">
          <p className="text-xs font-bold text-blue-500 uppercase">Total Recovered</p>
          <p className="text-2xl font-black text-blue-700"></p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">System / Zone</th>
                  <th className="px-4 py-3">STCs</th>
                  <th className="px-4 py-3">Assignment Form</th>
                  <th className="px-4 py-3">Registry Status</th>
                  <th className="px-4 py-3">Trade Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{o.customerName}</td>
                    <td className="px-4 py-3">{o.stcDetails?.systemSizeKw}kW (Z{o.stcDetails?.zone})</td>
                    <td className="px-4 py-3 font-bold">{o.stcDetails?.stcs}</td>
                    <td className="px-4 py-3">
                      {o.stcStatus?.assignmentFormSigned 
                        ? <span className="text-green-600 font-semibold">Signed</span>
                        : <span className="text-amber-500 font-semibold">Pending</span>}
                    </td>
                    <td className="px-4 py-3">
                      {o.stcStatus?.stcsCreatedInRegistry 
                        ? <span className="text-green-600 font-semibold">Created</span>
                        : <span className="text-amber-500 font-semibold">Pending</span>}
                    </td>
                    <td className="px-4 py-3">
                      {o.stcStatus?.stcsTraded 
                        ? <span className="text-green-600 font-semibold">Traded ({o.stcStatus?.amountRecovered})</span>
                        : <span className="text-slate-400 font-semibold">Not Traded</span>}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                      No STC orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
