import { useEffect, useState } from 'react';
import epcApi from '../../../api/epcApi';
import { useEpcAuth } from '../../../context/EpcAuthContext';

const typeIcons = {
  'Surya Ghar Yojana':      '🏠',
  'Group Solar':            '🏘️',
  'Village Solar Campaign': '🌾',
  'Commercial Solar':       '🏢',
  'Residential Solar':      '🏡',
  'Off-Grid Solar':         '🔋',
  'Solar + Battery':        '🔋',
  'Farm / Rural Solar':     '🚜',
  'Community & Strata':     '🏢',
  'commercial':             '🏢',
  'residential':            '🏡',
  'off-grid':               '🔋',
  'hybrid':                 '🔋',
};

// Loads the Razorpay checkout.js script once, reuses it on later opens
const loadRazorpayScript = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const EpcWallet = () => {
  const { epc } = useEpcAuth();

  const [wallet, setWallet]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [packages, setPackages] = useState([]);
  const [msg, setMsg]             = useState({ text: '', type: '', code: '' });

  const currentProjectTypes = wallet?.availableProjectTypes || [];

  const [showPurchase, setShowPurchase] = useState(false);
  const [purchaseType, setPurchaseType] = useState('');
  const [purchaseDistrict, setPurchaseDistrict] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState(null); // null = custom amount
  const [purchaseKw, setPurchaseKw]     = useState('');
  const [purchasing, setPurchasing]     = useState(false);

  const [showTransfer, setShowTransfer] = useState(false);
  const [transferKw, setTransferKw] = useState('');
  const [transferType, setTransferType] = useState('');
  const [fromDistrict, setFromDistrict] = useState('');
  const [toDistrict, setToDistrict] = useState('');
  const [transferring, setTransferring] = useState(false);

  const handleTransfer = async () => {
    if (!fromDistrict || !toDistrict || !transferKw || !transferType) {
      showMsg('Please fill all transfer fields', 'error');
      return;
    }
    if (fromDistrict === toDistrict) {
      showMsg('Source and Destination districts must be different', 'error');
      return;
    }

    const kwAmount = Number(transferKw);
    if (isNaN(kwAmount) || kwAmount <= 0) {
      showMsg('Please enter a valid KW amount', 'error');
      return;
    }

    setTransferring(true);
    try {
      const { data } = await epcApi.post('/api/epc/wallet/transfer', {
        fromDistrict,
        toDistrict,
        projectType: transferType,
        kwAmount: kwAmount
      });
      showMsg(data.message);
      setShowTransfer(false);
      load();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Transfer failed', 'error', err.response?.data?.code);
    } finally {
      setTransferring(false);
    }
  };


  const load = async () => {
    setLoading(true);
    try {
      const [walletRes, pkgRes] = await Promise.all([
        epcApi.get('/api/epc/wallet'),
        epcApi.get(`/api/epc-subscription-settings/packages?country=${epc?.country || 'India'}`).catch(() => ({ data: { data: [] } }))
      ]);
      setWallet(walletRes.data);
      setPackages(pkgRes.data?.data || pkgRes.data || []);
    } catch (err) {
      console.error('Wallet fetch error:', err);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const showMsg = (text, type = 'success', code = '') => {
    setMsg({ text, type, code });
    setTimeout(() => setMsg({ text: '', type: '', code: '' }), 15000); // 15 seconds
  };

  const openPurchaseModal = () => {
    setSelectedPackageId(null);
    setPurchaseKw('');
    setPurchaseDistrict(epc.district || epc.hqLocation || '');
    if (currentProjectTypes.length > 0) setPurchaseType(currentProjectTypes[0]);
    setShowPurchase(true);
  };

  const selectPackage = (pkg) => {
    setSelectedPackageId(pkg._id);
    setPurchaseKw(String(pkg.kwAmount));
  };

  const handlePurchase = async () => {
    // Client-side validation before we even hit the payment gateway
    if (!selectedPackageId) {
      showMsg('Please select a recharge package', 'error'); return;
    }

    setPurchasing(true);
    try {
      // STEP 1 — ask backend to create a Razorpay order (nothing credited yet)
      const { data: order } = await epcApi.post('/api/epc/wallet/create-order', {
        projectType: purchaseType,
        packageId: selectedPackageId || undefined,
        kw: selectedPackageId ? undefined : Number(purchaseKw),
      });

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showMsg('Could not load payment gateway. Check your internet connection.', 'error');
        setPurchasing(false);
        return;
      }

      // STEP 2 — open Razorpay checkout
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'EmergeSun EPC Portal',
        description: `${order.kw} KW credits — ${order.projectType}`,
        theme: { color: '#2563eb' },
        handler: async (response) => {
          // STEP 3 — verify payment server-side, THEN credits get added
          try {
            const { data } = await epcApi.post('/api/epc/wallet/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              projectType: order.projectType,
              kw: order.kw,
              packageId: selectedPackageId || 'custom',
            });
            showMsg(data.message);
            setShowPurchase(false);
            setPurchaseKw('');
            setPurchaseDistrict('');
            load();
          } catch (err) {
            showMsg(err.response?.data?.message || 'Payment verification failed. Contact support if amount was deducted.', 'error');
          } finally {
            setPurchasing(false);
          }
        },
        modal: {
          ondismiss: () => setPurchasing(false), // user closed the checkout without paying
        },
      });

      rzp.on('payment.failed', (resp) => {
        showMsg(resp.error?.description || 'Payment failed', 'error');
        setPurchasing(false);
      });

      rzp.open();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Could not start payment', 'error');
      setPurchasing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const freeTrialPct = wallet ? Math.min(100, (wallet.freeTrialKwUsed / wallet.freeTrialKwLimit) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Finance</p>
            <h2 className="text-white text-2xl font-black tracking-tight">KW Credit Wallet</h2>
            <p className="text-slate-400 text-sm mt-1">Manage your project-wise solar installation credits</p>
          </div>
          <div className="flex items-center gap-2">
            {wallet?.activeDistricts?.length > 1 && (
              <button onClick={() => {
                setTransferKw('');
                setFromDistrict('');
                setToDistrict('');
                if (currentProjectTypes.length > 0) setTransferType(currentProjectTypes[0]);
                setShowTransfer(true);
              }}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all">
                Transfer KW
              </button>
            )}
            <button onClick={openPurchaseModal}
              className="flex items-center gap-2 bg-white text-gray-800 hover:bg-gray-50 text-sm font-black px-5 py-2.5 rounded-xl transition-all shadow-sm">
              + Buy Credits
            </button>
          </div>
        </div>
      </div>

      {msg.text && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] text-sm rounded-xl px-6 py-4 border shadow-xl flex items-center justify-between transition-all w-[90%] max-w-lg ${
          msg.type === 'success' ? 'bg-green-50 border-green-400 text-green-800 font-bold' : 'bg-rose-50 border-rose-400 text-rose-800 font-bold'
        }`}>
          <span>{msg.text}</span>
          <button onClick={() => setMsg({ text: '', type: '', code: '' })} className="ml-4 opacity-50 hover:opacity-100 text-lg">&times;</button>
          {msg.code === 'CROSS_DISTRICT_NOT_ALLOWED' && (
            <button className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors shrink-0 ml-3">
              Upgrade Plan
            </button>
          )}
        </div>
      )}

      {wallet?.isLowBalance && (
        <div className="text-sm rounded-xl px-4 py-3 border bg-amber-50 border-amber-200 text-amber-700 flex items-center justify-between">
          <span>⚠️ Wallet balance low hai ({wallet.totalCredits} KW left). Order accept karne se pehle recharge kar lo.</span>
          <button onClick={openPurchaseModal} className="text-amber-800 font-semibold underline text-xs shrink-0 ml-3">
            Recharge Now
          </button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 via-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-blue-400 opacity-20 rounded-full blur-lg group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider relative z-10">Total Wallet Credits</p>
          <p className="text-4xl font-black mt-2 relative z-10 drop-shadow-md">{wallet?.totalCredits || 0} KW</p>
          <p className="text-blue-100 text-xs mt-2 relative z-10 opacity-80">Across all project types</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-xs font-medium">Free Trial Usage</p>
            <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-200">
              {wallet?.freeTrialRemaining || 0} KW left
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-green-500 h-full transition-all" style={{ width: `${freeTrialPct}%` }} />
          </div>
          <p className="text-gray-400 text-xs mt-2">
            {wallet?.freeTrialKwUsed || 0} / {wallet?.freeTrialKwLimit || 10} KW used (free, no credits needed)
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h3 className="text-gray-700 text-sm font-semibold mb-4">Credits by Project Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {currentProjectTypes.map((pt, i) => {
            const c = (wallet?.creditsByType || []).find(x => x.projectType === pt) || { projectType: pt, district: 'All', credits: 0 };
            return (
              <div key={i}
                className="flex items-center gap-4 px-4 py-4 rounded-xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-md transition-all duration-300 group cursor-default">
                <span className="text-3xl group-hover:scale-110 transition-transform">{typeIcons[c.projectType] || typeIcons[c.projectType.toLowerCase()] || '⚡'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 text-sm font-bold truncate" title={c.projectType}>{c.projectType}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{c.district || 'All'} District</p>
                </div>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-black text-xl shrink-0">{c.credits} KW</span>
              </div>
            );
          })}
          {currentProjectTypes.length === 0 && (
             <p className="text-gray-400 text-sm italic py-4 col-span-full">No active project types found in your region's order journey settings.</p>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h3 className="text-gray-700 text-sm font-semibold mb-4">Recent Transactions</h3>
        {!wallet?.recentTransactions?.length ? (
          <p className="text-gray-400 text-sm text-center py-6">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {wallet.recentTransactions.map((tx, i) => (
              <div key={tx._id || i} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    tx.type === 'PURCHASE' ? 'bg-green-100 text-green-600' :
                    tx.type === 'DEDUCT'   ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {tx.type === 'PURCHASE' ? '+' : tx.type === 'DEDUCT' ? '−' : '↩'}
                  </span>
                  <div>
                    <p className="text-gray-700 text-sm font-medium">{tx.note}</p>
                    <p className="text-gray-400 text-xs">{new Date(tx.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${
                    tx.type === 'PURCHASE' ? 'text-green-600' :
                    tx.type === 'DEDUCT'   ? 'text-orange-600' : 'text-blue-600'
                  }`}>{tx.type === 'DEDUCT' ? '-' : '+'}{tx.kw} KW</p>
                  {tx.amount > 0 && <p className="text-gray-400 text-xs">₹{tx.amount.toLocaleString('en-IN')}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !purchasing && setShowPurchase(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-gray-800 font-bold text-lg mb-4">Buy KW Credits</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 text-xs font-medium mb-1.5">Project Type</label>
                <select value={purchaseType} onChange={e => setPurchaseType(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                  {currentProjectTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                </select>
              </div>

              {/* Target District automatically picked up by backend */}

              {packages.length > 0 ? (
                <div>
                  <label className="block text-gray-600 text-xs font-medium mb-1.5">Choose a Package</label>
                  <div className="grid grid-cols-2 gap-2">
                    {packages.map(pkg => (
                      <button key={pkg._id} type="button" onClick={() => selectPackage(pkg)}
                        className={`relative text-left p-3 rounded-xl border transition-all ${
                          selectedPackageId === pkg._id
                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-400'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}>
                        {pkg.isPopular && (
                          <span className="absolute -top-2 right-2 text-[9px] font-bold bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                        <p className="text-xs font-bold text-gray-700">{pkg.name}</p>
                        <p className="text-blue-600 font-black text-base mt-0.5">{pkg.kwAmount} KW</p>
                        <p className="text-xs text-gray-600">₹{pkg.finalPrice.toLocaleString('en-IN')}</p>
                        {pkg.discountPercent > 0 && <p className="text-[10px] text-green-600 font-semibold">{pkg.discountPercent}% off</p>}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No recharge packages available. Please contact admin.</p>
              )}

              <div className="flex gap-3">
                <button onClick={() => setShowPurchase(false)} disabled={purchasing}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl text-sm disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handlePurchase} disabled={purchasing || (!purchaseKw && !selectedPackageId)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm">
                  {purchasing ? 'Opening payment...' : 'Proceed to Pay'}
                </button>
              </div>

              <p className="text-gray-400 text-xs text-center">
                🔒 Secure payment powered by Razorpay
              </p>
            </div>
          </div>
        </div>
      )}

      {showTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => !transferring && setShowTransfer(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-7 max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all">
            <h3 className="text-gray-900 font-black text-xl mb-1">Transfer KW</h3>
            <p className="text-gray-500 text-xs mb-5">Move credits securely between districts</p>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 text-xs font-medium mb-1.5">Project Type</label>
                <select value={transferType} onChange={e => setTransferType(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                  {currentProjectTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-600 text-xs font-medium mb-1.5">From District</label>
                <input type="text" value={fromDistrict} onChange={e => setFromDistrict(e.target.value)} placeholder="e.g. Surat"
                  className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-gray-600 text-xs font-medium mb-1.5">To District</label>
                <input type="text" value={toDistrict} onChange={e => setToDistrict(e.target.value)} placeholder="e.g. Ahmedabad"
                  className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-gray-600 text-xs font-medium mb-1.5">KW Amount</label>
                <input type="number" min={1} value={transferKw} onChange={e => setTransferKw(e.target.value)} placeholder="KW"
                  className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowTransfer(false)} disabled={transferring}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleTransfer} disabled={transferring || !fromDistrict || !toDistrict || !transferKw}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-md hover:shadow-lg disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all transform hover:-translate-y-0.5 disabled:hover:translate-y-0">
                  {transferring ? 'Transferring...' : 'Transfer 1:1'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EpcWallet;