<div className="relative pt-4 pb-6">
                  {/* Progress Connector Track */}
                  <div className="absolute top-[32px] left-8 right-8 h-1 bg-slate-850 rounded"></div>
                  <div
                    className="absolute top-[32px] left-8 h-1 bg-gradient-to-r from-[#0081C9] to-emerald-400 rounded transition-all duration-700"
                    style={{
                      width: `${(currentAccount.installDetails.currentStepIndex / 5) * 85}%`,
                    }}
                  ></div>

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative">
                    {ledgerSteps.map((step, idx) => {
                      const isActive =
                        idx === currentAccount.installDetails.currentStepIndex;
                      const isComplete =
                        idx < currentAccount.installDetails.currentStepIndex;

                      return (
                        <div
                          key={idx}
                          className="flex md:flex-col items-start gap-4 md:gap-2 relative text-left"
                        >
                          <div className="md:mx-auto relative z-10">
                            <div
                              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all ${
                                isComplete
                                  ? "bg-emerald-500 border-emerald-400 text-slate-950"
                                  : isActive
                                    ? "bg-solar-yellow border-white text-slate-950 scale-105 shadow-md shadow-amber-400/10"
                                    : "bg-slate-900 border-slate-700 text-slate-450"
                              }`}
                            >
                              {isComplete ? (
                                <Check className="w-5 h-5 stroke-[3]" />
                              ) : (
                                idx + 1
                              )}
                            </div>
                          </div>

                          <div className="flex-1 md:text-center">
                            <div
                              className={`text-xs font-black ${
                                isComplete
                                  ? "text-emerald-400"
                                  : isActive
                                    ? "text-solar-yellow"
                                    : "text-slate-400"
                              }`}
                            >
                              {step.title}
                            </div>
                            <p className="text-[10px] text-slate-450 mt-1 leading-snug">
                              {step.info}
                            </p>

                            {/* Date Log */}
                            <span className="block text-[9px] text-[#0081C9] font-mono mt-1 leading-tight font-bold">
                              {idx === 0 &&
                                currentAccount.installDetails.dates.booked}
                              {idx === 1 &&
                                currentAccount.installDetails.dates
                                  .surveyCompleted}
                              {idx === 2 &&
                                currentAccount.installDetails.dates
                                  .gedaApproved}
                              {idx === 3 &&
                                currentAccount.installDetails.dates
                                  .installationStart}
                              {idx === 4 &&
                                currentAccount.installDetails.dates
                                  .netMeteringSet}
                              {idx === 5 &&
                                currentAccount.installDetails.dates
                                  .subsidyDisbursed}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Economic Breakdown Ledger */}
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <span className="text-[9px] text-slate-500 font-black uppercase">
                      Project gross Contract Cost
                    </span>
                    <div className="text-lg font-black text-white mt-1">
                      {currentAccount.installDetails.projectCostTotal}
                    </div>
                    <span className="text-[9px] text-[#0081C9] font-medium mt-0.5 block">
                      Includes physical GEDA fees & structural scaffolds
                    </span>
                  </div>
                  <div className="sm:border-x border-slate-850 sm:px-6">
                    <span className="text-[9px] text-emerald-400 font-bold uppercase">
                      Expected Direct Govt Subsidy
                    </span>
                    <div className="text-lg font-black text-emerald-400 mt-1">
                      -{currentAccount.installDetails.subsidyExpected}
                    </div>
                    <span className="text-[9px] text-slate-500 block mt-0.5">
                      Disbursed directly after bidirectional PGVCL commissioning
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-solar-yellow font-bold uppercase">
                      Actual Net Payment Outlay
                    </span>
                    <div className="text-lg font-black text-solar-yellow mt-1">
                      {currentAccount.installDetails.netOutlay}
                    </div>
                    <span className="text-[9px] text-slate-500 block mt-0.5">
                      Homeowner self-funded outlay capital
                    </span>
                  </div>
                </div>
              </div>
