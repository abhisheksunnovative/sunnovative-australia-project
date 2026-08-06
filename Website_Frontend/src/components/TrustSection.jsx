/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  ShieldCheck,
  Snowflake,
  Settings,
  Gauge,
  PhoneCall,
} from "lucide-react";

export default function TrustSection({ settings }) {
  const defaultIcons = [
    <ShieldCheck className="w-5 h-5 text-solar-sky" />,
    <Snowflake className="w-5 h-5 text-blue-500" />,
    <Settings className="w-5 h-5 text-teal-600" />,
    <Gauge className="w-5 h-5 text-amber-600" />,
    <PhoneCall className="w-5 h-5 text-solar-green" />,
  ];

  const rawPoints = settings?.trust?.points || [];
  const trustPoints = rawPoints.length > 0
    ? rawPoints.map((pt, idx) => ({
        title: pt.title,
        desc: pt.desc,
        icon: defaultIcons[idx % defaultIcons.length]
      }))
    : [
        {
          title: "Empaneled Solar Contractor",
          desc: "Proud GEDA (Gujarat Energy Development Agency) authorized empanelled solar installer. Certified to load subsidy directly on the National Portal.",
          icon: <ShieldCheck className="w-5 h-5 text-solar-sky" />,
        },
        {
          title: "Residential Solar Pioneers",
          desc: "Authorized partner in Rajkot for residential solar panels, supporting zero-overhead setups for single-family homes, complexes, and high-rise apartments.",
          icon: <Snowflake className="w-5 h-5 text-blue-500" />,
        },
        {
          title: "Commercial & Industrial Solar",
          desc: "Custom high-load commercial arrays with 40% accelerated depreciation tax benefits, bringing down corporate, hospital, and factory energy bills significantly.",
          icon: <Settings className="w-5 h-5 text-teal-600" />,
        },
        {
          title: "Tier-1 Certified Components",
          desc: "We exclusively deploy ALMM-approved, ultra-high-efficiency Mono Perc and Bifacial panels (wafer-thin panels capturing sunlight from both sides) with a 25-year performance warranty.",
          icon: <Gauge className="w-5 h-5 text-amber-600" />,
        },
        {
          title: "Timely Local Maintenance",
          desc: "Based in Rajkot (Kalawad Road). Our mobile response team promises site checkups and cleanup services within 24 hours of call logged.",
          icon: <PhoneCall className="w-5 h-5 text-solar-green" />,
        },
      ];

  const sectionTitle = settings?.trust?.sectionTitle || "Local Trusted Expert";
  const sectionSubtitle = settings?.trust?.sectionSubtitle || "Sunnovative Solar System Pvt Ltd";
  const sectionDesc = settings?.trust?.sectionDesc || "As the leading epc service firm in Rajkot & Saurashtra region, we combine world-class PV component logistics with rigorous local engineering standards, protecting families against volatile power rates for the next 25+ years.";

  return (
    <section
      id="trust"
      className="py-20 solar-gradient relative overflow-hidden"
    >
      {/* Background elegant details */}
      <div className="absolute top-[340px] right-[-200px] w-[500px] h-[550px] bg-gradient-to-tr from-amber-500/5 to-transparent rounded-full blur-3xl -z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Split Section Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text and Grid */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#0081C9] bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                {sectionTitle}
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 mt-3 leading-tight">
                {sectionSubtitle}
              </h2>
              <p className="text-slate-500 mt-4 text-xs md:text-sm leading-relaxed">
                {sectionDesc}
              </p>
            </div>

            {/* Trust Cards layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {trustPoints.map((item, index) => (
                <div
                  key={index}
                  className={`p-5 rounded-2xl glass-panel transition-all duration-300 ${
                    index === 3 ? "md:col-span-2" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                      {item.icon}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-slate-500 text-xs mt-3 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual Representation (Bento style photos) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative group overflow-hidden rounded-3xl shadow-xl aspect-video md:aspect-auto md:h-64 border border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1548613053-220ef31815bb?auto=format&fit=crop&w=800&q=80"
                alt="Solar plant rooftop project in Rajkot"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10"></div>

              <div className="absolute bottom-4 left-4 z-25">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-solar-yellow bg-slate-950/60 px-2.5 py-0.5 rounded-md">
                  Authorized Installation Site
                </span>
                <p className="font-display font-bold text-sm text-white mt-1">
                  Rajeshbhai Patel Home Project, Mavdi Road
                </p>
                <p className="text-[10.5px] text-slate-350">
                  3 kW Rooftop Solar System Grid-connected
                </p>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-3xl shadow-xl aspect-video md:aspect-auto md:h-56 border border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=800&q=80"
                alt="Commercial solar building array"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10"></div>

              <div className="absolute bottom-4 left-4 z-25">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-solar-sky bg-slate-950/60 px-2.5 py-0.5 rounded-md">
                  Commercial & Industrial
                </span>
                <p className="font-display font-bold text-sm text-white mt-1">
                  Shreeji Industries Factory, GIDC Metoda
                </p>
                <p className="text-[10.5px] text-slate-350 font-sans">
                  45 kW Solar plant commissioned in record 14 Days
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
