import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import epcApi from '../../../api/epcApi';

const stageSteps = ['Order Created', 'Installation Pending', 'Net Metering', 'PCR Reports', 'Completed'];

const statusColors = {
  New:       'bg-blue-50 text-blue-600 border-blue-200',
  Ongoing:   'bg-amber-50 text-amber-600 border-amber-200',
  Overdue:   'bg-red-50 text-red-600 border-red-200',
  Completed: 'bg-green-50 text-green-600 border-green-200',
  Cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

const InfoRow = ({ label, value, accent }) => (
  <div className="flex items-start justify-between gap-3 py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-gray-400 text-xs shrink-0">{label}</span>
    <span className={`text-xs font-semibold text-right ${accent || 'text-gray-700'}`}>{value}</span>
  </div>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-100 rounded-2xl shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ title, icon }) => (
  <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b border-gray-50">
    {icon && <span className="text-base">{icon}</span>}
    <h3 className="text-gray-800 text-sm font-bold tracking-tight">{title}</h3>
  </div>
);

const EpcOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [stageLoading, setStageLoading] = useState(false);
  const [msg, setMsg]             = useState({ text: '', type: '' });

  // Date negotiation states
  const [epcStatus, setEpcStatus] = useState('accepted');
  const [epcNote, setEpcNote] = useState('');
  const [epcAlternateDate, setEpcAlternateDate] = useState('');
  const [isSubmittingDate, setIsSubmittingDate] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await epcApi.get(`/api/epc/orders/${id}`);
      setOrder(data);
    } catch (error) {
      console.error('Order detail fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const advanceStage = async () => {
    const idx = stageSteps.indexOf(order.stage);
    if (idx >= stageSteps.length - 1) return;
    const nextStage = stageSteps[idx + 1];
    if (!window.confirm(`Move order to "${nextStage}"?`)) return;
    setStageLoading(true);
    try {
      await epcApi.put(`/api/epc/orders/${id}/stage`, { stage: nextStage });
      setMsg({ text: `Stage updated to: ${nextStage}`, type: 'success' });
      load();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Failed', type: 'error' });
    } finally {
      setStageLoading(false);
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    }
  };

  const handleRespondDate = async () => {
    setIsSubmittingDate(true);
    try {
      await epcApi.post(`/api/project-orders/${id}/install-date/respond`, {
        role: 'epc',
        status: epcStatus,
        note: epcNote,
        alternateDate: epcStatus === 'rejected' ? epcAlternateDate : null
      });
      setMsg({ text: 'Response sent successfully!', type: 'success' });
      load();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Failed to send response', type: 'error' });
    } finally {
      setIsSubmittingDate(false);
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-10 h-10 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 gap-3">
        <div className="text-4xl">📋</div>
        <p className="text-gray-500 font-semibold">Order not found</p>
        <button onClick={() => navigate('/epc/orders')}
          className="mt-1 text-blue-600 text-sm font-medium hover:underline">← Back to Orders</button>
      </div>
    );
  }

  const currentStageIdx = stageSteps.indexOf(order.stage);
  const negotiation = order.installDateNegotiation;
  const hasProposal = negotiation && negotiation.proposedDateByBde;

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-8 px-1">

      {/* ── Top Bar ── */}
      <div className="flex items-center gap-3 pt-1">
        <button onClick={() => navigate('/epc/orders')}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition-colors text-gray-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-gray-900 text-base font-bold leading-tight truncate">Order Detail</h2>
          <p className="text-gray-400 text-xs font-mono">#{order.orderNumber}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold shrink-0 ${statusColors[order.status] || ''}`}>
          {order.status}
        </span>
      </div>

      {/* ── Toast Message ── */}
      {msg.text && (
        <div className={`text-sm rounded-xl px-4 py-3 border font-medium flex items-center gap-2 ${
          msg.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span>{msg.type === 'success' ? '✅' : '❌'}</span>
          {msg.text}
        </div>
      )}

      {/* ── Installation Date Negotiation ── */}
      {hasProposal && (
        <Card className={order.isInstallDateFixed ? 'border-green-200' : 'border-blue-200'}>
          <CardHeader
            icon={order.isInstallDateFixed ? '✅' : '📅'}
            title={order.isInstallDateFixed ? 'Installation Date Confirmed' : 'Proposed Installation Date'}
          />
          <div className="px-4 pb-4 pt-3 space-y-3">
            {order.isInstallDateFixed ? (
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-xs text-green-700 font-bold uppercase tracking-wider mb-1">Final Date</p>
                <p className="text-xl font-black text-green-900">
                  {new Date(negotiation.finalInstallationDate || negotiation.proposedDateByBde).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-blue-500 font-semibold mb-0.5">BDE Proposed Date</p>
                  <p className="text-base font-black text-blue-900">
                    {new Date(negotiation.proposedDateByBde).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                {negotiation.epcStatus !== 'pending' ? (
                  <div className={`rounded-xl p-4 border text-sm ${
                    negotiation.epcStatus === 'accepted'
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-orange-50 border-orange-200 text-orange-800'
                  }`}>
                    <p className="font-bold mb-1">
                      {negotiation.epcStatus === 'accepted' ? '✅ You accepted this date' : '🔄 You suggested a new date'}
                    </p>
                    {negotiation.epcNote && (
                      <p className="text-xs opacity-80 mt-1">Note: "{negotiation.epcNote}"</p>
                    )}
                    {negotiation.epcProposedAlternateDate && (
                      <p className="text-xs font-semibold mt-1">
                        Alt Date: {new Date(negotiation.epcProposedAlternateDate).toLocaleDateString()}
                      </p>
                    )}
                    <p className="text-xs opacity-60 mt-2 font-medium">Awaiting BDE confirmation...</p>
                  </div>
                ) : (
                  <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Your Response</p>

                    {/* Radio Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { val: 'accepted', label: '✅ Accept Date', bg: 'bg-green-50 border-green-300 text-green-800' },
                        { val: 'rejected', label: '📅 Suggest New', bg: 'bg-orange-50 border-orange-300 text-orange-800' }
                      ].map(opt => (
                        <label key={opt.val} className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 cursor-pointer text-sm font-bold transition-all ${
                          epcStatus === opt.val ? opt.bg : 'bg-white border-gray-200 text-gray-500'
                        }`}>
                          <input type="radio" name="epcStatus" value={opt.val}
                            checked={epcStatus === opt.val}
                            onChange={() => setEpcStatus(opt.val)}
                            className="hidden" />
                          {opt.label}
                        </label>
                      ))}
                    </div>

                    {epcStatus === 'rejected' && (
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">Your Preferred Date</label>
                        <input
                          type="date"
                          value={epcAlternateDate}
                          onChange={e => setEpcAlternateDate(e.target.value)}
                          className="border border-gray-200 bg-white px-3 py-2.5 rounded-xl text-sm w-full focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Note <span className="font-normal text-gray-400">(optional)</span></label>
                      <input
                        type="text"
                        value={epcNote}
                        onChange={e => setEpcNote(e.target.value)}
                        placeholder="e.g. Need more time to source panels"
                        className="border border-gray-200 bg-white px-3 py-2.5 rounded-xl text-sm w-full focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <button
                      onClick={handleRespondDate}
                      disabled={isSubmittingDate || (epcStatus === 'rejected' && !epcAlternateDate)}
                      className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-all"
                    >
                      {isSubmittingDate ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </span>
                      ) : 'Send Response'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      )}

      {/* ── Order Journey ── */}
      <Card>
        <CardHeader icon="🗺️" title="Order Journey" />
        <div className="px-4 pb-4 pt-3 space-y-4">
          {/* Stage Track */}
          <div className="flex items-start gap-0">
            {stageSteps.map((stage, i) => {
              const done   = i < currentStageIdx;
              const active = i === currentStageIdx;
              return (
                <div key={stage} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex items-center">
                    {i > 0 && <div className={`h-0.5 flex-1 ${done ? 'bg-blue-500' : 'bg-gray-100'}`} />}
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs ${
                      done ? 'bg-blue-500 text-white' : active ? 'bg-blue-100 border-2 border-blue-500 text-blue-600' : 'bg-gray-100 text-gray-300'
                    }`}>
                      {done ? '✓' : i + 1}
                    </div>
                    {i < stageSteps.length - 1 && <div className={`h-0.5 flex-1 ${done ? 'bg-blue-500' : 'bg-gray-100'}`} />}
                  </div>
                  <span className={`text-[9px] text-center leading-tight px-0.5 ${
                    active ? 'text-blue-600 font-bold' : done ? 'text-gray-400' : 'text-gray-300'
                  }`}>{stage}</span>
                </div>
              );
            })}
          </div>

          {order.stage !== 'Completed' ? (
            <button onClick={advanceStage} disabled={stageLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white text-sm font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
              {stageLoading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Updating...</>
              ) : (
                <>→ Move to: {stageSteps[currentStageIdx + 1]}</>
              )}
            </button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
              <span className="text-green-700 text-sm font-bold">✅ Order Completed</span>
            </div>
          )}
        </div>
      </Card>

      {/* ── Customer + Order Info ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card>
          <CardHeader icon="👤" title="Customer Info" />
          <div className="px-4 pb-4 pt-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shrink-0">
                <span className="text-blue-700 font-black text-sm">{order.customerName?.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-gray-800 font-bold text-sm">{order.customerName}</p>
                <p className="text-gray-500 text-xs">{order.customerMobile}</p>
              </div>
            </div>
            {order.customerEmail && (
              <p className="text-gray-500 text-xs flex items-center gap-1.5">
                <span>📧</span>{order.customerEmail}
              </p>
            )}
            <p className="text-gray-500 text-xs flex items-center gap-1.5">
              <span>📍</span>{order.district}{order.city ? `, ${order.city}` : ''}
            </p>
            {order.address && (
              <p className="text-gray-500 text-xs flex items-start gap-1.5">
                <span>🏠</span><span>{order.address}</span>
              </p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader icon="📋" title="Order Info" />
          <div className="px-4 pb-4 pt-2">
            <InfoRow label="Project Type" value={order.projectType} />
            {order.systemCapacityKw && <InfoRow label="Capacity" value={`${order.systemCapacityKw} kW`} />}
            <InfoRow label="Status" value={order.status} />
            {order.scheduledInstallDate && (
              <InfoRow label="Install Date" value={new Date(order.scheduledInstallDate).toLocaleDateString('en-IN')} />
            )}
            {order.dueDateForCompletion && (
              <InfoRow
                label="Due Date"
                value={new Date(order.dueDateForCompletion).toLocaleDateString('en-IN')}
                accent={order.isOverdue ? 'text-red-600' : undefined}
              />
            )}
            <InfoRow label="Created" value={new Date(order.createdAt).toLocaleDateString('en-IN')} />
          </div>
        </Card>
      </div>

      {/* ── Payment Breakdown ── */}
      <Card>
        <CardHeader icon="💰" title="Payment Breakdown" />
        <div className="px-4 pb-4 pt-2">
          <InfoRow label="Total Project Value" value={`₹${order.totalProjectValue?.toLocaleString('en-IN') || 0}`} />
          <div className="flex items-start justify-between gap-3 py-2.5 border-b border-gray-50">
            <div>
              <p className="text-gray-500 text-xs">90% Payment</p>
              <p className="text-gray-400 text-[10px]">Released when order received</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-gray-800 text-xs font-bold">₹{order.payment90?.amount?.toLocaleString('en-IN') || 0}</p>
              <span className={`text-[10px] font-semibold ${order.payment90?.status === 'Released' ? 'text-green-600' : 'text-amber-600'}`}>
                {order.payment90?.status || 'Pending'}
              </span>
            </div>
          </div>
          <div className="flex items-start justify-between gap-3 py-2.5">
            <div>
              <p className="text-gray-500 text-xs">10% Escrow</p>
              <p className="text-gray-400 text-[10px]">Released after customer rating</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-gray-800 text-xs font-bold">₹{order.payment10?.amount?.toLocaleString('en-IN') || 0}</p>
              <span className={`text-[10px] font-semibold ${order.payment10?.status === 'Released' ? 'text-green-600' : 'text-orange-600'}`}>
                {order.payment10?.status || 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Customer Rating ── */}
      {order.customerRating && (
        <Card>
          <CardHeader icon="⭐" title="Customer Rating" />
          <div className="px-4 pb-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} className={`w-5 h-5 ${s <= order.customerRating ? 'text-yellow-400' : 'text-gray-100'}`}
                    fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <span className="text-gray-800 font-black text-sm">{order.customerRating}/5</span>
            </div>
            {order.customerFeedback && (
              <p className="text-gray-500 text-sm mt-3 bg-gray-50 rounded-xl p-3 italic border border-gray-100">
                "{order.customerFeedback}"
              </p>
            )}
          </div>
        </Card>
      )}

      {/* ── Project Detail Link ── */}
      <button
        onClick={() => navigate(`/epc/projects/${order._id}`)}
        className="w-full bg-white border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-50 active:scale-95 text-blue-600 text-sm font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        View Full Project & Upload Docs
      </button>
    </div>
  );
};

export default EpcOrderDetail;