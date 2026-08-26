const fs = require('fs');
const file = 'src/customer/CustomerPortal.jsx';
let code = fs.readFileSync(file, 'utf8');

// For AU upload box (applyUploadFile)
const auRegex = /<div className=\{`border-2 border-dashed rounded-xl p-3 text-center transition[\s\S]*?View Document\s*<\/a>\s*<\/div>\s*\)\s*:\s*\([\s\S]*?Tap to upload utility bill or site document\s*<\/p>\s*\)\s*\}\s*<\/div>/;

const auReplacement = `<div className={\`border-2 border-dashed rounded-xl p-3 text-center transition \${applyUploadFile || customerLead?.billUrl ? "border-green-300 bg-green-50" : "border-slate-200 hover:border-slate-300 cursor-pointer"}\`}
                    onClick={() => { if (!customerLead?.billUrl || applyUploadFile) document.getElementById('apply-upload-file').click(); }}>
                    <input id="apply-upload-file" type="file" accept="image/*,application/pdf" className="hidden" onChange={handleApplyUploadFileChange} />
                    {applyUploadFile ? (
                      <div>
                        <p className="text-xs font-bold text-green-700">📄 {applyUploadFile.name}</p>
                        {geo.lat && <p className="text-[10px] text-green-600 font-bold mt-1">📍 Auto-fetched location ({geo.lat.toFixed(4)}, {geo.lng.toFixed(4)})</p>}
                        <p className="text-[10px] text-slate-500 mt-1 cursor-pointer underline" onClick={(e) => { e.stopPropagation(); document.getElementById('apply-upload-file').click(); }}>Click to change</p>
                      </div>
                    ) : customerLead?.billUrl ? (
                      <div className="flex flex-col items-center bg-white p-3 rounded-lg border border-green-100 shadow-sm w-full">
                        <p className="text-xs font-black text-green-700 flex items-center justify-center gap-1 mb-2">
                          <CheckCircle2 className="w-4 h-4" /> Your Uploaded Bill
                        </p>
                        {customerLead.billUrl.match(/\\.(jpeg|jpg|gif|png)$/i) ? (
                          <img src={\`\${import.meta.env.VITE_API_URL || "http://localhost:4005"}\${customerLead.billUrl}\`} alt="Your Uploaded Bill" className="h-20 w-auto object-contain rounded-md border border-slate-200 mb-2" />
                        ) : null}
                        <div className="flex items-center justify-center gap-3 mt-1">
                          <a href={\`\${import.meta.env.VITE_API_URL || "http://localhost:4005"}\${customerLead.billUrl}\`} target="_blank" rel="noreferrer" 
                             className="text-[11px] px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-bold flex items-center gap-1 transition-all"
                             onClick={(e) => e.stopPropagation()}>
                            View
                          </a>
                          <button type="button"
                             className="text-[11px] px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md font-bold flex items-center gap-1 transition-all"
                             onClick={(e) => { e.stopPropagation(); document.getElementById('apply-upload-file').click(); }}>
                            Change
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
                        <Camera className="w-4 h-4" /> Tap to upload utility bill or site document
                      </p>
                    )}
                  </div>`;

// For IN upload box (rooftopPhoto)
const inRegex = /<div className=\{`border-2 border-dashed rounded-xl p-3 text-center transition[\s\S]*?View Document\s*<\/a>\s*\}[\s\S]*?<\/div>\s*\)\s*:\s*\([\s\S]*?Tap to upload terrace photo \/ light bill\s*<\/p>\s*\)\s*\}\s*<\/div>/;

const inReplacement = `<div className={\`border-2 border-dashed rounded-xl p-3 text-center transition \${rooftopPhoto || customerLead?.billUrl ? "border-green-300 bg-green-50" : "border-slate-200 hover:border-slate-300 cursor-pointer"}\`}
                onClick={() => { if (!customerLead?.billUrl || rooftopPhoto) fileRef.current?.click(); }}>
                <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handlePhotoChange} />
                {rooftopPhoto ? (
                  <div>
                    <p className="text-xs font-bold text-green-700">📎 {rooftopPhoto.name}</p>
                    {geo.lat && <p className="text-[10px] text-green-600 font-bold mt-1">📍 Auto-fetched location ({geo.lat.toFixed(4)}, {geo.lng.toFixed(4)})</p>}
                    <p className="text-[10px] text-slate-500 mt-1 cursor-pointer underline" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>Click to change</p>
                  </div>
                ) : customerLead?.billUrl ? (
                  <div className="flex flex-col items-center bg-white p-3 rounded-lg border border-green-100 shadow-sm w-full">
                    <p className="text-xs font-black text-green-700 flex items-center justify-center gap-1 mb-2">
                      <CheckCircle2 className="w-4 h-4" /> Your Uploaded Bill
                    </p>
                    {customerLead.billUrl.match(/\\.(jpeg|jpg|gif|png)$/i) ? (
                      <img src={\`\${import.meta.env.VITE_API_URL || "http://localhost:4005"}\${customerLead.billUrl}\`} alt="Your Uploaded Bill" className="h-20 w-auto object-contain rounded-md border border-slate-200 mb-2" />
                    ) : null}
                    <div className="flex items-center justify-center gap-3 mt-1">
                      <a href={\`\${import.meta.env.VITE_API_URL || "http://localhost:4005"}\${customerLead.billUrl}\`} target="_blank" rel="noreferrer" 
                         className="text-[11px] px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-bold flex items-center gap-1 transition-all"
                         onClick={(e) => e.stopPropagation()}>
                        View
                      </a>
                      <button type="button"
                         className="text-[11px] px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md font-bold flex items-center gap-1 transition-all"
                         onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                        Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
                    <Camera className="w-4 h-4" /> Tap to upload terrace photo / light bill
                  </p>
                )}
              </div>`;

if (code.match(auRegex)) {
  code = code.replace(auRegex, auReplacement);
  console.log("Patched AU UI!");
} else {
  console.log("Failed to match AU regex");
}

if (code.match(inRegex)) {
  code = code.replace(inRegex, inReplacement);
  console.log("Patched IN UI!");
} else {
  console.log("Failed to match IN regex");
}

fs.writeFileSync(file, code);
