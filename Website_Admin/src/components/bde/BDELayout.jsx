import React, { useState, useEffect, useRef } from "react";
import { LayoutDashboard, Users, Map, LogOut, Sun, ClipboardList, AlertTriangle, Bell, Trash2, CheckSquare, Square, Check, User } from "lucide-react";

export default function BDELayout({ children, currentTab, onTabChange, onLogout, bdeName, bdeId, bdeType, userCountry, onCountryChange }) {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifIds, setSelectedNotifIds] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [tabCounts, setTabCounts] = useState({ leads: 0, projects: 0, prospects: 0 });
  const [bdeData, setBdeData] = useState(null);
  const [allCountries, setAllCountries] = useState([]);
  const notifRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

  const loadCounts = async () => {
    try {
      const [leadsRes, projRes] = await Promise.all([
        fetch(`${API_BASE}/api/bde/${bdeId}/leads`).catch(() => null),
        fetch(`${API_BASE}/api/bde/${bdeId}/projects`).catch(() => null)
      ]);
      let eligibilityCount = 0;
      let leadsCount = 0;
      let prospectsCount = 0;
      let projCount = 0;
      
      if (leadsRes && leadsRes.ok) {
        const d = await leadsRes.json();
        const bdeLeads = d.leads || [];
        const isFreelance = bdeType?.toLowerCase().includes("freelance");
        
        bdeLeads.forEach(l => {
             const isManual = l.history?.some(h => h.action.includes("Manually created by BDE"));
             const isTargetSource = isFreelance ? isManual : !isManual;
             
             if (!isTargetSource) return;
             if (l.status === 'Converted' || l.status === 'Not Interested' || l.status === 'Lost' || l.bdeMovedToOrderJourney) return;
             
             if (l.status === "RAW") {
                 if (isFreelance) {
                   leadsCount++;
                   return;
                 }
             }
             
             // A lead that is moved to Order Journey leaves Prospects
             const isInOrderJourney = l.bdeMovedToOrderJourney;

             if (isFreelance) {
               if (l.isEligibleForInstallation || l.installDateBooked) {
                 if (!isInOrderJourney) prospectsCount++;
               } else {
                 eligibilityCount++;
               }
             } else {
               if (!isInOrderJourney) prospectsCount++;
             }
        });
      }
      if (projRes && projRes.ok) {
        const p = await projRes.json();
        projCount = p.data?.length || p.projects?.length || 0;
      }
      setTabCounts({ eligibility: eligibilityCount, myleads: leadsCount, prospects: prospectsCount, projects: projCount });
    } catch (e) {
      console.warn("Failed to load BDE tab counts", e);
    }
  };

  const loadNotifications = async () => {
    try {
      if (!bdeId) return;
      const res = await fetch(`${API_BASE}/api/notifications/bde/${bdeId}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadNotifications();
    loadCounts();
    if(bdeId) {
      fetch(`${API_BASE}/api/bde/${bdeId}`).then(r=>r.json()).then(d=>{
        if(d.success) setBdeData(d.data);
      }).catch(e=>console.log(e));
    }
    fetch(`${API_BASE}/api/countries`).then(r=>r.json()).then(d=>{
      if(d.success) setAllCountries(d.data);
    }).catch(e=>console.log(e));
    const int = setInterval(() => {
      loadNotifications();
      loadCounts();
    }, 60000);
    return () => clearInterval(int);
  }, [bdeId]);

  const isFreelancer = bdeType?.toLowerCase().includes("freelance");

  const navItems = [
    { id: "bde-aust", name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 text-emerald-400" /> },
    ...(isFreelancer ? [{ id: "bde-my-leads", name: "My Leads", icon: <Users className="w-5 h-5" />, count: tabCounts.myleads || 0 }] : []),
    ...(isFreelancer ? [{ id: "bde-customer-eligibility", name: "Customer Eligibility List", icon: <Users className="w-5 h-5" />, count: tabCounts.eligibility || 0 }] : []),
    { id: "bde-prospects", name: "My Prospects", icon: <CheckSquare className="w-5 h-5" />, count: tabCounts.prospects || 0 },
    { id: "bde-projects", name: "Customer Order Journey", icon: <ClipboardList className="w-5 h-5" />, count: tabCounts.projects || 0 },
    ...(!isFreelancer ? [{ id: "bde-demand", name: "Demand Pool", icon: <Map className="w-5 h-5" /> }] : []),
    { id: "bde-profile", name: "My Profile", icon: <User className="w-5 h-5" /> }
  ];

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
      await fetch(`${API_BASE}/api/notifications/delete-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedNotifIds })
      });
      setSelectedNotifIds([]);
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedNotifIds.length === 0) return;
    try {
      await fetch(`${API_BASE}/api/notifications/mark-all-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedNotifIds })
      });
      setSelectedNotifIds([]);
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSingleNotif = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await fetch(`${API_BASE}/api/notifications/${id}`, { method: "DELETE" });
      setSelectedNotifIds(prev => prev.filter(x => x !== id));
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkSingleAsRead = async (id) => {
    try {
      await fetch(`${API_BASE}/api/notifications/${id}/read`, { method: "PUT" });
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      const ids = notifications.filter(n => !n.isRead).map(n => n._id);
      if (ids.length === 0) return;
      await fetch(`${API_BASE}/api/notifications/mark-all-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids })
      });
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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20 flex-shrink-0">
        <div className="min-h-16 py-3 flex flex-col justify-center px-6 border-b border-white/10 shrink-0 mt-4 mb-4">
          <img src="/logo-white.png" alt="EmergeSun" className="w-32 h-auto object-contain object-left" />
          <p className="text-[10px] uppercase tracking-wider text-amber-500/80 font-bold mt-1">BDE Portal</p>
        </div>

        <div className="px-4 py-3 border-b border-white/10 mb-4 bg-slate-800/50">
          <p className="text-xs text-slate-400 font-medium">Logged in as</p>
          <p className="text-sm font-semibold text-white truncate">{bdeName || "BDE Agent"}</p>
        </div>

        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto mt-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 ${
                currentTab === item.id 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
              {item.count > 0 && (
                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${currentTab === item.id ? 'bg-white text-blue-600' : 'bg-slate-700 text-slate-300'}`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 hover:text-rose-400 rounded-xl transition-all font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50/50 overflow-hidden relative">
        <header className="min-h-16 py-3 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-[100] sticky top-0 backdrop-blur-md bg-white/80">
          <h1 className="text-xl font-bold text-gray-800">
            {navItems.find(i => i.id === currentTab)?.name || "Dashboard"}
          </h1>

          {/* Notifications Bell for BDE */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-xl hover:bg-slate-100 relative transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5 text-gray-600" />
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
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50/50 text-[10px] text-slate-650">
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
                <div className="divide-y divide-slate-100">
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
        </header>
        <div className="flex-1 overflow-auto p-6 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
}
