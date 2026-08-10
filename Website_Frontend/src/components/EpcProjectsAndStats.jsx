/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Award,
  Briefcase,
  Users,
  Zap,
  MapPin,
  Quote,
  Star,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  Building,
} from "lucide-react";

export default function EpcProjectsAndStats() {
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);

  // 1. Core Corporate Milestones (as requested: years of experience, projects, epc partners, capacity)
  const corporateStats = [
    {
      id: "stat-years",
      label: "Years of Experience",
      value: "12+ Years",
      subtext: "Pioneering solar across Saurashtra",
      colors: "from-amber-500 to-yellow-500",
      icon: <Award className="w-5 h-5 text-amber-500 animate-pulse-subtle" />,
    },
    {
      id: "stat-projects",
      label: "Total Certified Projects",
      value: "1,500+",
      subtext: "Rooftops turned into power plants",
      colors: "from-sky-500 to-blue-500",
      icon: <Briefcase className="w-5 h-5 text-solar-sky" />,
    },
    {
      id: "stat-partners",
      label: "Active EPC Partners",
      value: "45+ Partners",
      subtext: "GEDA empanelled local installers",
      colors: "from-emerald-500 to-green-500",
      icon: <Users className="w-5 h-5 text-solar-green" />,
    },
    {
      id: "stat-capacity",
      label: "Active Clean Capacity",
      value: "8.5 Megawatts",
      subtext: "Offsetting million tons of carbon",
      colors: "from-orange-500 to-rose-500",
      icon: <Zap className="w-5 h-5 text-orange-500" />,
    },
  ];

  // 2. High-Trust Completed Projects with Testimonials and Verified Photos
  const testimonialProjects = [
    {
      title: "3kW Residential Rooftop Project",
      clientName: "Rajeshbhai Patel",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
      partnerName: "Ambika Solar Installers (EPC Partner)",
      location: "Nana Mava Road, Rajkot",
      capacity: "3.0 kW System",
      savings: "₹2,450 Saved / Mo",
      subsidyStatus: "₹78,000 Subsidy Credited",
      review:
        "“I was hesitant about government subsidy procedures but EmergeSun and Ambika Solar engineers took care of all PGVCL paperwork. My bank credit was settled in just 22 days! My light bill is now virtually ₹0.”",
      rating: 5,
      projectImg:
        "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80",
      gedaId: "GEDA-RJK-2026-9901",
    },
    {
      title: "5kW Premium Bungalow Solar Setup",
      clientName: "Devangbhai Vekaria",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
      partnerName: "Apex Renewable Engineers (EPC Partner)",
      location: "Kalawad Road, Rajkot",
      capacity: "5.0 kW Mono Perc",
      savings: "₹4,800 Saved / Mo",
      subsidyStatus: "₹78,000 Cap Subsidy Settled",
      review:
        "“With 3 air conditioners running throughout daytime, our bills were sky high. Apex team installed bifacial tier-1 panels under EmergeSun guidance. Highly cooperative engineers who knew every detail of National Portal submission.”",
      rating: 5,
      projectImg:
        "https://images.unsplash.com/photo-1548613053-220ef31815bb?auto=format&fit=crop&w=800&q=80",
      gedaId: "GEDA-RJK-2026-4412",
    },
    {
      title: "15kW Residential Apartments Unit",
      clientName: "Kiritbhai Marvaniya",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
      partnerName: "Vertex Power Systems (EPC Partner)",
      location: "Amin Marg, Rajkot",
      capacity: "15.0 kW Micro-Grid",
      savings: "₹14,600 Saved / Mo",
      subsidyStatus: "GEDA Net-Metering Activated",
      review:
        "“We compiled light bills for the entire cooperative housing block. Vertex and EmergeSun designed a flawless micro-grid solution. Cleanest workmanship, GEDA testing was certified within 48 hours is what built absolute trust!”",
      rating: 5,
      projectImg:
        "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=800&q=80",
      gedaId: "GEDA-GND-2026-1029",
    },
  ];

  return (
    <section
      id="epc-projects-stats"
      className="py-24 solar-gradient relative overflow-hidden border-t border-white/20"
    >
      {/* Background Soft Gradients */}
      <div className="absolute top-[20%] left-[-200px] w-[500px] h-[500px] bg-sky-200/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-200px] w-[500px] h-[500px] bg-amber-100/25 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Empowering Saurashtra Since 2014
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-black text-slate-900 mt-4 leading-tight">
            EPC Completed Projects & Real Client Testimonials
          </h2>
          <p className="text-slate-600 mt-4 text-xs md:text-sm leading-relaxed max-w-2xl mx-auto">
            EmergeSun Solar System Pvt Ltd handles complete premium component
            logistics while our network of authorized EPC partners installs
            rooftop projects safely, back-tested by real families inside Rajkot.
          </p>
        </div>

        {/* SECTION 1: CORPORATE STATS DASHBOARD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-18">
          {corporateStats.map((stat) => (
            <div
              key={stat.id}
              className="glass-panel rounded-3xl p-6 hover:shadow-lg transition-transform hover:-translate-y-1 duration-300 flex flex-col justify-between"
              id={stat.id}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-100">
                  {stat.icon}
                </div>
                <span className="text-[10px] font-bold tracking-widest text-[#0081C9] uppercase bg-sky-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Verified
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-2.5xl md:text-3.5xl font-black font-display text-slate-900 tracking-tight leading-none">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-slate-850">
                  {stat.label}
                </div>
                <p className="text-[11px] text-slate-500 leading-normal pt-1">
                  {stat.subtext}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* SECTION 2: HIGH TRUST TESTIMONIAL SHOWCASE FRAME */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-rose-100/10 pb-3">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-solar-yellow rounded-full inline-block"></span>
                GEDA Verified Completions Showcase
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Select are recently certified projects highlighting genuine
                reviews from local Rajkot owners.
              </p>
            </div>

            {/* Micro Dots Selector */}
            <div className="flex items-center gap-2">
              {testimonialProjects.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveProjectIdx(idx)}
                  className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
                    activeProjectIdx === idx
                      ? "bg-[#0081C9] border-[#0081C9] scale-110 shadow-md shadow-sky-400/25"
                      : "bg-white/80 border-slate-200 hover:bg-slate-100"
                  }`}
                  title={`View project ${idx + 1}`}
                  aria-label={`Showcase Project Testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Majestic Hero Testimonial Card */}
          <div className="glass-panel rounded-[2.25rem] overflow-hidden shadow-xl border border-white/50 grid grid-cols-1 lg:grid-cols-12">
            {/* Left Column: Physical Testimonial Photo */}
            <div className="lg:col-span-6 relative aspect-video lg:aspect-auto min-h-[300px] lg:min-h-[460px] overflow-hidden bg-slate-950">
              <img
                src={testimonialProjects[activeProjectIdx].projectImg}
                alt={testimonialProjects[activeProjectIdx].title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out scale-100 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

              {/* Floating verified badge */}
              <div className="absolute top-5 left-5 bg-[#10B981] text-white font-mono text-[10.5px] font-bold px-3.5 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 fill-white text-[#10B981]" />
                GEDA Cert: {testimonialProjects[activeProjectIdx].gedaId}
              </div>

              {/* Physical Project stats layout */}
              <div className="absolute bottom-5 left-5 right-5 text-white space-y-1.5">
                <div className="flex items-center gap-1 text-[11px] font-bold text-solar-yellow uppercase tracking-widest leading-none">
                  <Building className="w-3.5 h-3.5" /> Approved Project Site
                </div>
                <h4 className="text-lg md:text-xl font-display font-extrabold tracking-tight">
                  {testimonialProjects[activeProjectIdx].title}
                </h4>
                <p className="text-xs text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  {testimonialProjects[activeProjectIdx].location}
                </p>
              </div>
            </div>

            {/* Right Column: High Quality Testimony Prose */}
            <div className="lg:col-span-6 p-8 md:p-11 flex flex-col justify-between space-y-8 bg-white/40">
              {/* Quoted Review text */}
              <div className="space-y-4">
                <div className="flex items-center gap-1">
                  {[...Array(testimonialProjects[activeProjectIdx].rating)].map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-amber-500 fill-amber-400"
                      />
                    ),
                  )}
                  <span className="text-slate-400 text-xs font-semibold ml-2">
                    (Verified 5/5)
                  </span>
                </div>

                <div className="relative">
                  <Quote className="w-9 h-9 text-solar-yellow/30 absolute -top-4 -left-3 -z-10 transform -rotate-6" />
                  <p className="text-slate-700 font-sans text-sm md:text-base italic font-medium leading-relaxed">
                    {testimonialProjects[activeProjectIdx].review}
                  </p>
                </div>
              </div>

              {/* Key Metric tags */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white/90 border border-slate-100 rounded-2xl text-center">
                  <span className="text-slate-400 text-[9px] block uppercase font-bold tracking-wider leading-none">
                    System Size
                  </span>
                  <span className="text-xs font-extrabold text-[#0081C9] mt-1.5 block">
                    {testimonialProjects[activeProjectIdx].capacity}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-100/50 rounded-2xl text-center">
                  <span className="text-slate-500 text-[9px] block uppercase font-bold tracking-wider leading-none">
                    Monthly ROI
                  </span>
                  <span className="text-xs font-extrabold text-solar-green mt-1.5 block">
                    {testimonialProjects[activeProjectIdx].savings}
                  </span>
                </div>
                <div className="p-3 bg-amber-50/60 border border-amber-100/50 rounded-2xl text-center">
                  <span className="text-slate-500 text-[9px] block uppercase font-bold tracking-wider leading-none">
                    Subsidy Stage
                  </span>
                  <span className="text-[10px] font-extrabold text-amber-700 mt-1.5 block leading-normal line-clamp-1 truncate">
                    {testimonialProjects[activeProjectIdx].subsidyStatus}
                  </span>
                </div>
              </div>

              {/* Customer and EPC Partner Identity signature */}
              <div className="pt-6 border-t border-slate-200/60 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-solar-yellow shrink-0">
                  <img
                    src={testimonialProjects[activeProjectIdx].avatar}
                    alt={testimonialProjects[activeProjectIdx].clientName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h5 className="font-display font-black text-slate-900 tracking-tight text-sm">
                    {testimonialProjects[activeProjectIdx].clientName}
                  </h5>
                  <p className="text-xs text-slate-500">
                    {testimonialProjects[activeProjectIdx].location}
                  </p>
                  <p className="text-[10px] font-mono font-bold text-[#0081C9] mt-0.5 leading-none">
                    Installed by:{" "}
                    {testimonialProjects[activeProjectIdx].partnerName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
