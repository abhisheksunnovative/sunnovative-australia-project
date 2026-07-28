/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useWebsiteSettings } from "../hooks/useWebsiteSettings";

export default function Faqs() {
  const [openIndex, setOpenIndex] = useState(0);
  const settings = useWebsiteSettings();
  const faqsList = settings.faqs || [];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-solar-yellow/10 text-solar-yellow font-bold uppercase tracking-wider text-xs mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            Common Inquiries
          </div>
          <h2 className="text-3xl font-display font-extrabold text-slate-800 tracking-tight">
            Surya Ghar Yojana FAQs
          </h2>
          <p className="text-sm text-slate-500 mt-2">(અવારનવાર પુછાતા પ્રશ્નો)</p>
        </div>

        <div className="space-y-3">
          {faqsList.map((faq, index) => (
            <div
              key={index}
              className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-slate-800 text-sm pr-4">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-solar-yellow shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-600 font-medium mb-2">Kuch aur doubts ya questions hain?</p>
          <p className="text-xs text-slate-500">
            Direct call our Rajkot center representatives and get answers in Gujarati or Hindi.
          </p>
          <a
            href={`tel:${settings.footer?.phone || "+919898231245"}`}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-solar-yellow text-slate-900 font-bold text-sm rounded-xl hover:bg-amber-400 transition"
          >
            📞 Call Center: {settings.footer?.phone || "+91 98982 31245"}
          </a>
        </div>
      </div>
    </section>
  );
}
