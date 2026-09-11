const fs = require("fs");

function updateFile(filepath) {
    let content = fs.readFileSync(filepath, "utf-8");

    const pattern = /<div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">\s*<h4 className="font-bold text-slate-700 text-xs flex items-center gap-1\.5 border-b border-slate-200 pb-2">\s*<Zap className="w-4 h-4 text-amber-500"\/> Technical Specs(?: & Utility)?\s*<\/h4>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

    const replacement = `<div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <Zap className="w-4 h-4 text-amber-500"/> Technical Specs & Utility
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div><span className="text-slate-500 text-xs block mb-0.5">System Size</span> <span className="font-bold text-slate-800">{showDetailsModal.kw || showDetailsModal.systemSizeKW || "N/A"} kW</span></div>
                    {showDetailsModal.propertyType && showDetailsModal.propertyType !== "N/A" && <div><span className="text-slate-500 text-xs block mb-0.5">Property Type</span> <span className="font-bold text-slate-800">{showDetailsModal.propertyType}</span></div>}
                    {showDetailsModal.roofType && showDetailsModal.roofType !== "N/A" && <div><span className="text-slate-500 text-xs block mb-0.5">Roof Type</span> <span className="font-bold text-slate-800">{showDetailsModal.roofType}</span></div>}
                    <div><span className="text-slate-500 text-xs block mb-0.5">Monthly Bill</span> <span className="font-bold text-slate-800">{showDetailsModal.billAmount || showDetailsModal.monthlyBill ? (showDetailsModal.country === "australia" || showDetailsModal.country === "au" ? "$" : "\\u20B9") + (showDetailsModal.billAmount || showDetailsModal.monthlyBill) : "N/A"}</span></div>
                    {showDetailsModal.discom && showDetailsModal.discom !== "Not detected" && <div><span className="text-slate-500 text-xs block mb-0.5">Discom / Retailer</span> <span className="font-bold text-slate-800">{showDetailsModal.discom}</span></div>}
                    {showDetailsModal.tariff && showDetailsModal.tariff !== "Not detected" && <div><span className="text-slate-500 text-xs block mb-0.5">Tariff</span> <span className="font-bold text-slate-800">{showDetailsModal.tariff}</span></div>}
                    {showDetailsModal.meterCategory && showDetailsModal.meterCategory !== "Not detected" && <div><span className="text-slate-500 text-xs block mb-0.5">Meter Category</span> <span className="font-bold text-slate-800">{showDetailsModal.meterCategory}</span></div>}
                    {showDetailsModal.subsidy > 0 && <div><span className="text-slate-500 text-xs block mb-0.5">{showDetailsModal.country === "australia" ? "Estimated STC Rebate" : "Estimated Subsidy"}</span> <span className="font-bold text-emerald-600">{(showDetailsModal.country === "australia" ? "$" : "\\u20B9") + showDetailsModal.subsidy}</span></div>}
                  </div>
                  {(showDetailsModal.billUrl || showDetailsModal.billFileUrl) && (
                    <div className="pt-2 border-t border-slate-200 mt-2">
                       <a href={showDetailsModal.billUrl || showDetailsModal.billFileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"><Zap className="w-3 h-3"/> View Uploaded Bill</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>`;

    content = content.replace(pattern, replacement);

    const pattern2 = /<div className="col-span-2"><span className="text-slate-500 text-xs block mb-0.5">Full Address<\/span> <span className="font-bold text-slate-800">\{showDetailsModal\.address \|\| \x27N\/A\x27\}<\/span><\/div>/;
    const replacement2 = `{showDetailsModal.address && showDetailsModal.address !== 'N/A' && <div className="col-span-2"><span className="text-slate-500 text-xs block mb-0.5">Full Address</span> <span className="font-bold text-slate-800">{showDetailsModal.address}</span></div>}`;
    content = content.replace(pattern2, replacement2);

    fs.writeFileSync(filepath, content);
    console.log("Updated", filepath);
}

updateFile("Website_Admin/src/components/bde/BDELeadManagement.jsx");
updateFile("Website_Admin/src/components/bde/BDEProspects.jsx");
