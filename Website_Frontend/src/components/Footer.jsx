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
    <footer className="bg-orange-600 text-slate-400 font-sans border-t-4 border-solar-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
        {/* Brand Column */}
        <div className="space-y-5">
          <a href="#" onClick={handleLogoClick} className="inline-block group mb-2">
            <img src="/logo-white.png" alt="EmergeSun" className="w-40 h-auto object-contain" />
          </a>
          <p className="text-sm text-slate-400 leading-relaxed">
            {footer.copyrightText || "Sunnovative Solar System Pvt Ltd is Rajkot's premium GEDA registered EPC service provider specialized in standard residential PM Surya Ghar Yojana. Turns rooftop shadows into guaranteed cash savings."}
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-slate-800/50 w-fit px-3 py-1.5 rounded-lg border border-slate-700/50">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> GEDA Certified: {footer.gedaCertNo || "#RJK-20412"}
          </div>
        </div>

        {/* Navigation Quick Links */}
        <div className="space-y-5">
          <h4 className="text-sm font-bold font-display text-slate-200 tracking-wider">
            QUICK SHORTCUTS
          </h4>
          <ul className="space-y-3 text-sm">
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
        <div className="space-y-5">
          <h4 className="text-sm font-bold font-display text-slate-200 tracking-wider uppercase">
            {brand.companyName || "Sunnovative"} HQ
          </h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
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
        <div className="space-y-5">
          <h4 className="text-sm font-bold font-display text-slate-200 tracking-wider">
            OFFICIAL PORTALS
          </h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            Official central websites for tracking application registration.
          </p>
          <ul className="space-y-3 text-sm">
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
          <p>© 2026 {brand.companyName || "EmergeSun"} Solar System Pvt Ltd. All rights reserved.</p>
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
