import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import epcApi from '../../../api/epcApi';

const PROJECT_TYPES = [
  'residential', 'commercial', 'group', 'common-meter',
];

const STATUSES = [
  'lead', 'qualified', 'surveyed', 'in-progress', 'completed', 'closed', 'cancelled', 'on-hold'
];

const statusColors = {
  'lead':        'bg-gray-100 text-gray-600 border-gray-200',
  'qualified':   'bg-blue-50 text-blue-600 border-blue-200',
  'surveyed':    'bg-yellow-50 text-yellow-700 border-yellow-200',
  'in-progress': 'bg-indigo-50 text-indigo-600 border-indigo-200',
  'completed':   'bg-orange-50 text-orange-600 border-orange-200',
  'closed':      'bg-green-100 text-green-700 border-green-300',
  'cancelled':   'bg-red-50 text-red-600 border-red-200',
  'on-hold':     'bg-gray-100 text-gray-500 border-gray-200',
};

const EpcProjectManagement = () => {
  const navigate = useNavigate();
  const [projects, setProjects]       = useState([]);
  const [statusSummary, setStatusSummary] = useState({});
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType]   = useState('');
  const [msg, setMsg]                 = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterType)  params.set('projectType', filterType);
      if (search)      params.set('search', search);

      const { data } = await epcApi.get(`/api/epc/projects?${params}`);
      setProjects(data.projects || []);
      setStatusSummary(data.statusSummary || {});
    } catch (err) {
      console.error('Projects fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType, search]);

  useEffect(() => { load(); }, [load]);

  const inputCls = 'bg-white border border-gray-300 text-gray-700 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-800 text-xl font-bold">Project Management</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Track installation stages — complete assigned tasks and upload evidence
          </p>
        </div>
        <button onClick={load} className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {msg && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg px-4 py-3">{msg}</div>
      )}

      {/* Stage summary cards */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: 'qualified',     label: 'Qualified',  color: 'text-blue-600',  bg: 'bg-blue-50'   },
          { key: 'surveyed',      label: 'Surveyed',    color: 'text-yellow-700', bg: 'bg-yellow-50' },
          { key: 'in-progress',   label: 'In Progress', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { key: 'completed',     label: 'Completed',color: 'text-orange-600', bg: 'bg-orange-50' },
          { key: 'closed',        label: 'Closed',        color: 'text-green-700',  bg: 'bg-green-50'  },
          { key: 'cancelled',     label: 'Cancelled',        color: 'text-red-600',  bg: 'bg-red-50'  },
        ].map(s => (
          <button key={s.key}
            onClick={() => setFilterStatus(filterStatus === s.key ? '' : s.key)}
            className={`rounded-xl p-3 text-center border transition-all ${
              filterStatus === s.key
                ? `ring-2 ring-blue-500 border-transparent shadow-sm ${s.bg}`
                : `bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm`
            }`}>
            <p className={`text-xs font-semibold mb-1 ${filterStatus === s.key ? s.color : 'text-gray-500'}`}>
              {s.label}
            </p>
            <p className={`text-xl font-bold ${filterStatus === s.key ? s.color : 'text-gray-800'}`}>
              {statusSummary[s.key] || 0}
            </p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-48">
            <label className="block text-gray-500 text-xs mb-1">Search</label>
            <input
              type="text"
              placeholder="Customer name, order #, district..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full ${inputCls}`}
            />
          </div>
          <div>
            <label className="block text-gray-500 text-xs mb-1">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={inputCls}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-500 text-xs mb-1">Project Type</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className={inputCls}>
              <option value="">All Types</option>
              {PROJECT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {(search || filterStatus || filterType) && (
            <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterType(''); }}
              className="text-xs text-red-500 border border-red-200 bg-red-50 px-3 py-2 rounded-lg">
              Clear
            </button>
          )}
          <span className="text-gray-400 text-xs ml-auto self-end pb-2">{projects.length} projects</span>
        </div>
      </div>

      {/* Projects list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">No projects found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(project => {
            const progressPct  = project.completionPercentage || 0;

            return (
              <div key={project._id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => navigate(`/epc/projects/${project._id}`)}>

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${statusColors[project.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {project.status}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                        {project.projectTypeLabel || project.projectType}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">#{project.orderNumber}</span>
                    </div>

                    <h3 className="text-gray-800 font-semibold">{project.customerName}</h3>
                    <div className="flex items-center gap-4 mt-1 text-gray-500 text-xs flex-wrap">
                      <span>📱 {project.customerMobile}</span>
                      <span>📍 {project.location?.district}{project.location?.city ? `, ${project.location.city}` : ''}</span>
                      {project.systemSizeKW > 0 && <span>⚡ {project.systemSizeKW} kW</span>}
                    </div>
                  </div>

                  {/* Progress % */}
                  <div className="flex-shrink-0 text-center">
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.9" fill="none"
                          stroke={progressPct === 100 ? '#22c55e' : '#3b82f6'}
                          strokeWidth="3"
                          strokeDasharray={`${progressPct} ${100 - progressPct}`}
                          strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                        {progressPct}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stage progress bar */}
                <div className="mt-4">
                  <p className="text-blue-600 text-xs font-medium mt-1">Current Step: {project.currentStepTitle}</p>
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
