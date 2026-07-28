/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, ShieldCheck, CheckCircle2, ChevronRight } from "lucide-react";

import { useCountry } from "../context/CountryContext";

export default function EpcPartnerModal({ isOpen, onClose }) {
  const { country } = useCountry();
  const isAU = country === "AU";

  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    mobileNumber: "",
    email: "",
    experienceYears: "under-2",
    gstNumber: "",
    abn: "",
    cecAccreditationNumber: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.fullName ||
      !formData.companyName ||
      !formData.mobileNumber ||
      !formData.email
    ) {
      setErrorMsg("Please fill in all mandatory fields.");
      return;
    }
    // Simple verification
    setErrorMsg("");
    setIsSubmitted(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div
      id="epc-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
    >
      <div
        id="epc-modal"
        className="relative w-full max-w-xl overflow-hidden rounded-2xl glass-panel shadow-2xl transition-all duration-300 transform scale-100"
      >
        {/* Decorative Top Sun bar */}
        <div className="h-2 bg-gradient-to-r from-solar-yellow to-solar-green"></div>

        {/* Modal Close Button */}
        <button
          id="close-epc-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success State */}
        {isSubmitted ? (
          <div className="p-8 text-center" id="epc-success-view">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 mb-6 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">
              Registration Received!
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Thank you for trusting Sunnovative. Our EPC channel manager will
              review your company profile and reach out within 24 business hours
              to schedule a Zoom or physical meeting in Rajkot.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl mb-6 text-left max-w-sm mx-auto border border-dashed border-slate-200">
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">
                Registered Entity
              </div>
              <div className="font-semibold text-slate-800">
                {formData.companyName}
              </div>
              <div className="text-sm text-slate-600">
                {formData.fullName} ({formData.mobileNumber})
              </div>
              <div className="text-xs font-mono text-emerald-600 mt-2 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> {isAU ? "CEC Empanelment Review Pending" : "Direct GEDA Empanelment Lead Sync"}
              </div>
            </div>

            <button
              id="epc-success-ok"
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  fullName: "",
                  companyName: "",
                  mobileNumber: "",
                  email: "",
                  experienceYears: "under-2",
                  gstNumber: "",
                  abn: "",
                  cecAccreditationNumber: "",
                });
                onClose();
              }}
              className="py-2.5 px-6 font-medium text-white bg-slate-950 rounded-xl hover:bg-slate-850 transition-colors cursor-pointer"
            >
              Close Window
            </button>
          </div>
        ) : (
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 mb-2">
                B2B Channel Partner
              </span>
              <h2 className="text-2xl font-display font-bold text-slate-900">
                Become an EPC Delivery Partner
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Collaborate with Sunnovative Solar System Pvt Ltd to expand
                standard PM Surya Ghar Yojana installations in Saurashtra.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              id="epc-lead-form"
            >
              {errorMsg && (
                <div
                  className="p-3 text-xs bg-red-50 text-red-600 rounded-lg border border-red-100"
                  id="epc-form-error"
                >
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Entity Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Raj Solar Infrastructure"
                    className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Principal Contact Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    required
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="e.g. 98765 43210"
                    className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. contact@rajsolar.com"
                    className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Solar Installation Experience *
                  </label>
                  <select
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky outline-none transition-all cursor-pointer"
                  >
                    <option value="under-2">Less than 2 Years</option>
                    <option value="2-to-5">2 to 5 Years</option>
                    <option value="above-5">More than 5 Years</option>
                    <option value="none">Interested New Entrant</option>
                  </select>
                </div>
                {isAU ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ABN (Required for STC claims) *
                    </label>
                    <input
                      type="text"
                      name="abn"
                      required
                      value={formData.abn}
                      onChange={handleChange}
                      placeholder="e.g. 11 222 333 444"
                      className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky outline-none transition-all"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      GST Number (Optional)
                    </label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      placeholder="e.g. 24AAAAA1111A1Z1"
                      className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky outline-none transition-all"
                    />
                  </div>
                )}
              </div>

              {isAU && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CEC Accreditation Number *
                    </label>
                    <input
                      type="text"
                      name="cecAccreditationNumber"
                      required
                      value={formData.cecAccreditationNumber}
                      onChange={handleChange}
                      placeholder="e.g. A1234567"
                      className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-2.5 border border-slate-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  <strong>{isAU ? "Why Partner with Sunnovative in Australia?" : "Why Partner with Sunnovative?"}</strong> {isAU ? "Direct panel/inverter bulk logistics, STC assignment management, swift compliance coordination, and high-margin co-epc structure." : "Direct panel/inverter bulk logistics from Rajkot hub, MNRE National Portal submission convenience, swift subsidy coordination, and high-margin co-epc empanelment structure."}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-solar-green hover:bg-emerald-600 rounded-xl shadow-md cursor-pointer transition-colors flex items-center gap-1"
                >
                  Apply to Join <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
