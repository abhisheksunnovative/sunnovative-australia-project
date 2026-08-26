const fs = require('fs');
const file = 'src/components/bde/BDELeadManagement.jsx';
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

// Find Col 1: Install Date badge
let installIdx = -1;
for (let i = 0; i < lines.length; i++) {
   if (lines[i].includes('lead.preferredInstallDate ? (') && lines[i-1].includes('border-slate-100 flex flex-col gap-2')) {
       installIdx = i;
       break;
   }
}
if (installIdx > -1) {
   // delete from installIdx to installIdx + 8
   lines.splice(installIdx, 9);
}

// Find Col 2: System Info
let col2Idx = -1;
for(let i = 0; i < lines.length; i++) {
   if (lines[i].includes('{/* Col 2: System Info */}')) {
       col2Idx = i;
       break;
   }
}
if (col2Idx > -1) {
   let endCol2 = -1;
   for(let i = col2Idx; i < lines.length; i++) {
       if (lines[i].includes('{/* Col 3: Customer Info */}')) {
           endCol2 = i - 1;
           break;
       }
   }
   
   if (endCol2 > -1) {
       let newCol2 = `              {/* Col 2: System Info */}
              <div className="flex-1 min-w-[200px] lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-center">
                <div className="text-xl font-black text-slate-800 capitalize mb-2">
                  {lead.solarType || "Residential"} • {lead.kw || "0"} KW
                </div>
                <div className="text-sm text-slate-600 font-semibold flex items-center gap-2 mb-4">
                  <span className="text-slate-400">Est. Bill:</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">\${lead.billAmount || 0} {isAU ? 'AUD' : 'INR'}</span>
                </div>
                
                {/* Installation Date Badge (Moved Here) */}
                {lead.preferredInstallDate ? (
                  <div className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 inline-flex items-center gap-1.5 font-bold shadow-sm w-fit">
                    <Calendar className="w-4 h-4 text-emerald-600"/> Install: {new Date(lead.preferredInstallDate).toLocaleDateString("en-IN")}
                  </div>
                ) : (
                  <div className="text-xs bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200 inline-flex items-center gap-1.5 font-bold w-fit shadow-sm">
                    <Calendar className="w-4 h-4 text-amber-500"/> Install: Not Selected
                  </div>
                )}
              </div>
`;
       lines.splice(col2Idx, endCol2 - col2Idx + 1, ...newCol2.split('\n'));
   }
}

// Find Col 4: Actions and fix the Follow-up / Lead details hiding
let col4Idx = -1;
for(let i = 0; i < lines.length; i++) {
   if(lines[i].includes('{/* Col 4: Actions */}')) {
       col4Idx = i;
       break;
   }
}
if(col4Idx > -1) {
   let endCol4 = -1;
   for (let i = col4Idx; i < lines.length; i++) {
      if(lines[i].includes('</div>')) {
         // we just want to find where the entire loop `return (` ends? No, just replace col4 manually
      }
      // Let's just find `</button>` for Finalize Date or something
      if(lines[i].includes('Ask customer to login and provide an installation date to unlock Finalize Date.')) {
         endCol4 = i + 5;
         break;
      }
   }
   
   if(endCol4 > -1) {
       let newCol4 = `              {/* Col 4: Actions */}
              <div className="flex-1 min-w-[200px] lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col items-end gap-3 justify-center">
                {isFreelancer && filterTab === "eligibility" ? (
                    <div className="w-full flex flex-col gap-2 mt-auto">
                      {!lead.billAmount && !lead.billUrl ? (
                        <button onClick={() => handleOpenUploadBill(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                          <Zap className="w-4 h-4" /> Upload Documents
                        </button>
                      ) : (
                        <>
                          <div className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg font-bold text-center w-full">
                            ✅ Documents Uploaded — Click to Mark Eligible
                          </div>
                          <button onClick={() => handleMarkEligible(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                            <CheckCircle className="w-4 h-4" /> Mark Eligible
                          </button>
                        </>
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

                    <div className="w-full grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setViewingDetailLead(lead)} 
                        className="w-full justify-center px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-colors border border-slate-200 flex items-center gap-2 shadow-sm"
                      >
                        <ShieldCheck className="w-4 h-4 text-blue-500"/> Details
                      </button>
                      
                      {(lead.hasLoggedIn || lead.preferredInstallDate) ? (
                          <button onClick={() => {
                              if (!lead.nextFollowUp && !lead.followUpDate) return alert("Please select a Follow-up Date on the card before finalizing the installation date.");
                              handleQualify(lead);
                          }} className="w-full justify-center flex items-center gap-2 text-white text-xs font-bold px-2 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all">
                            <Calendar className="w-3 h-3" /> Finalize Date
                          </button>
                        ) : (
                          <div className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg font-bold text-center w-full shadow-sm">
                            Ask customer to login & provide date.
                          </div>
                      )}
                    </div>
                  </>
                )}
              </div>`;
       lines.splice(col4Idx, endCol4 - col4Idx + 1, ...newCol4.split('\n'));
   }
}

fs.writeFileSync(file, lines.join('\n'));
console.log('Fixed BDELeadManagement columns!');
