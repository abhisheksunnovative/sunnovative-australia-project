/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sun, Menu, X, PhoneCall, ShieldCheck, Zap, User } from "lucide-react";
import { useWebsiteSettings } from "../hooks/useWebsiteSettings";
import { useCountry } from "../context/CountryContext";

export default function Header({
  onOpenEpcModal,
  onScrollToForm,
  viewMode,
  setViewMode,
  onOpenCustomerLogin,
  isCustomerLoggedIn,
  customerName,
  settings: propSettings,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const baseSettings = useWebsiteSettings();
  const settings = propSettings || baseSettings;
  const brand = settings.brand || {};
  const footer = settings.footer || {};
  const { country, setCountry, t } = useCountry();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const navItems = (settings.websiteContent && settings.websiteContent.navItems && settings.websiteContent.navItems.length > 0) 
    ? settings.websiteContent.navItems 
    : [
        { label: "Sectors & Benefits", href: "#benefits", isPageLink: true },
        {
          label: "Check Subsidy",
          href: "#eligibility-calculator",
          isPageLink: true,
        },
        { label: "Solar Blogs", href: "#blog", isPageLink: false },
        { label: "FAQs", href: "#faqs", isPageLink: true },
      ];

  const handleNavClick = (e, href, isPageLink) => {
    e.preventDefault();
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
      {/* Top micro bar for trust declarations */}
      <div className="bg-gradient-to-r from-solar-navy via-slate-900 to-solar-navy text-white px-4 py-1.5 text-center text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 md:gap-3 flex-wrap">
        <span className="flex items-center gap-1 text-solar-yellow">
          <Zap className="w-3.5 h-3.5 fill-solar-yellow text-solar-yellow" />
          PM Surya Ghar Yojana Empaneled Vendor
        </span>
        <span className="hidden md:inline text-slate-400">|</span>
        <span className="flex items-center gap-1 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          Up to ₹78,000 Govt Subsidy Guaranteed
        </span>
        <span className="hidden md:inline text-slate-400">|</span>
        <a
          href="tel:+919898231245"
          className="hover:text-solar-yellow font-bold text-white transition-all flex items-center gap-1"
        >
          📞 {brand.hubLabel || "Call Rajkot Hub"}: {brand.phone || "+91 98982 31245"}
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
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
            <div className="w-10 h-10 rounded-xl bg-solar-yellow flex items-center justify-center text-solar-navy transition-all group-hover:scale-105 shadow-md shadow-amber-200">
              <Sun
                className="w-6 h-6 animate-spin-slow text-slate-955 fill-amber-300"
                style={{ animationDuration: "20s" }}
              />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-lg font-display font-black tracking-tight text-slate-900 leading-tight">
              {brand.companyName || "SUNNOVATIVE"}
            </span>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#0081C9] uppercase leading-none">
              {brand.tagline || "Solar System"}
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6" id="desktop-nav">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href, item.isPageLink)}
              className="text-[14px] font-semibold text-slate-700 hover:text-solar-sky transition-colors px-1"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Action Button & Menu Toggler */}
        <div className="flex items-center gap-3">
          {/* Country Switcher */}
          <div className="hidden sm:flex items-center bg-slate-100 rounded-xl p-0.5 gap-0.5">
            {[{ code: "IN", flag: "🇮🇳", label: "IN" }, { code: "AU", flag: "🇦🇺", label: "AU" }, { code: "NZ", flag: "🇳🇿", label: "NZ" }].map(c => (
              <button key={c.code} onClick={() => window.location.href = c.code === 'IN' ? '/' : `/${c.code.toLowerCase()}/`}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  country === c.code ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"
                }`}>
                <span>{c.flag}</span><span>{c.label}</span>
              </button>
            ))}
          </div>

          {/* My Account button */}
          <button
            onClick={onOpenCustomerLogin}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border ${
              isCustomerLoggedIn
                ? "bg-solar-yellow/10 text-yellow-700 border-yellow-300 hover:bg-solar-yellow/20"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            {isCustomerLoggedIn ? (customerName?.split(" ")[0] || "My Account") : "Login"}
          </button>

          <button
            onClick={onScrollToForm}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#0081C9] hover:bg-[#005F9E] text-white text-xs font-bold rounded-xl shadow-md shadow-sky-100 transition-all cursor-pointer"
            id="header-cta-quote"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            {t?.ctaLabel || "Free Consultation"}
          </button>

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
            <div className="w-8 h-8 rounded-lg bg-solar-yellow flex items-center justify-center text-solar-navy">
              <Sun className="w-5 h-5 text-slate-900 fill-amber-300" />
            </div>
            <span className="font-display font-black text-xs text-slate-900 uppercase tracking-widest">
              Sunnovative
            </span>
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
                onClick={(e) => handleNavClick(e, item.href, item.isPageLink)}
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
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 gap-0.5">
              {[{ code: "IN", flag: "🇮🇳", label: "IN" }, { code: "AU", flag: "🇦🇺", label: "AU" }, { code: "NZ", flag: "🇳🇿", label: "NZ" }].map(c => (
                <button key={c.code} onClick={() => window.location.href = c.code === 'IN' ? '/' : `/${c.code.toLowerCase()}/`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    country === c.code ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"
                  }`}>
                  <span>{c.flag}</span><span>{c.label}</span>
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
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onScrollToForm();
            }}
            className="w-full py-3 px-4 text-center rounded-xl font-bold bg-[#0081C9] hover:bg-[#005F9E] text-white text-xs uppercase tracking-wider shadow-md shadow-sky-100 transition cursor-pointer"
            id="mobile-nav-cta"
          >
            Get Free Solar Quote
          </button>
        </div>
      </div>
    </header>
  );
}