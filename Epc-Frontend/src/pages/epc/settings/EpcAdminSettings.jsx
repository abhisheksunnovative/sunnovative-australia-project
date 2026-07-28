import { useEpcAuth } from '../../../context/EpcAuthContext';

const EpcAdminSettings = () => {
  const { epc } = useEpcAuth();

  const Row = ({ label, value }) => (
    <div className="flex justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-gray-800 text-sm font-medium">{value || '—'}</span>
    </div>
  );

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-gray-800 text-xl font-bold">Settings</h2>
        <p className="text-gray-500 text-sm mt-0.5">Account settings and configuration</p>
      </div>

      {/* Account Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-gray-700 text-sm font-semibold mb-4">Account Information</h3>
        <Row label="Company Name"     value={epc?.companyName} />
        <Row label="Owner Name"       value={epc?.ownerName} />
        <Row label="Email"            value={epc?.email} />
        <Row label="Mobile"           value={epc?.mobile} />
        <Row label="Plan"             value={epc?.plan} />
        <Row label="Onboarding Status" value={epc?.onboardingStatus} />
        <Row label="Rating"           value={epc?.rating ? `${epc.rating.toFixed(1)} ⭐` : '0.0 ⭐'} />
      </div>

      {/* Active Districts */}
      {epc?.activeDistricts?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-gray-700 text-sm font-semibold mb-3">Active Districts</h3>
          <div className="flex gap-2 flex-wrap">
            {epc.activeDistricts.map(d => (
              <span key={d} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-200">
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Installation Calendar Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-gray-700 text-sm font-semibold mb-3">Installation Date Settings</h3>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <p className="text-blue-700 text-sm">
            📅 Installation dates are managed by admin. Customers can select dates based on your availability calendar set by the platform.
          </p>
          <p className="text-blue-600 text-xs mt-2">
            Range: Minimum 7 days from order date — Maximum 45 days
          </p>
        </div>
      </div>

      {/* Plan Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-gray-700 text-sm font-semibold mb-3">Plan Features</h3>
        <div className="space-y-2">
          {[
            { icon: '🏆', label: 'Trial Plan',    desc: 'Free KW Credits · Limited orders · 60 days validity', active: epc?.plan === 'Standard' },
            { icon: '🔷', label: 'Silver Plan',   desc: '1 District access · Limited monthly orders',           active: epc?.plan === 'Professional' },
            { icon: '💎', label: 'Gold Plan',     desc: 'Multiple districts · Higher monthly orders',            active: false },
            { icon: '👑', label: 'Platinum Plan', desc: 'Cluster access · Premium projects · Priority leads',    active: epc?.plan === 'Enterprise' },
          ].map(plan => (
            <div key={plan.label}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                plan.active
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-100'
              }`}>
              <span className="text-xl">{plan.icon}</span>
              <div>
                <p className={`text-sm font-semibold ${plan.active ? 'text-blue-700' : 'text-gray-600'}`}>
                  {plan.label} {plan.active && <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full ml-1">Current</span>}
                </p>
                <p className="text-gray-400 text-xs">{plan.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-gray-400 text-xs mt-3 text-center">
          To upgrade your plan, go to{' '}
          <a href="/epc/plan" className="text-blue-600 hover:underline">My Plan</a>
        </p>
      </div>

      {/* Contact Admin */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-gray-700 text-sm font-semibold mb-3">Need Help?</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            support@sunnovative.in
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Contact EPC Partner Manager
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpcAdminSettings;
