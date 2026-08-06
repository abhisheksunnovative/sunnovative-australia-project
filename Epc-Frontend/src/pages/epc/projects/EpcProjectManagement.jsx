import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import epcApi from '../../../api/epcApi';

const PROJECT_TYPES = ['residential', 'commercial', 'group', 'common-meter'];
const STATUSES = ['lead', 'qualified', 'surveyed', 'in-progress', 'completed', 'closed', 'cancelled', 'on-hold'];

const statusConfig = {
  'lead':        { cls: 'bg-gray-100 text-gray-600 border-gray-200',       dot: 'bg-gray-400',    icon: '🌱' },
  'qualified':   { cls: 'bg-blue-50 text-blue-700 border-blue-200',        dot: 'bg-blue-500',    icon: '✔️' },
  'surveyed':    { cls: 'bg-amber-50 text-amber-700 border-amber-200',     dot: 'bg-amber-500',   icon: '🔍' },
  'in-progress': { cls: 'bg-indigo-50 text-indigo-700 border-indigo-200',  dot: 'bg-indigo-500',  icon: '⚙️' },
  'completed':   { cls: 'bg-orange-50 text-orange-700 border-orange-200',  dot: 'bg-orange-500',  icon: '🏗️' },
  'closed':      { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: '✅' },
  'cancelled':   { cls: 'bg-red-50 text-red-600 border-red-200',           dot: 'bg-red-500',     icon: '❌' },
  'on-hold':     { cls: 'bg-gray-100 text-gray-500 border-gray-200',       dot: 'bg-gray-400',    icon: '⏸️' },
};

const stageSummaryCards = [
  { key: 'qualified',   label: 'Qualified',   icon: '✔️',  grad: 'from-blue-500 to-blue-600',    light: 'bg-blue-50 border-blue-200' },
  { key: 'surveyed',    label: 'Surveyed',    icon: '🔍',  grad: 'from-amber-500 to-amber-600',  light: 'bg-amber-50 border-amber-200' },
  { key: 'in-progress', label: 'In Progress', icon: '⚙️',  grad: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-50 border-indigo-200' },
  { key: 'completed',   label: 'Completed',   icon: '🏗️',  grad: 'from-orange-500 to-orange-600', light: 'bg-orange-50 border-orange-200' },
  { key: 'closed',      label: 'Closed',      icon: '✅',  grad: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50 border-emerald-200' },
  { key: 'cancelled',   label: 'Cancelled',   icon: '❌',  grad: 'from-red-500 to-rose-600',     light: 'bg-red-50 border-red-200' },
];

const EpcProjectManagement = () => {
  const navigate = useNavigate();
  const [projects, setProjects]         = useState([]);
  const [statusSummary, setStatusSummary] = useState({});
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterType)   params.set('projectType', filterType);
      if (search)       params.set('search', search);
      const { data } = await epcApi.get(`/api/epc/projects?${params}`);
      setProjects(data.projects || []);
      setStatusSummary(data.statusSummary || {});
    } catch (err) {
      console.error('Projects fetch error:', err);
    } finally { setLoading(false); }
  }, [filterStatus, filterType, search]);

  useEffect(() => { load(); }, [load]);

  const inputCls = 'bg-white border border-gray-200 text-gray-700 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all';
  const hasFilters = search || filterStatus || filterType;

  return (
    <div className="space-y-6">

      {/* ── PAGE HEADER ── */}
      <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white text-2xl font-black tracking-tight">Project Management</h2>
          <p className="text-slate-400 text-sm mt-1">Track installations — complete tasks and upload evidence</p>
        </div>
        <button onClick={load} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* ── STAGE SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stageSummaryCards.map(s => {
          const isActive = filterStatus === s.key;
          return (
            <button key={s.key}
              onClick={() => setFilterStatus(isActive ? '' : s.key)}
              className={`rounded-2xl p-4 text-center border-2 transition-all hover:-translate-y-0.5 duration-200 ${
                isActive
                  ? `bg-gradient-to-br ${s.grad} text-white border-transparent shadow-lg`
                  : `bg-white border-gray-100 hover:border-blue-300 hover:shadow-md ${s.light}`
              }`}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isActive ? 'text-white/80' : 'text-gray-400'}`}>{s.label}</p>
              <p className={`text-2xl font-black ${isActive ? 'text-white' : 'text-gray-800'}`}>{statusSummary[s.key] || 0}</p>
            </button>
          );
        })}
      </div>

      {/* ── FILTERS ── */}
      <div className="filter-bar">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Search & Filter</p>
          {hasFilters && <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterType(''); }} className="text-xs text-red-500 font-semibold hover:text-red-700">✕ Clear</button>}
        </div>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-52">
            <label className="block text-gray-400 text-xs mb-1 font-medium">Search</label>
            <input type="text" placeholder="Customer name, order #, district..."
              value={search} onChange={e => setSearch(e.target.value)} className={`w-full ${inputCls}`} />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1 font-medium">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={inputCls}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1 font-medium">Project Type</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className={inputCls}>
              <option value="">All Types</option>
              {PROJECT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <span className="text-gray-400 text-xs ml-auto font-medium">{projects.length} projects</span>
        </div>
      </div>

      {/* ── PROJECTS LIST ── */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-premium">
          <div className="text-5xl mb-4">🏗️</div>
          <h3 className="text-gray-700 font-bold text-lg mb-1">No Projects Found</h3>
          <p className="text-gray-400 text-sm">Projects appear here once orders are confirmed</p>
          {hasFilters && <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterType(''); }} className="mt-4 text-blue-600 text-sm font-semibold hover:underline">Clear filters</button>}
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(project => {
            const progressPct  = project.completionPercentage || 0;
            const sc = statusConfig[project.status] || statusConfig['lead'];

            return (
              <div key={project._id}
                className="card-row p-5 cursor-pointer group"
                onClick={() => navigate(`/epc/projects/${project._id}`)}>

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`status-pill ${sc.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} mr-1.5`}></span>
                        {project.status}
                      </span>
                      <span className="status-pill bg-gray-100 text-gray-600 border-gray-200">
                        {project.projectTypeLabel || project.projectType}
                      </span>
                      <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-200">
                        #{project.orderNumber}
                      </span>
                    </div>

                    {/* Customer */}
                    <h3 className="text-gray-800 font-black text-base group-hover:text-blue-600 transition-colors">{project.customerName}</h3>
                    <div className="flex items-center gap-x-4 gap-y-1 mt-1.5 text-gray-500 text-xs flex-wrap">
                      <span>📱 {project.customerMobile}</span>
                      <span>📍 {project.location?.district}{project.location?.city ? `, ${project.location.city}` : ''}</span>
                      {project.systemSizeKW > 0 && <span className="text-amber-600 font-semibold">⚡ {project.systemSizeKW} kW</span>}
                    </div>

                    {/* Step progress */}
                    <p className="text-blue-600 text-xs font-semibold mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block"></span>
                      Current Step: {project.currentStepTitle || 'Not started'}
                    </p>
                  </div>

                  {/* Circular Progress */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <div className="relative w-14 h-14">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.9" fill="none"
                          stroke={progressPct === 100 ? '#10b981' : '#3b82f6'}
                          strokeWidth="3"
                          strokeDasharray={`${progressPct} ${100 - progressPct}`}
                          strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-gray-700">
                        {progressPct}%
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Complete</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${progressPct === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EpcProjectManagement;
