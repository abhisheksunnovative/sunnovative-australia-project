/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Sun,
  ShieldCheck,
  ChevronRight,
  BadgePercent,
  ArrowDown,
} from "lucide-react";
import { useWebsiteSettings } from "../hooks/useWebsiteSettings";

const STAT_COLORS = ["text-solar-yellow", "text-solar-green", "text-solar-sky"];

export default function Hero({ onScrollToForm, projectTypes, selectedPt, onSelectPt }) {
  const settings = useWebsiteSettings();
  const hero = settings.hero || {};
  const stats = settings.stats || [];

  return (
    <section
      id="surya-ghar-section"
      className="relative overflow-hidden bg-slate-900 text-white min-h-[580px] md:min-h-[640px] flex items-center"
    >
      {/* Dynamic background element representing brilliant sunlight */}
      <div className="absolute top-0 right-0 w-full md:w-1/2 h-full z-0 opacity-45 md:opacity-90">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80"
          alt="Rooftop Solar Panels bathed in bright gujarat sunlight"
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Radiant circular sun overlay in background corner */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-solar-yellow/10 rounded-full blur-3xl z-0 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 z-10 w-full">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full glass-panel-dark text-solar-yellow font-bold uppercase tracking-wider mb-6 animate-pulse-subtle">
            <Sun className="w-3.5 h-3.5 fill-solar-yellow text-solar-yellow" />
            {hero.badge}
          </div>

          {/* Dynamic Project Type Selector */}
          {projectTypes && projectTypes.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 mb-6 bg-slate-800/50 p-2 rounded-2xl w-max backdrop-blur-sm border border-slate-700/50">
              {projectTypes.map((pt) => (
                <button
                  key={pt.type}
                  onClick={() => onSelectPt(pt.type)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 capitalize ${
                    selectedPt === pt.type
                      ? "bg-solar-yellow text-slate-900 shadow-md shadow-solar-yellow/20"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  {pt.type.replace("-", " ")}
                </button>
              ))}
            </div>
          )}

          {/* Majestic Hero Headline */}
          <h1 className="text-4.5xl sm:text-5xl lg:text-5.5xl font-display font-extrabold tracking-tight leading-[1.1] text-white">
            {hero.headingLine1} <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-solar-yellow via-amber-400 to-solar-green">
              {hero.headingHighlight}
            </span>
          </h1>

          {/* Accessible Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
            {hero.subtext}
          </p>

          {/* Live counters — dynamic from admin */}
          {stats.length > 0 && (
            <div className="mt-8 grid gap-4 glass-panel-dark py-4 px-6 rounded-2xl max-w-lg"
              style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}
            >
              {stats.map((stat, i) => (
                <div key={i}>
                  <div className={`text-2xl font-black font-display ${STAT_COLORS[i % STAT_COLORS.length]}`}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Main Hero CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={() => onScrollToForm("survey")}
              className="px-6 py-4 rounded-xl text-solar-navy bg-solar-yellow hover:bg-yellow-405 font-bold text-sm tracking-wide shadow-lg shadow-yellow-500/10 cursor-pointer text-center transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              id="hero-primary-cta"
            >
              {hero.ctaPrimary}
              <ChevronRight className="w-4 h-4 text-solar-navy stroke-[3]" />
            </button>

            <button
              onClick={() => onScrollToForm("calculator")}
              className="px-6 py-4 rounded-xl text-white bg-slate-800 hover:bg-slate-750 font-bold text-sm border border-slate-700 cursor-pointer text-center transition-all flex items-center justify-center gap-2"
              id="hero-secondary-cta"
            >
              <BadgePercent className="w-4 h-4 text-solar-sky" />
              {hero.ctaSecondary}
            </button>
          </div>

          {/* Quick trust pointer */}
          <div className="mt-6 flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-solar-green" />
            ISO 9001:2015 Solar Services company. No hiding charges.
          </div>
        </div>
      </div>

      {/* Decorative Wave/Angle shape at bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] translate-y-[1px] z-20">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-8 md:h-12 fill-white"
        >
          <path d="M0,0V120H1200V0C1000,80,600,120,0,0Z"></path>
        </svg>
      </div>

      {/* Scroll indicator button */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 hidden md:block">
        <button
          onClick={() => onScrollToForm("calculator")}
          className="p-2 bg-slate-800/80 backdrop-blur-md text-slate-400 hover:text-white rounded-full transition border border-slate-700 animate-bounce cursor-pointer"
          title="Scroll down to Solar Tool"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

