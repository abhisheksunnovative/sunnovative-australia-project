import React from "react";
import { useCountry } from "../context/CountryContext";
import Header from "../components/Header";
import { Sun, Shield, Zap, Users, TrendingUp, Globe, CheckCircle, ArrowRight } from "lucide-react";

const platformData = {
  IN: {
    title: "Our Platform – India",
    subtitle: "India's smartest solar adoption platform, powered by data and driven by trust.",
    accentColor: "orange",
    features: [
      {
        icon: <Zap className="w-6 h-6 text-orange-500" />,
        title: "PM Surya Ghar Subsidy",
        desc: "Instantly check your eligibility for central and state government subsidies. We calculate the exact subsidy amount for your system size.",
      },
      {
        icon: <Shield className="w-6 h-6 text-orange-500" />,
        title: "Verified EPC Installers",
        desc: "Every installer on our platform is verified, rated, and ranked. You always get the best-performing EPC for your project.",
      },
      {
        icon: <Users className="w-6 h-6 text-orange-500" />,
        title: "Transparent Pricing",
        desc: "No hidden charges. Admin-set, transparent pricing for every combination of kW size, panel brand, and inverter brand.",
      },
      {
        icon: <TrendingUp className="w-6 h-6 text-orange-500" />,
        title: "Live Order Tracking",
        desc: "Track your solar journey from application to grid connection in real time. Every step documented on your dashboard.",
      },
      {
        icon: <Sun className="w-6 h-6 text-orange-500" />,
        title: "Smart Bill Analysis",
        desc: "Upload your electricity bill. Our AI analyses your consumption and recommends the exact solar capacity you need.",
      },
    ],
    stats: [
      { value: "50,000+", label: "Happy Customers" },
      { value: "₹78,000", label: "Max Subsidy Saved" },
      { value: "500+", label: "Verified Installers" },
      { value: "200 MW+", label: "Capacity Installed" },
    ],
  },
  AU: {
    title: "Our Platform – Australia",
    subtitle: "Australia's most transparent solar marketplace — connecting homeowners to trusted installers and maximum STC rebates.",
    accentColor: "orange",
    features: [
      {
        icon: <Zap className="w-6 h-6 text-orange-500" />,
        title: "Federal STC Rebates",
        desc: "We calculate your exact Small-scale Technology Certificate (STC) rebate value and show you the net cost upfront.",
      },
      {
        icon: <Shield className="w-6 h-6 text-orange-500" />,
        title: "CEC-Accredited Installers",
        desc: "Every installer on our network is Clean Energy Council accredited. Verified, rated, and insured for your peace of mind.",
      },
      {
        icon: <Users className="w-6 h-6 text-orange-500" />,
        title: "Brand & Product Choice",
        desc: "Choose from our curated selection of Tier-1 solar panels and inverter brands. No compromises on quality.",
      },
      {
        icon: <TrendingUp className="w-6 h-6 text-orange-500" />,
        title: "EPC-Set Transparent Pricing",
        desc: "Installers set their own competitive prices, visible to you before you commit. Complete transparency guaranteed.",
      },
      {
        icon: <Globe className="w-6 h-6 text-orange-500" />,
        title: "Real-Time Order Journey",
        desc: "From your application to grid connection, track every step of your solar installation on your personal dashboard.",
      },
      {
        icon: <Sun className="w-6 h-6 text-orange-500" />,
        title: "Smart Energy Bill Scan",
        desc: "Upload your energy bill and our system recommends the right solar system size for your Australian home.",
      },
    ],
    stats: [
      { value: "2,000+", label: "Aussie Homes Solarized" },
      { value: "$5M+", label: "STC Rebates Claimed" },
      { value: "10 MW", label: "Clean Capacity Installed" },
      { value: "50+", label: "CEC Accredited Partners" },
    ],
  },
};

const defaultData = platformData.IN;

export default function OurPlatformPage() {
  const { country } = useCountry();
  const data = platformData[country] || defaultData;

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-bold mb-6 uppercase tracking-wider">
            <Sun className="w-4 h-4 fill-white" />
            EmergeSun Platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">{data.title}</h1>
          <p className="text-xl text-orange-100 max-w-3xl mx-auto leading-relaxed">{data.subtitle}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#1c2340] py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {data.stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className={`text-3xl font-black ${i % 2 === 0 ? "text-orange-400" : "text-yellow-300"}`}>{s.value}</div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Everything You Need, Built In</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              From eligibility check to final installation — our platform handles every step of your solar journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:border-orange-200 transition-all group">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-orange-600 to-amber-500 py-16 px-4 text-center text-white">
        <h2 className="text-3xl font-extrabold mb-4">Ready to Go Solar?</h2>
        <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
          Join thousands of homeowners who've already made the switch to clean, affordable solar energy.
        </p>
        <a href="/" className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-3.5 rounded-xl shadow-xl hover:bg-orange-50 transition text-sm uppercase tracking-wider">
          Get Started <ArrowRight className="w-4 h-4" />
        </a>
      </section>
    </div>
  );
}
