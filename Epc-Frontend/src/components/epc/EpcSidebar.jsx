import { useState, useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useEpcAuth } from '../../context/EpcAuthContext';
import epcApi from '../../api/epcApi';

const planColors = {
  Standard:     'bg-gray-700 text-gray-300',
  Professional: 'bg-blue-600/20 text-blue-400',
  Enterprise:   'bg-purple-600/20 text-purple-400',
};

// Small badge pill shown on nav items
const NavBadge = ({ count, color = 'bg-rose-500', collapsed, label }) => {
  if (!count || count <= 0) return null;
  if (collapsed) {
    return (
      <span className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full ${color} text-[9px] font-black text-white ring-2 ring-gray-900`}>
        {count > 9 ? '9+' : count}
      </span>
    );
  }
  return (
    <span
      className={`ml-auto px-1.5 py-0.5 text-[10px] font-black ${color} text-white rounded-full shrink-0 animate-pulse`}
      title={label}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

const EpcSidebar = ({ collapsed, setCollapsed, darkMode, setDarkMode, setMobileOpen }) => {
  const { epc, logout } = useEpcAuth();
  const { countryPrefix } = useParams();

  // ── Live badge counts ─────────────────────────────────────────
  const [enquiryCount, setEnquiryCount]   = useState(0); // open/unaccepted leads
  const [newOrderCount, setNewOrderCount] = useState(0); // new orders
  const [overdueCount, setOverdueCount]   = useState(0); // overdue orders

  useEffect(() => {
    const fetchBadgeCounts = async () => {
      try {
        const [enqRes, ordRes] = await Promise.allSettled([
          epcApi.get('/api/epc/enquiries'),
          epcApi.get('/api/epc/orders/summary'),
        ]);

        // Enquiries badge
        if (enqRes.status === 'fulfilled' && Array.isArray(enqRes.value.data)) {
          const open = enqRes.value.data.filter(e =>
            ['Open For EPC', 'Bid Running', 'New'].includes(e.status)
          ).length;
          setEnquiryCount(open);
        }

        // Orders badges
        if (ordRes.status === 'fulfilled' && ordRes.value.data) {
          const { data } = ordRes.value;
          setNewOrderCount(data.new ?? 0);
          setOverdueCount(data.overdue ?? 0);
        }
      } catch (e) {
        console.warn('Badge fetch skipped:', e);
      }
    };

    fetchBadgeCounts();
    const interval = setInterval(fetchBadgeCounts, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // ── Nav items with badge config ───────────────────────────────
  const navItems = [
    {
      path: '/epc/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    ...(epc?.country === 'australia' ? [
      {
        path: '/epc/stc-dashboard',
        label: 'STC Dashboard',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      {
        path: '/epc/incentives',
        label: 'Incentive Checker',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        )
      }
    ] : []),
    {
      path: '/epc/enquiries',
      label: 'My Enquiries',
      badge: enquiryCount,
      badgeColor: 'bg-rose-500',
      badgeLabel: `${enquiryCount} open lead${enquiryCount !== 1 ? 's' : ''}`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      path: '/epc/orders',
      label: 'Orders',
      badge: (newOrderCount + overdueCount) || 0,
      badgeColor: overdueCount > 0 ? 'bg-orange-500' : 'bg-emerald-500',
      badgeLabel: `${newOrderCount} new, ${overdueCount} overdue`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      path: '/epc/projects',
      label: 'Project Management',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      path: '/epc/calendar',
      label: 'Calendar Slots',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      path: '/epc/team',
      label: 'My Team',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      path: '/epc/settings',
      label: 'Admin Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      path: '/epc/plan',
      label: 'My Plan',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      path: '/epc/profile',
      label: 'My Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      path: '/epc/rate-card',
      label: 'Rate Card',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      path: '/epc/rewards',
      label: 'Rewards & Contests',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      path: '/epc/wallet',
      label: 'KW Wallet',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-60'} transition-all duration-300 bg-orange-600 border-r border-orange-700 flex flex-col h-screen sticky top-0 z-40`}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-orange-700">
        {!collapsed ? (
          <div className="flex-1 overflow-hidden flex flex-col items-center justify-center">
            <img src="/logo-white.png" alt="EmergeSun" className="w-28 h-auto object-contain object-center mb-1" />
            <p className="text-orange-200 text-[10px] uppercase tracking-wider text-center w-full">EPC Portal</p>
          </div>
        ) : (
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">ES</span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-orange-200 hover:text-white flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const resolvedPath = countryPrefix ? `/${countryPrefix.toLowerCase()}${item.path}` : item.path;
          return (
            <NavLink
              key={item.path}
              to={resolvedPath}
              title={collapsed ? item.label : undefined}
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 hover:translate-x-1 ${
                  isActive
                    ? 'bg-yellow-400 text-orange-900 font-bold shadow-md shadow-yellow-400/20'
                    : 'text-orange-100 hover:bg-orange-700 hover:text-white'
                }`
              }
            >
              {/* Icon wrapper — badge overlays here in collapsed mode */}
              <span className="relative flex-shrink-0">
                {item.icon}
                {collapsed && (
                  <NavBadge
                    count={item.badge}
                    color={item.badgeColor}
                    collapsed={true}
                    label={item.badgeLabel}
                  />
                )}
              </span>

              {/* Label + badge in expanded mode */}
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{item.label}</span>
                  <NavBadge
                    count={item.badge}
                    color={item.badgeColor}
                    collapsed={false}
                    label={item.badgeLabel}
                  />
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-orange-700 p-3 space-y-2">

        {/* Dark / Light toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-orange-200 hover:bg-orange-700 hover:text-white ${collapsed ? 'justify-center' : ''}`}
        >
          {darkMode ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
          {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* User info + logout */}
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-orange-200 text-xs font-bold">
                {epc?.companyName?.charAt(0)?.toUpperCase() || 'E'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{epc?.companyName}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${planColors[epc?.plan] || 'bg-orange-700 text-orange-200'}`}>
                {epc?.plan}
              </span>
            </div>
            <button onClick={logout} className="text-orange-200 hover:text-red-300 flex-shrink-0" title="Logout">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <button onClick={logout} className="w-full flex justify-center text-orange-200 hover:text-red-300 py-1" title="Logout">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
};

export default EpcSidebar;
