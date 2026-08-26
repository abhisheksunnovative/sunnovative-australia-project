const fs = require('fs');
const file = 'src/components/bde/BDELeadManagement.jsx';
let code = fs.readFileSync(file, 'utf8');

const oldActions = `              {/* Col 4: Actions */}
              <div className="flex-1 min-w-[200px] lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col items-end gap-3 justify-center">
                <div className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-2 shadow-sm mb-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Follow-up Date:</span>
                    <input
                      type="date"
                      value={lead.followUpDate || ''}
                      onChange={(e) => updateFollowUp(lead._id, e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600 outline-none w-[110px]"
                    />
                  </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setViewingLead(lead)}
                    className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm text-xs font-bold rounded-lg transition flex justify-center items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>
                  <button 
                    onClick={() => handleOpenCalendar(lead)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-xs font-bold rounded-lg transition flex justify-center items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Finalize
                  </button>
                </div>
              </div>`;

const newActions = `              {/* Col 4: Actions */}
              <div className="flex-1 min-w-[200px] lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col items-end gap-3 justify-center">
                {filterTab === "eligibility" ? (
                  <>
                    {!lead.billUrl ? (
                       <button onClick={() => handleOpenUploadBill(lead)} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-sm font-bold rounded-lg transition flex justify-center items-center gap-2">
                         Upload Documents
                       </button>
                    ) : (
                       <button onClick={() => handleMarkEligible(lead)} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm text-sm font-bold rounded-lg transition flex justify-center items-center gap-2">
                         Mark Eligible
                       </button>
                    )}
                    <button 
                      onClick={() => setViewingLead(lead)}
                      className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm text-xs font-bold rounded-lg transition flex justify-center items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-2 shadow-sm mb-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700">Follow-up Date:</span>
                        <input
                          type="date"
                          value={lead.followUpDate || ''}
                          onChange={(e) => updateFollowUp(lead._id, e.target.value)}
                          className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600 outline-none w-[110px]"
                        />
                      </div>
                    </div>

                    <div className="w-full flex flex-col gap-2">
                      <button 
                        onClick={() => setViewingLead(lead)}
                        className="w-full py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm text-xs font-bold rounded-lg transition flex justify-center items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </button>
                      {lead.portalLoginStatus ? (
                        <button 
                          onClick={() => {
                            if (!lead.followUpDate) return alert("Please select a Follow-up Date on the card before finalizing the installation date.");
                            handleOpenCalendar(lead);
                          }}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-sm font-bold rounded-lg transition flex justify-center items-center gap-2"
                        >
                          Finalize Date
                        </button>
                      ) : (
                        <p className="text-[10px] text-rose-500 font-bold bg-rose-50 px-2 py-1 rounded text-center border border-rose-100 w-full mt-1">Ask customer to login and provide an installation date to unlock Finalize Date.</p>
                      )}
                    </div>
                  </>
                )}
              </div>`;

code = code.replace(oldActions, newActions);

const oldAdd = `{isFreelancer && (
          <button 
            onClick={handleOpenAdd}`;

const newAdd = `{isFreelancer && filterTab !== "self-leads" && (
          <button 
            onClick={handleOpenAdd}`;

code = code.replace(oldAdd, newAdd);
fs.writeFileSync(file, code);
