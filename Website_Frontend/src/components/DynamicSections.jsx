import React from "react";
import { useWebsiteSettings } from "../hooks/useWebsiteSettings";
import { CheckCircle2, ChevronRight, Zap } from "lucide-react";

export default function DynamicSections({ onScrollToForm }) {
  const settings = useWebsiteSettings();
  const dynamicSections = settings?.websiteContent?.dynamicSections || [];

  if (!dynamicSections || dynamicSections.length === 0) return null;

  return (
    <div className="w-full bg-white">
      {dynamicSections
        .filter((sec) => sec.isVisible)
        .sort((a, b) => a.order - b.order)
        .map((sec, idx) => (
          <section key={sec.id || idx} className={`py-16 md:py-24 ${idx % 2 === 0 ? "bg-slate-50" : "bg-white"}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight mb-6">
                  {sec.title}
                </h2>
                {sec.subtitle && (
                  <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
                    {sec.subtitle}
                  </p>
                )}
              </div>

              {sec.type === "cards" && Array.isArray(sec.content) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sec.content.map((card, cIdx) => (
                    <div key={cIdx} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                        <Zap className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-black text-slate-800 mb-3">{card.title || "Feature"}</h3>
                      <p className="text-slate-600 leading-relaxed">{card.desc || card.description || ""}</p>
                    </div>
                  ))}
                </div>
              )}

              {sec.type === "text" && (
                <div className="max-w-4xl mx-auto prose prose-lg prose-slate text-slate-600" dangerouslySetInnerHTML={{ __html: sec.content || "" }} />
              )}

              {sec.type === "cta" && (
                <div className="text-center mt-10">
                  <button onClick={onScrollToForm} className="bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1">
                    {sec.content?.buttonText || "Get Started"} <ChevronRight className="inline w-5 h-5 ml-1" />
                  </button>
                </div>
              )}

            </div>
          </section>
        ))}
    </div>
  );
}
