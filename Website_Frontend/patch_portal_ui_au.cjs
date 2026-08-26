const fs = require('fs');
const file = 'src/customer/CustomerPortal.jsx';
let code = fs.readFileSync(file, 'utf8');

const auRegex = /<div className=\{`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition \$\{applyUploadFile \|\| customerLead\?\.billUrl \? "border-green-300 bg-green-50" : "border-slate-200 hover:border-slate-300"\}`\}[\s\S]*?onClick=\{\(\) => document\.getElementById\('apply-upload-file'\)\.click\(\)\}>[\s\S]*?<input id="apply-upload-file" type="file" accept="image\/\*,application\/pdf" className="hidden" onChange=\{handleApplyUploadFileChange\} \/>[\s\S]*?\{applyUploadFile \? \([\s\S]*?\) : customerLead\?\.billUrl \? \([\s\S]*?<p className="text-\[10px\] text-slate-500 mt-1">Tap here to replace with a new document<\/p>\s*<\/div>\s*\) : \([\s\S]*?\) \}\s*<\/div>/;

// I will simplify the regex because maybe there is a space difference.
const simplerAuRegex = /<div className=\{`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition[\s\S]*?Tap here to replace with a new document<\/p>\s*<\/div>\s*\) : \([\s\S]*?Tap to upload utility bill or site document\s*<\/p>\s*\)\s*\}\s*<\/div>/;

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

if (code.match(simplerAuRegex)) {
  code = code.replace(simplerAuRegex, auReplacement);
  console.log("Patched AU UI!");
  fs.writeFileSync(file, code);
} else {
  console.log("Still failed to match AU regex");
}
