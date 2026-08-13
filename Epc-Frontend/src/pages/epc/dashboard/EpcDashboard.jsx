import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEpcAuth } from '../../../context/EpcAuthContext';
import epcApi from '../../../api/epcApi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4005';

const StatCard = ({ label, value, sub, color, bgColor, icon, onClick }) => (
  <div
    onClick={onClick}
    className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-gray-100 dark:border-slate-700/50 rounded-2xl p-6 cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full"></div>
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-gray-500 dark:text-slate-400 text-xs font-semibold tracking-wide uppercase mb-1.5">{label}</p>
        <p className={`text-3xl font-black ${color} dark:text-white drop-shadow-sm`}>{value ?? '—'}</p>
        {sub && <p className="text-gray-400 dark:text-slate-500 text-[11px] font-medium mt-1.5">{sub}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ${bgColor}`}>
        {icon}
      </div>
    </div>
  </div>
);

const EpcDashboard = () => {
  const { epc } = useEpcAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [enquiryCount, setEnquiryCount] = useState(null);
  const [demandStats, setDemandStats] = useState(null);
  const [videoSettings, setVideoSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unacceptedLeadsCount, setUnacceptedLeadsCount] = useState(0);
  const [installationPhotos, setInstallationPhotos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          epcApi.get('/api/epc/orders/summary'),
          epcApi.get('/api/epc/enquiries'),
          epcApi.get('/api/epc/orders/demand-stats'),
          epcApi.get('/api/website-settings'),
          epcApi.get('/api/epc/projects')
        ]);
        
        const ordRes = results[0].status === 'fulfilled' ? results[0].value : { data: {} };
        const enqRes = results[1].status === 'fulfilled' ? results[1].value : { data: [] };
        const demandRes = results[2].status === 'fulfilled' ? results[2].value : { data: null };
        const settingsRes = results[3].status === 'fulfilled' ? results[3].value : null;
        const projRes = results[4].status === 'fulfilled' ? results[4].value : { data: { projects: [] } };

        if (!settingsRes || !settingsRes.data) {
          try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4005"}/api/website-settings`, { headers: { 'x-country': 'india' } });
            const data = await res.json();
            setVideoSettings(data?.data?.videos?.epcDashboardVideo);
          } catch(err) {}
        } else {
          setVideoSettings(settingsRes.data?.data?.videos?.epcDashboardVideo);
        }

        setSummary(ordRes.data);
        setEnquiryCount(enqRes.data.filter(e => e.status === 'New').length);
        
        const unaccepted = enqRes.data.filter(e => ['Open For EPC', 'New', 'Bid Running'].includes(e.status)).length;
        setUnacceptedLeadsCount(unaccepted);
        setDemandStats(demandRes.data);

        // Process recent installation photos
        const photos = [];
        if (projRes && projRes.data && Array.isArray(projRes.data.projects)) {
          projRes.data.projects.forEach(proj => {
            const installStep = proj.steps?.find(s => s.stepId?.includes('step-8') || s.title?.toLowerCase().includes('installation'));
            if (installStep?.uploadedActions?.length > 0) {
              installStep.uploadedActions.forEach(act => {
                if (act.value && act.fileType !== 'text') {
                  photos.push({
                    url: act.value,
                    label: `${proj.customerName || 'Customer'} - Roof Installation`,
                    date: installStep.completedAt || proj.updatedAt
                  });
                }
              });
            }
            if (proj.rooftopPhoto) {
              photos.push({
                url: proj.rooftopPhoto,
                label: `${proj.customerName || 'Customer'} - Initial Rooftop`,
                date: proj.createdAt
              });
            }
          });
        }
        setInstallationPhotos(photos.slice(0, 6));
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const planColors = {
    Standard:     'text-gray-600 dark:text-slate-300',
    Professional: 'text-blue-600 dark:text-blue-400',
    Enterprise:   'text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="space-y-6">

      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Dashboard</p>
            <h2 className="text-white text-2xl font-black tracking-tight">
              Welcome, {epc?.companyName} 👋
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              <span className="text-blue-400 font-bold">{epc?.plan} Plan</span>
              <span className="mx-2 text-slate-600">|</span>
              {epc?.activeDistricts?.join(', ') || 'No districts assigned'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-xl">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="text-yellow-300 text-lg font-black">{epc?.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-slate-400 text-xs">/ 5.0</span>
            </div>
          </div>
        </div>
      </div>
      {/* Red Alert Banner */}
      {summary?.isRedAlert && (
        <div className="bg-gradient-to-r from-red-500 to-rose-600 border border-red-600 p-5 rounded-2xl shadow-lg mb-6 flex items-start gap-4 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
          <svg className="w-8 h-8 text-white shrink-0 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="relative z-10">
            <h3 className="text-white font-black text-lg drop-shadow-sm">RED ALERT: Overdue Limit Exceeded</h3>
            <p className="text-red-50 text-sm mt-1 font-medium">
              You have {summary.overdue} overdue projects (Max allowed: {summary.maxOverdue}). Your account may be temporarily suspended. Please clear overdue projects immediately.
            </p>
          </div>
        </div>
      )}

      {/* New Leads Notification Alert */}
      {unacceptedLeadsCount > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 border border-orange-600 p-5 rounded-2xl shadow-lg mb-6 flex items-start justify-between gap-4 text-white animate-pulse-slow">
          <div className="flex items-start gap-4">
            <span className="text-2xl mt-0.5">🔔</span>
            <div>
              <h3 className="font-black text-lg">New Leads Waiting!</h3>
              <p className="text-orange-50 text-sm mt-1 font-medium">
                You have {unacceptedLeadsCount} new solar enquiries waiting to be accepted. Go to My Enquiries to claim them before they expire!
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/epc/enquiries')}
            className="px-4 py-2 bg-white text-orange-950 font-black text-xs rounded-xl shadow-md hover:bg-orange-50 hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            View Enquiries
          </button>
        </div>
      )}


      {/* Onboarding alert */}
      {epc?.onboardingStatus === 'Approved' && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 rounded-xl px-5 py-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Your account is approved. Please complete KYC to get fully verified and start accepting orders.
          </p>
        </div>
      )}

      {/* Demand Stats Alert */}
      {demandStats && (
        <div className={`${demandStats.demandCount > 0 ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800/50' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'} border rounded-xl px-5 py-4 flex items-center gap-3 shadow-premium cursor-pointer hover-lift glass-panel transition-all`}
             onClick={() => navigate('/epc/plan')}>
          <div className={`p-2 rounded-full ${demandStats.demandCount > 0 ? 'bg-green-100 dark:bg-green-800' : 'bg-gray-200 dark:bg-gray-700'}`}>
            <svg className={`w-5 h-5 ${demandStats.demandCount > 0 ? 'text-green-600 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {demandStats.demandCount > 0 ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
          </div>
          <div className="flex-1">
            <p className={`${demandStats.demandCount > 0 ? 'text-green-800 dark:text-green-100' : 'text-gray-800 dark:text-gray-200'} font-semibold text-sm`}>
              {demandStats.demandCount > 0 ? 'Hot Demand in your Service Areas!' : 'Grow your business!'}
            </p>
            <p className={`${demandStats.demandCount > 0 ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'} text-xs mt-0.5`}>
              {demandStats.demandCount > 0 
                ? `There ${demandStats.demandCount === 1 ? 'is' : 'are'} currently <b>${demandStats.demandCount} new solar lead${demandStats.demandCount > 1 ? 's' : ''}</b> waiting for EPC assignment in your active districts (${demandStats.districts.join(', ')}). Upgrade your plan to capture them!`
                : 'There are currently no unassigned leads in your active districts. Consider expanding your service areas by upgrading your plan!'}
            </p>
          </div>
          <button className={`px-4 py-1.5 text-white text-xs font-semibold rounded-lg shadow-sm ${demandStats.demandCount > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
            Upgrade Plan
          </button>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="New Enquiries"
          value={loading ? '...' : enquiryCount ?? 0}
          sub="Awaiting your response"
          color="text-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-900/40"
          onClick={() => navigate('/epc/enquiries')}
          icon={<svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
        />
        <StatCard
          label="New Orders"
          value={loading ? '...' : summary?.new ?? 0}
          sub="Pending action"
          color="text-green-600"
          bgColor="bg-green-50 dark:bg-green-900/40"
          onClick={() => navigate('/epc/orders?status=New')}
          icon={<svg className="w-5 h-5 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Ongoing"
          value={loading ? '...' : summary?.ongoing ?? 0}
          sub="In progress"
          color="text-yellow-600"
          bgColor="bg-yellow-50 dark:bg-yellow-900/40"
          onClick={() => navigate('/epc/orders?status=Ongoing')}
          icon={<svg className="w-5 h-5 text-yellow-500 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Overdue"
          value={loading ? '...' : summary?.overdue ?? 0}
          sub="Past due date"
          color="text-red-600"
          bgColor="bg-red-50 dark:bg-red-900/40"
          onClick={() => navigate('/epc/orders?status=Overdue')}
          icon={<svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
        <StatCard
          label="Completed"
          value={loading ? '...' : summary?.completed ?? 0}
          sub="Total completed"
          color="text-purple-600"
          bgColor="bg-purple-50 dark:bg-purple-900/40"
          onClick={() => navigate('/epc/orders?status=Completed')}
          icon={<svg className="w-5 h-5 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
        />
        <StatCard
          label="Today's Installations"
          value={loading ? '...' : summary?.today ?? 0}
          sub="Scheduled for today"
          color="text-teal-600"
          bgColor="bg-teal-50 dark:bg-teal-900/40"
          onClick={() => navigate('/epc/orders')}
          icon={<svg className="w-5 h-5 text-teal-500 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <StatCard
          label="Upcoming"
          value={loading ? '...' : summary?.upcoming ?? 0}
          sub="Scheduled for future"
          color="text-orange-600"
          bgColor="bg-orange-50 dark:bg-orange-900/40"
          onClick={() => navigate('/epc/orders')}
          icon={<svg className="w-5 h-5 text-orange-500 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="My Plan"
          value={epc?.plan}
          sub={`${epc?.activeDistricts?.length || 0} active districts`}
          color={planColors[epc?.plan] || 'text-gray-600 dark:text-slate-300'}
          bgColor="bg-gray-100 dark:bg-slate-700"
          onClick={() => navigate('/epc/plan')}
          icon={<svg className="w-5 h-5 text-gray-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
        />
      </div>

      {/* ── PERFORMANCE METRICS ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-premium">
        <h3 className="text-gray-800 font-black mb-4 flex items-center gap-2">
          <span className="text-xl">📈</span> Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl border border-gray-100 dark:border-slate-600">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 dark:text-slate-400 text-xs">Lead-to-Project Acceptance Ratio</p>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-xl font-bold text-gray-800 dark:text-white">
                  {summary && summary.total > 0 
                    ? Math.round((summary.total / (summary.total + (enquiryCount || 0))) * 100) 
                    : 0}%
                </span>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium pb-1">+5.2% this month</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl border border-gray-100 dark:border-slate-600">
            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 dark:text-slate-400 text-xs">Project Success Rate</p>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-xl font-bold text-gray-800 dark:text-white">
                  {summary && summary.total > 0 
                    ? Math.round((summary.completed / summary.total) * 100) 
                    : 0}%
                </span>
                <span className="text-xs text-gray-400 dark:text-slate-500 font-medium pb-1">of total accepted projects</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-premium">
        <h3 className="text-gray-800 font-black mb-4 flex items-center gap-2">
          <span className="text-xl">⚡</span> Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '💬 View Enquiries', path: '/epc/enquiries', cls: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300' },
            { label: '📋 My Orders',      path: '/epc/orders',    cls: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300' },
            { label: '📅 View Calendar',  path: '/epc/calendar',  cls: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-300' },
            { label: '💠 Upgrade Plan',   path: '/epc/plan',      cls: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300' },
          ].map((a) => (
            <button key={a.path} onClick={() => navigate(a.path)}
              className={`border text-xs font-bold rounded-xl py-3.5 px-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${a.cls}`}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── INSTALLATION PHOTOS ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-premium">
        <h3 className="text-gray-800 font-black mb-4 flex items-center gap-2">
          <span className="text-xl">📸</span> Recent Installation Photos
        </h3>
        
        {installationPhotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {installationPhotos.map((photo, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700 aspect-square shadow-sm hover:shadow-lg transition-all duration-300">
                <img 
                  src={photo.url.startsWith('http') ? photo.url : `${API_BASE}${photo.url}`} 
                  alt={photo.label} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-white">
                  <p className="text-[10px] font-black tracking-wider uppercase text-blue-400">EmergeSun Partner</p>
                  <p className="text-xs font-bold leading-tight mt-0.5 truncate">{photo.label}</p>
                  <span className="text-[9px] text-gray-300 mt-1">{new Date(photo.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
            <span className="text-2xl">🌅</span>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 font-medium">No installation photos uploaded yet</p>
          </div>
        )}
      </div>

      {/* Floating Video Widget (PIP) */}
      {(!videoSettings || videoSettings.enabled !== false) && (
        <div className="fixed bottom-6 right-6 z-50 w-72 md:w-80 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 overflow-hidden group">
          <div className="bg-slate-800 px-3 py-2 flex items-center justify-between border-b border-slate-700">
            <span className="text-xs font-bold text-slate-200">How to use EPC Portal</span>
            <button className="text-slate-400 hover:text-white" onClick={() => setVideoSettings({...videoSettings, enabled: false})}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="aspect-video relative">
            <iframe 
              className="absolute top-0 left-0 w-full h-full"
              src={videoSettings?.url || "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"}
              title="EPC Portal Guide"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default EpcDashboard;