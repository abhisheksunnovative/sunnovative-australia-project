import React from "react";
import {
  ClipboardList, ClipboardCheck, Ruler, Hammer,
  Zap, FileText, Users, TrendingUp, CheckCircle, Sun,
  ArrowRight
} from "lucide-react";

const ICON_POOL = [
  <ClipboardList className="w-6 h-6 text-solar-sky" />,
  <ClipboardCheck className="w-6 h-6 text-solar-yellow-dark" />,
  <Ruler className="w-6 h-6 text-[#10B981]" />,
  <Hammer className="w-6 h-6 text-indigo-600" />,
  <CheckCircle className="w-6 h-6 text-purple-600" />,
  <Zap className="w-6 h-6 text-orange-500" />,
  <FileText className="w-6 h-6 text-teal-500" />,
  <Users className="w-6 h-6 text-rose-500" />,
  <TrendingUp className="w-6 h-6 text-amber-500" />,
  <Sun className="w-6 h-6 text-yellow-500" />,
];

export default function OrderJourneySteps({ journeySettings, selectedPt, settings }) {
  // ── Derive steps from Order Journey ─────────────────────────────────────────
  const journeySteps = (() => {
    if (journeySettings?.journeys?.length > 0) {
      // Find the journey that matches the selected project type
      const ptKey = (selectedPt || journeySettings.journeys[0]?.projectType || "").toLowerCase();
      const matched = journeySettings.journeys.find(
        pt => (pt.projectType || "").toLowerCase() === ptKey || (pt.type || "").toLowerCase() === ptKey
      ) || journeySettings.journeys[0];

      if (matched?.steps?.length > 0) {
        return matched.steps
          .filter(s => s.enabled !== false && s.visibleToCustomer !== false)
          .slice(0, 6)
          .map((step, idx) => ({
            step: `Step ${idx + 1}`,
            icon: ICON_POOL[idx % ICON_POOL.length],
            title: step.title,
            description: step.description,
            badge: step.sla || "Varies"
          }));
      }
    }
    return null;
  })();

  if (!journeySteps || journeySteps.length === 0) return null;

  const colClass = journeySteps.length <= 3
    ? "grid-cols-1 md:grid-cols-3"
    : journeySteps.length === 4
    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
    : journeySteps.length === 5
    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-5"
    : "grid-cols-1 md:grid-cols-3 lg:grid-cols-3";

  return (
    <section id="order-journey" className="py-20 bg-slate-50 relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider mb-4">
            <TrendingUp className="w-3.5 h-3.5 text-solar-yellow-dark" />
            Order Journey
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
            Order Journey Steps
          </h2>
          <p className="mt-4 text-slate-500 text-lg leading-relaxed max-w-2xl mx-auto">
            A transparent view into every step of your solar project, from order placement to final commissioning.
          </p>
        </div>

        {/* Steps Grid */}
        <div className={`grid ${colClass} gap-8 relative justify-center`}>
          {/* Subtle connecting line for desktop layout */}
          <div className="hidden lg:block absolute top-[68px] left-[10%] right-[10%] h-0.5 bg-dashed border-t-2 border-dashed border-sky-200/55 -z-0" />

          {journeySteps.map((item, index) => (
            <div
              key={index}
              className="relative text-center flex flex-col items-center group p-6 rounded-2xl glass-panel transition-all duration-300 z-10"
            >
              {/* Step number */}
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                {item.step}
              </div>

              {/* Icon Container */}
              <div className="w-16 h-16 rounded-2xl bg-white/80 shadow-md border border-white/40 flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 relative">
                {item.icon}

                {/* Micro timing tag */}
                <div className="absolute -bottom-2 px-1.5 py-0.5 bg-orange-600 text-[9px] text-white font-semibold rounded shadow whitespace-nowrap">
                  {item.badge}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-base font-bold font-display text-slate-900 leading-tight">
                {item.title}
              </h3>
              <p className="text-slate-500 text-xs mt-3 leading-relaxed max-w-xs">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
