import React, { Suspense, lazy } from "react";
import { useWebsiteSettings } from "../hooks/useWebsiteSettings";
import { CheckCircle2, ChevronRight, Zap } from "lucide-react";
import LeadForm from "./LeadForm";

export default function DynamicPageRenderer({ onScrollToForm, selectedProjectType, settings }) {
  // Use the merged dynamicSections from settings (which handles the fallback)
  const sections = settings?.websiteContent?.dynamicSections || [];

  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-white">
      {sections
        .filter((sec) => sec.isVisible)
        .sort((a, b) => a.order - b.order)
        .map((sec, idx) => {
          
          return (
            <section key={sec.id || idx} className={`py-16 md:py-24 ${idx % 2 === 0 ? "bg-slate-50" : "bg-white"}`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {sec.title && (
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
                )}

                {/* Section Type: Cards (USPs) */}
                {sec.type === "cards" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.isArray(sec.content) ? sec.content.map((card, cIdx) => (
                      <div key={cIdx} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                          <Zap className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-3">{card.title || "Feature"}</h3>
                        <p className="text-slate-600 leading-relaxed">{card.desc || card.description || ""}</p>
                      </div>
                    )) : (
                      typeof sec.content === 'string' && sec.content.startsWith('[') ? (
                        JSON.parse(sec.content).map((card, cIdx) => (
                          <div key={cIdx} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                              <Zap className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-3">{card.title || "Feature"}</h3>
                            <p className="text-slate-600 leading-relaxed">{card.desc || card.description || ""}</p>
                          </div>
                        ))
                      ) : null
                    )}
                  </div>
                )}

                {/* Section Type: Rich Text */}
                {sec.type === "text" && (
                  <div className="max-w-4xl mx-auto prose prose-lg prose-slate text-slate-600" dangerouslySetInnerHTML={{ __html: sec.content || "" }} />
                )}

                {/* Section Type: Video (Testimonials, Demo) */}
                {sec.type === "video" && (
                  <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-200 aspect-video">
                    {typeof sec.content === 'string' && sec.content ? (
                      <iframe 
                        className="w-full h-full"
                        src={sec.content} 
                        title="Video Player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen>
                      </iframe>
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                        No video URL configured
                      </div>
                    )}
                  </div>
                )}

                {/* Section Type: Apply Form */}
                {sec.type === "form" && (
                   <div id="eligibility-calculator">
                     <LeadForm selectedProjectType={selectedProjectType} settings={settings} />
                   </div>
                )}

                {/* Section Type: Journey Snap (Customer Journey Timeline) */}
                {sec.type === "snap" && (
                  <div className="max-w-5xl mx-auto">
                     <div className="relative border-l-4 border-emerald-500 ml-6 md:ml-12 pl-8 py-4 space-y-12">
                       {settings?.customerJourney?.steps?.map((step, sIdx) => (
                          <div key={sIdx} className="relative">
                            <div className="absolute -left-[45px] bg-emerald-500 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-4 border-white text-white font-bold text-sm">
                              {sIdx + 1}
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">{step.title}</h3>
                            <p className="text-lg text-slate-600">{step.description}</p>
                          </div>
                       ))}
                       {(!settings?.customerJourney?.steps || settings?.customerJourney?.steps?.length === 0) && (
                         <p className="text-slate-500">Journey steps not configured.</p>
                       )}
                     </div>
                  </div>
                )}

                {/* Section Type: Call To Action */}
                {sec.type === "cta" && (
                  <div className="text-center mt-4">
                    <button onClick={onScrollToForm} className="bg-emerald-500 text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1">
                      {typeof sec.content === 'string' && sec.content ? sec.content : "Apply for Solar Now"} <ChevronRight className="inline w-6 h-6 ml-2" />
                    </button>
                  </div>
                )}

              </div>
            </section>
          )
        })}
    </div>
  );
}
