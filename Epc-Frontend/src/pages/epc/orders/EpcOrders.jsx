import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEpcAuth } from '../../../context/EpcAuthContext';
import { useCountry } from '../../../context/CountryContext';
import epcApi from '../../../api/epcApi';
import EpcOrdersCalendar from './EpcOrdersCalendar';

const PROJECT_TYPES = [
  'Surya Ghar Yojana', 'Group Solar', 'Village Solar Campaign',
  'Commercial Solar', 'Residential Solar',
];

const statusConfig = {
  New:       { cls: 'bg-blue-50 text-blue-700 border-blue-200',   dot: 'bg-blue-500',   icon: '🆕' },
  Ongoing:   { cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500',  icon: '⚙️' },
  Overdue:   { cls: 'bg-red-50 text-red-700 border-red-200',      dot: 'bg-red-500',    icon: '⚠️' },
  Completed: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'emerald-500', icon: '✅' },
  Cancelled: { cls: 'bg-gray-100 text-gray-500 border-gray-200',  dot: 'bg-gray-400',   icon: '❌' },
};

const stageSteps = [
  'Registration Started', 'Material Delivered', 'Installation In Progress',
  'Installation Completed', 'QC Verification', '90% Payment Released',
  'Customer Approval', '10% Payment Released', 'Project Closed',
];

const EpcOrders = () => {
  const { epc } = useEpcAuth();
  const { getStates, locationsLoading } = useCountry();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultStatus = searchParams.get('status') || '';

  const [orders, setOrders]       = useState([]);
  const [summary, setSummary]     = useState({});
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [stageLoading, setStageLoading] = useState(false);
  const [msg, setMsg]             = useState('');
  const [viewMode, setViewMode]   = useState('list');

  const [filterStatus, setFilterStatus]   = useState(defaultStatus);
  const [filterProject, setFilterProject] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterState, setFilterState]     = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterCity, setFilterCity] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus)   params.set('status', filterStatus);
      if (filterProject)  params.set('projectType', filterProject);
      if (filterCountry)  params.set('country', filterCountry);
      if (filterState)    params.set('state', filterState);
      if (filterDistrict) params.set('district', filterDistrict);
      if (filterCity)     params.set('city', filterCity);

      const [ordRes, sumRes] = await Promise.all([
        epcApi.get(`/api/epc/orders?${params}`),
        epcApi.get('/api/epc/orders/summary'),
      ]);
      setOrders(ordRes.data.orders || ordRes.data);
      setSummary(sumRes.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally { setLoading(false); }
  }, [filterStatus, filterProject, filterCountry, filterState, filterDistrict, filterCity]);

  useEffect(() => { load(); }, [load]);

  const advanceStage = async (orderId, currentStage) => {
    const idx = stageSteps.indexOf(currentStage);
    if (idx === -1 || idx >= stageSteps.length - 1) return;
    const nextStage = stageSteps[idx + 1];
    if (!window.confirm(`Move order to "${nextStage}"?`)) return;
    setStageLoading(true);
    try {
      const { data } = await epcApi.put(`/api/epc/orders/${orderId}/stage`, { stage: nextStage });
      setMsg(`✅ Stage updated to: ${nextStage}`);
      setSelected(data.order);
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to update stage');
    } finally {
      setStageLoading(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const clearFilters = () => { setFilterStatus(''); setFilterProject(''); setFilterCountry(''); setFilterState(''); setFilterDistrict(''); setFilterCity(''); };
  const hasFilters = filterProject || filterCountry || filterState || filterDistrict || filterCity;

  const inputCls = 'bg-white border border-gray-200 text-gray-700 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all';

  const statusTabs = [
    { key: '',          label: 'All',       count: summary.total || orders.length, color: 'text-gray-600' },
    { key: 'New',       label: '🆕 New',    count: summary.new || 0,              color: 'text-blue-600' },
    { key: 'Ongoing',   label: '⚙️ Ongoing', count: summary.ongoing || 0,          color: 'text-amber-600' },
    { key: 'Overdue',   label: '⚠️ Overdue', count: summary.overdue || 0,          color: 'text-red-600' },
    { key: 'Completed', label: '✅ Done',    count: summary.completed || 0,        color: 'text-emerald-600' },
  ];

  return (
    <div className="space-y-6">

      {/* ── PAGE HEADER ── */}
      <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white text-2xl font-black tracking-tight">My Orders</h2>
          <p className="text-slate-400 text-sm mt-1">Track installation stages and payments</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-white/10 rounded-xl p-1 gap-1">
            <button onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-gray-800 shadow' : 'text-white/70 hover:text-white'}`}>
              📋 List
            </button>
            <button onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'calendar' ? 'bg-white text-gray-800 shadow' : 'text-white/70 hover:text-white'}`}>
              📅 Calendar
            </button>
          </div>
          <button onClick={load} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── STATUS PILL TABS ── */}
      <div className="flex gap-2 flex-wrap">
        {statusTabs.map(t => (
          <button key={t.key} onClick={() => setFilterStatus(t.key)}
            className={`text-xs px-4 py-2 rounded-xl font-bold border transition-all ${
              filterStatus === t.key
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}>
            {t.label} <span className={`ml-1 ${filterStatus === t.key ? 'text-white/80' : t.color}`}>({t.count})</span>
          </button>
        ))}
      </div>

      {msg && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-xl px-4 py-3 font-medium">{msg}</div>
      )}

      {/* ── FILTERS ── */}
      <div className="filter-bar">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filters</p>
          {hasFilters && <button onClick={clearFilters} className="text-xs text-red-500 font-semibold hover:text-red-700">✕ Clear</button>}
        </div>
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-gray-400 text-xs mb-1 font-medium">Project Type</label>
            <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className={inputCls}>
              <option value="">All Types</option>
              {PROJECT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1 font-medium">Country</label>
            <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} className={inputCls}>
              <option value="">All</option>
              <option value="India">🇮🇳 India</option>
              <option value="Australia">🇦🇺 Australia</option>
              <option value="New Zealand">🇳🇿 New Zealand</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1 font-medium">State</label>
            <select 
              value={filterState} 
              onChange={e => setFilterState(e.target.value)} 
              className={`${inputCls} w-28`}
              disabled={locationsLoading}
            >
              <option value="">All</option>
              {getStates(epc?.country).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1 font-medium">District</label>
            <select value={filterDistrict} onChange={e => { setFilterDistrict(e.target.value); setFilterCity(''); }} className={inputCls}>
              <option value="">All Districts</option>
              {(epc?.activeDistricts || []).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1 font-medium">City/Area</label>
            <input type="text" value={filterCity} onChange={e => setFilterCity(e.target.value)} placeholder="City" className={`${inputCls} w-24`} />
          </div>
          <span className="text-gray-400 text-xs ml-auto font-medium">{orders.length} orders</span>
        </div>
      </div>

      {/* ── CALENDAR VIEW ── */}
      {viewMode === 'calendar' && <EpcOrdersCalendar orders={orders} />}

      {/* ── LIST VIEW ── */}
      {viewMode === 'list' && (
        loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-premium">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-gray-700 font-bold text-lg mb-1">No Orders Found</h3>
            <p className="text-gray-400 text-sm">Accept an enquiry to get your first order</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const sc = statusConfig[order.status] || statusConfig.New;
              const isExpanded = selected?._id === order._id;
              const stageIdx = stageSteps.indexOf(order.stage);
              const stagePct = stageIdx >= 0 ? Math.round(((stageIdx + 1) / stageSteps.length) * 100) : 0;

              return (
                <div key={order._id}
                  className={`card-row overflow-hidden ${order.isOverdue ? 'border-red-300 shadow-sm shadow-red-50' : ''}`}>

                  {/* Overdue Banner */}
                  {order.isOverdue && (
                    <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-black px-4 py-1.5">
                      ⚠️ OVERDUE — Please complete this project immediately
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Tags Row */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className={`status-pill ${sc.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} mr-1.5`}></span>
                            {order.status}
                          </span>
                          <span className="status-pill bg-gray-100 text-gray-600 border-gray-200">{order.projectType}</span>
                          <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-200">#{order.orderNumber}</span>
                        </div>

                        {/* Customer */}
                        <h3 className="text-gray-800 font-black text-base">{order.customerName}</h3>
                        <div className="flex items-center gap-x-4 gap-y-1 mt-1.5 text-gray-500 text-xs flex-wrap">
                          <span>📱 {order.customerMobile}</span>
                          <span>📍 {order.district}</span>
                          {order.systemCapacityKw && <span className="text-amber-600 font-semibold">⚡ {order.systemCapacityKw} kW</span>}
                          {order.totalProjectValue > 0 && (
                            <span className="text-emerald-600 font-bold">₹{order.totalProjectValue?.toLocaleString('en-IN')}</span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stage Progress</span>
                            <span className="text-[10px] font-black text-blue-600">{stagePct}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${stagePct === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}
                              style={{ width: `${stagePct}%` }}
                            />
                          </div>
                          <p className="text-blue-600 text-xs font-semibold mt-1.5">📍 {order.stage || 'Not started'}</p>
                        </div>
                      </div>

                      {/* Expand Button */}
                      <button
                        onClick={() => setSelected(isExpanded ? null : order)}
                        className={`flex-shrink-0 p-2 rounded-xl border transition-all ${isExpanded ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-300'}`}>
                        <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Panel */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-5 space-y-4">
                      {/* Payment Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">90% Payment</p>
                          <p className="text-gray-800 text-base font-black">₹{order.payment90?.amount?.toLocaleString('en-IN') || 0}</p>
                          <span className={`text-xs font-bold ${order.payment90?.status === 'Released' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {order.payment90?.status || 'Pending'}
                          </span>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">10% Escrow</p>
                          <p className="text-gray-800 text-base font-black">₹{order.payment10?.amount?.toLocaleString('en-IN') || 0}</p>
                          <span className={`text-xs font-bold ${order.payment10?.status === 'Released' ? 'text-emerald-600' : 'text-orange-600'}`}>
                            {order.payment10?.status || 'Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="flex gap-4 flex-wrap">
                        {order.scheduledInstallDate && (
                          <span className="text-gray-600 text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-xl">
                            📅 Scheduled: {new Date(order.scheduledInstallDate).toLocaleDateString('en-IN')}
                          </span>
                        )}
                        {order.dueDateForCompletion && (
                          <span className={`text-xs px-3 py-1.5 rounded-xl border ${order.isOverdue ? 'bg-red-50 border-red-200 text-red-700 font-bold' : 'bg-white border-gray-200 text-gray-600'}`}>
                            ⏰ Due: {new Date(order.dueDateForCompletion).toLocaleDateString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => navigate(`/epc/orders/${order._id}`)}
                          className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5">
                          📄 View Full Details
                        </button>
                        {order.stage !== 'Project Closed' && (
                          <button onClick={() => advanceStage(order._id, order.stage)}
                            disabled={stageLoading}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:opacity-50 text-white text-xs font-black py-2.5 rounded-xl transition-all shadow-md shadow-blue-100">
                            {stageLoading ? '⏳ Updating...' : `→ Move to: ${stageSteps[stageIdx + 1] || '—'}`}
                          </button>
                        )}
                      </div>

                      {/* Customer Rating */}
                      {order.customerRating && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-xs font-medium">Customer Rating:</span>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <svg key={s} className={`w-4 h-4 ${s <= order.customerRating ? 'text-amber-400' : 'text-gray-200'}`}
                                fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default EpcOrders;