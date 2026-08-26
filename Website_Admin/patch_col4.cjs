const fs = require('fs');
const file = 'src/components/bde/BDELeadManagement.jsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Fix the project type cards
const oldCards = `      {/* Project Type Filter Cards */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-2 scrollbar-hide">
        <button 
          onClick={() => setProjectTypeFilter("All")}
          className={\`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all \${projectTypeFilter === 'All' ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'}\`}
        >
          All Types
        </button>
        {dynamicProjectTypes.map(pt => (
          <button 
            key={pt.projectType}
            onClick={() => setProjectTypeFilter(pt.projectType)}
            className={\`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all \${projectTypeFilter === pt.projectType ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'}\`}
          >
            {pt.projectTypeLabel || pt.projectType}
          </button>
        ))}
      </div>`;

const newCards = `      {/* Project Type Filter Cards */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-2 scrollbar-hide">
        <button 
          onClick={() => setProjectTypeFilter("All")}
          className={\`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all \${projectTypeFilter === 'All' ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'}\`}
        >
          All Types
        </button>
        {dynamicProjectTypes.map(pt => (
          <button 
            key={pt.value}
            onClick={() => setProjectTypeFilter(pt.value)}
            className={\`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all \${projectTypeFilter === pt.value ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'}\`}
          >
            {pt.label}
          </button>
        ))}
      </div>`;

if (code.includes(oldCards)) {
  code = code.replace(oldCards, newCards);
  console.log("Replaced cards");
}

// 2. Fix the Col 4 logic
const oldCol4 = `{/* Col 4: Actions */}
              <div className="flex-1 min-w-[200px] lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col items-end gap-3 justify-center">
                <div className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-2 shadow-sm mb-1">
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                      <Calendar className="w-3 h-3"/> Follow-up Date
                    </div>
                    <input 
                      type="date" 
                      className="bg-transparent border-none p-0 text-xs font-bold text-blue-700 cursor-pointer focus:ring-0"
                      value={lead.nextFollowUp ? lead.nextFollowUp.split("T")[0] : ""}
                      onChange={(e) => updateLeadStatus(lead._id, lead.status, e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setViewingDetailLead(lead)} 
                  className="w-full justify-center px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-colors border border-slate-200 flex items-center gap-2 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-500"/> Lead Details
                </button>

                {isFreelancer ? (
                  !lead.billAmount ? (
                    <div className="w-full flex flex-col gap-2 mt-auto">
                      <button onClick={() => handleOpenUploadBill(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                        <Zap className="w-4 h-4" /> Upload Bill
                      </button>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col gap-2 mt-auto">
                      { (lead.hasLoggedIn || lead.preferredInstallDate) ? (
                        <button onClick={() => handleQualify(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                          <Calendar className="w-4 h-4" /> Finalize Date
                        </button>
                      ) : (
                        <div className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg font-bold text-center w-full shadow-sm">
                          Ask customer to login and provide an installation date to unlock Finalize Date.
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="w-full flex flex-col gap-2 mt-auto">
                    { (lead.hasLoggedIn || lead.preferredInstallDate) ? (
                        <button onClick={() => handleQualify(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                          <Calendar className="w-4 h-4" /> Finalize Date
                        </button>
                      ) : (
                        <div className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg font-bold text-center w-full shadow-sm">
                          Ask customer to login and provide an installation date to unlock Finalize Date.
                        </div>
                      )}
                    <button onClick={() => handleReject(lead)} className="w-full justify-center px-4 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold border border-rose-100 transition-colors flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5"/> Reject Lead
                    </button>
                  </div>
                )}
              </div>`;

const newCol4 = `{/* Col 4: Actions */}
              <div className="flex-1 min-w-[200px] lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col items-end gap-3 justify-center">
                {isFreelancer && filterTab === 'eligibility' ? (
                  <div className="w-full flex flex-col gap-2 mt-auto">
                    <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-lg font-bold text-center w-full shadow-sm">
                      Note: Firstly upload the bill of customer to get recommended system of KW.
                    </p>
                    {!lead.billUrl ? (
                      <button onClick={() => handleOpenUploadBill(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                        <Zap className="w-4 h-4" /> Upload Bill
                      </button>
                    ) : (
                      <button onClick={async () => {
                          try {
                            const res = await fetch(\`\${API_BASE}/api/bde/leads/\${lead._id}/mark-eligible\`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" }
                            });
                            if (res.ok) { window.location.reload(); }
                          } catch (e) {}
                        }} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                        <CheckCircle className="w-4 h-4" /> Mark as Eligible
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-2 shadow-sm mb-1">
                      <div className="flex justify-between items-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                          <Calendar className="w-3 h-3"/> Follow-up Date
                        </div>
                        <input 
                          type="date" 
                          className="bg-transparent border-none p-0 text-xs font-bold text-blue-700 cursor-pointer focus:ring-0"
                          value={lead.nextFollowUp ? lead.nextFollowUp.split("T")[0] : ""}
                          onChange={(e) => updateLeadStatus(lead._id, lead.status, e.target.value)}
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => setViewingDetailLead(lead)} 
                      className="w-full justify-center px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-colors border border-slate-200 flex items-center gap-2 shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4 text-blue-500"/> Lead Details
                    </button>

                    <div className="w-full flex flex-col gap-2 mt-auto">
                      { (lead.hasLoggedIn || lead.preferredInstallDate) ? (
                          <button onClick={() => {
                            if (!lead.nextFollowUp) {
                              alert("Firstly select the follow up date");
                              return;
                            }
                            handleQualify(lead);
                          }} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                            <Calendar className="w-4 h-4" /> Finalize Date
                          </button>
                        ) : (
                          <div className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg font-bold text-center w-full shadow-sm flex flex-col gap-1.5">
                            <span>Ask customer to login and provide an installation date to unlock Finalize Date.</span>
                            <a href="/au/#account" target="_blank" className="text-rose-700 underline flex items-center justify-center gap-1"><ArrowRight className="w-3 h-3"/> Open Customer Portal</a>
                          </div>
                        )}
                      <button onClick={() => handleReject(lead)} className="w-full justify-center px-4 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold border border-rose-100 transition-colors flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5"/> Reject Lead
                      </button>
                    </div>
                  </>
                )}
              </div>`;

if (code.includes(oldCol4)) {
  code = code.replace(oldCol4, newCol4);
  console.log("Replaced Col4");
}

fs.writeFileSync(file, code);
