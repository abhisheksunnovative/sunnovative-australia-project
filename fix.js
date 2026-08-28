const fs = require("fs");
let text = fs.readFileSync("Website_Admin/src/components/bde/BDEProspects.jsx", "utf-8");

const pattern = /<div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">[\s\S]*?<button onClick=\{\(\) => setShowDetailsModal\(null\)\} className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 transition shadow-sm cursor-pointer">/;

const replacement = `<div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div><span className="text-slate-500 text-xs block mb-0.5">System Size</span> <span className="font-bold text-slate-800">{showDetailsModal.kw || showDetailsModal.systemSizeKW || "N/A"} kW</span></div>
                    {showDetailsModal.propertyType && showDetailsModal.propertyType !== "N/A" && <div><span className="text-slate-500 text-xs block mb-0.5">Property Type</span> <span className="font-bold text-slate-800">{showDetailsModal.propertyType}</span></div>}
                    {showDetailsModal.roofType && showDetailsModal.roofType !== "N/A" && <div><span className="text-slate-500 text-xs block mb-0.5">Roof Type</span> <span className="font-bold text-slate-800">{showDetailsModal.roofType}</span></div>}
                    <div><span className="text-slate-500 text-xs block mb-0.5">Monthly Bill</span> <span className="font-bold text-slate-800">{showDetailsModal.billAmount || showDetailsModal.monthlyBill ? (showDetailsModal.country === "australia" || showDetailsModal.country === "au" ? "$" : "₹") + (showDetailsModal.billAmount || showDetailsModal.monthlyBill) : "N/A"}</span></div>
                    {showDetailsModal.discom && showDetailsModal.discom !== "Not detected" && <div><span className="text-slate-500 text-xs block mb-0.5">Discom / Retailer</span> <span className="font-bold text-slate-800">{showDetailsModal.discom}</span></div>}
                    {showDetailsModal.tariff && showDetailsModal.tariff !== "Not detected" && <div><span className="text-slate-500 text-xs block mb-0.5">Tariff</span> <span className="font-bold text-slate-800">{showDetailsModal.tariff}</span></div>}
                    {showDetailsModal.meterCategory && showDetailsModal.meterCategory !== "Not detected" && <div><span className="text-slate-500 text-xs block mb-0.5">Meter Category</span> <span className="font-bold text-slate-800">{showDetailsModal.meterCategory}</span></div>}
                    {showDetailsModal.subsidy > 0 && <div><span className="text-slate-500 text-xs block mb-0.5">{showDetailsModal.country === "australia" ? "Estimated STC Rebate" : "Estimated Subsidy"}</span> <span className="font-bold text-emerald-600">{(showDetailsModal.country === "australia" ? "$" : "₹") + showDetailsModal.subsidy}</span></div>}
                  </div>
                  {(showDetailsModal.billUrl || showDetailsModal.billFileUrl) && (
                    <div className="pt-2 border-t border-slate-200 mt-2">
                       <a href={showDetailsModal.billUrl || showDetailsModal.billFileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"><Zap className="w-3 h-3"/> View Uploaded Bill</a>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0 rounded-b-2xl">
                <button onClick={() => setShowDetailsModal(null)} className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 transition shadow-sm cursor-pointer">`;

text = text.replace(pattern, replacement);
fs.writeFileSync("Website_Admin/src/components/bde/BDEProspects.jsx", text);
