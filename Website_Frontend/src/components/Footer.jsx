/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sun, Mail, Phone, MapPin, ExternalLink, ShieldCheck } from "lucide-react";
import { useWebsiteSettings } from "../hooks/useWebsiteSettings";

export default function Footer({ onScrollToForm, settings: propSettings }) {
  const baseSettings = useWebsiteSettings();
  const settings = propSettings || baseSettings;
  const brand = settings.brand || {};
  const footer = settings.footer || {};

  const handleLogoClick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-900 text-slate-400 font-sans border-t-8 border-solar-yellow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="space-y-4">
          <a href="#" onClick={handleLogoClick} className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-solar-yellow flex items-center justify-center text-slate-950">
              <Sun className="w-5 h-5 fill-amber-300 text-slate-900" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black font-display tracking-tight text-white">
                {brand.companyName || "SUNNOVATIVE"}
              </span>
              <span className="text-[9px] font-mono font-black text-solar-sky tracking-widest leading-none">
                {brand.tagline || "SOLAR SYSTEM"}
              </span>
            </div>
          </a>
          <p className="text-xs text-slate-400 leading-relaxed pt-1">
            {footer.copyrightText}
          </p>
          <div className="flex items-center gap-1.5 text-[10.5px] text-emerald-500 font-bold">
            <ShieldCheck className="w-4 h-4" /> GEDA Certified Empanelment: {footer.gedaCertNo}
          </div>
        </div>

        {/* Navigation Quick Links */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold font-display text-white uppercase tracking-wider">
            Quick Shortcuts
          </h4>
          <ul className="space-y-2 text-xs">
            {[
              ["#surya-ghar-section", "Surya Ghar Yojana"],
              ["#benefits", "Benefits & Savings"],
              ["#how-it-works", "How it works"],
              ["#eligibility-calculator", "Subsidy calculator"],
              ["#trust", "Trust Section"],
              ["#faqs", "Query FAQs"],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="hover:text-white transition-colors">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact info */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold font-display text-white uppercase tracking-wider">
            {brand.companyName || "Sunnovative"} Headquarters
          </h4>
          <ul className="space-y-3 text-xs">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-solar-yellow shrink-0 mt-0.5" />
              <span>{footer.address}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#0081C9] shrink-0" />
              <a href={`tel:${footer.phone}`} className="hover:text-white transition-colors">
                {footer.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
              <a href={`mailto:${footer.email}`} className="hover:text-white transition-colors">
                {footer.email}
              </a>
            </li>
          </ul>
        </div>

        {/* Govt Official Resources */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold font-display text-white uppercase tracking-wider">
            Official Portals
          </h4>
          <p className="text-xs text-slate-400">
            Official central websites for tracking application registration.
          </p>
          <ul className="space-y-2 text-xs">
            {[
              ["https://pmsuryaghar.gov.in/", "National Portal - PM Surya Ghar"],
              ["https://geda.gujarat.gov.in/", "GEDA Official - Gujarat Govt"],
              ["https://www.pgvcl.com/", "PGVCL - Saurashtra Utility"],
            ].map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                >
                  {label} <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-slate-950 text-slate-500 py-6 text-center text-[10.5px] border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 {brand.companyName || "Sunnovative"} Solar System Pvt Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Geda Authorized Partner</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>T&C Apply</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
