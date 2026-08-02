/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Globe,
  Zap,
  GitBranch,
  ListChecks,
  LayoutDashboard,
  Users,
  FileCheck,
  Award,
  CreditCard,
  Sun,
  Package,
  CalendarRange,
  Sliders,
  Sparkles,
  Settings,
  ShieldCheck,
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Activity,
  UserCheck,
   Wallet,
} from "lucide-react";

export const MainLayout = ({
  currentTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onLogout,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Dynamic Administrator Session Mapping
  const sessionEmail =
    localStorage.getItem("sunnovative_admin_email") ||
    "structasoftadmin@gmail.com";
  const displayInitials = sessionEmail.includes("structa") ? "SA" : "AD";
  const displayRole = sessionEmail.includes("structa")
    ? "Super Admin"
    : "SaaS Director";
  const displayShortName = sessionEmail.includes("structa")
    ? "Structa Owner"
    : "SaaS Admin";

  const currentRole = localStorage.getItem("sunnovative_user_role") || "Admin";
  const isVeneet = sessionEmail === "veneet@sunnovative.com";

  let portalName = `Solar ${currentRole.toUpperCase()} Portal`;
  let platformBadge = `${currentRole.toUpperCase()} PLATFORM`;

  if (isVeneet || currentRole.toLowerCase() === "viewer") {
    portalName = "Order Journey Portal";
    platformBadge = "ORDER JOURNEY PLATFORM";
  } else if (currentRole.toLowerCase() !== "admin" && currentRole.toLowerCase() !== "super admin" && currentRole.toLowerCase() !== "saas director") {
    portalName = `${currentRole.toUpperCase()} Portal`;
    platformBadge = `${currentRole.toUpperCase()} PLATFORM`;
  }

  const allMenuItems = [
    {
      name: "Dashboard",
      id: "dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "EPC Partners",
      id: "epc-partners",
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: "KYC & Agreement",
      id: "kyc-agreement",
      icon: <FileCheck className="w-5 h-5" />,
    },
    {
      name: "Partner Qualification",
      id: "qualification",
      icon: <Award className="w-5 h-5" />,
    },
    {
      name: "Website Leads",
      id: "website-leads",
      icon: <UserCheck className="w-5 h-5" />,
    },
    {
      name: "Plans & Subscriptions",
      id: "subscriptions",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
  name: "EPC Wallet Settings",
  id: "epc-wallet-settings",
  icon: <Wallet className="w-5 h-5" />,
},
{
  name: "EPC System Settings",
  id: "epc-system-settings",
  icon: <Settings className="w-5 h-5" />,
},
    { name: "Projects", id: "projects", icon: <Sun className="w-5 h-5" /> },
    { name: "Project Orders", id: "project-orders", icon: <ListChecks className="w-5 h-5" /> },
    { name: "Products", id: "products", icon: <Package className="w-5 h-5" /> },
    { name: "Demand & Supply", id: "demand-supply", icon: <Activity className="w-5 h-5" /> },
    {
      name: "Project Order Settings",
      id: "order-settings",
      icon: <CalendarRange className="w-5 h-5" />,
    },
    {
      name: "Order Process Settings",
      id: "process-settings",
      icon: <Sliders className="w-5 h-5" />,
    },
    {
      name: "Ratings & Benefits",
      id: "ratings-benefits",
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      name: "EPC Partner Settings",
      id: "epc-settings",
      icon: <Settings className="w-5 h-5" />,
    },
    {
      name: "Order Journey Settings",
      id: "order-journey",
      icon: <GitBranch className="w-5 h-5" />,
    },
    {
      name: "Discom Management",
      id: "discom-management",
      icon: <Zap className="w-5 h-5" />,
    },
    {
      name: "Country Websites",
      id: "country-websites",
      icon: <Globe className="w-5 h-5" />,
    },
    {
      name: "Brand Management",
      id: "brand-management",
      icon: <Package className="w-5 h-5" />,
    },
    {
      name: "Admin Settings",
      id: "admin-settings",
      icon: <ShieldCheck className="w-5 h-5" />,
    },
    {
      name: "BDE Management",
      id: "bde-management",
      icon: <Users className="w-5 h-5" />,
    },
  ];

  const filteredMenuItems = isVeneet 
    ? allMenuItems.filter(item => ["dashboard", "project-orders", "order-journey"].includes(item.id))
    : allMenuItems;

  // ── Website Content — Settings sub-pages (each is its own page with its own Save button) ──
  const websiteContentItems = [
    { name: "Brand & Logo", id: "website-brand" },
    { name: "Hero Section", id: "website-hero" },
    { name: "Stats Bar", id: "website-stats" },
    { name: "Benefits Section", id: "website-benefits" },
    { name: "How It Works", id: "website-howitworks" },
    { name: "Trust / About", id: "website-trust" },
    { name: "Milestones", id: "website-milestones" },
    { name: "FAQs", id: "website-faqs" },
    { name: "Footer Details", id: "website-footer" },
    { name: "Video Guides", id: "website-videos" },
  ];
  const websiteContentIds = websiteContentItems.map((item) => item.id);

  // ── Customer Eligibility — Settings sub-pages (each is its own page with its own Save button) ──
  const eligibilityItems = [
    { name: "Bill → KW Mapping", id: "eligibility-bill-kw" },
    { name: "State-wise Subsidy", id: "eligibility-state-subsidy" },
    { name: "Project Categories", id: "eligibility-categories" },
    { name: "Inverter Types", id: "eligibility-inverters" },
    { name: "Meter Categories", id: "eligibility-meter" },
    { name: "Bill Status Rules", id: "eligibility-billstatus" },
    { name: "KW Derivation Rules", id: "eligibility-kw" },
    { name: "Subsidy Criteria", id: "eligibility-subsidy" },
    { name: "Due Amount Threshold", id: "eligibility-dueamount" },
  ];
  const eligibilityIds = eligibilityItems.map((item) => item.id);

  const epcSequenceItems = [
    { name: "KYC & Agreement", id: "kyc-agreement", step: 1 },
    { name: "Partner Qualification", id: "qualification", step: 2 },
    { name: "Ratings & Benefits", id: "ratings-benefits", step: 3 },
    { name: "EPC Partner Settings", id: "epc-settings", step: 4 },
    { name: "Rewards & Incentives", id: "epc-rewards", step: 5 },
  ];

  const epcSequenceIds = epcSequenceItems.map((item) => item.id);
  const topLevelMenuItems = filteredMenuItems.filter(
    (item) => !epcSequenceIds.includes(item.id),
  );

  const [epcSettingsOpen, setEpcSettingsOpen] = useState(true);
  const [websiteContentOpen, setWebsiteContentOpen] = useState(false);
  const [eligibilityOpen, setEligibilityOpen] = useState(false);

  // Auto-expand if the active tab is one of the sub-tabs in the sequence
  React.useEffect(() => {
    if (epcSequenceIds.includes(currentTab)) {
      setEpcSettingsOpen(true);
    }
    if (websiteContentIds.includes(currentTab)) {
      setWebsiteContentOpen(true);
    }
    if (eligibilityIds.includes(currentTab)) {
      setEligibilityOpen(true);
    }
  }, [currentTab]);

  const currentTabName =
    allMenuItems.find((item) => item.id === currentTab)?.name ||
    websiteContentItems.find((item) => item.id === currentTab)?.name ||
    eligibilityItems.find((item) => item.id === currentTab)?.name ||
    "Sunnovative";

  const [notifications, setNotifications] = useState([]);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

  React.useEffect(() => {
    fetchNotifications();
    const int = setInterval(fetchNotifications, 60000); // refresh every minute
    return () => clearInterval(int);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications/Admin`);
      const data = await res.json();
      if (data.success) setNotifications(data.data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_BASE}/api/notifications/Admin/read-all`, { method: "PUT" });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ── Reusable dropdown block — used for both Website Content and Customer Eligibility ──
  const DropdownGroup = ({
    label,
    icon,
    isOpen,
    setIsOpen,
    items,
    activeIds,
    showStep = false,
    onMobileSelect,
  }) => (
    <div className="space-y-1 pt-1 pb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
          activeIds.includes(currentTab)
            ? "bg-white/10 text-white font-semibold border-l-2 border-secondary"
            : "text-sky-100 hover:bg-white/5 hover:text-white"
        }`}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span>{label}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-sky-300 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="pl-6 ml-4 border-l border-sky-800/60 mt-1 space-y-1.5 relative">
          {items.map((subItem) => {
            const isSubActive = currentTab === subItem.id;
            return (
              <button
                key={subItem.id}
                onClick={() => {
                  onTabChange(subItem.id);
                  if (onMobileSelect) onMobileSelect();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                  isSubActive
                    ? "bg-secondary text-primary font-extrabold shadow-xs"
                    : "text-sky-200 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="truncate">{subItem.name}</span>
                {showStep && subItem.step && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm font-bold shrink-0 ml-1.5 ${
                      isSubActive
                        ? "bg-primary text-white"
                        : "bg-[#0b3852] text-sky-300 border border-sky-800/40"
                    }`}
                  >
                    Step {subItem.step}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-bg-soft flex font-sans antialiased text-text-navy">
      {/* BACKGROUND GRAPHIC ACCENTS */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full filter blur-3xl pointer-events-none -z-10" />

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex flex-col w-64 bg-primary text-white border-r border-[#154E6F] flex-shrink-0 z-30 transition-all duration-300">
        <div className="h-16 flex items-center px-6 gap-3 border-b border-[#154E6F]">
          <div className="p-2 bg-secondary rounded-xl text-primary font-bold">
            <Sun className="w-6 h-6 animate-spin-slow rotate-12" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight font-display select-none block">
              SUNNOVATIVE
            </span>
            <span className="text-[10px] text-sky-200 uppercase tracking-widest font-mono">
              {portalName}
            </span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin space-y-1.5">
          {/* Dashboard & EPC Partners */}
          {topLevelMenuItems.slice(0, 2).map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-secondary text-primary font-bold shadow-md shadow-secondary/15 transform translate-x-1.5"
                    : "text-sky-100 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.icon}
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}

          {/* EPC Settings Setup Step-Sequence Dropdown */}
          {!isVeneet && (
            <DropdownGroup
              label="EPC Settings"
              icon={<Settings className="w-5 h-5 text-sky-200" />}
              isOpen={epcSettingsOpen}
              setIsOpen={setEpcSettingsOpen}
              items={epcSequenceItems}
              activeIds={epcSequenceIds}
              showStep
            />
          )}

          {/* Remaining Top Level Menu Items (Plans, Projects, Products, Settings, Admin) */}
          {topLevelMenuItems.slice(2).map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-secondary text-primary font-bold shadow-md shadow-secondary/15 transform translate-x-1.5"
                    : "text-sky-100 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.icon}
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}

          {/* Customer Eligibility Dropdown — each sub-page has its own Save button */}
          {!isVeneet && (
            <DropdownGroup
              label="Customer Eligibility"
              icon={<Zap className="w-5 h-5 text-sky-200" />}
              isOpen={eligibilityOpen}
              setIsOpen={setEligibilityOpen}
              items={eligibilityItems}
              activeIds={eligibilityIds}
            />
          )}

          {/* Website Content Dropdown — each sub-page has its own Save button */}
          {!isVeneet && (
            <DropdownGroup
              label="Website Content"
              icon={<Globe className="w-5 h-5 text-sky-200" />}
              isOpen={websiteContentOpen}
              setIsOpen={setWebsiteContentOpen}
              items={websiteContentItems}
              activeIds={websiteContentIds}
            />
          )}
        </nav>

        {/* Sidebar footer account banner */}
        <div className="p-4 border-t border-[#154E6F] bg-[#072B3E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-secondary/15 border border-secondary/20 flex items-center justify-center font-bold text-secondary text-xs">
              {displayInitials}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-white truncate max-w-[110px]">
                {displayShortName}
              </p>
              <p className="text-[10px] text-sky-300 leading-none truncate max-w-[110px]">
                {displayRole}
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              onLogout ? onLogout() : alert("Simulated log out!")
            }
            className="p-1.5 rounded-lg text-sky-300 hover:text-[#EF4444] hover:bg-white/5 transition-colors cursor-pointer"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* --- MOBILE COLLAPSIBLE SIDEBAR --- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          {/* overlay */}
          <div
            className="fixed inset-0 bg-primary/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative flex w-full max-w-xs flex-col bg-primary pt-5 pb-4 text-white shadow-xl">
            <div className="absolute top-2 right-2 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-hidden text-white hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-shrink-0 items-center px-6 gap-3 mb-4">
              <div className="p-2 bg-secondary rounded-xl text-primary font-bold">
                <Sun className="w-6 h-6 rotate-12" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight font-display text-white">
                  SUNNOVATIVE
                </span>
                <span className="text-[10px] text-sky-200 block uppercase tracking-wider font-mono">
                  {portalName}
                </span>
              </div>
            </div>

            <div className="mt-5 h-0 flex-1 overflow-y-auto px-4 space-y-1.5 pb-8">
              {/* Dashboard & EPC Partners */}
              {topLevelMenuItems.slice(0, 2).map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-secondary text-primary font-bold shadow-md shadow-secondary/15"
                        : "text-sky-100 hover:bg-white/5"
                    }`}
                  >
                    {item.icon}
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}

              {/* EPC Settings Setup Step-Sequence Dropdown */}
              {!isVeneet && (
                <DropdownGroup
                  label="EPC Settings"
                  icon={<Settings className="w-5 h-5 text-sky-200" />}
                  isOpen={epcSettingsOpen}
                  setIsOpen={setEpcSettingsOpen}
                  items={epcSequenceItems}
                  activeIds={epcSequenceIds}
                  showStep
                  onMobileSelect={() => setMobileMenuOpen(false)}
                />
              )}

              {/* Remaining Top Level Menu Items (Plans, Projects, Products, Settings, Admin) */}
              {topLevelMenuItems.slice(2).map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-secondary text-primary font-bold shadow-md shadow-secondary/15"
                        : "text-sky-100 hover:bg-white/5"
                    }`}
                  >
                    {item.icon}
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}

              {/* Customer Eligibility Dropdown */}
              {!isVeneet && (
                <DropdownGroup
                  label="Customer Eligibility"
                  icon={<Zap className="w-5 h-5 text-sky-200" />}
                  isOpen={eligibilityOpen}
                  setIsOpen={setEligibilityOpen}
                  items={eligibilityItems}
                  activeIds={eligibilityIds}
                  onMobileSelect={() => setMobileMenuOpen(false)}
                />
              )}

              {/* Website Content Dropdown */}
              {!isVeneet && (
                <DropdownGroup
                  label="Website Content"
                  icon={<Globe className="w-5 h-5 text-sky-200" />}
                  isOpen={websiteContentOpen}
                  setIsOpen={setWebsiteContentOpen}
                  items={websiteContentItems}
                  activeIds={websiteContentIds}
                  onMobileSelect={() => setMobileMenuOpen(false)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENT CONTAINER WRAPPER --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* --- TOP NAVBAR --- */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 shadow-xs">
          {/* Logo & Burger for mobile layout */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-primary hover:bg-gray-50 focus:outline-hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-extrabold text-sm font-display tracking-tight text-primary">
              SUNNOVATIVE
            </span>
          </div>

          {/* Search Box */}
          <div className="hidden sm:flex items-center flex-1 max-w-md">
            <div className="relative w-full text-gray-400 focus-within:text-primary">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4" aria-hidden="true" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search EPCs, local projects, products, rules..."
                className="block w-full rounded-xl border border-gray-100 bg-gray-50 py-2 pl-9 pr-3 text-sm text-text-navy placeholder-gray-400 focus:border-primary/25 focus:bg-white focus:outline-hidden transition-all font-sans"
              />

              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 font-bold text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Action Icons Panel */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Sync Status Accent */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
              <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-700 font-mono">
                LIVE CLOUD SYNCHRONIZED
              </span>
            </div>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                className="p-2 rounded-xl text-primary hover:bg-gray-50 relative cursor-pointer"
              >
                <span className="sr-only">Notifications</span>
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2.5 w-80 origin-top-right rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5 z-40 border border-gray-100 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-50">
                      <span className="font-bold text-xs text-primary font-display">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[10px] text-accent font-semibold hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="mt-2 divide-y divide-gray-55 space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-gray-500 py-4 text-center">No new notifications</p>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif._id} className="pt-2 text-left">
                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">{notif.title}</p>
                            <p
                              className={`text-xs ${notif.isRead ? "text-gray-500" : "text-primary font-semibold"}`}
                            >
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-gray-400 mt-1 block">
                              {new Date(notif.createdAt).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 focus:outline-hidden cursor-pointer hover:opacity-90"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center border border-primary/20">
                  {displayInitials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-primary leading-tight">
                    {displayShortName}
                  </p>
                  <p className="text-[10px] text-gray-400">{displayRole}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-primary" />
              </button>

              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-2.5 w-48 origin-top-right rounded-2xl bg-white shadow-xl ring-1 ring-black/5 z-40 border border-gray-100 py-1">
                    <button
                      onClick={() => {
                        onTabChange("admin-settings");
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      Settings Profile
                    </button>
                    <button
                      onClick={() => {
                        onTabChange("epc-settings");
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <UserCheck className="w-4 h-4 text-gray-400" />
                      Approval Workflow
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        if (onLogout) {
                          onLogout();
                        } else {
                          alert("Simulating Log Out");
                        }
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* --- DYNAMIC BREADCRUMB / TOP PAGEHEADER --- */}
        <section className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {/* Breadcrumb path */}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
              <span>SaaS System</span>
              <span className="text-gray-300">/</span>
              <span className="text-primary capitalize">
                {currentTab.replace("-", " ")}
              </span>
            </div>

            <div className="flex items-center gap-2.5 mt-1">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-primary tracking-tight">
                {currentTabName}
              </h1>
              <div className="bg-sky-50 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">
                {platformBadge}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-gray-400">
              Platform Time:{" "}
              <strong className="text-gray-600 font-semibold">
                {new Date().toISOString().split("T")[0]} 10:40:58 UTC
              </strong>
            </span>
          </div>
        </section>

        {/* --- MAIN PAGE CONTENT OUTLET --- */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
};