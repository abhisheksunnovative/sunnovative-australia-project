const fs = require('fs');
const file = 'src/components/bde/BDELeadManagement.jsx';
let code = fs.readFileSync(file, 'utf8');

const oldCol1 = `                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
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
                </div>`;

const newCol1 = `                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5"/> Lead Added: {new Date(lead.createdAt).toLocaleDateString("en-IN")}
                  </div>
                </div>`;

code = code.replace(oldCol1, newCol1);

const oldCol2 = `              {/* Col 2: System Info */}
              <div className="flex-1 min-w-[200px] lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{isAU ? 'NMI / Acc #' : 'Consumer No'}</p>
                    <p className="font-semibold text-sm text-slate-800 truncate">{lead.nmi || lead.consumerNumber || 'Pending'}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{isAU ? 'Retailer/DNSP' : 'Discom'}</p>
                    <p className="font-semibold text-sm text-slate-800 truncate capitalize">{lead.retailer || lead.discom || 'Pending'}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm font-black text-slate-800 capitalize">
                    {lead.solarType || "Residential"} • {lead.kw || "0"} KW
                  </div>
                  <div className="text-sm font-semibold flex items-center gap-1.5">
                    <span className="text-slate-400 text-xs">Est. Bill:</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">\${lead.billAmount || 0}</span>
                  </div>
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
              </div>`;

code = code.replace(oldCol2, newCol2);
fs.writeFileSync(file, code);
