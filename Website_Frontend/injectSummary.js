import fs from 'fs';
let content = fs.readFileSync('src/components/LeadForm.jsx', 'utf8');

const anchor = `{scanError && (
              <div className="mt-4 p-3 bg-red-50/50 border border-red-100 rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-red-600 font-medium leading-relaxed">{scanError}</p>
              </div>
            )}`;

const scannedDetailsBlock = `
            {scanConfidence && !scanError && (
              <div className="mt-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-[11px] font-bold text-emerald-800">Bill Scanned Successfully</h4>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                  {fullName && <div><span className="text-slate-400">Name:</span> <span className="font-semibold text-slate-700">{fullName}</span></div>}
                  {consumerNumber && <div><span className="text-slate-400">Account No:</span> <span className="font-semibold text-slate-700">{consumerNumber}</span></div>}
                  {scannedRetailer && <div><span className="text-slate-400">Retailer:</span> <span className="font-semibold text-slate-700">{scannedRetailer}</span></div>}
                  {customerState && <div><span className="text-slate-400">State:</span> <span className="font-semibold text-slate-700">{customerState}</span></div>}
                  {tariffCategory && <div><span className="text-slate-400">Tariff:</span> <span className="font-semibold text-slate-700">{tariffCategory}</span></div>}
                  {dueDate && <div><span className="text-slate-400">Due Date:</span> <span className="font-semibold text-slate-700">{dueDate}</span></div>}
                  {scannedQuarterlyKwh && <div><span className="text-slate-400">Usage:</span> <span className="font-semibold text-slate-700">{scannedQuarterlyKwh} kWh</span></div>}
                </div>
              </div>
            )}`;

content = content.replace(anchor, anchor + "\n" + scannedDetailsBlock);

fs.writeFileSync('src/components/LeadForm.jsx', content);
console.log("Scanned details summary block injected!");
