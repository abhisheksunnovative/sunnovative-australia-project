const fs = require('fs');
let text = fs.readFileSync('Website_Admin/src/components/bde/BDELeadManagement.jsx', 'utf-8');

const modal = `{showDetailsModal && (
          <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowDetailsModal(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 leading-tight">Customer Details</h3>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">{showDetailsModal.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailsModal(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition cursor-pointer">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-5 overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Customer Name</p>
                    <p className="font-black text-slate-800 text-sm mt-0.5 truncate">{showDetailsModal.name || showDetailsModal.customerName}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Mobile</p>
                    <p className="font-black text-slate-800 text-sm mt-0.5">{showDetailsModal.mobile || showDetailsModal.customerMobile || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Project Type</p>
                    <p className="font-black text-slate-800 text-sm mt-0.5 truncate">{showDetailsModal.solarType === 'au-standard-family' ? 'Residential' : (dynamicProjectTypes?.find(pt => pt.value === showDetailsModal.solarType)?.label || (showDetailsModal.solarType === 'surya-ghar' ? 'PM Surya Ghar' : showDetailsModal.solarType)) || showDetailsModal.projectType || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 md:col-span-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                    <p className="font-black text-slate-800 text-sm mt-0.5 break-all">{showDetailsModal.email || showDetailsModal.customerEmail || 'N/A'}</p>
                  </div>
                </div>
  
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <MapPin className="w-4 h-4 text-blue-500"/> Location Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-500 text-xs block mb-0.5">State</span> <span className="font-bold text-slate-800">{showDetailsModal.state || 'N/A'}</span></div>
                    <div><span className="text-slate-500 text-xs block mb-0.5">District / Suburb</span> <span className="font-bold text-slate-800">{showDetailsModal.district || showDetailsModal.suburb || 'N/A'}</span></div>
                    {showDetailsModal.address && showDetailsModal.address !== 'N/A' && <div className="col-span-2"><span className="text-slate-500 text-xs block mb-0.5">Full Address</span> <span className="font-bold text-slate-800">{showDetailsModal.address}</span></div>}
                    <div><span className="text-slate-500 text-xs block mb-0.5">Pincode</span> <span className="font-bold text-slate-800">{showDetailsModal.pincode || showDetailsModal.postcode || 'N/A'}</span></div>
                  </div>
                </div>
  
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
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
              
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0 rounded-b-2xl">
                <button onClick={() => setShowDetailsModal(null)} className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 transition shadow-sm cursor-pointer">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}`;

const idx = text.indexOf('{/* Customer Details Modal */}');
if (idx !== -1) {
    const newText = text.substring(0, idx) + '{/* Customer Details Modal */}\\n' + modal + '\\n    </div>\\n  );\\n}';
    fs.writeFileSync('Website_Admin/src/components/bde/BDELeadManagement.jsx', newText);
}
