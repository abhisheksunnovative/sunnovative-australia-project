import { useEpcAuth } from '../../../context/EpcAuthContext';
import { Link } from 'react-router-dom';

const EpcAdminSettings = () => {
  const { epc } = useEpcAuth();

  const InfoRow = ({ icon, label, value, highlight }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 group hover:bg-gray-50/50 -mx-5 px-5 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-base">{icon}</span>
        <span className="text-gray-500 text-sm">{label}</span>
      </div>
      <span className={`text-sm font-semibold ${highlight || 'text-gray-800'}`}>{value || '—'}</span>
    </div>
  );

  const plans = [
    {
      key: 'Standard',
      icon: '🏆',
      label: 'Trial Plan',
      badge: 'Free',
      desc: 'Free KW Credits · Limited orders · 60 days validity',
      color: 'from-gray-500 to-gray-700',
      light: 'bg-gray-50 border-gray-200',
      activeCls: 'bg-gradient-to-br from-gray-600 to-gray-800 text-white border-transparent shadow-lg',
    },
    {
      key: 'Professional',
      icon: '🔷',
      label: 'Silver Plan',
      badge: 'Popular',
      desc: '1 District access · Limited monthly orders',
      color: 'from-blue-500 to-blue-700',
      light: 'bg-blue-50 border-blue-200',
      activeCls: 'bg-gradient-to-br from-blue-500 to-blue-700 text-white border-transparent shadow-lg shadow-blue-200',
    },
    {
      key: 'Gold',
      icon: '💎',
      label: 'Gold Plan',
      badge: 'Best Value',
      desc: 'Multiple districts · Higher monthly orders',
      color: 'from-amber-500 to-amber-700',
      light: 'bg-amber-50 border-amber-200',
      activeCls: 'bg-gradient-to-br from-amber-500 to-amber-700 text-white border-transparent shadow-lg shadow-amber-200',
    },
    {
      key: 'Enterprise',
      icon: '👑',
      label: 'Platinum Plan',
      badge: 'Premium',
      desc: 'Cluster access · Premium projects · Priority leads',
      color: 'from-purple-500 to-purple-700',
      light: 'bg-purple-50 border-purple-200',
      activeCls: 'bg-gradient-to-br from-purple-500 to-purple-700 text-white border-transparent shadow-lg shadow-purple-200',
    },
  ];

  const currentPlan = epc?.plan || 'Standard';

  return (
    <div className="space-y-6 max-w-2xl">

      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">⚙️</div>
          <div>
            <h2 className="text-white text-2xl font-black tracking-tight">Settings</h2>
            <p className="text-slate-400 text-sm mt-0.5">Account configuration & plan info</p>
          </div>
        </div>
      </div>

      {/* ── ACCOUNT INFO CARD ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-premium">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
            <span className="text-white text-xl font-black">
              {epc?.companyName?.charAt(0)?.toUpperCase() || 'E'}
            </span>
          </div>
          <div>
            <h3 className="text-gray-800 font-black text-base">{epc?.companyName || 'My Company'}</h3>
            <p className="text-gray-400 text-xs">{epc?.email}</p>
          </div>
          <div className="ml-auto">
            <span className={`status-pill ${
              epc?.onboardingStatus === 'Verified'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {epc?.onboardingStatus === 'Verified' ? '✅' : '⏳'} {epc?.onboardingStatus || 'Pending'}
            </span>
          </div>
        </div>

        <InfoRow icon="🏢" label="Company Name"     value={epc?.companyName} />
        <InfoRow icon="👤" label="Owner Name"       value={epc?.ownerName} />
        <InfoRow icon="📱" label="Mobile"           value={epc?.mobile} />
        <InfoRow icon="📋" label="Current Plan"     value={`${currentPlan} Plan`} highlight="text-blue-600" />
        <InfoRow icon="⭐" label="Rating"           value={epc?.rating ? `${epc.rating.toFixed(1)} / 5.0` : '0.0 / 5.0'} highlight="text-amber-600" />
      </div>

      {/* ── ACTIVE DISTRICTS ── */}
      {epc?.activeDistricts?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-premium">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📍</span>
            <h3 className="text-gray-800 font-black">Active Districts</h3>
            <span className="ml-auto text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {epc.activeDistricts.length} districts
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {epc.activeDistricts.map(d => (
              <span key={d} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-200 font-semibold hover:bg-blue-100 transition-colors">
                📍 {d}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── INSTALLATION DATE INFO ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-premium">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📅</span>
          <h3 className="text-gray-800 font-black">Installation Date Settings</h3>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-blue-700 text-sm font-medium">
            📅 Installation dates are managed by admin. Customers can select dates based on your availability calendar set by the platform.
          </p>
          <div className="flex items-center gap-2 mt-3 text-xs font-semibold">
            <span className="bg-white text-blue-600 border border-blue-200 px-3 py-1 rounded-full">Min: 7 days from order</span>
            <span className="bg-white text-blue-600 border border-blue-200 px-3 py-1 rounded-full">Max: 45 days</span>
          </div>
        </div>
      </div>

      {/* ── PLAN COMPARISON ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-premium">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-lg">💼</span>
            <h3 className="text-gray-800 font-black">Subscription Plans</h3>
          </div>
          <Link to="/epc/plan"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-colors">
            View Plan Details →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {plans.map(plan => {
            const isActive = currentPlan === plan.key;
            return (
              <div key={plan.key}
                className={`rounded-2xl p-4 border-2 relative transition-all ${isActive ? plan.activeCls : `bg-white ${plan.light}`}`}>
                {isActive && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white text-xs font-black text-gray-700 px-3 py-0.5 rounded-full border border-gray-200 shadow-sm whitespace-nowrap">
                    ✅ Current Plan
                  </div>
                )}
                <div className="text-2xl mb-2">{plan.icon}</div>
                <p className={`text-sm font-black mb-0.5 ${isActive ? 'text-white' : 'text-gray-800'}`}>{plan.label}</p>
                <p className={`text-[10px] leading-relaxed ${isActive ? 'text-white/70' : 'text-gray-400'}`}>{plan.desc}</p>
                {!isActive && (
                  <span className={`mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${plan.color} text-white`}>
                    {plan.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-gray-400 text-xs text-center mt-4">
          To upgrade, go to{' '}
          <Link to="/epc/plan" className="text-blue-600 font-semibold hover:underline">My Plan</Link>
        </p>
      </div>

      {/* ── SUPPORT CARD ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-premium">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🎧</span>
          <h3 className="text-gray-800 font-black">Need Help?</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a href="mailto:support@emergesun.in"
            className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors group">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white text-sm group-hover:scale-105 transition-transform">📧</div>
            <div>
              <p className="text-blue-800 text-xs font-black">Email Support</p>
              <p className="text-blue-600 text-xs">support@emergesun.in</p>
            </div>
          </a>
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl cursor-pointer hover:bg-green-100 transition-colors group">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center text-white text-sm group-hover:scale-105 transition-transform">📞</div>
            <div>
              <p className="text-green-800 text-xs font-black">Partner Manager</p>
              <p className="text-green-600 text-xs">Contact EPC Partner</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpcAdminSettings;
