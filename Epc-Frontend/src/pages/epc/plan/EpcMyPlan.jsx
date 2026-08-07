import { useEffect, useState } from 'react';
import { useEpcAuth } from '../../../context/EpcAuthContext';
import epcApi from '../../../api/epcApi';
import TeamCapacityManager from './TeamCapacityManager';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const EpcMyPlan = () => {
  const { epc, updateEpcData } = useEpcAuth();
  const [plans, setPlans]     = useState([]);
  const [myPlan, setMyPlan]   = useState(null);
  const [demandStats, setDemandStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  
  // Transfer Modal State
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferKw, setTransferKw] = useState('');
  const [transferType, setTransferType] = useState('Surya Ghar Yojana');
  const [fromDistrict, setFromDistrict] = useState('');
  const [toDistrict, setToDistrict] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [transferMsg, setTransferMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const [plansRes, myRes, analyticsRes] = await Promise.all([
          epcApi.get('/api/epc/plans').catch(() => ({ data: [] })),
          epcApi.get('/api/epc/plans/my-plan').catch(() => ({ data: null })),
          epcApi.get('/api/epc/orders/demand-analytics').catch(() => ({ data: { data: [] } })),
        ]);
        setPlans(plansRes?.data || []);
        setMyPlan(myRes?.data || null);
        setDemandStats(analyticsRes.data?.data || []);
      } catch (error) {
        console.error('Plans fetch error:', error);
      } finally { setLoading(false); }
    };
    fetchPlans();
  }, []);

  const handleUpgrade = async (planName, billing) => {
    if (!window.confirm(`Upgrade to ${planName} (${billing})?`)) return;
    setUpgrading(planName + billing);
    try {
      // 1. Call backend to get order details or direct upgrade (if free)
      const { data } = await epcApi.post('/api/epc/plans/upgrade', {
        newPlan: planName, billingCycle: billing,
      });

      if (!data.requiresPayment) {
        setMsg({ text: data.message, type: 'success' });
        updateEpcData({ plan: data.plan });
        setUpgrading('');
        return;
      }

      // 2. Open Razorpay Checkout for paid plans
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Sunnovative EPC",
        description: `${planName} Plan (${billing})`,
        order_id: data.orderId,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyRes = await epcApi.post('/api/epc/plans/verify-upgrade', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              newPlan: data.newPlan,
              billingCycle: data.billingCycle
            });
            if (verifyRes.data.success) {
              setMsg({ text: `Payment successful! Upgraded to ${planName}!`, type: 'success' });
              updateEpcData({ plan: verifyRes.data.plan });
              window.location.reload(); // Refresh to pull all updated plan details
            } else {
              setMsg({ text: verifyRes.data.message || 'Verification failed', type: 'error' });
            }
          } catch (err) {
            console.error("Verification error:", err);
            setMsg({ text: err.response?.data?.message || 'Payment verification failed', type: 'error' });
          }
        },
        prefill: {
          name: epc?.companyName,
          email: epc?.email,
          contact: epc?.mobile,
        },
        theme: { color: "#3B82F6" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setMsg({ text: 'Payment failed. Please try again.', type: 'error' });
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      setMsg({ text: err.response?.data?.message || 'Upgrade request failed', type: 'error' });
    } finally {
      setUpgrading('');
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    }
  };

  const handleTransfer = async () => {
    setTransferMsg({ text: '', type: '' });
    if (!fromDistrict || !toDistrict || !transferKw || !transferType) {
      setTransferMsg({ text: 'Please fill all transfer fields', type: 'error' });
      return;
    }
    if (fromDistrict === toDistrict) {
      setTransferMsg({ text: 'Source and Destination districts must be different', type: 'error' });
      return;
    }
    setTransferring(true);
    try {
      const { data } = await epcApi.post('/api/epc/wallet/transfer', {
        fromDistrict,
        toDistrict,
        projectType: transferType,
        kwAmount: Number(transferKw)
      });
      setMsg({ text: data.message, type: 'success' });
      setShowTransfer(false);
      setTransferMsg({ text: '', type: '' });
      // Refresh analytics to show updated supply
      epcApi.get('/api/epc/orders/demand-analytics').then(res => setDemandStats(res.data.data));
    } catch (err) {
      setTransferMsg({ text: err.response?.data?.message || 'Transfer failed', type: 'error' });
    } finally {
      setTransferring(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  const planConfig = {
    Standard: {
      icon: '⭐',
      accent: 'border-gray-200',
      header: 'bg-gray-50',
      text:   'text-gray-700',
      btn:    'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300',
      ring:   '',
    },
    Professional: {
      icon: '🔷',
      accent: 'border-blue-200',
      header: 'bg-blue-50',
      text:   'text-blue-700',
      btn:    'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
      ring:   'ring-2 ring-blue-200',
    },
    Enterprise: {
      icon: '👑',
      accent: 'border-purple-200',
      header: 'bg-purple-50',
      text:   'text-purple-700',
      btn:    'bg-purple-600 hover:bg-purple-700 text-white border-purple-600',
      ring:   '',
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-800 text-xl font-bold">My Plan</h2>
        <p className="text-gray-500 text-sm mt-0.5">View and upgrade your EPC partner plan</p>
      </div>

      {msg.text && (
        <div className={`text-sm rounded-lg px-4 py-3 border ${
          msg.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>{msg.text}</div>
      )}

      {/* Current plan card */}
      {myPlan && (
        <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{planConfig[myPlan.currentPlan]?.icon}</span>
            <div>
              <p className="text-gray-800 font-bold text-lg">{myPlan.currentPlan} Plan</p>
              <p className="text-gray-400 text-xs">
                {myPlan.planExpiresAt
                  ? `Expires: ${new Date(myPlan.planExpiresAt).toLocaleDateString('en-IN')}`
                  : 'No expiry set'}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="text-yellow-600 text-sm font-semibold">{myPlan.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-gray-400 text-xs">({myPlan.totalRatings} ratings)</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(myPlan.activeDistricts || []).map(d => (
              <span key={d} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200">{d}</span>
            ))}
            {!myPlan.activeDistricts?.length && (
              <span className="text-gray-400 text-xs">No active districts yet — contact admin</span>
            )}
          </div>
        </div>
      )}

      {/* Demand Analytics Chart */}
      {myPlan && demandStats.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
          <div>
            <h3 className="text-gray-800 font-bold mb-1">Market Analytics & Transfer Suggestions</h3>
            <p className="text-sm text-gray-500 mb-4">Compare Demand (leads) vs Supply (EPC credits) in your Active Districts over the last 30 days.</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demandStats} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="district" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="demandKw" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Demand (KW)" />
                  <Bar dataKey="supplyKw" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Supply (KW)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-700">Transfer Suggestions</h4>
            {demandStats.map((stat, idx) => (
              <div key={idx} className={`p-3 rounded-lg border flex items-start gap-3 ${
                stat.status === 'high_demand' ? 'bg-green-50 border-green-200 text-green-800' : 
                stat.status === 'low_demand' ? 'bg-red-50 border-red-200 text-red-800' :
                'bg-gray-50 border-gray-200 text-gray-800'
              }`}>
                {stat.status === 'high_demand' ? (
                   <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                ) : stat.status === 'low_demand' ? (
                   <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                ) : (
                   <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
                <div>
                  <p className="font-bold text-sm">{stat.district}</p>
                  <p className="text-xs opacity-90">{stat.suggestion}</p>
                </div>
                {stat.status === 'high_demand' && (
                  <button onClick={() => { setToDistrict(stat.district); setFromDistrict(''); setShowTransfer(true); }} className="ml-auto bg-white border border-green-300 text-green-700 text-xs px-3 py-1.5 rounded hover:bg-green-100 transition">
                    Transfer Here
                  </button>
                )}
                {stat.status === 'low_demand' && (
                  <button onClick={() => { setFromDistrict(stat.district); setToDistrict(''); setShowTransfer(true); }} className="ml-auto bg-white border border-red-300 text-red-700 text-xs px-3 py-1.5 rounded hover:bg-red-100 transition">
                    Transfer Out
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="pt-2">
            <button onClick={() => setShowTransfer(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
              Transfer KW Between Districts
            </button>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowTransfer(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-1">Transfer KW Credits</h3>
            <p className="text-sm text-gray-500 mb-4">Move credits from one district to another to meet demand.</p>
            
            {transferMsg.text && (
              <div className={`mb-4 text-sm rounded-lg px-4 py-3 border ${
                transferMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
              }`}>{transferMsg.text}</div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Project Type</label>
                <select value={transferType} onChange={e => setTransferType(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 focus:bg-white">
                  {epc?.country === 'australia' ? (
                    <>
                      <option value="Residential Solar">Residential Solar</option>
                      <option value="Commercial Solar">Commercial Solar</option>
                      <option value="Off-Grid Solar">Off-Grid Solar</option>
                    </>
                  ) : (
                    <>
                      <option value="Surya Ghar Yojana">Surya Ghar Yojana</option>
                      <option value="Group Solar">Group Solar</option>
                      <option value="Commercial Solar">Commercial Solar</option>
                      <option value="Residential Solar">Residential Solar</option>
                    </>
                  )}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">From District</label>
                  <select value={fromDistrict} onChange={e => setFromDistrict(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 focus:bg-white">
                    <option value="">Select Source</option>
                    {(myPlan?.activeDistricts || []).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">To District</label>
                  <select value={toDistrict} onChange={e => setToDistrict(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 focus:bg-white">
                    <option value="">Select Target</option>
                    {(myPlan?.activeDistricts || []).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">KW Amount to Transfer</label>
                <input type="number" min="1" placeholder="e.g. 5" value={transferKw} onChange={e => setTransferKw(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 focus:bg-white" />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 mt-2">
                <strong>Note:</strong> Transfers will be blocked if the Target District already has sufficient supply to meet its current demand.
              </div>

              <button 
                onClick={handleTransfer} 
                disabled={transferring}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition shadow-sm disabled:opacity-50">
                {transferring ? 'Processing...' : 'Transfer Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan cards */}
      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading plans...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map(plan => {
            const cfg = planConfig[plan.name] || planConfig.Standard;
            const isCurrent = epc?.plan === plan.name;
            return (
              <div key={plan.name}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${cfg.accent} ${isCurrent ? cfg.ring : 'hover:shadow-md'}`}>
                <div className={`px-5 py-4 ${cfg.header}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cfg.icon}</span>
                    <div>
                      <p className={`font-bold text-base ${cfg.text}`}>{plan.name}</p>
                      <p className="text-gray-500 text-xs">{plan.loginScope} access</p>
                    </div>
                    {isCurrent && (
                      <span className="ml-auto text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">Current</span>
                    )}
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-gray-400 text-xs">Min Experience</p>
                      <p className="text-gray-700 text-sm font-semibold">{plan.minYearsExperience}+ yrs</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-gray-400 text-xs">Max Districts</p>
                      <p className="text-gray-700 text-sm font-semibold">{plan.maxDistricts}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5 col-span-2">
                      <p className="text-gray-400 text-xs">Orders/month</p>
                      <p className="text-gray-700 text-sm font-semibold">{plan.maxOrdersPerMonth}</p>
                    </div>
                  </div>

                  {plan.features?.length > 0 && (
                    <ul className="space-y-1.5">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-600 text-xs">
                          <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  {plan.monthlyFee > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-gray-400 text-xs mb-0.5">Pricing</p>
                      <p className="text-gray-800 text-sm font-bold">₹{plan.monthlyFee?.toLocaleString('en-IN')}/mo</p>
                      {plan.annualFee > 0 && (
                        <p className="text-gray-400 text-xs">₹{plan.annualFee?.toLocaleString('en-IN')}/yr</p>
                      )}
                    </div>
                  )}

                  {!isCurrent && (
                    <div className="flex flex-col gap-2 pt-1">
                      <button onClick={() => handleUpgrade(plan.name, 'Monthly')} disabled={!!upgrading}
                        className={`w-full text-xs font-medium py-2 rounded-lg border transition-colors disabled:opacity-50 ${cfg.btn}`}>
                        {upgrading === plan.name + 'Monthly' ? 'Upgrading...' : 'Monthly'}
                      </button>
                      {plan.annualFee > 0 && (
                        <button onClick={() => handleUpgrade(plan.name, 'Annual')} disabled={!!upgrading}
                          className={`w-full text-xs font-medium py-2 rounded-lg border transition-colors disabled:opacity-50 ${cfg.btn}`}>
                          {upgrading === plan.name + 'Annual' ? 'Upgrading...' : 'Annual (Save more)'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Team Capacity & Installer Upgrades Section */}
      <TeamCapacityManager myPlan={myPlan} />
    </div>
  );
};

export default EpcMyPlan;