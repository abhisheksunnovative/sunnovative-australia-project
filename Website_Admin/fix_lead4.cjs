const fs = require('fs');
const file = 'src/components/bde/BDELeadManagement.jsx';
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

let c4_start = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('{/* Col 4: Actions */}')) {
        c4_start = i;
        break;
    }
}

if (c4_start !== -1) {
    let c4_end = -1;
    for (let i = c4_start; i < lines.length; i++) {
        if (lines[i].includes('))}')) {
            // Find the </div> that closes the lead item loop
            c4_end = i - 3;
            break;
        }
    }
    
    if (c4_end !== -1) {
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
                            [OK] Documents Uploaded - Click to Mark Eligible
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
                    <button onClick={() => handleReject(lead)} className="w-full justify-center px-4 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold border border-rose-100 transition-colors flex items-center gap-1.5 mt-2">
                      <XCircle className="w-3.5 h-3.5"/> Reject Lead
                    </button>
                  </>
                )}
              </div>`;
              
       lines.splice(c4_start, c4_end - c4_start + 1, ...newCol4.split('\n'));
       fs.writeFileSync(file, lines.join('\n'));
       console.log('Fixed Col 4 perfectly!');
    }
}
