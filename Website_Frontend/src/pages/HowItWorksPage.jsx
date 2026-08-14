import React from "react";
import { useCountry } from "../context/CountryContext";
import Header from "../components/Header";
import { Sun, FileText, Users, Zap, CheckCircle, TrendingUp, ArrowRight, PhoneCall } from "lucide-react";

const steps = {
  IN: [
    {
      step: "01",
      icon: <FileText className="w-6 h-6" />,
      title: "Upload Your Electricity Bill",
      desc: "Upload your latest electricity bill or enter your monthly bill amount. Our AI instantly analyses your consumption.",
      color: "bg-orange-500",
    },
    {
      step: "02",
      icon: <Zap className="w-6 h-6" />,
      title: "Check Subsidy Eligibility",
      desc: "Our system checks your meter category, bill status, and state — then calculates the exact PM Surya Ghar and state subsidy you'll receive.",
      color: "bg-amber-500",
    },
    {
      step: "03",
      icon: <Sun className="w-6 h-6" />,
      title: "Select Your Solar System",
      desc: "We recommend the ideal system size (kW) for your needs. Choose your preferred solar panel and inverter brand from our curated list.",
      color: "bg-orange-600",
    },
    {
      step: "04",
      icon: <Users className="w-6 h-6" />,
      title: "Get Matched to an EPC Installer",
      desc: "Our smart ranking algorithm assigns the best-rated, least-loaded EPC installer in your area to your project.",
      color: "bg-amber-600",
    },
    {
      step: "05",
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Submit Your Application",
      desc: "Fill out the project application form. Documents are pre-filled from your bill scan — just review and submit.",
      color: "bg-orange-500",
    },
    {
      step: "06",
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Track Your Order Journey",
      desc: "From survey to final installation and grid connection, track every milestone live on your customer dashboard.",
      color: "bg-amber-500",
    },
  ],
  AU: [
    {
      step: "01",
      icon: <FileText className="w-6 h-6" />,
      title: "Upload Your Energy Bill",
      desc: "Upload your Australian energy bill. Our system reads your quarterly kWh usage and recommends the right solar system size.",
      color: "bg-orange-500",
    },
    {
      step: "02",
      icon: <Zap className="w-6 h-6" />,
      title: "See Your STC Rebate Value",
      desc: "We calculate your exact Small-scale Technology Certificate (STC) rebate based on your location and system size — showing you the net cost.",
      color: "bg-amber-500",
    },
    {
      step: "03",
      icon: <Sun className="w-6 h-6" />,
      title: "Choose Your Brands",
      desc: "Select your preferred Tier-1 solar panel and inverter brand from our curated selection. All products are CEC approved.",
      color: "bg-orange-600",
    },
    {
      step: "04",
      icon: <Users className="w-6 h-6" />,
      title: "Select a CEC-Accredited Installer",
      desc: "Browse and select from verified, CEC-accredited EPC installers. View their ratings, STC pricing, and track record.",
      color: "bg-amber-600",
    },
    {
      step: "05",
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Apply & Confirm Your Order",
      desc: "Submit your application with pre-filled details. Confirm your chosen installer and agree to the installation pricing.",
      color: "bg-orange-500",
    },
    {
      step: "06",
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Installation & Grid Connection",
      desc: "Your installer schedules the survey and installation. Track every step — from site survey to grid approval — on your dashboard.",
      color: "bg-amber-500",
    },
  ],
};

export default function HowItWorksPage() {
  const { country } = useCountry();
  const currentSteps = steps[country] || steps.IN;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 rounded-full px-4 py-1.5 text-sm font-bold mb-6 uppercase tracking-wider text-orange-300">
            <Zap className="w-4 h-4" />
            Simple 6-Step Process
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            How EmergeSun Works
          </h1>
          <p className="text-xl text-orange-200 max-w-2xl mx-auto leading-relaxed">
            From bill scan to solar installation in 6 simple steps. We've made going solar effortless.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="space-y-10">
              {currentSteps.map((s, i) => (
                <div key={i} className="relative flex gap-6 items-start group">
                  {/* Step badge */}
                  <div className={`relative w-16 h-16 rounded-2xl ${s.color} text-white flex flex-col items-center justify-center shrink-0 shadow-lg z-10 group-hover:scale-105 transition-transform`}>
                    {s.icon}
                    <span className="text-[10px] font-black opacity-75">{s.step}</span>
                    
                    {/* Connector line */}
                    {i !== currentSteps.length - 1 && (
                      <div className="absolute top-16 left-1/2 w-0.5 h-10 bg-gradient-to-b from-orange-400 to-amber-400 hidden md:block -translate-x-1/2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex-1 group-hover:border-orange-200 group-hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-black text-orange-500 uppercase tracking-wider">Step {s.step}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{s.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Visual diagram teaser */}
      <section className="bg-[#1c2340] py-16 px-4">
        <div className="max-w-5xl mx-auto text-center text-white">
          <h2 className="text-2xl font-extrabold mb-2">The EmergeSun Flow</h2>
          <p className="text-slate-400 mb-10 text-sm">A quick visual summary of how your project moves through our system.</p>
          <div className="flex flex-wrap justify-center items-center gap-2">
            {["Customer Applies", "→", "EPC Assigned", "→", "Site Survey", "→", "Installation", "→", "Grid Connection", "→", "Dashboard Live"].map((label, i) => (
              label === "→" ? (
                <ArrowRight key={i} className="w-5 h-5 text-orange-400 shrink-0" />
              ) : (
                <div key={i} className="bg-orange-600/20 border border-orange-500/30 text-orange-300 font-bold text-sm px-4 py-2 rounded-xl">
                  {label}
                </div>
              )
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-orange-600 to-amber-500 py-16 px-4 text-center text-white">
        <h2 className="text-3xl font-extrabold mb-4">Ready to Start Your Solar Journey?</h2>
        <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
          It takes less than 2 minutes to check your eligibility and see your potential savings.
        </p>
        <a href="/" className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-3.5 rounded-xl shadow-xl hover:bg-orange-50 transition text-sm uppercase tracking-wider">
          Check Eligibility Now <ArrowRight className="w-4 h-4" />
        </a>
      </section>
    </div>
  );
}
