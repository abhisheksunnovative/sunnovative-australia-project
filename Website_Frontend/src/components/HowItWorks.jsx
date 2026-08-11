/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ClipboardList, ClipboardCheck, Ruler, Hammer } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

export default function HowItWorks({ onScrollToForm, settings }) {
  const [videoSettings, setVideoSettings] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/website-settings`, {
      headers: { 'x-country': localStorage.getItem("sn_country") || "IN" }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.videos?.customerWebsiteVideo) {
          setVideoSettings(data.data.videos.customerWebsiteVideo);
        }
      })
      .catch(err => console.error("Failed to load video settings:", err));
  }, []);

  const defaultIcons = [
    <ClipboardList className="w-6 h-6 text-solar-sky" />,
    <ClipboardCheck className="w-6 h-6 text-solar-yellow-dark" />,
    <Ruler className="w-6 h-6 text-[#10B981]" />,
    <Hammer className="w-6 h-6 text-indigo-600" />,
    <ClipboardCheck className="w-6 h-6 text-purple-600" />
  ];

  const rawSteps = settings?.howItWorks?.steps || [];
  const steps = rawSteps.length > 0
    ? rawSteps.map((step, idx) => ({
        step: `Step ${idx + 1}`,
        icon: defaultIcons[idx % defaultIcons.length],
        title: step.title,
        description: step.desc,
        badge: step.timeLabel || "In 2 Minutes"
      }))
    : [
        {
          step: "Step 1",
          icon: <ClipboardList className="w-6 h-6 text-solar-sky" />,
          title: "Light Bill Details Submit Kare",
          description:
            "Hamari system me apna Consumer Number ya Average monthly bill enter kare. High-resolution utility bill upload option available.",
          badge: "In 2 Minutes",
        },
        {
          step: "Step 2",
          icon: <ClipboardCheck className="w-6 h-6 text-solar-yellow-dark" />,
          title: "Team Eligibility Check Karegi",
          description:
            "EmergeSun experts PGVCL database se load allocation aur sanjay-yojana slab details match karke optimal solar size estimate karenge.",
          badge: "Within 1 Hour",
        },
        {
          step: "Step 3",
          icon: <Ruler className="w-6 h-6 text-[#10B981]" />,
          title: "Free Site Survey & Quotation",
          description:
            "Rajkot ke field officers aapke rooftop area, shadow profiles aur tile strength check kareke high-durability customized quote design karenge.",
          badge: "In 24 Hours",
        },
        {
          step: "Step 4",
          icon: <Hammer className="w-6 h-6 text-indigo-600" />,
          title: "Installation & Subsidy Credit",
          description:
            "Within 10-15 days, structure setup and net-meter commissioning are finalized. Goverment subsidy amount directly transfers into your bank account.",
          badge: "Direct Transfer",
        },
        {
          step: "Step 5",
          icon: <ClipboardCheck className="w-6 h-6 text-purple-600" />,
          title: "Lifetime Support & Warranty",
          description:
            "Premium support with our Trust Badge verified EPC partners ensuring your solar system runs flawlessly for 25 years.",
          badge: "Peace of Mind",
        },
      ];

  const sectionTitle = settings?.howItWorks?.sectionTitle || "Easy 5-Step Process";
  const sectionSubtitle = settings?.howItWorks?.sectionSubtitle || "Solar Installation Kaise Kaam Karta Hai?";
  const sectionDesc = settings?.howItWorks?.sectionDesc || "Zero-friction consultation flow designed to protect your savings and speed up subsidy registration with GEDA.";
  const tipText = settings?.calculator?.tipText || "Keep a PDF or photo of your latest PGVCL utility bill ready to streamline step 1 calculation!";

  const activeVideo = settings?.videos?.customerWebsiteVideo || videoSettings;

  return (
    <section id="how-it-works" className="py-20 solar-gradient relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Block */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0081C9] bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            {sectionTitle}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 mt-3 leading-tight">
            {sectionSubtitle}
          </h2>
          <p className="text-slate-500 mt-3 text-xs md:text-sm">
            {sectionDesc}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 relative">
          {/* Subtle connecting line for desktop layout */}
          <div className="hidden lg:block absolute top-[68px] left-[10%] right-[10%] h-0.5 bg-dashed border-t-2 border-dashed border-sky-200/55 -z-0"></div>

          {steps.map((item, index) => (
            <div
              key={index}
              className="relative text-center flex flex-col items-center group p-6 rounded-2xl glass-panel transition-all duration-300 z-10"
            >
              {/* Step indicator */}
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                {item.step}
              </div>

              {/* Icon Container with glowing base */}
              <div className="w-16 h-16 rounded-2xl bg-white/80 shadow-md border border-white/40 flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 relative">
                {item.icon}

                {/* Micro timing tag */}
                <div className="absolute -bottom-2 px-1.5 py-0.5 bg-orange-600 text-[9px] text-white font-semibold rounded shadow">
                  {item.badge}
                </div>
              </div>

              {/* Content Text */}
              <h3 className="text-base font-bold font-display text-slate-900 leading-tight">
                {item.title}
              </h3>

              <p className="text-slate-500 text-xs mt-3 leading-relaxed max-w-xs">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-4 bg-amber-50/55 rounded-2xl border border-amber-100 flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-solar-yellow opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-solar-yellow"></span>
            </span>
            <p className="text-xs text-slate-700 font-semibold leading-relaxed font-sans">
              {tipText}
            </p>
          </div>
          <button
            onClick={onScrollToForm}
            className="px-4 py-1.5 text-xs font-bold text-slate-900 bg-solar-yellow hover:bg-yellow-405 rounded-lg shrink-0 transition"
          >
            Start Check Now
          </button>
        </div>

        {/* Informational Video Embed */}
        {(activeVideo && activeVideo.enabled !== false) && (
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-display font-bold text-slate-900">Watch the Process in Action</h3>
              <p className="text-slate-500 mt-2 text-sm">See how quickly your home can be upgraded to solar.</p>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-orange-600 border-4 border-white aspect-video">
              <iframe 
                className="absolute top-0 left-0 w-full h-full"
                src={activeVideo.url || "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"}
                title="Solar Installation Process"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
