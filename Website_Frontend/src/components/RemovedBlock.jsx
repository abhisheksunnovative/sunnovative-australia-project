{fetchedData && (
              <div className="p-4 bg-[#10B981]/5 rounded-2xl border border-[#10B981]/20 mb-4" id="fetched-details-card">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#10B981] mb-2 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  {scanConfidence ? "Bill scanned successfully!" : "Demo data loaded!"}
                </div>
                {scanConfidence && scanConfidence !== "high" && (
                  <div className="flex items-start gap-2 mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-700">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Kuch details bill se clearly nahi mil payi — kripya neeche form me manually check/edit kar lo.</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 text-xs mb-1">
                  <div>
                    <span className="text-slate-400 font-medium">Consumer Name:</span>
                    <p className="font-bold text-slate-800 truncate">{fetchedData.consumerName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">DISCOM Provider:</span>
                    <p className="font-bold text-[#0081C9] truncate">{discom || fetchedData.discom || "—"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Meter Category:</span>
                    <p className="font-bold text-[#0081C9]">{meterCategory || "—"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Tariff / Phase:</span>
                    <p className="font-bold text-[#0081C9]">{tariffDesc || "—"}</p>
                  </div>
                  <div className="grid grid-cols-3 col-span-2 gap-2 text-center pt-2 mt-2 border-t border-slate-200/50">
                    <div className="p-1.5 bg-white rounded-lg">
                      <span className="text-[9px] text-slate-400">Monthly units</span>
                      <span className="font-extrabold text-slate-800 block">{fetchedData.monthlyUnits} Units</span>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg">
                      <span className="text-[9px] text-slate-400">Est solar capacity</span>
                      <span className="font-extrabold text-solar-sky block">{fetchedData.eligibleCapacityKw} kW System</span>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg">
                      <span className="text-[9px] text-slate-400">Guaranteed Subsidy</span>
                      <span className="font-extrabold text-solar-green block">₹{Number(fetchedData.subsidyAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isCheckingEligibility && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-6 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-solar-sky animate-spin" />
                <span className="text-xs font-semibold text-slate-600">Checking eligibility against Sunnovative's admin rules...</span>
              </div>
            )}

            {eligibilityError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold mb-6 flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" /> {eligibilityError}
              </div>
            )}

            {eligibilityResult && (
              <div className={`p-4 rounded-2xl border mb-6 ${
                eligibilityResult.isEligible ? "bg-emerald-50/60 border-emerald-200" : "bg-red-50/60 border-red-200"
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  {eligibilityResult.isEligible ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`text-sm font-bold ${eligibilityResult.isEligible ? "text-emerald-700" : "text-red-600"}`}>
                    {eligibilityResult.isEligible ? "You're Eligible for Rooftop Solar!" : "Needs Review Before Proceeding"}
                  </span>
                </div>

                {eligibilityResult.reasons?.length > 0 && (
                  <ul className="text-[11px] text-slate-600 space-y-1 mb-3 list-disc list-inside">
                    {eligibilityResult.reasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                )}

                {eligibilityResult.dueAmountWarning && (
                  <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {eligibilityResult.dueAmountWarning}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Recommended</p>
                    <p className="text-base font-black text-solar-sky">{eligibilityResult.suggestedKW} kW</p>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Subsidy</p>
                    <p className="text-base font-black text-solar-green">
                      {eligibilityResult.isSubsidyEligible ? `₹${eligibilityResult.subsidy.total.toLocaleString("en-IN")}` : "Not eligible"}
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Net Investment</p>
                    <p className="text-base font-black text-slate-900">₹{eligibilityResult.estimatedInvestment.netAfterSubsidy.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                {eligibilityResult.isSubsidyEligible && eligibilityResult.subsidy.total > 0 && (
                  <p className="text-[10px] text-slate-500 mt-2">
                    ₹{eligibilityResult.subsidy.central.toLocaleString("en-IN")} Central (PM Surya Ghar) + ₹{eligibilityResult.subsidy.state.toLocaleString("en-IN")} {customerState} state top-up
                    {eligibilityResult.subsidy.stateScheme ? ` (${eligibilityResult.subsidy.stateScheme})` : ""}.
                  </p>
                )}

                {eligibilityResult.isEligible && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60">
                    <p className="text-[11px] text-slate-500">
                      Next step: fill your details below and submit — our team will help you choose an EPC installer for this project. 👇
                    </p>
                  </div>
                )}
              </div>
            )}

            

