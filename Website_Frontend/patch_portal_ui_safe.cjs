const fs = require('fs');
const file = 'src/customer/CustomerPortal.jsx';
let code = fs.readFileSync(file, 'utf8');

// AU Patch
const auTarget = `onClick={() => document.getElementById('apply-upload-file').click()}>
                    <input id="apply-upload-file" type="file" accept="image/*,application/pdf" className="hidden" onChange={handleApplyUploadFileChange} />
                    {applyUploadFile ? (
                      <div>
                        <p className="text-xs font-bold text-green-700">📄 {applyUploadFile.name}</p>
                        {geo.lat && <p className="text-[10px] text-green-600 font-bold mt-1">📍 Auto-fetched location ({geo.lat.toFixed(4)}, {geo.lng.toFixed(4)})</p>}
                      </div>
                    ) : customerLead?.billUrl ? (
                      <div className="flex flex-col items-center">
                        <p className="text-xs font-bold text-green-700 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Previous Bill Attached: 
                          <a href={\`\${API}\${customerLead.billUrl}\`} target="_blank" rel="noreferrer" 
                             className="underline text-blue-600 hover:text-blue-800 ml-1 font-extrabold"
                             onClick={(e) => e.stopPropagation()}>
                            {customerLead.billUrl.split('/').pop()}
                          </a>
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">Tap here to replace with a new document</p>
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
                        <Camera className="w-4 h-4" /> Tap to upload utility bill or site document
                      </p>
                    )}`;

const auReplacement = `onClick={(e) => {
                      if (e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON') {
                        if (!customerLead?.billUrl || applyUploadFile) document.getElementById('apply-upload-file').click();
                      }
                    }}>
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
                    )}`;

if (code.includes(auTarget)) {
  code = code.replace(auTarget, auReplacement);
  console.log("AU Patched!");
} else {
  console.log("AU NOT FOUND!");
}

// IN Patch
const inTarget = `onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                {rooftopPhoto ? (
                  <div>
                    <p className="text-xs font-bold text-green-700">📎 {rooftopPhoto.name}</p>
                    {geo.lat && <p className="text-[10px] text-green-600 font-bold mt-1">📍 Auto-fetched location ({geo.lat.toFixed(4)}, {geo.lng.toFixed(4)})</p>}
                  </div>
                ) : (
                  <p className="text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
                    <Camera className="w-4 h-4" /> Tap to upload terrace photo
                  </p>
                )}`;

const inReplacement = `onClick={(e) => {
                  if (e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON') {
                    if (!customerLead?.billUrl || rooftopPhoto) fileRef.current?.click();
                  }
                }}>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
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
                )}`;

if (code.includes(inTarget)) {
  code = code.replace(inTarget, inReplacement);
  console.log("IN Patched!");
} else {
  console.log("IN NOT FOUND!");
}

fs.writeFileSync(file, code);
