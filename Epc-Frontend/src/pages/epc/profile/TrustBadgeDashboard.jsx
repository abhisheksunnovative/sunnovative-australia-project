import { useState, useEffect } from 'react';
import { useEpcAuth } from '../../../context/EpcAuthContext';
import epcApi from '../../../api/epcApi';
import { ShieldCheck, TrendingUp, Users, Target, CheckCircle2, AlertCircle, FileText, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const loadRazorpayScript = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const TrustBadgeDashboard = () => {
  const { epc, loadProfile, updateEpcData } = useEpcAuth();
  
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [msg, setMsg] = useState({ text: '', type: '' });
  
  const [showPurchase, setShowPurchase] = useState(false);
  const [purchaseLeads, setPurchaseLeads] = useState(10);
  const [purchaseState, setPurchaseState] = useState('');
  const [purchaseProjectType, setPurchaseProjectType] = useState('');
  const [projectTypes, setProjectTypes] = useState([]);
  const [purchasing, setPurchasing] = useState(false);
  const [undertakingAgreed, setUndertakingAgreed] = useState(false);

  const country = epc?.country?.toLowerCase() || 'india';
  const isAustralia = country === 'australia';
  // Determine routing logic based on country (or analytics if available)
  const routingType = 'Customer Select'; // As per user request, Australia is also Customer Select First
  const statesList = epc?.activeDistricts || [];

  useEffect(() => {
    fetchFreshProfile();
    fetchAnalytics();
    fetchProjectTypes();
  }, []);

  const fetchFreshProfile = async () => {
    try {
      const { data } = await epcApi.get('/api/epc/auth/profile');
      if (data && data.companyName) {
        if (typeof updateEpcData === 'function') {
          updateEpcData(data);
        } else if (epc && typeof epc === 'object') {
          epc.trustBadge = data.trustBadge;
        }
      }
    } catch (err) {
      console.error('Failed to fetch fresh profile', err);
    }
  };

  const fetchProjectTypes = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4005';
      const res = await fetch(`${API_BASE}/api/project-types?country=${country}`);
      const data = await res.json();
      
      if (data && data.success && Array.isArray(data.data)) {
        setProjectTypes(data.data);
        if (data.data.length > 0) {
          setPurchaseProjectType(data.data[0].projectType || data.data[0].projectTypeLabel || data.data[0].name || data.data[0]);
        }
      } else if (data && data.projectTypes) {
        setProjectTypes(data.projectTypes);
        if (data.projectTypes.length > 0) {
          setPurchaseProjectType(data.projectTypes[0].projectType || data.projectTypes[0].name || data.projectTypes[0]);
        }
      } else if (data && Array.isArray(data)) {
        setProjectTypes(data);
        if (data.length > 0) {
          setPurchaseProjectType(data[0].projectType || data[0].name || data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load project types:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await epcApi.get('/api/epc/auth/trust-badge/analytics');
      if (res.data?.success) {
        setAnalytics(res.data.analytics);
      }
    } catch (err) {
      console.error(err);
      // Don't show error toast on analytics fail, just silently handle
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const handlePurchase = async () => {
    if (!purchaseState) return showMsg('Please select a state first', 'error');
    if (!purchaseProjectType) return showMsg('Please select a project type', 'error');
    if (!purchaseLeads || purchaseLeads <= 0) return showMsg('Enter valid number of leads', 'error');
    
    if (routingType === 'FCFS' && !undertakingAgreed) {
      return showMsg('You must agree to the Trust Badge Undertaking to proceed', 'error');
    }

    setPurchasing(true);
    try {
      const { data: order } = await epcApi.post('/api/epc/auth/trust-badge/create-order', {
        numLeads: purchaseLeads,
        projectType: purchaseProjectType,
        state: purchaseState,
        country: country
      });

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showMsg('Could not load payment gateway. Check your internet connection.', 'error');
        setPurchasing(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY || order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'EmergeSun Trust Badge',
        description: `Purchase ${order.numLeads} Trust Badge Leads`,
        theme: { color: '#2563eb' },
        handler: async (response) => {
          try {
            const { data } = await epcApi.post('/api/epc/auth/trust-badge/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              numLeads: order.numLeads,
            });
            showMsg(data.message);
            setShowPurchase(false);
            setUndertakingAgreed(false);
            fetchAnalytics();
            loadProfile();
          } catch (err) {
            showMsg(err.response?.data?.message || 'Payment verification failed.', 'error');
          } finally {
            setPurchasing(false);
          }
        },
        modal: {
          ondismiss: () => setPurchasing(false),
        },
      });

      rzp.on('payment.failed', (resp) => {
        showMsg(resp.error?.description || 'Payment failed', 'error');
        setPurchasing(false);
      });

      rzp.open();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Could not create order', 'error');
      setPurchasing(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Trust Badge Data...</div>;
  }

  const purchasedCount = epc?.trustBadge?.purchasedLeads || 0;
  const consumedCount = epc?.trustBadge?.leadsConsumed || 0;
  const isApproved = epc?.trustBadge?.status === 'Approved' && (purchasedCount === 0 || consumedCount < purchasedCount);
  const isExhausted = epc?.trustBadge?.status === 'Approved' && purchasedCount > 0 && consumedCount >= purchasedCount;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {msg.text && (
        <div className={`p-4 rounded-xl border ${msg.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'} transition-all`}>
          {msg.text}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${isApproved ? 'bg-gradient-to-br from-green-400 to-emerald-600' : 'bg-white/10 backdrop-blur-md'}`}>
              <ShieldCheck className={`w-8 h-8 ${isApproved ? 'text-white' : 'text-blue-200'}`} />
            </div>
            <div>
              <h1 className="text-3xl font-black mb-1">Trust Badge</h1>
              <p className="text-blue-100/80 font-medium flex items-center gap-2">
                Status: {isApproved ? <span className="px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-300 text-sm border border-green-500/30">Active</span> : isExhausted ? <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-sm border border-amber-500/30">Exhausted</span> : <span className="px-2.5 py-0.5 rounded-full bg-slate-500/20 text-slate-300 text-sm border border-slate-500/30">{epc?.trustBadge?.status || 'None'}</span>}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowPurchase(true)}
            className="bg-white text-blue-900 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2"
          >
            <TrendingUp className="w-5 h-5" /> Buy More Leads
          </button>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Analytics Grid */}
      {isApproved && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <p className="text-slate-500 text-sm font-medium mb-1">Leads Consumed / Total</p>
              <h3 className="text-3xl font-black text-slate-800">{analytics.leadsConsumed || 0} <span className="text-lg text-slate-400">/ {analytics.purchasedLeads || 0}</span></h3>
              <div className="w-full bg-slate-100 h-2 mt-4 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(((analytics.leadsConsumed || 0)/(analytics.purchasedLeads || 1))*100, 100)}%`}}></div>
              </div>
            </div>

            {routingType === 'FCFS' ? (
              <>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Leads Arrived Early</p>
                  <h3 className="text-3xl font-black text-slate-800">{analytics.arrivedAfter || analytics.leadsArrivedEarly || 0}</h3>
                  {analytics.arrivedBefore !== undefined && (
                    <p className="text-emerald-600 text-xs font-bold mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +{Math.round(((analytics.arrivedAfter - analytics.arrivedBefore) / Math.max(analytics.arrivedBefore, 1)) * 100)}% vs Before Badge
                    </p>
                  )}
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Leads Converted</p>
                  <h3 className="text-3xl font-black text-slate-800">{analytics.convertedAfter || analytics.leadsConverted || 0}</h3>
                  {analytics.convertedBefore !== undefined && (
                    <p className="text-emerald-600 text-xs font-bold mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +{Math.round(((analytics.convertedAfter - analytics.convertedBefore) / Math.max(analytics.convertedBefore, 1)) * 100)}% vs Before Badge
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Profile Views</p>
                  <h3 className="text-3xl font-black text-slate-800">{analytics.profileViewsAfter || analytics.profileViews || 0}</h3>
                  {analytics.profileViewsBefore !== undefined && (
                    <p className="text-emerald-600 text-xs font-bold mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +{Math.round(((analytics.profileViewsAfter - analytics.profileViewsBefore) / Math.max(analytics.profileViewsBefore, 1)) * 100)}% vs Before Badge
                    </p>
                  )}
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Customers Selected You</p>
                  <h3 className="text-3xl font-black text-slate-800">{analytics.customersSelectedAfter || analytics.customersSelected || 0}</h3>
                  {analytics.customersSelectedBefore !== undefined && (
                    <p className="text-emerald-600 text-xs font-bold mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +{Math.round(((analytics.customersSelectedAfter - analytics.customersSelectedBefore) / Math.max(analytics.customersSelectedBefore, 1)) * 100)}% vs Before Badge
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          
          {/* Recharts Analytics Diagram */}
          {analytics.chartData && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <BarChart2 className="w-6 h-6 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-lg">Trust Badge Impact Analysis (Last 7 Days)</h3>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="period" tick={{fill: '#64748b', fontSize: 13}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: '#64748b', fontSize: 13}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'}} />
                    <Legend wrapperStyle={{paddingTop: '20px'}} />
                    {routingType === 'FCFS' ? (
                      <>
                        <Bar dataKey="Arrivals" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                        <Bar dataKey="Conversions" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                      </>
                    ) : (
                      <>
                        <Bar dataKey="Views" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                        <Bar dataKey="Selections" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                      </>
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Always show benefits */}
      {!showPurchase && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" /> 
                  Trust Badge Benefits ({routingType} Region)
                </h3>
                
                {routingType === 'FCFS' ? (
                  <ul className="space-y-2 text-sm text-slate-600 mb-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span><strong>First-Come First-Served:</strong> Leads are routed directly to you immediately. No waiting for customers to manually select you.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span><strong>High Priority Allocation:</strong> Trust Badge EPCs bypass the standard queue and get priority access to fresh leads.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Compliance Requirement:</strong> You must agree to the EPC Undertaking and adhere to standard installation guidelines to maintain FCFS privileges.</span>
                    </li>
                  </ul>
                ) : (
                  <ul className="space-y-2 text-sm text-slate-600 mb-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Premium Visibility:</strong> Your profile is highlighted with a 'Trusted' Badge and positioned at the top of customer search results.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Higher Selection Rate:</strong> Customers are 3x more likely to select an EPC with an active Trust Badge.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span><strong>No Strict Undertaking Needed:</strong> Customer Select flow empowers the customer to choose you based on your reviews and Trust Badge.</span>
                    </li>
                  </ul>
                )}
                
                
              </div>
            )}

      {!isApproved && !showPurchase && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-amber-900 font-bold text-lg mb-2">{isExhausted ? 'Trust Badge Exhausted' : 'Trust Badge Not Active'}</h3>
          <p className="text-amber-800 max-w-md mx-auto mb-6">
            {isExhausted ? 'Your previously purchased leads have been fully consumed. Purchase more leads to reactivate your Trust Badge and retain your premium benefits.' : 'Purchase leads to activate your Trust Badge and unlock priority routing or higher visibility in Customer Select regions.'}
          </p>
          <button 
            onClick={() => setShowPurchase(true)}
            className="bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-sm"
          >
            Activate Now
          </button>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !purchasing && setShowPurchase(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-blue-600 p-6 text-white text-center flex-shrink-0">
              <ShieldCheck className="w-10 h-10 text-blue-200 mx-auto mb-2" />
              <h2 className="text-2xl font-black">Purchase Trust Badge Leads</h2>
              <p className="text-blue-100 text-sm mt-1">Select state and project type for targeted priority allocation.</p>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Select Region/State</label>
                  <select 
                    value={purchaseState} 
                    onChange={e => setPurchaseState(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800"
                  >
                    <option value="">-- Choose Working Region --</option>
                    {statesList.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                  {statesList.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">No active regions found in your profile.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Select Project Type</label>
                  <select 
                    value={purchaseProjectType} 
                    onChange={e => setPurchaseProjectType(e.target.value)}
                    disabled={projectTypes.length === 0}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800 disabled:opacity-50"
                  >
                    {projectTypes.length > 0 ? (
                      projectTypes.map(pt => {
                        const val = pt.projectType || pt.name || pt;
                        const label = pt.projectTypeLabel || pt.name || pt.projectType || pt;
                        return <option key={val} value={val}>{label}</option>;
                      })
                    ) : (
                      <option value="">Loading types...</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Number of Leads</label>
                <input 
                  type="number" 
                  value={purchaseLeads} 
                  onChange={e => setPurchaseLeads(Number(e.target.value))}
                  min="1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800 text-lg"
                />
              </div>

              {routingType === 'FCFS' && (
                  <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-blue-50 transition-colors mb-4">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      checked={undertakingAgreed}
                      onChange={e => setUndertakingAgreed(e.target.checked)}
                    />
                    <span className="text-xs text-slate-700 leading-snug">
                      <strong>I agree to the Trust Badge Undertaking.</strong> I confirm that I will maintain high compliance standards, handle leads professionally, and adhere to local regulatory requirements for all assigned installations.
                    </span>
                  </label>
                )}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex flex-col gap-2">
                 <div className="flex items-center justify-between text-blue-900 font-medium">
                    <span>Rate Per Lead:</span>
                    <span>{analytics?.currency || (isAustralia ? 'AUD' : 'INR')} {analytics?.ratePerLead || 0}</span>
                 </div>
                 <div className="flex items-center justify-between text-blue-900 font-black text-lg pt-2 border-t border-blue-200">
                    <span>Total Amount:</span>
                    <span>{analytics?.currency || (isAustralia ? 'AUD' : 'INR')} {(analytics?.ratePerLead || 0) * purchaseLeads}</span>
                 </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowPurchase(false)} 
                  disabled={purchasing}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePurchase} 
                  disabled={purchasing || (!purchaseState) || (routingType === 'FCFS' && !undertakingAgreed)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {purchasing ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                  ) : (
                    'Proceed to Pay'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustBadgeDashboard;
