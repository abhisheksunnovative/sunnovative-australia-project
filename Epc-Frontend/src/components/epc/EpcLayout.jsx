import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Bell, Trash2, CheckSquare, Square, Check } from 'lucide-react';
import EpcSidebar from './EpcSidebar';
import { useEpcAuth } from '../../context/EpcAuthContext';
import epcApi from '../../api/epcApi';

const EpcLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('epc-theme') === 'dark'
  );
  const { epc } = useEpcAuth();
  const navigate = useNavigate();

  // ── Wallet summary for header badge ───────────────────────────────────────
  const [wallet, setWallet] = useState(null);

  const loadWallet = async () => {
    try {
      const { data } = await epcApi.get('/api/epc/wallet');
      setWallet(data);
    } catch (e) {
      // Silent fail — wallet badge is non-critical, don't break the app
      console.warn('Wallet fetch skipped:', e.response?.status);
    }
  };

  useEffect(() => {
    loadWallet();
    // Refresh wallet every 60s so header stays in sync after purchases/order accepts
    const interval = setInterval(loadWallet, 60000);
    return () => clearInterval(interval);
  }, []);

  const [notifications, setNotifications] = useState([]);
  const [selectedNotifIds, setSelectedNotifIds] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifRef = useRef(null);

  const toggleSelectNotif = (id) => {
    setSelectedNotifIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllNotifs = () => {
    if (selectedNotifIds.length === notifications.length) {
      setSelectedNotifIds([]);
    } else {
      setSelectedNotifIds(notifications.map(n => n._id));
    }
  };

  const handleDeleteSelectedNotifs = async () => {
    if (selectedNotifIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedNotifIds.length} selected notifications?`)) return;
    try {
      await epcApi.post(`/api/notifications/delete-batch`, { ids: selectedNotifIds });
      setSelectedNotifIds([]);
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedNotifIds.length === 0) return;
    try {
      await epcApi.post(`/api/notifications/mark-all-read`, { ids: selectedNotifIds });
      setSelectedNotifIds([]);
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSingleNotif = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await epcApi.delete(`/api/notifications/${id}`);
      setSelectedNotifIds(prev => prev.filter(x => x !== id));
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkSingleAsRead = async (id) => {
    try {
      await epcApi.put(`/api/notifications/${id}/read`);
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const loadNotifications = async () => {
    try {
      if (!epc?._id) return;
      const { data } = await epcApi.get(`/api/notifications/EpcPartner/${epc._id}`);
      if (data.success) setNotifications(data.data);
    } catch (e) {
      console.warn('Notifications fetch skipped:', e.response?.status);
    }
  };

  useEffect(() => {
    if (epc?._id) {
      loadNotifications();
      const int = setInterval(loadNotifications, 60000);
      return () => clearInterval(int);
    }
  }, [epc?._id]);

  const markAllAsRead = async () => {
    try {
      const ids = notifications.filter(n => !n.isRead).map(n => n._id);
      if (ids.length === 0) return;
      await epcApi.post(`/api/notifications/mark-all-read`, { ids });
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('epc-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const statusBadge = {
    Pending:  { color: 'bg-yellow-50 text-yellow-600 border border-yellow-200', label: 'Pending Approval' },
    Approved: { color: 'bg-blue-50 text-blue-600 border border-blue-200',       label: 'Approved' },
    Verified: { color: 'bg-green-50 text-green-600 border border-green-200',     label: 'Verified' },
  };
  const badge = statusBadge[epc?.onboardingStatus] || statusBadge.Pending;

  // SUSPENDED VIEW
  if (epc && epc.isActive === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-red-100 max-w-md w-full">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Suspended</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your EPC partner account has been deactivated by the administrator. 
            <br/><br/>
            <strong>Reason: </strong> 
            <span className="text-red-600 font-semibold">{epc.deactivationReason || "Administrative decision"}</span>
          </p>
          <div className="p-4 bg-gray-50 rounded-xl mb-6">
            <p className="text-sm text-gray-500">
              Please contact the support team or your administrative manager to resolve this issue and restore your account access.
            </p>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('epcPartner');
              navigate('/epc/login');
            }}
            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-app)' }}>

      <EpcSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-app)' }}>

        {/* Header */}
        <header style={{ backgroundColor: 'var(--header-bg)', borderBottom: '1px solid var(--header-border)' }}
          className="px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {epc?.companyName}
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{epc?.email}</p>
          </div>

          <div className="flex items-center gap-3">

            {/* Country Switcher */}
            <div className="flex items-center bg-slate-100/50 rounded-lg p-0.5 gap-0.5 border border-slate-200">
              {[{ code: "IN", flag: "🇮🇳" }, { code: "AU", flag: "🇦🇺" }, { code: "NZ", flag: "🇳🇿" }].map(c => {
                const isActive = window.location.pathname.startsWith(`/${c.code.toLowerCase()}/`) || (c.code === 'IN' && !window.location.pathname.startsWith('/au/') && !window.location.pathname.startsWith('/nz/'));
                return (
                  <button key={c.code} onClick={() => window.location.href = c.code === 'IN' ? '/epc/dashboard' : `/${c.code.toLowerCase()}/epc/dashboard`}
                    className={`flex items-center justify-center w-6 h-6 rounded-md text-sm transition-all ${
                      isActive ? "bg-white shadow-sm ring-1 ring-slate-200" : "opacity-60 hover:opacity-100"
                    }`} title={c.code}>
                    <span>{c.flag}</span>
                  </button>
                )
              })}
            </div>

            {/* ✅ KW Wallet Badge */}
            <button
              onClick={() => navigate('/epc/wallet')}
              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full px-3 py-1.5 transition-colors"
              title="View Wallet"
            >
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-bold text-blue-700">
                {wallet ? wallet.totalCredits : '...'} KW
              </span>
              {wallet?.freeTrialRemaining > 0 && (
                <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-medium">
                  +{wallet.freeTrialRemaining} free
                </span>
              )}
            </button>

            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.color}`}>
              {badge.label}
            </span>

            {/* Notifications Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl hover:bg-slate-100 relative transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-96 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 z-50 border border-slate-100 max-h-96 overflow-y-auto">
                  {/* Header */}
                  <div className="flex items-center justify-between p-3 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <span className="font-bold text-xs text-slate-800">Notifications ({notifications.length})</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-[10px] text-blue-600 font-semibold hover:underline cursor-pointer">
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Batch Actions Toolbar */}
                  {notifications.length > 0 && (
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50/50 text-[10px] text-slate-600">
                      <button 
                        onClick={handleSelectAllNotifs}
                        className="font-bold hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        {selectedNotifIds.length === notifications.length ? <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> : <Square className="w-3.5 h-3.5" />}
                        Select All
                      </button>

                      {selectedNotifIds.length > 0 && (
                        <div className="flex gap-3">
                          <button 
                            onClick={handleMarkSelectedAsRead}
                            className="text-blue-600 font-bold hover:underline cursor-pointer"
                          >
                            Mark Read
                          </button>
                          <button 
                            onClick={handleDeleteSelectedNotifs}
                            className="text-red-500 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Delete Selected ({selectedNotifIds.length})
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notifications List */}
                  <div className="divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 p-4 text-center">No new notifications</p>
                    ) : (
                      notifications.map((notif) => {
                        const isSelected = selectedNotifIds.includes(notif._id);
                        return (
                          <div key={notif._id} className="p-3 flex items-start gap-2 text-left hover:bg-slate-50 transition-colors">
                            {/* Checkbox */}
                            <button 
                              onClick={() => toggleSelectNotif(notif._id)}
                              className="mt-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> : <Square className="w-3.5 h-3.5" />}
                            </button>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">{notif.title}</p>
                              <p className={`text-xs ${notif.isRead ? "text-slate-500" : "text-slate-800 font-semibold"}`}>
                                {notif.message}
                              </p>
                              <span className="text-[9px] text-slate-400 mt-1 block">
                                {new Date(notif.createdAt).toLocaleString()}
                              </span>
                            </div>

                            {/* Single row actions */}
                            <div className="flex items-center gap-1 shrink-0 self-center">
                              {!notif.isRead && (
                                <button 
                                  onClick={() => handleMarkSingleAsRead(notif._id)}
                                  className="p-1 hover:bg-slate-200 rounded text-emerald-600 cursor-pointer"
                                  title="Mark as Read"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteSingleNotif(notif._id)}
                                className="p-1 hover:bg-slate-200 rounded text-red-500 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 ml-2">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                {epc?.rating?.toFixed(1) || '0.0'}
              </span>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: 'var(--bg-app)' }}>
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ darkMode, wallet, refreshWallet: loadWallet }} />
          </div>
        </main>

      </div>
    </div>
  );
};

export default EpcLayout;