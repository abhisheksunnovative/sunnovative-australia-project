const fs = require('fs');

let file = fs.readFileSync('../Website_Frontend/src/customer/CustomerPortal.jsx', 'utf8');

// 1. Add fileRef
if (!file.includes('const fileRef = useRef(null)')) {
  file = file.replace(
    'const [geoError, setGeoError] = useState("");',
    'const [geoError, setGeoError] = useState("");\n  const fileRef = React.useRef(null);'
  );
}

// 2. Change bg-orange-600 to bg-[#28377f] in ApplyModal
file = file.replace(
  '<div className="bg-orange-600 rounded-t-3xl p-5 border-b border-slate-800 shrink-0">',
  '<div className="bg-[#28377f] rounded-t-3xl p-5 shrink-0 shadow-sm border-b border-[#1d2a63]">'
);

// 3. For India (rooftopPhoto block), if bill is already uploaded by BDE, show it!
// customerLead.rooftopPhoto or customerLead.billUrl
const indiaPhotoBlock = `<div className="mb-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Rooftop Photo / Light Bill *
              </label>
              <div className={\`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition \${rooftopPhoto || customerLead?.billUrl ? "border-green-300 bg-green-50" : "border-slate-200 hover:border-slate-300"}\`}
                onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                {rooftopPhoto ? (
                  <div>
                    <p className="text-xs font-bold text-green-700">📎 {rooftopPhoto.name}</p>
                    {geo.lat && <p className="text-[10px] text-green-600 font-bold mt-1">📍 Auto-fetched location ({geo.lat.toFixed(4)}, {geo.lng.toFixed(4)})</p>}
                  </div>
                ) : customerLead?.billUrl ? (
                  <div className="flex flex-col items-center">
                    <p className="text-xs font-bold text-green-700 flex items-center justify-center gap-1">
                      ✓ Bill/Document Already Uploaded by BDE
                    </p>
                    <p className="text-[10px] text-green-600 mt-0.5">Click to replace or upload new.</p>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
                    <Camera className="w-4 h-4" /> Tap to upload terrace photo / light bill
                  </p>
                )}
              </div>
              {geoError && <p className="text-[10px] text-red-500 mt-1">{geoError}</p>}
            </div>`;

// Use regex to replace the specific block in India flow
const regexIndiaPhoto = /<div className="mb-4">\s*<label className="text-\[10px\] font-bold text-slate-400 uppercase tracking-wider block mb-1">\s*Rooftop Photo \*\s*<\/label>[\s\S]*?\{geoError && <p className="text-\[10px\] text-red-500 mt-1">\{geoError\}<\/p>\}\s*<\/div>/;
file = file.replace(regexIndiaPhoto, indiaPhotoBlock);

// 4. In submit logic for India, handle if customerLead?.billUrl is used instead of rooftopPhoto
// find: if (!isAU && !rooftopPhoto) return setError("Rooftop photo upload karna zaroori hai");
file = file.replace(
  'if (!isAU && !rooftopPhoto) return setError("Rooftop photo upload karna zaroori hai");',
  'if (!isAU && !rooftopPhoto && !customerLead?.billUrl) return setError("Rooftop photo ya Light bill upload karna zaroori hai");'
);
// find: if (!geo.lat && (!isAU || applyUploadFile)) return setError("Location capture nahi hui. Photo upload retry karein aur location allow karein.");
// Change to only error if rooftopPhoto is selected
file = file.replace(
  'if (!geo.lat && (!isAU || applyUploadFile)) return setError("Location capture nahi hui. Photo upload retry karein aur location allow karein.");',
  'if (!geo.lat && (rooftopPhoto || applyUploadFile)) return setError("Location capture nahi hui. Photo upload retry karein aur location allow karein.");'
);
// also add existingBillUrl to payload if used for india
file = file.replace(
  'if (isAU && !applyUploadFile && customerLead?.billUrl) {\n      payload.existingBillUrl = customerLead.billUrl;\n    }',
  'if (!applyUploadFile && !rooftopPhoto && customerLead?.billUrl) {\n      payload.existingBillUrl = customerLead.billUrl;\n    }'
);

fs.writeFileSync('../Website_Frontend/src/customer/CustomerPortal.jsx', file);
console.log("Patched CustomerPortal");
