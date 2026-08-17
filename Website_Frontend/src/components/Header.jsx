/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sun, Menu, X, PhoneCall, ShieldCheck, Zap, User, ChevronDown } from "lucide-react";
import { useWebsiteSettings } from "../hooks/useWebsiteSettings";
import { useCountry } from "../context/CountryContext";

export default function Header({
  onOpenEpcModal = () => {},
  onScrollToForm = () => {},
  viewMode = "home",
  setViewMode = () => {},
  onOpenCustomerLogin = () => {},
  isCustomerLoggedIn = false,
  customerName = "",
  settings: propSettings,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [availableCountries, setAvailableCountries] = useState([]);
  const baseSettings = useWebsiteSettings();
  const settings = propSettings || baseSettings;

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4005'}/api/countries`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setAvailableCountries(data.data.filter(c => c.isActive !== false));
        }
      })
      .catch(e => console.error("Error fetching countries:", e));
  }, []);

  const getCountryRoute = (c) => {
    const code = (c.code || '').toLowerCase();
    const name = (c.name || '').toLowerCase();
    if (code === 'in' || code === 'india' || name === 'india') return '/';
    if (code === 'au' || code === 'australia' || name === 'australia') return '/au/';
    if (code === 'nz' || code === 'newzealand' || name === 'new zealand') return '/nz/';
    return `/${code}/`;
  };

  const getShortCode = (c) => {
    const code = (c.code || '').toLowerCase();
    const name = (c.name || '').toLowerCase();
    if (code === 'india' || name === 'india') return 'IN';
    if (code === 'australia' || name === 'australia') return 'AU';
    if (code === 'newzealand' || name === 'new zealand') return 'NZ';
    return (c.code || '').substring(0, 2).toUpperCase();
  };

  const brand = settings.brand || {};
  const footer = settings.footer || {};
  const { country, setCountry, t } = useCountry();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const navItems = (settings.websiteContent && settings.websiteContent.navItems && settings.websiteContent.navItems.length > 0) 
    ? settings.websiteContent.navItems 
    : [
        { label: "Home", href: "/", isPageLink: false, isExternalLink: false },
        { label: "How It Works", href: "/how-it-works", isPageLink: false, isExternalLink: false },
        { label: "Our Platform", href: "/platform", isPageLink: false, isExternalLink: false },
        { label: "Solar Blogs", href: "#blog", isPageLink: false },
        { label: "FAQs", href: "#faqs", isPageLink: true },
      ];

  const handleNavClick = (e, item) => {
    e.preventDefault();
    const { href, isPageLink, isExternalLink } = item;

    if (href.startsWith('/')) {
      window.location.href = href;
      return;
    }

    setMobileMenuOpen(false);

    if (href === "#blog") {
      setViewMode("blog");
      window.location.hash = "blog";
      window.scrollTo(0, 0);
      return;
    }

    if (!isPageLink) {
      // Any other non-page link handles (like blog)
      return;
    }

    if (viewMode !== "home") {
      setViewMode("home");
      // allow component to render before scrolling
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
      return;
    }

    const element = document.querySelector(href);
    if (element) {
      const offset = 80; // height of the sticky nav
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-md border-b border-white/25 shadow-sm">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[72px] py-3 flex items-center justify-between">
        {/* Logo and Brand */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setViewMode("home");
          }}
          className="flex items-center gap-2 group shrink-0"
          id="brand-logo-link"
        >
          {brand.logoUrl ? (
            <img
              src={brand.logoUrl}
              alt={brand.companyName || "Logo"}
              className="w-10 h-10 rounded-xl object-contain transition-all group-hover:scale-105"
            />
          ) : (
            <img src="/logo.png" alt="EmergeSun" className="w-32 h-auto object-contain" />
          )}
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6" id="desktop-nav">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item)}
              className="text-[14px] font-semibold text-slate-700 hover:text-solar-sky transition-colors px-1"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Action Button & Menu Toggler */}
        <div className="flex items-center gap-3">
          {/* Country Switcher Dropdown */}
          <div className="relative group hidden sm:flex items-center">
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-700 hover:text-solar-navy transition-all">
              <span className="text-lg">{availableCountries.find(c => c.code === country || c.name === country)?.flagEmoji || ''}</span>
              <span className="uppercase">{availableCountries.find(c => c.code === country || c.name === country)?.code?.substring(0, 3) || country || "IN"}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-solar-navy" />
            </button>
            <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
              {availableCountries.length > 0 ? availableCountries.map(c => (
                <button
                  key={c.code}
                  onClick={() => window.location.href = getCountryRoute(c)}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-solar-navy transition-colors flex items-center gap-3"
                >
                  {c.flagEmoji && <span className="text-base">{c.flagEmoji}</span>}
                  <span className="truncate">{c.name}</span>
                </button>
              )) : (
                <div className="px-4 py-2 text-sm text-slate-400">Loading...</div>
              )}
            </div>
          </div>

          {/* Signup/Login Button */}
          <button
            onClick={onOpenCustomerLogin}
            className={`hidden sm:inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${
              isCustomerLoggedIn
                ? "bg-orange-600 text-white hover:bg-orange-600/90 shadow-lg shadow-solar-navy/20"
                : "bg-orange-600 text-white hover:bg-orange-600/90 shadow-lg shadow-solar-navy/20"
            }`}
          >
            {isCustomerLoggedIn ? (customerName?.split(" ")[0] || "My Account") : "Customer Login"}
          </button>

          {/* EPC Installer Button */}
          <a
            href={import.meta.env.VITE_EPC_PORTAL_URL || 'http://localhost:5173'}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-all cursor-pointer shadow-lg shadow-orange-500/20 gap-1.5"
          >
            <Zap className="w-4 h-4" />
            Installer Login
          </a>


          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl focus:outline-none transition-colors border border-slate-100"
            aria-expanded={mobileMenuOpen}
            id="mobile-menu-toggler"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Right Slide-out Drawer & Backdrop */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className={`lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          mobileMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
        id="mobile-nav-backdrop"
      />

      <div
        id="mobile-nav-panel"
        onClick={(e) => e.stopPropagation()}
        className={`lg:hidden fixed top-0 right-0 h-svh w-[320px] max-w-[85vw] bg-white z-55 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header with Title and Cancel Button */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.companyName || "EmergeSun"} className="h-8 w-auto object-contain" />
            ) : (
              <img src="/logo.png" alt="EmergeSun" className="h-8 w-auto object-contain" />
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 border border-slate-150 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold"
            id="mobile-menu-close-btn"
          >
            <X className="w-4 h-4 text-rose-500" />
            <span>Close</span>
          </button>
        </div>

        {/* Scrollable links */}
        <div className="flex-1 px-5 py-6 space-y-3 overflow-y-auto">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">
            Navigation Menu
          </span>
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className="flex items-center p-3 rounded-xl text-slate-700 hover:text-solar-sky hover:bg-slate-50 text-sm font-semibold transition border border-transparent hover:border-slate-100"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* Action Buttons at bottom of Drawer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-3">

          {/* Country Switcher — mobile */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Region:</span>
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 gap-0.5 overflow-x-auto max-w-[220px]">
              {availableCountries.map(c => (
                <button key={c.code} onClick={() => window.location.href = getCountryRoute(c)}
                  className={`flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    country === getShortCode(c) ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"
                  }`}>
                  {c.flag && <span>{c.flag}</span>}<span>{getShortCode(c)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Customer Login/Account */}
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenCustomerLogin?.(); }}
            className={`w-full py-3 px-4 text-center rounded-xl font-bold text-xs uppercase tracking-wider transition border cursor-pointer flex items-center justify-center gap-2 ${
              isCustomerLoggedIn
                ? "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            {isCustomerLoggedIn ? `My Account (${customerName?.split(" ")[0]})` : "Customer Login"}
          </button>
          <a
            href={import.meta.env.VITE_EPC_PORTAL_URL || 'http://localhost:3001'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 text-center rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white text-xs uppercase tracking-wider shadow-md shadow-orange-100 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Zap className="w-3.5 h-3.5" />
            Solar Installer Login
          </a>
        </div>
      </div>
    </header>
  );
}
