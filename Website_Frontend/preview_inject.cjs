const fs = require('fs');

const path = 'src/components/LeadForm.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace dynamic fields section
content = content.replace(
  '<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">\n                      {(() => {',
  `<div className="flex flex-col lg:flex-row gap-4">
                      {/* Bill Preview */}
                      <div className="w-full lg:w-1/3 border border-slate-200 rounded-lg overflow-hidden bg-white flex items-center justify-center p-2 shadow-sm min-h-[250px]">
                        {uploadedFile.type.includes('pdf') ? (
                          <embed src={URL.createObjectURL(uploadedFile)} type="application/pdf" className="w-full h-[350px] rounded" />
                        ) : (
                          <img src={URL.createObjectURL(uploadedFile)} alt="Uploaded Bill" className="w-full h-auto object-contain max-h-[350px] rounded" />
                        )}
                      </div>
                      {/* Editable Fields */}
                      <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 content-start">
                      {(() => {`
);

content = content.replace(
  '                        return otherFields.map((field, idx) => renderDynamicField(field, idx));\n                      })()}\n                    </div>\n                  </div>\n                )}',
  `                        return otherFields.map((field, idx) => renderDynamicField(field, idx));\n                      })()}\n                    </div>\n                    </div>\n                  </div>\n                )}`
);

// We should also replace the fallback block
content = content.replace(
  '<span>Note: Verify the auto-filled details. AI can sometimes make mistakes. If anything looks incorrect, please manually edit these fields.</span>\n                  </div>\n                  {/* Additional fallback scanned details if needed, usually we don\'t render them separately in fallback since they are captured in state */}\n                </div>\n              )}',
  `<span>Note: Verify the auto-filled details. AI can sometimes make mistakes. If anything looks incorrect, please manually edit these fields.</span>\n                  </div>\n                  <div className="flex flex-col lg:flex-row gap-4">\n                    <div className="w-full lg:w-1/3 border border-slate-200 rounded-lg overflow-hidden bg-white flex items-center justify-center p-2 shadow-sm min-h-[250px]">\n                      {uploadedFile.type.includes('pdf') ? (\n                        <embed src={URL.createObjectURL(uploadedFile)} type="application/pdf" className="w-full h-[350px] rounded" />\n                      ) : (\n                        <img src={URL.createObjectURL(uploadedFile)} alt="Uploaded Bill" className="w-full h-auto object-contain max-h-[350px] rounded" />\n                      )}\n                    </div>\n                    <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">\n                      <div>\n                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>\n                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl" />\n                      </div>\n                      <div>\n                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Discom / Retailer</label>\n                        <input type="text" value={scannedRetailer || ''} onChange={e => setScannedRetailer(e.target.value)} className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl" />\n                      </div>\n                    </div>\n                  </div>\n                </div>\n              )}`
);

fs.writeFileSync(path, content);
console.log('Successfully injected bill preview into LeadForm.jsx');
