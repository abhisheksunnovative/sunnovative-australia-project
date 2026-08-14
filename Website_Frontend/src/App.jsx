/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from "react";
import { Sun, Sparkles, Zap } from "lucide-react";
import { CustomerAuthProvider, useCustomerAuth } from "./customer/CustomerAuthContext";
import { CountryProvider } from "./context/CountryContext";
import { BrowserRouter, Routes, Route, useParams, Navigate } from "react-router-dom";
import { useCountry } from "./context/CountryContext";
import { useWebsiteSettings } from "./hooks/useWebsiteSettings";

// Lazy load components to minimize initial bundle size and speed up rendering
const Header = lazy(() => import("./components/Header"));
const Hero = lazy(() => import("./components/Hero"));
const Benefits = lazy(() => import("./components/Benefits"));
const HowItWorks = lazy(() => import("./components/HowItWorks"));
const LeadForm = lazy(() => import("./components/LeadForm"));
const TrustSection = lazy(() => import("./components/TrustSection"));
const EpcProjectsAndStats = lazy(() => import("./components/EpcProjectsAndStats"));
const EsopPanel = lazy(() => import("./components/EsopPanel"));
const BlogPanel = lazy(() => import("./components/BlogPanel"));
const Faqs = lazy(() => import("./components/Faqs"));
const Footer = lazy(() => import("./components/Footer"));
const DynamicSections = lazy(() => import("./components/DynamicSections"));
const DynamicPageRenderer = lazy(() => import("./components/DynamicPageRenderer"));
const UserReviewsSection = lazy(() => import("./components/UserReviewsSection"));
const EpcPartnerModal = lazy(() => import("./components/EpcPartnerModal"));
const CustomerLogin = lazy(() => import("./customer/CustomerLogin"));
const CustomerPortal = lazy(() => import("./customer/CustomerPortal"));
const OurPlatformPage = lazy(() => import("./pages/OurPlatformPage"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));


function AppInner() {
  const { customer, loading, token } = useCustomerAuth();
  const { country } = useCountry();
  const [selectedPt, setSelectedPt] = useState(null);
  const settings = useWebsiteSettings(selectedPt);
  const isAU = country === "AU";
  const [viewMode, setViewMode] = useState("home"); // home | blog | account
  const [showCustomerLogin, setShowCustomerLogin] = useState(false);
  const [journeySettings, setJourneySettings] = useState(null);
  
  useEffect(() => {
    // Fetch journey settings to know available project types for this country
    const fetchJourney = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4005"}/api/order-journey/${country || "IN"}`);
        if(res.ok) {
          const data = await res.json();
          setJourneySettings(data);
          
          if(data.projectTypes && data.projectTypes.length > 0 && !selectedPt) {
            setSelectedPt(data.projectTypes[0].projectType);
          }
        }
      } catch(err) {
        console.error("Failed to fetch journey settings:", err);
      }
    };
    fetchJourney();
  }, [country]);

  // Merge selected project type overrides with global settings
  const currentPtConfig = settings?.projectTypeConfigs?.find(c => c.type === selectedPt);
  
  // Merge dynamic sections by type
  const globalSections = settings?.websiteContent?.dynamicSections || [];
  const ptSections = currentPtConfig?.dynamicSections || [];
  let mergedDynamicSections = [...globalSections];
  ptSections.forEach(ptSec => {
    const existingIdx = mergedDynamicSections.findIndex(gSec => gSec.type === ptSec.type);
    if (existingIdx >= 0) {
      mergedDynamicSections[existingIdx] = ptSec;
    } else {
      mergedDynamicSections.push(ptSec);
    }
  });

  const displaySettings = {
    ...settings,
    websiteContent: {
      ...settings?.websiteContent,
      heroTitle: currentPtConfig?.heroTitle || settings?.websiteContent?.heroTitle,
      heroSubtitle: currentPtConfig?.heroSubtitle || settings?.websiteContent?.heroSubtitle,
      navItems: currentPtConfig?.navItems?.length > 0 ? currentPtConfig.navItems : settings?.websiteContent?.navItems,
      dynamicSections: mergedDynamicSections
    }
  };

  const hasDynamic = (type) => mergedDynamicSections.some(s => s.type === type && s.isVisible !== false);

  const availableProjectTypes = journeySettings?.projectTypes?.filter(pt => pt.enabled) || 
    (settings?.projectTypeConfigs?.length > 0 ? settings.projectTypeConfigs : [{ type: "residential", projectTypeLabel: "Residential Solar" }, { type: "commercial", projectTypeLabel: "Commercial Solar" }]);

  // Hash routing
  useEffect(() => {
    if (loading) return; // Wait until authentication check completes!
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#blog" || hash.startsWith("#blog/")) setViewMode("blog");
      else if (hash === "#account") {
        if (customer) setViewMode("account");
        else { setShowCustomerLogin(true); window.location.hash = ""; }
      }
      else setViewMode("home");
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [customer, loading]);

  if (loading && token) {
    return (
      <div className="min-h-screen bg-slate-550 flex items-center justify-center bg-orange-600 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400">Securing your session...</p>
        </div>
      </div>
    );
  }

  const scrollToForm = () => {
    if (viewMode !== "home") {
      setViewMode("home");
      window.location.hash = "";
      setTimeout(() => {
        document.getElementById("eligibility-calculator")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      return;
    }
    const section = document.getElementById("eligibility-calculator");
    if (section) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementPosition = section.getBoundingClientRect().top - bodyRect;
      window.scrollTo({ top: elementPosition - offset, behavior: "smooth" });
    }
  };

  const openCustomerSection = () => {
    if (customer) { setViewMode("account"); window.location.hash = "account"; }
    else setShowCustomerLogin(true);
  };

  const changeView = (view) => {
    setViewMode(view);
    window.location.hash = view === "blog" ? "blog" : view === "account" ? "account" : "";
    window.scrollTo(0, 0);
  };

  // If customer portal open — full page takeover
  if (viewMode === "account" && customer) {
    return (
      <CustomerPortal onClose={() => { setViewMode("home"); window.location.hash = ""; }} />
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-slate-800 selection:bg-solar-yellow/30 selection:text-slate-900 leading-relaxed">
      <Header
        onOpenEpcModal={() => {}}
        onScrollToForm={scrollToForm}
        viewMode={viewMode}
        setViewMode={changeView}
        onOpenCustomerLogin={openCustomerSection}
        isCustomerLoggedIn={!!customer}
        customerName={customer?.fullName}
        settings={displaySettings}
      />

      {/* Floating badge */}
      <div className="fixed bottom-4 left-4 z-30 max-w-xs p-3.5 glass-panel-dark rounded-2xl shadow-xl hidden sm:flex items-center gap-3 animate-float">
        <div className="w-10 h-10 rounded-xl bg-solar-yellow/20 flex items-center justify-center text-solar-yellow shrink-0 border border-solar-yellow/30">
          <Sun className="w-5.5 h-5.5 fill-solar-yellow" />
        </div>
        <div>
          <div className="text-[10.5px] font-black uppercase text-solar-yellow tracking-wider leading-none flex items-center gap-1">
            <Sparkles className="w-3 h-3 fill-solar-yellow text-solar-yellow" /> {isAU ? "CEC Accredited Installers" : "GEDA Certified Partner"}
          </div>
          <p className="text-[11px] font-bold text-white mt-1 leading-normal">
            {isAU ? "Get Up To " : "Rajkot Residents: Save up to "}<span className="text-solar-green">{isAU ? "$4,000" : "₹78,000"}</span> {isAU ? "Point-of-Sale Discount!" : "on Solar Subsidy!"}
          </p>
        </div>
      </div>

      <main className="flex-grow">
        {viewMode === "blog" ? (
          <div className="animate-fadeIn">
            <BlogPanel onBackToHome={() => { setViewMode("home"); window.location.hash = ""; window.scrollTo(0, 0); }} onScrollToForm={scrollToForm} country={country} projectType={selectedPt} />
          </div>
        ) : (
          <>
            {/* Premium Project Type Switcher */}
            <div className="bg-slate-800 border-b border-slate-900 shadow-md">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-solar-yellow/20 flex items-center justify-center">
                       <Zap className="w-4 h-4 text-solar-yellow" />
                    </div>
                    <span className="text-slate-300 font-medium text-sm">Select your project type:</span>
                  </div>
                  <div className="flex space-x-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                    {availableProjectTypes.map((pt) => (
                      <button
                        key={pt.type || pt.projectType}
                        onClick={() => setSelectedPt(pt.type || pt.projectType)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-xs transition-all duration-300 ${
                          selectedPt === (pt.type || pt.projectType)
                            ? "bg-solar-yellow text-slate-900 shadow-[0_0_15px_rgba(253,224,71,0.3)]"
                            : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700"
                        }`}
                      >
                        {pt.projectTypeLabel || pt.type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {!hasDynamic('hero') && <Hero onScrollToForm={scrollToForm} settings={displaySettings} />}
            {!hasDynamic('cards') && <Benefits onScrollToForm={scrollToForm} settings={displaySettings} />}
            {!hasDynamic('snap') && <HowItWorks onScrollToForm={scrollToForm} settings={displaySettings} />}
            {!hasDynamic('form') && (
              <div id="eligibility-calculator">
                <LeadForm selectedProjectType={selectedPt} settings={displaySettings} />
              </div>
            )}
            <TrustSection settings={displaySettings} />
            <DynamicPageRenderer onScrollToForm={scrollToForm} selectedProjectType={selectedPt} settings={displaySettings} />
            <UserReviewsSection settings={displaySettings} />
            {!hasDynamic('faq') && <Faqs settings={displaySettings} />}
          </>
        )}
      </main>

      <Footer onScrollToForm={scrollToForm} settings={displaySettings} />

      {showCustomerLogin && (
        <CustomerLogin
          onClose={() => setShowCustomerLogin(false)}
          onSuccess={() => { setShowCustomerLogin(false); setViewMode("account"); window.location.hash = "account"; }}
        />
      )}
    </div>
  );
}

function CountryWrapper() {
  const { countryParam } = useParams();
  
  let countryProp = "IN";
  if (countryParam) {
    if (countryParam.toLowerCase() === "au") countryProp = "AU";
    else if (countryParam.toLowerCase() === "nz") countryProp = "NZ";
    else countryProp = countryParam.toUpperCase();
  }

  return (
    <CountryProvider countryProp={countryProp}>
      <CustomerAuthProvider>
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}>
          <AppInner />
        </Suspense>
      </CustomerAuthProvider>
    </CountryProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Standalone pages */}
        <Route path="/platform" element={<CountryProvider countryProp="IN"><Suspense fallback={<div />}><OurPlatformPage /></Suspense></CountryProvider>} />
        <Route path="/how-it-works" element={<CountryProvider countryProp="IN"><Suspense fallback={<div />}><HowItWorksPage /></Suspense></CountryProvider>} />
        {/* Match specific country prefixes */}
        <Route path="/:countryParam/*" element={<CountryWrapper />} />
        {/* Match the root path (default to India) */}
        <Route path="/*" element={<CountryWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}