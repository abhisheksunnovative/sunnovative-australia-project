import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import epcApi from '../../../api/epcApi';

const stageSteps = ['Order Created', 'Installation Pending', 'Net Metering', 'PCR Reports', 'Completed'];

const statusColors = {
  New:       'bg-blue-50 text-blue-600 border-blue-200',
  Ongoing:   'bg-yellow-50 text-yellow-600 border-yellow-200',
  Overdue:   'bg-red-50 text-red-600 border-red-200',
  Completed: 'bg-green-50 text-green-600 border-green-200',
  Cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

const EpcOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [stageLoading, setStageLoading] = useState(false);
  const [msg, setMsg]             = useState({ text: '', type: '' });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Order not found</p>
        <button onClick={() => navigate('/epc/orders')}
          className="mt-3 text-blue-600 text-sm hover:underline">← Back to Orders</button>
      </div>
    );
  }

  const currentStageIdx = stageSteps.indexOf(order.stage);

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/epc/orders')}
          className="text-gray-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-gray-800 text-xl font-bold">Order Detail</h2>
          <p className="text-gray-400 text-xs font-mono">#{order.orderNumber}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <span className={`text-xs px-2.5 py-1 rounded border font-medium ${statusColors[order.status] || ''}`}>
            {order.status}
          </span>
        </div>
      </div>

      {msg.text && (
        <div className={`text-sm rounded-lg px-4 py-3 border ${
          msg.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>{msg.text}</div>
      )}

      {/* Stage progress */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-gray-700 text-sm font-semibold mb-4">Order Journey</h3>
        <div className="flex items-center gap-1 mb-4">
          {stageSteps.map((stage, i) => {
            const done   = i < currentStageIdx;
            const active = i === currentStageIdx;
            return (
              <div key={stage} className="flex-1 flex flex-col items-center gap-1.5">
                <div className={`h-2 w-full rounded-full ${done ? 'bg-blue-500' : active ? 'bg-blue-300' : 'bg-gray-100'}`} />
                <span className={`text-xs text-center leading-tight ${
                  active ? 'text-blue-600 font-semibold' : done ? 'text-gray-400' : 'text-gray-300'
                }`}>{stage}</span>
              </div>
            );
          })}
        </div>

        {order.stage !== 'Completed' && (
          <button onClick={advanceStage} disabled={stageLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
            {stageLoading ? 'Updating...' : `→ Move to: ${stageSteps[currentStageIdx + 1]}`}
          </button>
        )}
        {order.stage === 'Completed' && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-center">
            <span className="text-green-700 text-sm font-medium">✅ Order Completed</span>
          </div>
        )}
      </div>

      {/* Customer + Order Info */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-gray-700 text-sm font-semibold mb-3">Customer Info</h3>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-sm">
                  {order.customerName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-gray-800 font-semibold text-sm">{order.customerName}</p>
                <p className="text-gray-500 text-xs">{order.customerMobile}</p>
              </div>
            </div>
            {order.customerEmail && <p className="text-gray-500 text-xs">📧 {order.customerEmail}</p>}
            <p className="text-gray-500 text-xs">📍 {order.district}{order.city ? `, ${order.city}` : ''}</p>
            {order.address && <p className="text-gray-500 text-xs">🏠 {order.address}</p>}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-gray-700 text-sm font-semibold mb-3">Order Info</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400 text-xs">Project Type</span>
              <span className="text-gray-700 text-xs font-medium">{order.projectType}</span>
            </div>
            {order.systemCapacityKw && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-xs">Capacity</span>
                <span className="text-gray-700 text-xs font-medium">{order.systemCapacityKw} kW</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400 text-xs">Order Status</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded border ${statusColors[order.status] || ''}`}>
                {order.status}
              </span>
            </div>
            {order.scheduledInstallDate && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-xs">Install Date</span>
                <span className="text-gray-700 text-xs font-medium">
                  {new Date(order.scheduledInstallDate).toLocaleDateString('en-IN')}
                </span>
              </div>
            )}
            {order.dueDateForCompletion && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-xs">Due Date</span>
                <span className={`text-xs font-medium ${order.isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                  {new Date(order.dueDateForCompletion).toLocaleDateString('en-IN')}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400 text-xs">Created</span>
              <span className="text-gray-700 text-xs">
                {new Date(order.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-gray-700 text-sm font-semibold mb-4">Payment Breakdown</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
            <span className="text-gray-600 text-sm">Total Project Value</span>
            <span className="text-gray-800 text-sm font-bold">₹{order.totalProjectValue?.toLocaleString('en-IN') || 0}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
            <div>
              <span className="text-gray-600 text-sm">90% Payment</span>
              <p className="text-gray-400 text-xs">Released when order received</p>
            </div>
            <div className="text-right">
              <p className="text-gray-800 text-sm font-semibold">₹{order.payment90?.amount?.toLocaleString('en-IN') || 0}</p>
              <span className={`text-xs font-medium ${order.payment90?.status === 'Released' ? 'text-green-600' : 'text-yellow-600'}`}>
                {order.payment90?.status || 'Pending'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <div>
              <span className="text-gray-600 text-sm">10% Escrow</span>
              <p className="text-gray-400 text-xs">Released after customer rating</p>
            </div>
            <div className="text-right">
              <p className="text-gray-800 text-sm font-semibold">₹{order.payment10?.amount?.toLocaleString('en-IN') || 0}</p>
              <span className={`text-xs font-medium ${order.payment10?.status === 'Released' ? 'text-green-600' : 'text-orange-600'}`}>
                {order.payment10?.status || 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Rating */}
      {order.customerRating && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-gray-700 text-sm font-semibold mb-3">Customer Rating</h3>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(s => (
                <svg key={s} className={`w-5 h-5 ${s <= order.customerRating ? 'text-yellow-400' : 'text-gray-200'}`}
                  fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <span className="text-gray-800 font-bold">{order.customerRating}/5</span>
          </div>
          {order.customerFeedback && (
            <p className="text-gray-600 text-sm mt-2 bg-gray-50 rounded-lg p-3 italic">
              "{order.customerFeedback}"
            </p>
          )}
        </div>
      )}

      {/* Quick link to project detail */}
      <button
        onClick={() => navigate(`/epc/projects/${order._id}`)}
        className="w-full bg-white border border-blue-200 text-blue-600 text-sm font-medium py-3 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        View Full Project Details & Upload Docs
      </button>
    </div>
  );
};

export default EpcOrderDetail;