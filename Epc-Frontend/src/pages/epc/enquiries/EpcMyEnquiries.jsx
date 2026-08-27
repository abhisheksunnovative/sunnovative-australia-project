import { useEffect, useState } from 'react';
import { useEpcAuth } from '../../../context/EpcAuthContext';
import { useCountry } from '../../../context/CountryContext';
import epcApi from '../../../api/epcApi';

const PROJECT_TYPES = [
  'Surya Ghar Yojana', 'Group Solar', 'Village Solar Campaign',
  'Commercial Solar', 'Residential Solar',
];

const ENQUIRY_TYPES = [
  {
    key: 'ECommerce', label: 'E Commerce', desc: 'Direct website orders',
    icon: '🛒', grad: 'from-blue-500 to-blue-700', light: 'bg-blue-50 border-blue-200',
    activeCls: 'bg-gradient-to-br from-blue-500 to-blue-700 text-white border-transparent shadow-lg shadow-blue-200',
    inactiveCls: 'bg-white border-blue-200 hover:border-blue-400 text-blue-700',
  },
  {
    key: 'Bidding', label: 'Bidding', desc: 'Projects >10kW bid system',
    icon: '📊', grad: 'from-purple-500 to-purple-700', light: 'bg-purple-50 border-purple-200',
    activeCls: 'bg-gradient-to-br from-purple-500 to-purple-700 text-white border-transparent shadow-lg shadow-purple-200',
    inactiveCls: 'bg-white border-purple-200 hover:border-purple-400 text-purple-700',
  },
  {
    key: 'QuoteByEPC', label: 'Quote by EPC', desc: 'EPC quoted to customer',
    icon: '📋', grad: 'from-emerald-500 to-emerald-700', light: 'bg-emerald-50 border-emerald-200',
    activeCls: 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-transparent shadow-lg shadow-emerald-200',
    inactiveCls: 'bg-white border-emerald-200 hover:border-emerald-400 text-emerald-700',
  },
];

const statusConfig = {
  Lead:                    { cls: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' },
  'Token Paid':            { cls: 'bg-blue-50 text-blue-700 border-blue-200',  dot: 'bg-blue-500' },
  'Order Generated':       { cls: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  'Open For EPC':          { cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'Bid Running':           { cls: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  'EPC Accepted':          { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Customer Selected EPC': { cls: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-500' },
  Converted:               { cls: 'bg-green-50 text-green-800 border-green-300', dot: 'bg-green-600' },
  Expired:                 { cls: 'bg-gray-100 text-gray-400 border-gray-200', dot: 'bg-gray-300' },
  Rejected:                { cls: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-500' },
  New:                     { cls: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  Accepted:                { cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
};

const EpcMyEnquiries = () => {
  const { epc, logout }                 = useEpcAuth();
  const { getStates, locationsLoading } = useCountry();
  const [enquiries, setEnquiries]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [accepting, setAccepting]       = useState(null);
  const [confirmingDateFor, setConfirmingDateFor] = useState(null);
  const [installDate, setInstallDate]   = useState('');
  const [msg, setMsg]                   = useState('');
  const [msgType, setMsgType]           = useState('info');
  const [selectedType, setSelectedType] = useState('');
  const [typeCounts, setTypeCounts]     = useState({ ECommerce: 0, Bidding: 0, QuoteByEPC: 0 });
  const [filterType, setFilterType]     = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterState, setFilterState]     = useState('');
  const [filterDist, setFilterDist]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType)  params.set('enquiryType', selectedType);
      if (filterType)    params.set('projectType', filterType);
      if (filterCountry) params.set('country', filterCountry);
      if (filterState)   params.set('state', filterState);
      if (filterDist)    params.set('district', filterDist);
      if (filterStatus)  params.set('status', filterStatus);

      const [enqRes, ordRes] = await Promise.all([
        epcApi.get(`/api/epc/enquiries?${params}`),
        epcApi.get(`/api/epc/orders?status=lead`)
      ]);
      const mappedOrders = (ordRes.data.orders || ordRes.data).map(o => ({
        ...o,
        isOrderMode: true,
        projectValue: o.totalProjectCost,
        systemCapacityKw: o.systemSizeKW,
        location: o.location || { city: o.city, state: o.state }
      }));
      const data = [...enqRes.data, ...mappedOrders].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      setEnquiries(data);
      if (!selectedType) {
        const counts = { ECommerce: 0, Bidding: 0, QuoteByEPC: 0 };
        data.forEach(e => { if (e.enquiryType && counts[e.enquiryType] !== undefined) counts[e.enquiryType]++; });
        setTypeCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [selectedType, filterType, filterCountry, filterState, filterDist, filterStatus]);

  const handleAccept = async (enq) => {
    if (!window.confirm(`Accept this project? This will deduct ${enq.systemCapacityKw || 1} kW points from your wallet.`)) return;
    setAccepting(enq._id);
    try {
      await epcApi.put(`/api/epc/enquiries/${enq._id}/accept`);
      setMsg(`✅ Enquiry accepted! Confirm installation date within 24 hours.`);
      setMsgType('success');
      window.dispatchEvent(new Event('walletUpdated'));
      load();
    } catch (error) {
      setMsg(error.response?.data?.message || 'Failed to accept');
      setMsgType('error');
    } finally {
      setAccepting(null);
      setTimeout(() => setMsg(''), 6000);
    }
  };

  const handleConfirmDate = async (id) => {
    if (!installDate) return alert('Please select a proposed installation date.');
    try {
      await epcApi.put(`/api/epc/enquiries/${id}/confirm-date`, { scheduledInstallDate: installDate });
      setMsg(`📅 Date confirmed. Waiting for customer approval.`);
      setMsgType('success');
      load();
    } catch (error) {
      setMsg(error.response?.data?.message || 'Failed to confirm date');
      setMsgType('error');
    } finally {
      setConfirmingDateFor(null);
      setTimeout(() => setMsg(''), 6000);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    if (!window.confirm(`Accept this order and move it to Orders?`)) return;
    setAccepting(orderId);
    try {
      // Set status to processing, and stage to Registration Started
      await epcApi.put(`/api/epc/orders/${orderId}/stage`, { stage: 'Registration Started' });
      setMsg(`✅ Order accepted! Moved to Orders tab.`);
      setMsgType('success');
      load();
    } catch (error) {
      setMsg(error.response?.data?.message || 'Failed to accept order');
      setMsgType('error');
    } finally {
      setAccepting(null);
      setTimeout(() => setMsg(''), 6000);
    }
  };

  const clearAll = () => { setSelectedType(''); setFilterType(''); setFilterCountry(''); setFilterState(''); setFilterDist(''); setFilterStatus(''); };
  const hasFilters = filterType || filterCountry || filterState || filterDist || filterStatus || selectedType;
  const unacceptedCount = enquiries.filter(e => ['Open For EPC', 'Bid Running', 'New'].includes(e.status)).length;

  const inputCls = 'bg-white border border-gray-200 text-gray-700 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all';

  return (
    <div className="space-y-6">

      {/* ── PAGE HEADER ── */}
      <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white text-2xl font-black tracking-tight">My Enquiries</h2>
          <p className="text-slate-400 text-sm mt-1">Solar leads in your active districts</p>
        </div>
        <div className="flex items-center gap-3">
          {unacceptedCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 text-amber-300 px-3 py-1.5 rounded-full text-xs font-bold animate-pulse-slow">
              🔔 {unacceptedCount} awaiting acceptance
            </div>
          )}
          <button onClick={load} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors" title="Refresh">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── TOAST MESSAGE ── */}
      {msg && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${
          msgType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : msgType === 'error' ? 'bg-red-50 border-red-200 text-red-700'
          : 'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="ml-auto text-current opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      {/* ── ENQUIRY TYPE CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {ENQUIRY_TYPES.map(type => {
          const isActive = selectedType === type.key;
          return (
            <button key={type.key}
              onClick={() => setSelectedType(isActive ? '' : type.key)}
              className={`rounded-2xl p-5 border-2 text-left transition-all duration-300 hover:-translate-y-0.5 ${isActive ? type.activeCls : type.inactiveCls}`}>
              <div className="text-3xl mb-3">{type.icon}</div>
              <p className={`text-sm font-black mb-0.5 ${isActive ? 'text-white' : 'text-gray-800'}`}>{type.label}</p>
              <p className={`text-xs mb-3 ${isActive ? 'text-white/70' : 'text-gray-500'}`}>{type.desc}</p>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-current/10 text-current'}`}>
                {typeCounts[type.key]} leads
              </span>
            </button>
          );
        })}
      </div>

      {/* ── FILTERS ── */}
      <div className="filter-bar">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filters</p>
          {hasFilters && (
            <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1">
              ✕ Clear All
            </button>
          )}
        </div>
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-gray-400 text-xs mb-1 font-medium">Project Type</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className={inputCls}>
              <option value="">All Types</option>
              {PROJECT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1 font-medium">Country</label>
            <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} className={inputCls}>
              <option value="">All Countries</option>
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
            <select value={filterDist} onChange={e => setFilterDist(e.target.value)} className={inputCls}>
              <option value="">All Districts</option>
              {(epc?.activeDistricts || []).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1 font-medium">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={inputCls}>
              <option value="">All Status</option>
              <option value="Open For EPC">Open For EPC</option>
              <option value="Bid Running">Bid Running</option>
              <option value="EPC Accepted">EPC Accepted</option>
              <option value="Customer Selected EPC">Customer Selected EPC</option>
              <option value="Converted">Converted</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          <span className="text-gray-400 text-xs ml-auto font-medium">{enquiries.length} results</span>
        </div>
      </div>

      {/* ── LIST ── */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="skeleton h-28" />
            </div>
          ))}
        </div>
      ) : enquiries.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-premium">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-gray-700 font-bold text-lg mb-1">No Enquiries Found</h3>
          <p className="text-gray-400 text-sm">Try adjusting your filters or check back later</p>
          {hasFilters && (
            <button onClick={clearAll} className="mt-4 text-blue-600 text-sm font-semibold hover:underline">Clear all filters</button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map(enq => {
            const sc = statusConfig[enq.status] || { cls: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400' };
            const isNew = ['Open For EPC', 'Bid Running', 'New'].includes(enq.status);
            return (
              <div key={enq._id}
                className={`card-row overflow-hidden ${isNew ? 'border-amber-300 shadow-amber-50' : ''}`}>
                {isNew && (
                  <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black px-4 py-1.5 flex items-center gap-2">
                    <span className="animate-pulse">●</span> NEW LEAD — Accept before it expires!
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Status + Tags */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className={`status-pill ${sc.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} mr-1.5 shrink-0`}></span>
                          {enq.status}
                        </span>
                        <span className="status-pill bg-gray-100 text-gray-600 border-gray-200">{enq.projectType}</span>
                        {enq.enquiryType && (
                          <span className={`status-pill ${
                            enq.enquiryType === 'ECommerce'  ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            enq.enquiryType === 'Bidding'    ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {enq.enquiryType === 'ECommerce' ? '🛒 E-Commerce' : enq.enquiryType === 'Bidding' ? '📊 Bidding' : '📋 Quote'}
                          </span>
                        )}
                        {enq.orderNumber && <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-200">#{enq.orderNumber}</span>}
                      </div>

                      {/* Customer Info */}
                      <h3 className="text-gray-800 font-black text-base">{enq.customerName}</h3>
                      <div className="flex items-center gap-x-4 gap-y-1 mt-1.5 text-gray-500 text-xs flex-wrap">
                        <span className="flex items-center gap-1">📱 {enq.customerMobile}</span>
                        <span className="flex items-center gap-1">📍 {enq.district}{enq.city ? `, ${enq.city}` : ''}</span>
                        {enq.systemCapacityKw && <span className="flex items-center gap-1 text-amber-600 font-semibold">⚡ {enq.systemCapacityKw} kW</span>}
                        <span className="flex items-center gap-1">🗓️ {new Date(enq.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>

                      {/* Date confirmation flow */}
                      {enq.customerSelectionDeadline && ['EPC Accepted', 'Accepted'].includes(enq.status) && (
                        <div className="mt-3 space-y-3">
                          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 px-3 py-2 rounded-xl text-xs font-medium">
                            ⏳ Propose install date before: <strong>{new Date(enq.customerSelectionDeadline).toLocaleString('en-IN')}</strong>
                          </div>
                          {confirmingDateFor === enq._id ? (
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                              <h4 className="text-gray-800 text-sm font-bold">Confirm Installation Details</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <label className="text-gray-500 text-xs font-medium">Proposed Install Date</label>
                                    {enq.preferredInstallDate && installDate === new Date(new Date(enq.preferredInstallDate).getTime() - new Date(enq.preferredInstallDate).getTimezoneOffset() * 60000).toISOString().split('T')[0] && (
                                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">
                                        ✨ Customer Preferred
                                      </span>
                                    )}
                                  </div>
                                  <input type="date" value={installDate} onChange={e => setInstallDate(e.target.value)}
                                    className={`${inputCls} w-full ${enquiries.some(e => e._id !== enq._id && !['Rejected', 'Expired'].includes(e.status) && (e.scheduledInstallDate?.split('T')[0] === installDate || e.preferredInstallDate?.split('T')[0] === installDate)) ? 'border-red-500 focus:ring-red-500 bg-red-50' : ''}`} min={new Date().toISOString().split('T')[0]} />
                                  {enquiries.some(e => e._id !== enq._id && !['Rejected', 'Expired'].includes(e.status) && (e.scheduledInstallDate?.split('T')[0] === installDate || e.preferredInstallDate?.split('T')[0] === installDate)) && (
                                    <p className="text-[10px] text-red-600 font-bold mt-1 bg-red-50 px-1 py-0.5 rounded border border-red-200">
                                      ⚠️ Change the date, you already have an order on this date!
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-gray-500 text-xs mb-1 font-medium">Customer KYC (PDF/JPG)</label>
                                  <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                                    className="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 bg-white border border-gray-200 rounded-xl p-1" />
                                </div>
                              </div>
                              <div className="flex items-center gap-2 pt-1">
                                <button onClick={() => handleConfirmDate(enq._id)}
                                  className="flex-1 bg-emerald-600 text-white text-xs px-4 py-2.5 rounded-xl hover:bg-emerald-700 font-bold transition-colors">
                                  ✔ Confirm & Submit
                                </button>
                                <button onClick={() => { setConfirmingDateFor(null); setInstallDate(''); }}
                                  className="px-4 py-2.5 text-gray-500 text-xs rounded-xl hover:bg-gray-100 border border-gray-200 font-medium transition-colors">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => {
                              setConfirmingDateFor(enq._id);
                              if (enq.preferredInstallDate) {
                                setInstallDate(new Date(new Date(enq.preferredInstallDate).getTime() - new Date(enq.preferredInstallDate).getTimezoneOffset() * 60000).toISOString().split('T')[0]);
                              }
                            }}
                              className="bg-orange-50 border border-orange-300 text-orange-700 text-xs font-bold px-4 py-2 rounded-xl hover:bg-orange-100 transition-colors flex items-center gap-2">
                              📅 Propose Install Date & Upload Docs
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0 flex flex-col gap-2">
                      {isNew && !enq.isOrderMode && (
                        <button onClick={() => handleAccept(enq)} disabled={accepting === enq._id}
                          className="bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:opacity-50 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-200 hover:shadow-blue-300 hover:scale-105 active:scale-95">
                          {accepting === enq._id ? (
                            <span className="flex items-center gap-1.5"><span className="animate-spin">⏳</span> Accepting...</span>
                          ) : '✔ Accept Lead'}
                        </button>
                      )}
                      
                      {enq.isOrderMode && (
                        <button onClick={() => handleAcceptOrder(enq._id)} disabled={accepting === enq._id}
                          className="bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:opacity-50 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-200 hover:shadow-blue-300 hover:scale-105 active:scale-95">
                          {accepting === enq._id ? (
                            <span className="flex items-center gap-1.5"><span className="animate-spin">⏳</span> Moving...</span>
                          ) : '→ Move to Order Created'}
                        </button>
                      )}

                      {enq.status === 'Converted' && !enq.isOrderMode && (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                          ✅ Order Created
                        </span>
                      )}
                    </div>
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

export default EpcMyEnquiries;