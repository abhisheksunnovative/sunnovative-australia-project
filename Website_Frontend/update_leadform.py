import re

with open('src/components/LeadForm.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add selectedKw state
state_match = re.search(r'const \[selectedUpgradeKw, setSelectedUpgradeKw\] = useState\(0\);', code)
if state_match:
    code = code.replace(
        'const [selectedUpgradeKw, setSelectedUpgradeKw] = useState(0);',
        'const [selectedUpgradeKw, setSelectedUpgradeKw] = useState(0);\n  const [selectedKw, setSelectedKw] = useState(3);'
    )

# 2. Update logic for sliderKw to use selectedKw if set manually, else calculate from bill
calc_block = """  if (isAU) {
    sliderKw = Math.max(3, Math.min(15, Math.ceil(monthlyBill / 100))); // e.g. $400/qtr = 4kW"""
new_calc_block = """  // Effect to auto-update selectedKw when monthly bill or scan results change
  useEffect(() => {
    if (isAU) {
      setSelectedKw(Math.max(3, Math.min(15, Math.ceil(monthlyBill / 100))));
    } else {
      const units = Math.round(monthlyBill / 7.2);
      setSelectedKw(Math.max(1, Math.min(15, Math.ceil(units / 115))));
    }
  }, [monthlyBill, isAU]);

  if (isAU) {
    sliderKw = selectedKw || Math.max(3, Math.min(15, Math.ceil(monthlyBill / 100))); // e.g. $400/qtr = 4kW"""
code = code.replace(calc_block, new_calc_block)

# 3. Completely replace the rendering part of the form. 

start_idx = code.find('<section id="eligibility-calculator"')
end_idx = code.find('</section>', start_idx) + 10

new_layout = """<section id="eligibility-calculator" className="py-20 solar-gradient relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Realtime Solar Simulator
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 mt-3 leading-tight">
            Check Your Subsidy & Rooftop Solar Estimate
          </h2>
          <p className="text-slate-600 mt-3 text-xs md:text-sm">
            Select your state, then upload a photo of your latest light bill —
            we'll scan it and instantly tell you your recommended capacity,
            subsidy, and eligibility.
          </p>
        </div>

        {submitSuccess && (
          <div className="max-w-3xl mx-auto glass-panel rounded-3xl p-8 mb-12 relative overflow-hidden" id="lead-success-receipt">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-solar-yellow via-solar-green to-solar-sky"></div>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-emerald-50 text-solar-green rounded-full flex items-center justify-center mb-4 border border-emerald-250">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-display font-bold text-slate-900">Rooftop Solar Enquiry Submitted!</h3>
              <p className="text-slate-500 text-xs mt-1">
                Your application ID is <strong className="text-slate-800 font-mono">{submitSuccess.id}</strong>.
                A dedicated Sunnovative solar consultant is processing your file.
              </p>
              
              <div className="mt-6 flex gap-3">
                <button onClick={() => setSubmitSuccess(null)} className="px-5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-center">
                  Enquire for another home
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="glass-panel p-6 md:p-8 rounded-3xl max-w-3xl mx-auto">
          <form onSubmit={handleFormSubmit} className="space-y-6" id="solar-lead-form">
            
            {/* 1. Location & Personal Details First */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-4">1. Applicant & Location Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                  <select
                    value={customerState}
                    onChange={(e) => { setCustomerState(e.target.value); setEligibilityResult(null); }}
                    className="w-full px-4 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all cursor-pointer"
                  >
                    {(countryStatesMap[country] || countryStatesMap["IN"]).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{isAU ? "Suburb / City *" : "District / City *"}</label>
                  {isAU ? (
                    <div className="flex gap-2">
                      <input type="text" required value={city} onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Parramatta"
                        className="w-2/3 px-4 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all" />
                      <input type="text" required value={postcode} onChange={(e) => setPostcode(e.target.value.replace(/\D/g, ""))} maxLength={4}
                        placeholder="Postcode"
                        className="w-1/3 px-3 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all" />
                    </div>
                  ) : (
                    <select value={city} onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all cursor-pointer">
                      {!["Rajkot", "Morbi", "Jamnagar", "Gondal", "Jetpur", "Jasdan", "Wankaner"].includes(city) && (
                        <option value={city}>{city}</option>
                      )}
                      <option value="Rajkot">Rajkot</option>
                      <option value="Morbi">Morbi</option>
                      <option value="Jamnagar">Jamnagar</option>
                      <option value="Gondal">Gondal</option>
                      <option value="Jetpur">Jetpur</option>
                      <option value="Jasdan">Jasdan</option>
                      <option value="Wankaner">Wankaner</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name (Owner Name) *</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rajeshbhai Kunjibhai Patel"
                    className="w-full px-4 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (WhatsApp) *</label>
                  <div className="relative">
                    {isAU && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">+61</span>}
                    <input type="tel" required maxLength={10} value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder={isAU ? "412 345 678" : "e.g. 98982 12345"}
                      className={`w-full ${isAU ? 'pl-10' : 'px-4'} pr-4 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all`} />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Bill Fetch / Upload Section */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-4 mt-6">2. Electricity Bill Check</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Upload Light Bill for Auto-Scan</label>
                  <div
                    onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                    onClick={handleTriggerFileInput}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                      dragActive ? "border-solar-sky bg-sky-50/50" : uploadedFile ? "border-solar-green bg-emerald-50/20" : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                    }`}
                    id="drag-drop-container"
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf" className="hidden" id="bill-file-input" />
                    {isScanning ? (
                      <div className="flex flex-col items-center">
                        <ScanLine className="w-8 h-8 text-solar-sky mb-2 animate-pulse" />
                        <p className="text-xs font-bold text-slate-800">Scanning your bill...</p>
                      </div>
                    ) : uploadedFile ? (
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-solar-green flex items-center justify-center mb-2">
                          <FileCheck className="w-5 h-5 animate-pulse-subtle" />
                        </div>
                        <p className="text-xs font-bold text-slate-800 tracking-tight">{uploadedFile.name}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-xs font-semibold text-slate-700">Drag & drop bill photo</p>
                      </div>
                    )}
                  </div>
                  {scanError && (
                    <div className="text-[11px] text-red-500 font-semibold mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {scanError}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Or Enter Average Bill Manually</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{isAU ? "$" : "₹"}</span>
                    <input type="number" required value={monthlyBill}
                      onChange={(e) => setMonthlyBill(Number(e.target.value))}
                      placeholder="e.g. 2150"
                      className="w-full pl-7 pr-4 py-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all mb-2" />
                  </div>
                  <p className="text-[10px] text-slate-400 italic">This helps us calculate your required solar system size.</p>
                </div>
              </div>
            </div>

            {/* 3. Subsidy Rules & kW Scale Selector (Appears BELOW the bill fetch) */}
            <div className="bg-amber-50/50 rounded-2xl border border-amber-100 p-5 mt-6">
              <h3 className="text-sm font-bold text-slate-900 border-b border-amber-200/50 pb-2 mb-4">3. Recommended System & Expected Subsidy</h3>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-600 font-bold">Select System Size (kW):</span>
                  <span className="text-lg font-black text-solar-sky">{selectedKw} kW</span>
                </div>
                <input
                  type="range" min="1" max="15" step="1" value={selectedKw}
                  onChange={(e) => setSelectedKw(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-solar-sky focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-slate-400 px-1 mt-1">
                  <span>1 kW</span>
                  <span>15 kW</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="p-3 bg-white rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-tight">Est. Generation</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{sliderUnits} Units<span className="text-[9px] text-slate-400">/mo</span></span>
                </div>
                <div className="p-3 bg-[#10B981]/10 rounded-xl border border-[#10B981]/20 text-center">
                  <span className="text-[10px] text-emerald-600 block uppercase font-bold tracking-tight">Govt Subsidy</span>
                  <span className="text-sm font-black text-solar-green mt-0.5 block">{isAU ? "$" : "₹"}{sliderSubsidy.toLocaleString("en-IN")}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-tight">Setup Cost</span>
                  <span className="text-sm font-bold text-slate-700 mt-0.5 block">{isAU ? "$" : "₹"}{sliderCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
                  <span className="text-[10px] text-blue-600 block uppercase font-bold tracking-tight">Net Investment</span>
                  <span className="text-sm font-black text-blue-900 mt-0.5 block">{isAU ? "$" : "₹"}{sliderNet.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-100 text-[11px] text-slate-600">
                <Award className="w-4 h-4 text-solar-sky shrink-0" />
                <p>
                  By installing a <strong>{selectedKw} kW</strong> system, you will generate approx <strong>{sliderUnits} units</strong> monthly, saving {isAU ? "$" : "₹"}{(sliderUnits * (isAU ? 0.3 : 7.2)).toFixed(0)} on your bill. 
                  ROI is estimated at <strong>{sliderPaybackMonths} months</strong>.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-6">
              <button type="submit" disabled={isSubmitting}
                className="w-full py-4 bg-solar-green hover:bg-emerald-600 text-white font-bold text-sm rounded-xl cursor-pointer shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-2"
                id="lead-submit-btn">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    {isAU ? "Generating Quote..." : "Registering Application..."}
                  </span>
                ) : (
                  <>Submit Application <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
              <span className="block text-center text-[10px] text-slate-400 mt-2.5 flex items-center justify-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> Your information is fully secured. We never share your data.
              </span>
            </div>
          </form>
        </div>
      </div>
    </section>"""

code = code[:start_idx] + new_layout + code[end_idx:]

with open('src/components/LeadForm.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

