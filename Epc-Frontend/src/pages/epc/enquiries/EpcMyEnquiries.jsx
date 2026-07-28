import { useEffect, useState } from 'react';
import { useEpcAuth } from '../../../context/EpcAuthContext';
import epcApi from '../../../api/epcApi';

const PROJECT_TYPES = [
  'Surya Ghar Yojana', 'Group Solar', 'Village Solar Campaign',
  'Commercial Solar', 'Residential Solar',
];

const ENQUIRY_TYPES = [
  {
    key: 'ECommerce',
    label: 'E Commerce Orders',
    desc: 'Website se direct orders',
    icon: (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>),
    colorClass: 'text-blue-600',
    bgActive: 'bg-blue-600 border-blue-600',
    bgInactive: 'bg-white border-blue-200 hover:border-blue-400',
    countBg: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    key: 'Bidding',
    label: 'Bidding Orders',
    desc: 'Project >10kW bid system',
    icon: (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>),
    colorClass: 'text-purple-600',
    bgActive: 'bg-purple-600 border-purple-600',
    bgInactive: 'bg-white border-purple-200 hover:border-purple-400',
    countBg: 'bg-purple-50 text-purple-600 border-purple-200',
  },
  {
    key: 'QuoteByEPC',
    label: 'Quote by EPC',
    desc: 'EPC ne customer ko quote diya',
    icon: (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>),
    colorClass: 'text-green-600',
    bgActive: 'bg-green-600 border-green-600',
    bgInactive: 'bg-white border-green-200 hover:border-green-400',
    countBg: 'bg-green-50 text-green-600 border-green-200',
  },
];

const statusColors = {
  Lead:                    'bg-gray-100 text-gray-600 border-gray-200',
  'Token Paid':            'bg-blue-50 text-blue-600 border-blue-200',
  'Order Generated':       'bg-indigo-50 text-indigo-600 border-indigo-200',
  'Open For EPC':          'bg-yellow-50 text-yellow-600 border-yellow-200',
  'Bid Running':           'bg-orange-50 text-orange-600 border-orange-200',
  'EPC Accepted':          'bg-green-50 text-green-600 border-green-200',
  'Customer Selected EPC': 'bg-teal-50 text-teal-600 border-teal-200',
  Converted:               'bg-green-50 text-green-700 border-green-300',
  Expired:                 'bg-gray-100 text-gray-400 border-gray-200',
  Rejected:                'bg-red-50 text-red-500 border-red-200',
  New:                     'bg-blue-50 text-blue-600 border-blue-200',
  Accepted:                'bg-yellow-50 text-yellow-600 border-yellow-200',
  CustomerPending:         'bg-orange-50 text-orange-600 border-orange-200',
};

const EpcMyEnquiries = () => {
  const { epc } = useEpcAuth();
  const [enquiries, setEnquiries]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [accepting, setAccepting]       = useState(null);
  const [confirmingDateFor, setConfirmingDateFor] = useState(null);
  const [installDate, setInstallDate]   = useState('');
  const [msg, setMsg]                   = useState('');
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
      if (selectedType) params.set('enquiryType', selectedType);
      if (filterType)   params.set('projectType', filterType);
      if (filterCountry) params.set('country', filterCountry);
      if (filterState)  params.set('state', filterState);
      if (filterDist)   params.set('district', filterDist);
      if (filterStatus) params.set('status', filterStatus);

      const { data } = await epcApi.get(`/api/epc/enquiries?${params}`);
      setEnquiries(data);

      // Counts update — sirf jab koi type filter nahi
      if (!selectedType) {
        const counts = { ECommerce: 0, Bidding: 0, QuoteByEPC: 0 };
        data.forEach(e => {
          if (e.enquiryType && counts[e.enquiryType] !== undefined) counts[e.enquiryType]++;
        });
        setTypeCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [selectedType, filterType, filterCountry, filterState, filterDist, filterStatus]);

  const handleAccept = async (enq) => {
    if (!window.confirm(`Accept this project? This will deduct ${enq.systemCapacityKw || 1} kW points from your wallet balance.`)) return;
    setAccepting(enq._id);
    try {
      await epcApi.put(`/api/epc/enquiries/${enq._id}/accept`);
      setMsg(`Enquiry accepted! Deducted ${enq.systemCapacityKw || 1} kW points. You must confirm installation date within 24 hours.`);
      load();
    } catch (error) {
      setMsg(error.response?.data?.message || 'Failed to accept');
    } finally {
      setAccepting(null);
      setTimeout(() => setMsg(''), 6000);
    }
  };

  const handleConfirmDate = async (id) => {
    if (!installDate) return alert('Please select a proposed installation date.');
    try {
      await epcApi.put(`/api/epc/enquiries/${id}/confirm-date`, { scheduledInstallDate: installDate });
      setMsg('Installation date proposed to customer!');
      setConfirmingDateFor(null);
      setInstallDate('');
      load();
    } catch (error) {
      setMsg(error.response?.data?.message || 'Failed to confirm date');
      setTimeout(() => setMsg(''), 4000);
    }
  };

  const clearAll = () => {
    setSelectedType('');
    setFilterType('');
    setFilterCountry('');
    setFilterState('');
    setFilterDist('');
    setFilterStatus('');
  };

  const inputCls = 'bg-white border border-gray-300 text-gray-700 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-800 text-xl font-bold">My Enquiries</h2>
          <p className="text-gray-500 text-sm mt-0.5">Project-wise leads in your active districts</p>
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

      {/* ── 3 Type Cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {ENQUIRY_TYPES.map(type => {
          const isActive = selectedType === type.key;
          return (
            <button key={type.key}
              onClick={() => setSelectedType(isActive ? '' : type.key)}
              className={`rounded-xl p-5 border-2 text-left transition-all hover:shadow-md ${isActive ? type.bgActive : type.bgInactive}`}>
              <div className={`mb-3 ${isActive ? 'text-white' : type.colorClass}`}>{type.icon}</div>
              <p className={`text-sm font-bold mb-0.5 ${isActive ? 'text-white' : 'text-gray-800'}`}>{type.label}</p>
              <p className={`text-xs mb-3 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>{type.desc}</p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isActive ? 'bg-white/20 text-white border-white/20' : type.countBg
              }`}>
                {typeCounts[type.key]} enquiries
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-gray-500 text-xs mb-1">Project Type</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className={inputCls}>
              <option value="">All Types</option>
              {PROJECT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-500 text-xs mb-1">Country</label>
            <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} className={inputCls}>
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
            <select value={filterDist} onChange={e => setFilterDist(e.target.value)} className={inputCls}>
              <option value="">All Districts</option>
              {(epc?.activeDistricts || []).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-500 text-xs mb-1">Status</label>
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
          {(filterType || filterCountry || filterState || filterDist || filterStatus || selectedType) && (
            <button onClick={clearAll} className="text-xs text-red-500 border border-red-200 bg-red-50 px-3 py-2 rounded-lg">
              Clear All
            </button>
          )}
          <span className="text-gray-400 text-xs ml-auto self-end pb-2">{enquiries.length} enquiries</span>
        </div>
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading enquiries...</div>
      ) : enquiries.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">No enquiries found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map(enq => (
            <div key={enq._id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${statusColors[enq.status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                      {enq.status}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                      {enq.projectType}
                    </span>
                    {enq.enquiryType && (
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${
                        enq.enquiryType === 'ECommerce'  ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        enq.enquiryType === 'Bidding'    ? 'bg-purple-50 text-purple-600 border-purple-200' :
                        'bg-green-50 text-green-600 border-green-200'
                      }`}>
                        {enq.enquiryType === 'ECommerce' ? 'E Commerce' :
                         enq.enquiryType === 'Bidding'   ? 'Bidding' : 'Quote by EPC'}
                      </span>
                    )}
                    {enq.orderNumber && <span className="text-xs text-gray-400 font-mono">#{enq.orderNumber}</span>}
                  </div>
                  <h3 className="text-gray-800 font-semibold">{enq.customerName}</h3>
                  <div className="flex items-center gap-4 mt-1 text-gray-500 text-xs flex-wrap">
                    <span>📱 {enq.customerMobile}</span>
                    <span>📍 {enq.district}{enq.city ? `, ${enq.city}` : ''}</span>
                    {enq.systemCapacityKw && <span>⚡ {enq.systemCapacityKw} kW</span>}
                    <span>🕒 {new Date(enq.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  {enq.customerSelectionDeadline && ['EPC Accepted', 'Accepted'].includes(enq.status) && (
                    <div className="mt-2 space-y-2">
                      <p className="text-orange-600 text-xs bg-orange-50 px-2 py-1 rounded inline-block">
                        ⏳ Please propose installation date and upload KYC documents before: {new Date(enq.customerSelectionDeadline).toLocaleString('en-IN')}
                      </p>
                      {confirmingDateFor === enq._id ? (
                        <div className="flex flex-col gap-3 mt-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <h4 className="text-gray-800 text-sm font-semibold mb-1">Confirm Installation Details</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-gray-500 text-xs mb-1">Proposed Install Date</label>
                              <input type="date" value={installDate} onChange={(e) => setInstallDate(e.target.value)} className={`${inputCls} w-full`} min={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div>
                              <label className="block text-gray-500 text-xs mb-1">Upload Customer KYC (PDF/JPG)</label>
                              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 bg-white border border-gray-200 rounded-lg p-1" />
                            </div>
                            <div>
                              <label className="block text-gray-500 text-xs mb-1">MNRE Registration Letter (PDF)</label>
                              <input type="file" accept=".pdf" className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 bg-white border border-gray-200 rounded-lg p-1" />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                            <button onClick={() => handleConfirmDate(enq._id)} className="bg-green-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-green-700 font-medium">Confirm & Submit Docs</button>
                            <button onClick={() => {setConfirmingDateFor(null); setInstallDate('');}} className="text-gray-500 text-xs px-3 py-2 rounded-lg hover:bg-gray-100">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <button onClick={() => setConfirmingDateFor(enq._id)} className="bg-orange-100 text-orange-700 text-xs font-medium px-4 py-1.5 rounded-lg border border-orange-200 hover:bg-orange-200 transition-colors">
                            Propose Install Date & Upload Docs
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {['Open For EPC', 'Bid Running', 'New'].includes(enq.status) && (
                  <button onClick={() => handleAccept(enq)} disabled={accepting === enq._id}
                    className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
                    {accepting === enq._id ? 'Accepting...' : 'Accept Order'}
                  </button>
                )}
                {enq.status === 'Converted' && (
                  <span className="flex-shrink-0 text-xs text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Order Created
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EpcMyEnquiries;