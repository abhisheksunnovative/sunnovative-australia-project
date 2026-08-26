const fs = require('fs');
const file = 'src/components/bde/BDELeadManagement.jsx';
let code = fs.readFileSync(file, 'utf8');

// Fix 1: Inner tabs
const oldTabs = `          {!isFreelancer ? (
            <button 
              className="px-4 py-2 text-sm font-bold border-b-2 transition-all border-blue-600 text-blue-600"
            >
              Website Enquiries ({websiteLeads.length})
            </button>
          ) : (
            <button 
              className="px-4 py-2 text-sm font-bold border-b-2 transition-all border-blue-600 text-blue-600"
            >
              Self-Sourced Leads ({manualLeads.length})
            </button>
          )}`;
const newTabs = `          <button 
            onClick={() => setActiveTab("website")}
            className={\`px-4 py-2 text-sm font-bold border-b-2 transition-all \${activeTab === 'website' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
          >
            {isFreelancer ? "Assigned Leads" : "Website Enquiries"} ({websiteLeads.length})
          </button>
          <button 
            onClick={() => setActiveTab("manual")}
            className={\`px-4 py-2 text-sm font-bold border-b-2 transition-all \${activeTab === 'manual' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
          >
            Self-Sourced Leads ({manualLeads.length})
          </button>`;
code = code.replace(oldTabs, newTabs);

// Fix 2: Add Lead button
code = code.replace('{isFreelancer && (\n          <button \n            onClick={handleOpenAdd}', '{isFreelancer && filterTab !== "self-leads" && (\n          <button \n            onClick={handleOpenAdd}');

// Fix 3: Col 1
const oldCol1 = `              {/* Col 1: Customer Details */}
              <div className="flex-1 min-w-[250px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="font-black text-lg text-slate-900 truncate">{lead.name}</div>
                  <button onClick={() => handleOpenEdit(lead)} className="text-slate-400 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5"/></button>
                </div>
                
                <div className="space-y-1.5">
                  <div className="text-sm text-slate-600 font-semibold flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-blue-500"/> 
                    {lead.mobile} 
                    {lead.email && <span className="ml-1 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[11px] border border-slate-200">{lead.email}</span>}
                  </div>
                  <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400"/>
                    {lead.district || lead.city}, {lead.state} {lead.pincode || lead.postcode ? \`- \${lead.pincode || lead.postcode}\` : ''}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                  {lead.preferredInstallDate ? (
                    <div className="text-xs bg-emerald-50 text-emerald-800 px-2 py-1 rounded-md border border-emerald-200 inline-flex items-center gap-1.5 font-bold shadow-sm w-fit">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600"/> Install: {new Date(lead.preferredInstallDate).toLocaleDateString("en-IN")}
                    </div>
                  ) : (
                    <div className="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded-md border border-amber-200 inline-flex items-center gap-1.5 font-bold w-fit shadow-sm">
                      <Calendar className="w-3.5 h-3.5 text-amber-500"/> Install: Not Selected
                    </div>
                  )}
                  <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5"/> Lead Added: {new Date(lead.createdAt).toLocaleDateString("en-IN")}
                  </div>
                </div>
              </div>`;

const newCol1 = `              {/* Col 1: Customer Details */}
              <div className="flex-[1.5] min-w-[250px] flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-700 transition-colors capitalize">
                    {lead.name}
                  </h3>
                  {lead.leadSource === 'Manual' && (
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded border border-indigo-100">
                      Self-Sourced
                    </span>
                  )}
                  {lead.isEligibleForInstallation && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded border border-emerald-100 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3"/> Eligible
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 text-sm font-semibold text-slate-600 mb-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{lead.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="truncate">
                      {lead.address || "Address not provided"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5"/> Lead Added: {new Date(lead.createdAt).toLocaleDateString("en-IN")}
                  </div>
                </div>
              </div>`;
code = code.replace(oldCol1, newCol1);

// Fix 4: Col 2
const oldCol2 = `              {/* Col 2: System Info */}
              <div className="flex-1 min-w-[200px] lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-center">
                <div className="text-sm font-black text-slate-800 capitalize mb-2 text-lg">
                  {lead.solarType || "Residential"} • {lead.kw || "6.6"} kW
                </div>
                <div className="text-sm text-slate-600 font-semibold flex items-center gap-2 mb-3">
                  <span className="text-slate-400">Est. Bill:</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">\${lead.billAmount || 0} {isAU ? 'AUD' : 'INR'}</span>
                </div>
                
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1 flex justify-between">
                    <span>NMI / Acc #:</span>
                    <span className="text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-sm">{lead.nmi || 'Pending'}</span>
                  </div>
                  {lead.retailer ? (
                    <div className="text-[11px] font-bold text-blue-700">Retailer/DNSP: {lead.retailer}</div>
                  ) : (
                    <div className="text-[11px] font-bold text-slate-400">Retailer/DNSP: Not detected</div>
                  )}
                </div>
              </div>`;

const newCol2 = `              {/* Col 2: System Info */}
              <div className="flex-1 min-w-[200px] lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-center">
                <div className="text-xl font-black text-slate-800 capitalize mb-2">
                  {lead.solarType || "Residential"} • {lead.kw || "0"} KW
                </div>
                <div className="text-sm text-slate-600 font-semibold flex items-center gap-2 mb-4">
                  <span className="text-slate-400">Est. Bill:</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">\${lead.billAmount || 0} {isAU ? 'AUD' : 'INR'}</span>
                </div>
                
                {/* Installation Date Badge */}
                {lead.preferredInstallDate ? (
                  <div className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 inline-flex items-center gap-1.5 font-bold shadow-sm w-fit">
                    <Calendar className="w-4 h-4 text-emerald-600"/> Install: {new Date(lead.preferredInstallDate).toLocaleDateString("en-IN")}
                  </div>
                ) : (
                  <div className="text-xs bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200 inline-flex items-center gap-1.5 font-bold w-fit shadow-sm">
                    <Calendar className="w-4 h-4 text-amber-500"/> Install: Not Selected
                  </div>
                )}
              </div>`;
code = code.replace(oldCol2, newCol2);


// Fix 5: Col 4
let c4_start = code.indexOf('{/* Col 4: Actions */}');
if (c4_start > -1) {
    let c4_end = code.indexOf('            </div>\n          ))\n        )}\n      </div>', c4_start);
    if (c4_end > -1) {
        let oldCol4Full = code.substring(c4_start, c4_end);
        
        let newCol4Full = `{/* Col 4: Actions */}
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
                    <button onClick={() => handleReject(lead)} className="w-full justify-center px-4 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold border border-rose-100 transition-colors flex items-center gap-1.5 mt-2">
                      <XCircle className="w-3.5 h-3.5"/> Reject Lead
                    </button>
                  </>
                )}
              </div>
`;
        code = code.replace(oldCol4Full, newCol4Full);
    }
}

fs.writeFileSync(file, code);
console.log('Applied all patches successfully!');
