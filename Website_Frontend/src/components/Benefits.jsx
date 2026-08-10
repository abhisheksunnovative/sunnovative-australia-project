/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Landmark,
  PiggyBank,
  Award,
  FileText,
  Cable,
  ArrowRight,
} from "lucide-react";
import { useCountry } from "../context/CountryContext";

export default function Benefits({ onScrollToForm, projectTypes, selectedPt, settings }) {
  const { country } = useCountry();
  const isAU = country === "AU";
  const defaultIcons = [
    <Landmark className="w-8 h-8 text-amber-600" />,
    <PiggyBank className="w-8 h-8 text-sky-600" />,
    <Award className="w-8 h-8 text-emerald-600" />,
    <FileText className="w-8 h-8 text-indigo-600" />,
    <Cable className="w-8 h-8 text-rose-600" />
  ];

  const rawItems = settings?.benefits?.items || [];
  const benefitCards = rawItems.length > 0 
    ? rawItems.map((item, idx) => ({
        icon: defaultIcons[idx % defaultIcons.length],
        title: item.title,
        guarantee: item.subtitle,
        subtitle: item.desc,
        badge: item.badge
      }))
    : [
        {
          icon: <Landmark className="w-8 h-8 text-amber-600" />,
          title: "Government Subsidy Support",
          guarantee: "Up to ₹78,000 Direct Return",
          subtitle:
            "MNRE National Portal key direct integration: 1kW translates to ₹33,000, 2kW offers ₹66,000, and 3kW or above gains ₹78,000 maximum direct bank transfer.",
          badge: "Rajkot Authorized Geda vendor"
        },
        {
          icon: <PiggyBank className="w-8 h-8 text-sky-600" />,
          title: "Zero Electricity Bill Savings",
          guarantee: "Save up to 90% Every Month",
          subtitle:
            "Free up to 300 units of energy monthly depending on panel size. Any extra energy generated goes back to PGVCL grid, lowering your electric tab to near-zero.",
          badge: "Rajkot Authorized Geda vendor"
        },
        {
          icon: <Award className="w-8 h-8 text-emerald-600" />,
          title: "End-to-End Installation",
          guarantee: "Tier-1 Components & Warranty",
          subtitle:
            "Complete rooftop mounting structure with wind-flow optimization (withstands Cyclone gusts in Saurashtra), structural safety certified by architects.",
          badge: "Rajkot Authorized Geda vendor"
        },
        {
          icon: <FileText className="w-8 h-8 text-indigo-600" />,
          title: "Hassle-Free Liaisoning",
          guarantee: "Zero Red Tape or Document Stress",
          subtitle:
            "We fully manage documentation on the PGVCL portal, structural drawing submissions, subsidy eligibility approval, and regulatory liaisoning.",
          badge: "Rajkot Authorized Geda vendor"
        },
        {
          icon: <Cable className="w-8 h-8 text-rose-600" />,
          title: "Bi-directional Net-Metering",
          guarantee: "Turn Sun into Guaranteed Earnings",
          subtitle:
            "Full coordination with PGVCL division engineers to commission standard and secure bi-directional meters. Monitor production from your smartphone.",
          badge: "Rajkot Authorized Geda vendor"
        },
      ];

  const sectionTitle = settings?.benefits?.sectionTitle || "Why Install Solar Now?";
  const sectionSubtitle = settings?.benefits?.sectionSubtitle || "PM Surya Ghar Yojana ke Benefits & Savings";
  const sectionDesc = settings?.benefits?.sectionDesc || "Sarkari Subsidy and EmergeSun Solar System's advanced German engineering make Rooftop Solar the single smartest investment for every home in Rajkot.";

  return (
    <section
      id="benefits"
      className="py-20 solar-gradient relative overflow-hidden"
    >
      {/* Background soft circles */}
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-solar-sky/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-solar-yellow/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0081C9] bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            {sectionTitle}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 mt-3 leading-tight">
            {sectionSubtitle}
          </h2>
          <p className="text-slate-600 mt-4 text-sm md:text-base">
            {sectionDesc}
          </p>
        </div>

        {/* Benefits Grid - Bento Grid Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefitCards.map((benefit, idx) => (
            <div
              key={idx}
              className={`p-6 glass-panel rounded-2xl transition-all duration-300 flex flex-col justify-between group ${
                idx === 2
                  ? "md:col-span-2 lg:col-span-1 border-t-4 border-t-solar-green"
                  : ""
              } ${idx === 0 ? "border-t-4 border-t-solar-yellow" : ""}`}
            >
              <div>
                <div className="p-3 bg-slate-50 rounded-xl inline-block group-hover:bg-white group-hover:shadow-inner transition-colors">
                  {benefit.icon}
                </div>

                <h3 className="text-lg font-bold font-display text-slate-900 mt-5">
                  {benefit.title}
                </h3>

                <div className="mt-1.5 text-xs text-solar-sky font-bold uppercase tracking-wider bg-sky-50/60 p-1 px-2.5 rounded inline-block">
                  {benefit.guarantee}
                </div>

                <p className="text-slate-500 text-xs md:text-sm mt-3 leading-relaxed">
                  {benefit.subtitle}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">
                  {benefit.badge || "Rajkot Authorized Geda vendor"}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-solar-green animate-pulse"></span>
              </div>
            </div>
          ))}

          {/* Large dynamic CTA card inside the Grid */}
          <div className="p-8 bg-gradient-to-br from-solar-navy to-slate-800 text-white rounded-2xl flex flex-col justify-between relative overflow-hidden group">
            {/* Soft glowing ambient circle */}
            <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-solar-yellow/20 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#0081C9] bg-sky-500/10 px-2.5 py-0.5 rounded">
                Interactive Estimate
              </span>
              <h3 className="text-xl font-display font-bold mt-4 leading-snug">
                {isAU ? (
                  <>How much Rebate?<br />Check parameters instantly.</>
                ) : (
                  <>Kitna Subsidy milega? <br />Check parameters instantly.</>
                )}
              </h3>
              <p className="text-slate-300 text-xs mt-3 leading-relaxed">
                {isAU 
                  ? "Provide your energy bill values to estimate total ROI, payback periods, and net installation panel units."
                  : "Provide your custom light bill values to estimate total ROI, payback periods, and net installation panel units."}
              </p>
            </div>

            <button
              onClick={() => onScrollToForm("calculator")}
              className="mt-8 px-4 py-3 bg-solar-yellow text-slate-900 font-bold text-xs rounded-xl hover:bg-yellow-405 self-start cursor-pointer transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/10"
              id="benefit-calc-link"
            >
              Open Solar Calculator <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

