import { useState, useEffect } from 'react';
import epcApi from '../../../api/epcApi';
import { useEpcAuth } from '../../../context/EpcAuthContext';

const INDIAN_STATES = {
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi"]
};

const AUS_STATES = {
  "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo"],
  "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Central Coast"],
  "Queensland": ["Brisbane", "Gold Coast", "Sunshine Coast", "Townsville"],
  "Western Australia": ["Perth", "Mandurah", "Bunbury", "Geraldton"]
};

const TeamCapacityManager = ({ myPlan }) => {
  const { epc } = useEpcAuth();
  const [upgrading, setUpgrading] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [additionalInstallers, setAdditionalInstallers] = useState(1);
  const [installerConfig, setInstallerConfig] = useState(null);

  useEffect(() => {
    epcApi.get(`/api/epc-subscription-settings/installer-configs?country=${epc?.country || 'India'}`)
      .then(res => {
        if (res.data && res.data.data && res.data.data.length > 0) {
          setInstallerConfig(res.data.data[0]);
        }
      })
      .catch(err => console.error("Failed to load installer config", err));
  }, [epc?.country]);


  const isAus = epc?.country === 'australia';
  const statesMap = isAus ? AUS_STATES : INDIAN_STATES;
  const defaultState = isAus ? 'Victoria' : 'Gujarat';
  const defaultDistrict = isAus ? 'Melbourne' : 'Ahmedabad';

  const [targetState, setTargetState] = useState(defaultState);
  const [targetDistrict, setTargetDistrict] = useState(defaultDistrict);

  const handleInstallerUpgrade = async () => {
    if (!targetDistrict) return alert("Please select a target district for the new team(s).");
    if (!window.confirm(`Add ${additionalInstallers} Installer Team(s) in ${targetDistrict} for ₹${((installerConfig?.extraInstallerPrice || 50000) * additionalInstallers).toLocaleString('en-IN')}/yr?`)) return;
    setUpgrading('installer');
    try {
      const { data } = await epcApi.post('/api/epc/plans/upgrade-installer', {
        additionalInstallers,
        targetDistrict
      });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "EmergeSun EPC",
        description: `Add ${additionalInstallers} Installer Team(s) for ${targetDistrict}`,
        order_id: data.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await epcApi.post('/api/epc/plans/verify-installer-upgrade', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              additionalInstallers: data.additionalInstallers,
              targetDistrict: data.targetDistrict
            });
            if (verifyRes.data.success) {
              setMsg({ text: `Success! Added ${additionalInstallers} installers.`, type: 'success' });
              window.location.reload(); 
            } else {
              setMsg({ text: verifyRes.data.message || 'Verification failed', type: 'error' });
            }
          } catch (err) {
            console.error("Installer Verification error:", err);
            setMsg({ text: err.response?.data?.message || 'Payment verification failed', type: 'error' });
          }
        },
        prefill: {
          name: epc?.companyName,
          email: epc?.email,
          contact: epc?.mobile,
        },
        theme: { color: "#10B981" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        setMsg({ text: 'Payment failed. Please try again.', type: 'error' });
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      setMsg({ text: err.response?.data?.message || 'Failed to request installer upgrade', type: 'error' });
    } finally {
      setUpgrading('');
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    }
  };

  if (!myPlan) return null;

  return (
    <div className="mt-8">
      {msg.text && (
        <div className={`p-3 mb-4 rounded-lg text-sm ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {msg.text}
        </div>
      )}
      
      <div>
        <h2 className="text-gray-800 text-xl font-bold">Team Capacity & Overrides</h2>
        <p className="text-gray-500 text-sm mt-0.5">Scale your weekly KW capacity by adding more installer teams.</p>
      </div>
      
      <div className="mt-4 grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">District Capacities</h3>
              <p className="text-xs text-gray-500">Your active throughput by district</p>
            </div>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {myPlan.districtCapacities && myPlan.districtCapacities.length > 0 ? (
              myPlan.districtCapacities.map((dCap, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{dCap.district}</p>
                    <p className="text-xs text-gray-500">{dCap.installerCount} Team(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-700 text-sm">{dCap.weeklyCapacityKw} KW</p>
                    <p className="text-[10px] text-gray-400">Weekly Max</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No active teams explicitly purchased yet. (Default plan limits apply).</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-emerald-200 rounded-xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <h3 className="font-bold text-emerald-800 mb-1">Add More Teams</h3>
            <p className="text-xs text-emerald-600 mb-4">Each additional installer adds <b>{installerConfig?.weeklyKwCapacityPerInstaller || 25} KW</b> to your weekly limit for a chosen district (Yearly flat fee).</p>
            
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">State</label>
                <select 
                  value={targetState}
                  onChange={(e) => {
                    setTargetState(e.target.value);
                    setTargetDistrict(statesMap[e.target.value][0]);
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                >
                  {Object.keys(statesMap).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">District</label>
                <select 
                  value={targetDistrict}
                  onChange={(e) => setTargetDistrict(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                >
                  {statesMap[targetState]?.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center bg-gray-50 border rounded-lg overflow-hidden">
                <button onClick={() => setAdditionalInstallers(Math.max(1, additionalInstallers - 1))} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold">-</button>
                <div className="px-4 py-1.5 font-bold text-gray-800 text-sm min-w-[3rem] text-center">{additionalInstallers}</div>
                <button onClick={() => setAdditionalInstallers(additionalInstallers + 1)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold">+</button>
              </div>
              <div className="text-sm font-bold text-gray-800">
                ₹{((installerConfig?.extraInstallerPrice || 50000) * additionalInstallers).toLocaleString('en-IN')}<span className="text-xs text-gray-500 font-normal"> /yr</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleInstallerUpgrade}
            disabled={upgrading === 'installer' || !targetDistrict}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-sm"
          >
            {upgrading === 'installer' ? 'Processing...' : `Pay & Add ${additionalInstallers} Team${additionalInstallers > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamCapacityManager;
