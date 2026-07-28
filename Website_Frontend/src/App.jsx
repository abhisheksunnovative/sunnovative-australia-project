/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from "react";
import { Sun, Sparkles } from "lucide-react";
import { CustomerAuthProvider, useCustomerAuth } from "./customer/CustomerAuthContext";
import { CountryProvider } from "./context/CountryContext";
import { BrowserRouter, Routes, Route, useParams, Navigate } from "react-router-dom";
import { useCountry } from "./context/CountryContext";

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
const EpcPartnerModal = lazy(() => import("./components/EpcPartnerModal"));
const CustomerLogin = lazy(() => import("./customer/CustomerLogin"));
const CustomerPortal = lazy(() => import("./customer/CustomerPortal"));


function AppInner() {
  const { customer } = useCustomerAuth();
  const { country } = useCountry();
  const isAU = country === "AU";
  const [isEpcOpen, setIsEpcOpen] = useState(false);
  const [viewMode, setViewMode] = useState("home"); // home | eshop | blog | account
  const [showCustomerLogin, setShowCustomerLogin] = useState(false);

  // Hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#shop" || hash === "#eshop") setViewMode("eshop");
      else if (hash === "#blog" || hash.startsWith("#blog/")) setViewMode("blog");
      else if (hash === "#account") {
        if (customer) setViewMode("account");
        else { setShowCustomerLogin(true); window.location.hash = ""; }
      }
      else setViewMode("home");
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [customer]);

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
    window.location.hash = view === "eshop" ? "shop" : view === "blog" ? "blog" : view === "account" ? "account" : "";
    window.scrollTo(0, 0);
  };

  // If customer portal open — full page takeover
  if (viewMode === "account" && customer) {
    return (
      <CustomerPortal onClose={() => { setViewMode("home"); window.location.hash = ""; }} />
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-slate-800 selection:bg-solar-yellow/30 selection:text-slate-900 leading-relaxed overflow-x-hidden">
      <Header
        onOpenEpcModal={() => setIsEpcOpen(true)}
        onScrollToForm={scrollToForm}
        viewMode={viewMode}
        setViewMode={changeView}
        onOpenCustomerLogin={openCustomerSection}
        isCustomerLoggedIn={!!customer}
        customerName={customer?.fullName}
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

      <main>
        {viewMode === "eshop" ? (
          <div className="animate-fadeIn">
            <EsopPanel viewMode={viewMode} setViewMode={(v) => { setViewMode(v); window.location.hash = v === "eshop" ? "shop" : ""; window.scrollTo(0, 0); }} />
          </div>
        ) : viewMode === "blog" ? (
          <div className="animate-fadeIn">
            <BlogPanel onBackToHome={() => { setViewMode("home"); window.location.hash = ""; window.scrollTo(0, 0); }} onScrollToForm={scrollToForm} />
          </div>
        ) : (
          <>
            <Hero onScrollToForm={scrollToForm} />
            <Benefits onScrollToForm={scrollToForm} />
            <HowItWorks onScrollToForm={scrollToForm} />
            <LeadForm />
            <TrustSection />
            <EpcProjectsAndStats />
            <Faqs />
          </>
        )}
      </main>

      <Footer onScrollToForm={scrollToForm} />
      <EpcPartnerModal isOpen={isEpcOpen} onClose={() => setIsEpcOpen(false)} />

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
  if (countryParam === "au") countryProp = "AU";
  else if (countryParam === "nz") countryProp = "NZ";
  else if (countryParam) {
    // If there's an unknown path prefix, redirect to root
    return <Navigate to="/" replace />;
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
        {/* Match specific country prefixes */}
        <Route path="/:countryParam/*" element={<CountryWrapper />} />
        {/* Match the root path (default to India) */}
        <Route path="/*" element={<CountryWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}