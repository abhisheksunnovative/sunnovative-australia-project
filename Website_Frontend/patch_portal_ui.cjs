const fs = require('fs');
const file = 'src/customer/CustomerPortal.jsx';
let code = fs.readFileSync(file, 'utf8');

// For AU upload box
const auRegex = /<div className=\{`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition \$\{applyUploadFile \|\| customerLead\?\.billUrl \? "border-green-300 bg-green-50" : "border-slate-200 hover:border-slate-300"\}`\}[\s\S]*?onClick=\{\(\) => document\.getElementById\('apply-upload-file'\)\.click\(\)\}>[\s\S]*?<input id="apply-upload-file" type="file" accept="image\/\*,application\/pdf" className="hidden" onChange=\{handleApplyUploadFileChange\} \/>[\s\S]*?\{applyUploadFile \? \([\s\S]*?\) : customerLead\?\.billUrl \? \([\s\S]*?<p className="text-\[10px\] text-slate-500 mt-1">Tap here to replace with a new document<\/p>\s*<\/div>\s*\) : \([\s\S]*?\) \}\s*<\/div>/;

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
                      <div className="flex flex-col items-center">
                        <p className="text-xs font-bold text-green-700 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Bill / Site Document Already Uploaded
                        </p>
                        <a href={\`\${API}\${customerLead.billUrl}\`} target="_blank" rel="noreferrer" 
                           className="text-[11px] underline text-blue-600 hover:text-blue-800 mt-1 font-bold"
                           onClick={(e) => e.stopPropagation()}>
                          View Document
                        </a>
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
                        <Camera className="w-4 h-4" /> Tap to upload utility bill or site document
                      </p>
                    )}
                  </div>`;

// For India upload box
const inRegex = /<div className=\{`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition \$\{rooftopPhoto \|\| customerLead\?\.billUrl \? "border-green-300 bg-green-50" : "border-slate-200 hover:border-slate-300"\}`\}[\s\S]*?onClick=\{\(\) => fileRef\.current\?\.click\(\)\}>[\s\S]*?<input ref=\{fileRef\} type="file" accept="image\/\*" className="hidden" onChange=\{handlePhotoChange\} \/>[\s\S]*?\{rooftopPhoto \? \([\s\S]*?\) : customerLead\?\.billUrl \? \([\s\S]*?<p className="text-\[10px\] text-green-600 mt-1">Click here to replace<\/p>\s*<\/div>\s*\) : \([\s\S]*?\)\}\s*<\/div>/;

const inReplacement = `<div className={\`border-2 border-dashed rounded-xl p-3 text-center transition \${rooftopPhoto || customerLead?.billUrl ? "border-green-300 bg-green-50" : "border-slate-200 hover:border-slate-300 cursor-pointer"}\`}
                onClick={() => { if (!customerLead?.billUrl || rooftopPhoto) fileRef.current?.click(); }}>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                {rooftopPhoto ? (
                  <div>
                    <p className="text-xs font-bold text-green-700">📎 {rooftopPhoto.name}</p>
                    {geo.lat && <p className="text-[10px] text-green-600 font-bold mt-1">📍 Auto-fetched location ({geo.lat.toFixed(4)}, {geo.lng.toFixed(4)})</p>}
                    <p className="text-[10px] text-slate-500 mt-1 cursor-pointer underline" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>Click to change</p>
                  </div>
                ) : customerLead?.billUrl ? (
                  <div className="flex flex-col items-center">
                    <p className="text-xs font-bold text-green-700 flex items-center justify-center gap-1">
                      ✓ Document Already Uploaded
                    </p>
                    {customerLead.billUrl.match(/\\.(jpeg|jpg|gif|png)$/i) ? (
                      <img src={\`\${import.meta.env.VITE_API_URL || "http://localhost:4005"}\${customerLead.billUrl}\`} alt="bill" className="h-20 w-auto object-contain mt-1 rounded-lg shadow-sm border border-green-200" />
                    ) : (
                      <a href={\`\${import.meta.env.VITE_API_URL || "http://localhost:4005"}\${customerLead.billUrl}\`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline mt-1">View Document</a>
                    )}
                  </div>
                ) : (
                  <p className="text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
                    <Camera className="w-4 h-4" /> Tap to upload terrace photo / light bill
                  </p>
                )}
              </div>`;

if (code.match(auRegex)) {
  code = code.replace(auRegex, auReplacement);
  console.log("Patched AU UI");
} else {
  console.log("Failed to match AU regex");
}

if (code.match(inRegex)) {
  code = code.replace(inRegex, inReplacement);
  console.log("Patched IN UI");
} else {
  console.log("Failed to match IN regex");
}

fs.writeFileSync(file, code);
