with open('Website_Frontend/src/components/LeadForm.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

scanned_details_block = '''            {uploadedFile && !isScanning && !scanError && (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 flex items-center gap-2">
                  <ScanLine className="w-3.5 h-3.5 text-solar-sky" /> Scanned Details
                </h3>
                <div className="text-[10.5px] text-orange-600 font-semibold mb-3 flex items-start gap-1 bg-orange-50 p-1.5 rounded-md border border-orange-100">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> 
                  <span>Note: Verify the auto-filled details. AI can sometimes make mistakes.</span>
                </div>
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="w-full lg:w-1/3 border border-slate-200 rounded-lg overflow-hidden bg-white flex items-center justify-center p-2 shadow-sm min-h-[250px]">
                    {uploadedFile.type.includes('pdf') ? (
                      <embed src={URL.createObjectURL(uploadedFile)} type="application/pdf" className="w-full h-[350px] rounded" />
                    ) : (
                      <img src={URL.createObjectURL(uploadedFile)} alt="Uploaded Bill" className="w-full h-auto object-contain max-h-[350px] rounded" />
                    )}
                  </div>
                  <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                      <input type="text" readOnly value={fullName} className="w-full px-3 py-2 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Discom / Retailer</label>
                      <input type="text" readOnly value={scannedRetailer || discom || ''} className="w-full px-3 py-2 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Recommended System & Subsidy (Auto-calculated, read-only) */}'''

content = content.replace('            {/* 3. Recommended System & Subsidy (Auto-calculated, read-only) */}', scanned_details_block)

with open('Website_Frontend/src/components/LeadForm.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated!")
