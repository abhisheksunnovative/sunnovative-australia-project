/**
 * LeadsScreen — Admin Panel
 * Lead Generation Module — Website form + manual leads
 * API: /api/leads
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Users, Plus, RefreshCw, Search, Filter, Trash2, Eye,
  CheckCircle, AlertCircle, Loader2, ChevronLeft, ChevronRight,
  Upload, TrendingUp, Phone, Mail, MapPin, Zap, X, ArrowRight,
  UserCheck, BarChart2, Download, Calendar, Clock
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["New", "Called", "Interested", "Not Interested", "Follow Up", "Converted", "Junk"];

const STATUS_COLORS = {
  "New":            "bg-blue-100 text-blue-700 border-blue-200",
  "Called":         "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Interested":     "bg-green-100 text-green-700 border-green-200",
  "Not Interested": "bg-red-100 text-red-700 border-red-200",
  "Follow Up":      "bg-purple-100 text-purple-700 border-purple-200",
  "Converted":      "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Junk":           "bg-slate-100 text-slate-500 border-slate-200",
};

const SOLAR_TYPES = [
  { value: "residential",  label: "Residential Solar" },
  { value: "surya-ghar",   label: "Surya Ghar Yojana" },
  { value: "commercial",   label: "Commercial Solar" },
  { value: "group-solar",  label: "Group Solar" },
  { value: "rwa-society",  label: "RWA Society" },
  { value: "village",      label: "Village Solar" },
  { value: "msme",         label: "MSME Solar" },
  { value: "au-small-home",      label: "AU Small Home (6.6kW)" },
  { value: "au-standard-family", label: "AU Standard Family (8-10kW)" },
  { value: "au-large-home",      label: "AU Large Home (10-13kW)" },
  { value: "au-ev-owners",       label: "AU EV Owners (13-20kW)" },
  { value: "au-solar-battery",   label: "AU Solar + Battery" },
  { value: "general",      label: "General" },
];

const SOURCE_COLORS = {
  "website-form": "bg-sky-50 text-sky-700",
  "manual":       "bg-slate-100 text-slate-600",
  "bulk-upload":  "bg-violet-50 text-violet-700",
  "epc-portal":   "bg-orange-50 text-orange-700",
};

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ toast }) => toast ? (
  <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
    {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
    {toast.msg}
  </div>
) : null;

// ── Create Lead Modal ─────────────────────────────────────────────────────────
const CreateLeadModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: "", mobile: "", email: "", state: "", district: "", city: "", pincode: "", solarType: "residential", kw: "", billAmount: "", notes: "", sourceOfMedia: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Name required hai"); return; }
    if (!form.mobile.trim() || form.mobile.length !== 10) { setError("Valid 10-digit mobile number do"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, kw: form.kw || "0", billAmount: Number(form.billAmount) || 0 }),
      });
      const data = await res.json();
      if (data.success) { onSuccess(); onClose(); }
      else setError(data.message || "Lead create nahi hua");
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-yellow-500" />
            <h2 className="text-base font-bold text-slate-800">Add New Lead</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Name *", key: "name", placeholder: "Customer name" },
              { label: "Mobile *", key: "mobile", placeholder: "10-digit mobile", type: "tel" },
              { label: "Email", key: "email", placeholder: "email@example.com", type: "email" },
              { label: "State", key: "state", placeholder: "e.g. Gujarat" },
              { label: "District", key: "district", placeholder: "e.g. Rajkot" },
              { label: "City", key: "city", placeholder: "e.g. Rajkot" },
              { label: "Pincode", key: "pincode", placeholder: "360001" },
              { label: "Bill Amount (₹)", key: "billAmount", placeholder: "2500", type: "number" },
              { label: "System Size (kW)", key: "kw", placeholder: "3", type: "number" },
              { label: "Source of Media", key: "sourceOfMedia", placeholder: "Facebook / Reference" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">{f.label}</label>
                <input type={f.type || "text"} value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40" />
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Solar Type *</label>
            <select value={form.solarType} onChange={e => set("solarType", e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 bg-white">
              {SOLAR_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} placeholder="Additional notes..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 resize-none" />
          </div>
          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">Cancel</button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 bg-yellow-400 text-slate-900 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-400 transition disabled:opacity-50">
              {loading ? "Saving..." : "Save Lead"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Lead Detail Modal ─────────────────────────────────────────────────────────
const LeadDetailModal = ({ lead, onClose, onUpdate, onConvert }) => {
  const [converting, setConverting] = useState(false);
  const status = STATUS_COLORS[lead.status] || STATUS_COLORS["New"];

  const handleConvert = async () => {
    if (!window.confirm(`"${lead.name}" ko Project Order mein convert karein?`)) return;
    setConverting(true);
    try {
      const res = await fetch(`${API_BASE}/api/leads/${lead._id}/convert`, { method: "POST" });
      const data = await res.json();
      if (data.success) { onConvert?.(data.data); onClose(); }
      else alert(data.message);
    } catch { alert("Network error"); }
    finally { setConverting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Lead Details</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center text-yellow-700 text-lg font-black">
              {lead.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-black text-slate-800">{lead.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status}`}>{lead.status}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${SOURCE_COLORS[lead.source] || "bg-slate-100 text-slate-500"}`}>
                  {lead.source?.replace("-", " ")}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 text-sm">
            {[
              { icon: <Phone className="w-3.5 h-3.5" />, label: "Mobile", value: lead.mobile },
              { icon: <Mail className="w-3.5 h-3.5" />, label: "Email", value: lead.email || "—" },
              { icon: <MapPin className="w-3.5 h-3.5" />, label: "Location", value: [lead.address, lead.city, lead.district, lead.state, lead.country].filter(Boolean).join(", ") || "—" },
              { icon: <Zap className="w-3.5 h-3.5" />, label: "Solar Type", value: SOLAR_TYPES.find(t => t.value === lead.solarType)?.label || lead.solarType },
              { icon: <Zap className="w-3.5 h-3.5" />, label: "System Size", value: lead.kw ? `${lead.kw} kW` : "—" },
              { icon: <Zap className="w-3.5 h-3.5" />, label: "Bill Amount", value: lead.billAmount ? (lead.country?.toLowerCase() === 'australia' ? `$${lead.billAmount} AUD` : `₹${lead.billAmount}`) : "—" },
              { icon: <Zap className="w-3.5 h-3.5" />, label: "NMI / Consumer", value: lead.consumerNumber || "—" },
              { icon: <Zap className="w-3.5 h-3.5" />, label: "Retailer/DNSP", value: lead.discom || lead.retailer || "—" },
              { icon: <Calendar className="w-3.5 h-3.5" />, label: "Install Date", value: lead.preferredInstallDate ? new Date(lead.preferredInstallDate).toLocaleDateString("en-IN") : "Not Selected Yet" },
              { icon: <Clock className="w-3.5 h-3.5" />, label: "5-Day EPC Target", value: lead.preferredInstallDate ? `${new Date(new Date(lead.preferredInstallDate).setDate(new Date(lead.preferredInstallDate).getDate() + 5)).toLocaleDateString("en-IN")} (Assign EPC & Start)` : "Awaiting Customer Date" },
              { icon: <Calendar className="w-3.5 h-3.5" />, label: "Lead Created", value: new Date(lead.createdAt).toLocaleDateString("en-IN") },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-slate-400 shrink-0">{row.icon}</span>
                <span className="text-slate-500 w-28 shrink-0 text-xs font-semibold uppercase tracking-wider">{row.label}</span>
                <span className="text-slate-800 font-bold">{row.value}</span>
              </div>
            ))}
            {lead.rooftopPhoto && (
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                <span className="text-slate-400 shrink-0"><Eye className="w-3.5 h-3.5" /></span>
                <span className="text-slate-500 w-28 shrink-0 text-xs font-semibold uppercase tracking-wider">Terrace Photo</span>
                <a href={`${API_BASE}${lead.rooftopPhoto}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline font-bold hover:text-blue-800">
                  📷 Open Terrace Image
                </a>
              </div>
            )}
          </div>

          {lead.notes && (
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-slate-700">{lead.notes}</p>
            </div>
          )}

          {/* History */}
          {lead.history?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">History</p>
              <div className="space-y-1">
                {lead.history.slice(-5).reverse().map((h, i) => (
                  <p key={i} className="text-xs text-slate-500">{h.action} • {new Date(h.date).toLocaleDateString("en-IN")}</p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50">Close</button>
            {lead.convertedProjectId ? (
              <div className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-200 py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-600"/> Order Approved & Created
              </div>
            ) : lead.status === "Converted" ? (
              <button onClick={handleConvert} disabled={converting}
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm">
                {converting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Confirm & Approve Order
              </button>
            ) : (
              <div className="flex-1 bg-slate-100 text-slate-500 border border-slate-200 py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Waiting for BDE Conversion
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Upload Modal ──────────────────────────────────────────────────────────────
const UploadModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [solarType, setSolarType] = useState("residential");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) { setError("File select karo"); return; }
    setLoading(true); setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("solarType", solarType);
      const res = await fetch(`${API_BASE}/api/leads/upload`, { method: "POST", body: form });
      const data = await res.json();
      if (data.success) { setResult(data); onSuccess(); }
      else setError(data.message || "Upload failed");
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2"><Upload className="w-5 h-5 text-yellow-500" /><h2 className="text-base font-bold text-slate-800">Bulk Upload Leads</h2></div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        {!result ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Solar Type</label>
              <select value={solarType} onChange={e => setSolarType(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40">
                {SOLAR_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">CSV / Excel File</label>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={e => setFile(e.target.files[0])}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              <p className="text-[11px] text-slate-400 mt-1">Columns: name, mobile, email, state, district, city, pincode, billAmount, kw, notes</p>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50">Cancel</button>
              <button onClick={handleUpload} disabled={loading || !file}
                className="flex-1 bg-yellow-400 text-slate-900 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-400 disabled:opacity-50">
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <p className="font-black text-slate-800 text-xl">{result.total} Leads Uploaded!</p>
            {result.errors?.length > 0 && <p className="text-xs text-amber-600">{result.errors.length} rows skipped</p>}
            <button onClick={onClose} className="w-full bg-yellow-400 text-slate-900 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-400">Done</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main LeadsScreen ──────────────────────────────────────────────────────────
export const LeadsScreen = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, newLeads: 0, converted: 0, today: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [cardFilter, setCardFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const fetchLeads = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 25 });
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (typeFilter) params.append("solarType", typeFilter);
      if (filterCountry) params.append("country", filterCountry);
      if (filterState) params.append("state", filterState);
      if (filterDistrict) params.append("district", filterDistrict);
      if (cardFilter && cardFilter !== "all") params.append("cardFilter", cardFilter);

      const [leadsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/leads?${params}`).then(r => r.json()),
        fetch(`${API_BASE}/api/leads/stats`).then(r => r.json()),
      ]);

      if (leadsRes.success) {
        setLeads(leadsRes.data);
        setTotal(leadsRes.total);
        setTotalPages(Math.ceil(leadsRes.total / 25));
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (e) { console.error(e); showToast("error", "Leads load nahi hue"); }
    finally { setLoading(false); }
  }, [search, statusFilter, typeFilter, filterCountry, filterState, filterDistrict, cardFilter]);

  useEffect(() => {
    const t = setTimeout(() => { fetchLeads(1); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [fetchLeads]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await fetch(`${API_BASE}/api/leads/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
      setLeads(prev => prev.map(l => l._id === id ? { ...l, status: newStatus } : l));
    } catch { showToast("error", "Status update failed"); }
    finally { setUpdatingId(null); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" ko delete karna chahte ho?`)) return;
    setDeletingId(id);
    try {
      await fetch(`${API_BASE}/api/leads/${id}`, { method: "DELETE" });
      setLeads(prev => prev.filter(l => l._id !== id));
      setTotal(t => t - 1);
      showToast("success", "Lead deleted");
    } catch { showToast("error", "Delete failed"); }
    finally { setDeletingId(null); }
  };

  const handleExportUnassigned = () => {
    const params = new URLSearchParams();
    if (filterCountry) params.append("country", filterCountry);
    if (filterState) params.append("state", filterState);
    if (filterDistrict) params.append("district", filterDistrict);
    if (statusFilter) params.append("status", statusFilter);
    if (search) params.append("search", search);
    window.open(`${API_BASE}/api/leads/export-unassigned?${params.toString()}`, "_blank");
  };

  const cardConfig = [
    { key: "all", label: "Total Leads", value: stats.total || 0, color: "text-slate-700", bg: "hover:bg-slate-50" },
    { key: "today", label: "New Today", value: stats.today || 0, color: "text-amber-600", bg: "hover:bg-amber-50/50" },
    { key: "unassigned", label: "New (Unworked)", value: stats.newLeads || 0, color: "text-blue-600", bg: "hover:bg-blue-50/50" },
    { key: "converted", label: "Converted", value: stats.converted || 0, color: "text-emerald-600", bg: "hover:bg-emerald-50/50" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Toast toast={toast} />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center">
            <Users className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Lead Management</h1>
            <p className="text-xs text-slate-500">Website form + manually added — total {total} leads</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportUnassigned} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition cursor-pointer shadow-sm">
            <Download className="w-3.5 h-3.5" /> Export Unassigned CSV
          </button>
          <button onClick={() => fetchLeads(page)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
            <Upload className="w-3.5 h-3.5" /> Bulk Upload
          </button>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 bg-yellow-400 rounded-xl hover:bg-amber-400 shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Add Lead
          </button>
        </div>
      </div>

      {/* Interactive Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cardConfig.map((s) => {
          const isActive = cardFilter === s.key;
          return (
            <button
              key={s.key}
              onClick={() => {
                setCardFilter(s.key);
                setPage(1);
              }}
              className={`rounded-xl border p-4 text-center transition-all cursor-pointer ${s.bg} ${
                isActive
                  ? "bg-amber-50/80 border-amber-300 ring-2 ring-yellow-400 shadow-md scale-[1.02]"
                  : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 font-bold mt-0.5">{s.label}</p>
              {isActive && <span className="text-[10px] text-amber-700 font-extrabold uppercase mt-1 block">Active Filter</span>}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, mobile ya district se search..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/40 font-medium" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCardFilter("all"); }}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40 font-medium">
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40 font-medium">
          <option value="">All Solar Types</option>
          {SOLAR_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40 font-medium">
          <option value="">All Countries</option>
          <option value="India">India</option>
          <option value="Australia">Australia</option>
          <option value="New Zealand">New Zealand</option>
        </select>
        <input type="text" value={filterState} onChange={e => setFilterState(e.target.value)} placeholder="Filter State"
            className="w-32 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/40 font-medium" />
        <input type="text" value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} placeholder="Filter District"
            className="w-32 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/40 font-medium" />
        {(statusFilter || typeFilter || search || filterCountry || filterState || filterDistrict || cardFilter !== "all") && (
          <button onClick={() => { setStatusFilter(""); setTypeFilter(""); setSearch(""); setFilterCountry(""); setFilterState(""); setFilterDistrict(""); setCardFilter("all"); }}
            className="flex items-center gap-1 px-3 py-2.5 text-xs font-semibold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 cursor-pointer">
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48 gap-3 text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin text-yellow-400" />
          <p className="text-sm">Leads load ho rahe hain...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
          <Users className="w-10 h-10 opacity-30" />
          <p className="text-sm font-medium">Koi lead nahi mila</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["#", "Name", "Mobile", "Solar Type", "Location", "kW / Bill", "Source", "Status", "Date", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead, i) => (
                  <tr key={lead._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-xs text-slate-400">{(page - 1) * 25 + i + 1}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedLead(lead)} className="font-semibold text-slate-800 hover:text-yellow-600 text-left transition">
                        {lead.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{lead.mobile}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg">
                        {SOLAR_TYPES.find(t => t.value === lead.solarType)?.label || lead.solarType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{[lead.city, lead.district].filter(Boolean).join(", ") || "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {lead.kw && lead.kw !== "0" ? <span className="font-semibold text-slate-700">{lead.kw} kW</span> : "—"}
                      {lead.billAmount > 0 && <span className="block text-slate-400">₹{lead.billAmount}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${SOURCE_COLORS[lead.source] || "bg-slate-100 text-slate-500"}`}>
                        {lead.source?.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select value={lead.status} disabled={updatingId === lead._id}
                        onChange={e => handleStatusChange(lead._id, e.target.value)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-full border cursor-pointer focus:outline-none disabled:opacity-50 ${STATUS_COLORS[lead.status] || "bg-slate-100 text-slate-500"}`}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{new Date(lead.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setSelectedLead(lead)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Show Details">
                          <Eye className="w-4 h-4" />
                        </button>

                        {lead.convertedProjectId ? (
                          <span className="px-2 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-lg border border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600"/> Approved
                          </span>
                        ) : lead.status === "Converted" ? (
                          <button 
                            onClick={async () => {
                              if (!window.confirm(`Confirm & approve order for "${lead.name}"?`)) return;
                              try {
                                const res = await fetch(`${API_BASE}/api/leads/${lead._id}/convert`, { method: "POST" });
                                const data = await res.json();
                                if (data.success) {
                                  alert(`🎉 Order Confirmed & Approved for "${lead.name}"!\n\n${lead.country?.toLowerCase() === 'australia' ? 'BDE has been enabled to suggest EPC installers to customer.' : 'Lead has been broadcasted to all Indian EPC partners on First-Come, First-Served basis.'}`);
                                  fetchLeads(page);
                                } else { alert(data.message); }
                              } catch { alert("Network error"); }
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Confirm Order
                          </button>
                        ) : (
                          <span className="px-2 py-1 bg-slate-100 text-slate-500 font-semibold text-[10px] rounded-lg border border-slate-200 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-500"/> Pending BDE
                          </span>
                        )}

                        <button onClick={() => handleDelete(lead._id, lead.name)} disabled={deletingId === lead._id}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40" title="Delete Lead">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 py-4 border-t border-slate-100">
              <button onClick={() => { setPage(p => Math.max(1, p - 1)); fetchLeads(Math.max(1, page - 1)); }} disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <span className="text-sm text-slate-500">Page <strong>{page}</strong> of <strong>{totalPages}</strong></span>
              <button onClick={() => { setPage(p => Math.min(totalPages, p + 1)); fetchLeads(Math.min(totalPages, page + 1)); }} disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreate && <CreateLeadModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); fetchLeads(page); showToast("success", "Lead created!"); }} />}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSuccess={() => { setShowUpload(false); fetchLeads(1); showToast("success", "Leads uploaded!"); }} />}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={() => fetchLeads(page)}
          onConvert={() => { fetchLeads(page); showToast("success", "Lead converted to Project Order!"); }}
        />
      )}
    </div>
  );
};

export default LeadsScreen;