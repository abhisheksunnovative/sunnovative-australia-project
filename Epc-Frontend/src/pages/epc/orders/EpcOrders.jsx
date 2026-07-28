import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEpcAuth } from '../../../context/EpcAuthContext';
import epcApi from '../../../api/epcApi';
import EpcOrdersCalendar from './EpcOrdersCalendar';

const PROJECT_TYPES = [
  'Surya Ghar Yojana', 'Group Solar', 'Village Solar Campaign',
  'Commercial Solar', 'Residential Solar',
];

const statusColors = {
  New:       'bg-blue-50 text-blue-600 border-blue-200',
  Ongoing:   'bg-yellow-50 text-yellow-600 border-yellow-200',
  Overdue:   'bg-red-50 text-red-600 border-red-200',
  Completed: 'bg-green-50 text-green-600 border-green-200',
  Cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

const stageSteps = [
  'Registration Started',
  'Material Delivered',
  'Installation In Progress',
  'Installation Completed',
  'QC Verification',
  '90% Payment Released',
  'Customer Approval',
  '10% Payment Released',
  'Project Closed',
];

const EpcOrders = () => {
  const { epc } = useEpcAuth();
  const navigate = useNavigate(); // Navigation ke liye hook
  const [searchParams] = useSearchParams();
  const defaultStatus = searchParams.get('status') || '';

  const [orders, setOrders]       = useState([]);
  const [summary, setSummary]     = useState({});
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [stageLoading, setStageLoading] = useState(false);
  const [msg, setMsg]             = useState('');
  const [viewMode, setViewMode]   = useState('list'); // 'list' or 'calendar'

  // Filters
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
    } finally {
      setLoading(false);
    }
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
      setMsg(`Stage updated to: ${nextStage}`);
      setSelected(data.order);
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to update stage');
    } finally {
      setStageLoading(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterProject('');
    setFilterCountry('');
    setFilterState('');
    setFilterDistrict('');
    setFilterCity('');
  };

  const inputCls = 'bg-white border border-gray-300 text-gray-700 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500';

  const statusTabs = [
    { key: '',          label: 'All',       count: summary.total || orders.length },
    { key: 'New',       label: 'New',       count: summary.new || 0 },
    { key: 'Ongoing',   label: 'Ongoing',   count: summary.ongoing || 0 },
    { key: 'Overdue',   label: 'Overdue',   count: summary.overdue || 0 },
    { key: 'Completed', label: 'Completed', count: summary.completed || 0 },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-800 text-xl font-bold">Orders</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            All project orders — track payments and stages
          </p>
        </div>
        <button onClick={load} className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {msg && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg px-4 py-3">{msg}</div>
      )}

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {statusTabs.map(t => (
          <button key={t.key} onClick={() => setFilterStatus(t.key)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
              filterStatus === t.key
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}>
            {t.label} ({t.count})
          </button>
        ))}
        
        <div className="ml-auto flex bg-gray-100 rounded-lg p-1">
          <button onClick={() => setViewMode('list')} className={`px-3 py-1 rounded text-xs font-medium ${viewMode === 'list' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>List</button>
          <button onClick={() => setViewMode('calendar')} className={`px-3 py-1 rounded text-xs font-medium ${viewMode === 'calendar' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>Calendar</button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-gray-500 text-xs mb-1">Project Type</label>
            <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
              className={inputCls}>
              <option value="">All Types</option>
              {PROJECT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-gray-500 text-xs mb-1">Country</label>
            <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
              className={inputCls}>
              <option value="">All Countries</option>
              <option value="India">India</option>
              <option value="Australia">Australia</option>
              <option value="New Zealand">New Zealand</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-500 text-xs mb-1">State</label>
            <input type="text" value={filterState} onChange={e => setFilterState(e.target.value)} placeholder="State" className={`${inputCls} w-24`} />
          </div>
          <div>
            <label className="block text-gray-500 text-xs mb-1">District</label>
            <select value={filterDistrict} onChange={e => { setFilterDistrict(e.target.value); setFilterCity(''); }}
              className={inputCls}>
              <option value="">All Districts</option>
              {(epc?.activeDistricts || []).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-500 text-xs mb-1">City/Area</label>
            <input type="text" value={filterCity} onChange={e => setFilterCity(e.target.value)} placeholder="City/Area" className={`${inputCls} w-24`} />
          </div>

          {(filterProject || filterCountry || filterState || filterDistrict || filterCity) && (
            <button onClick={clearFilters}
              className="text-xs text-red-500 border border-red-200 bg-red-50 px-3 py-2 rounded-lg transition-colors">
              Clear
            </button>
          )}

          <span className="text-gray-400 text-xs ml-auto self-end pb-2">
            {orders.length} orders
          </span>
        </div>
      </div>

      {viewMode === 'calendar' && (
        <EpcOrdersCalendar orders={orders} />
      )}

      {/* Orders list */}
      {viewMode === 'list' && (
        loading ? (
        <div className="text-center py-12 text-gray-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">No orders found</p>
          {(filterProject || filterCountry || filterState || filterDistrict || filterCity) && (
            <button onClick={clearFilters} className="mt-2 text-blue-500 text-sm hover:underline">Clear filters</button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order._id}
              className={`bg-white border rounded-xl overflow-hidden hover:shadow-sm transition-all ${order.isOverdue ? 'border-red-400 shadow-sm' : 'border-gray-200 hover:border-blue-300'}`}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${statusColors[order.status] || ''}`}>
                        {order.status}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                        {order.projectType}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">#{order.orderNumber}</span>
                    </div>
                    <h3 className="text-gray-800 font-semibold">{order.customerName}</h3>
                    <div className="flex items-center gap-4 mt-1 text-gray-500 text-xs flex-wrap">
                      <span>📱 {order.customerMobile}</span>
                      <span>📍 {order.district}</span>
                      {order.systemCapacityKw && <span>⚡ {order.systemCapacityKw} kW</span>}
                      {order.totalProjectValue > 0 && (
                        <span className="text-green-600 font-medium">
                          ₹{order.totalProjectValue?.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(selected?._id === order._id ? null : order)}
                    className="flex-shrink-0 text-gray-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                    <svg className={`w-4 h-4 transition-transform ${selected?._id === order._id ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Stage progress */}
                <div className="mt-4">
                  <div className="flex items-center gap-0.5">
                    {stageSteps.map((stage, i) => {
                      const currentIdx = stageSteps.indexOf(order.stage);
                      const done   = i < currentIdx;
                      const active = i === currentIdx;
                      return (
                        <div key={stage} className="flex-1 flex flex-col items-center gap-1">
                          <div className={`h-1.5 w-full rounded-full ${
                            done ? 'bg-blue-500' : active ? 'bg-blue-400' : 'bg-gray-200'
                          }`} />
                          <span className={`text-xs text-center leading-tight hidden lg:block ${
                            active ? 'text-blue-600 font-medium' : done ? 'text-gray-400' : 'text-gray-300'
                          }`} style={{ fontSize: '9px' }}>{stage}</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Current stage label for mobile */}
                  <p className="text-blue-600 text-xs font-medium mt-1 lg:hidden">
                    Stage: {order.stage}
                  </p>
                </div>
              </div>

              {/* Expanded detail (Dropdown Panel) */}
              {selected?._id === order._id && (
                <div className="border-t border-gray-100 p-5 space-y-4 bg-gray-50">
                  {/* Payment */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">90% Payment</p>
                      <p className="text-gray-800 text-sm font-semibold">
                        ₹{order.payment90?.amount?.toLocaleString('en-IN') || 0}
                      </p>
                      <span className={`text-xs font-medium ${
                        order.payment90?.status === 'Released' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {order.payment90?.status || 'Pending'}
                      </span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">10% Escrow</p>
                      <p className="text-gray-800 text-sm font-semibold">
                        ₹{order.payment10?.amount?.toLocaleString('en-IN') || 0}
                      </p>
                      <span className={`text-xs font-medium ${
                        order.payment10?.status === 'Released' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {order.payment10?.status || 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex gap-4 flex-wrap">
                    {order.scheduledInstallDate && (
                      <p className="text-gray-600 text-xs">
                        📅 Scheduled: {new Date(order.scheduledInstallDate).toLocaleDateString('en-IN')}
                      </p>
                    )}
                    {order.dueDateForCompletion && (
                      <p className={`text-xs ${order.isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                        ⏰ Due: {new Date(order.dueDateForCompletion).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>

                  {/* Operational Action Buttons Wrapper */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Naya View Full Details Button */}
                    <button
                      onClick={() => navigate(`/epc/orders/${order._id}`)}
                      className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold py-2.5 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1"
                    >
                      View Full Order Details →
                    </button>

                    {/* Advance stage button */}
                    {order.stage !== 'Project Closed' && (
                      <button onClick={() => advanceStage(order._id, order.stage)}
                        disabled={stageLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium py-2.5 rounded-lg transition-colors">
                        {stageLoading ? 'Updating...' : `→ Move to: ${stageSteps[stageSteps.indexOf(order.stage) + 1]}`}
                      </button>
                    )}
                  </div>

                  {/* Customer rating */}
                  {order.customerRating && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">Customer Rating:</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <svg key={s} className={`w-3.5 h-3.5 ${s <= order.customerRating ? 'text-yellow-400' : 'text-gray-200'}`}
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
          ))}
        </div>
      ))}
    </div>
  );
};

export default EpcOrders;