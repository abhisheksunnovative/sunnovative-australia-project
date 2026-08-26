import re

filepath = '../Website_Frontend/src/customer/CustomerPortal.jsx'

with open(filepath, 'r', encoding='utf8') as f:
    content = f.read()

# 1. Add fileRef
content = re.sub(
    r'const \[geoError, setGeoError\] = useState\(""\);',
    r'const [geoError, setGeoError] = useState("");\n  const fileRef = React.useRef(null);',
    content
)

# 2. Change bg-orange-600 to bg-[#28377f] in ApplyModal
content = content.replace(
    '<div className="bg-orange-600 rounded-t-3xl p-5 border-b border-slate-800 shrink-0">',
    '<div className="bg-[#28377f] rounded-t-3xl p-5 shrink-0 shadow-sm border-b border-[#1d2a63]">'
)

# 3. For India (rooftopPhoto block), show it!
india_block = """<div className="mb-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Rooftop Photo / Light Bill *
              </label>
              <div className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition ${rooftopPhoto || customerLead?.billUrl ? "border-green-300 bg-green-50" : "border-slate-200 hover:border-slate-300"}`}
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
                      ✓ Document Attached
                    </p>
                    {customerLead.billUrl.match(/\\.(jpeg|jpg|gif|png)$/i) ? (
                      <img src={`${import.meta.env.VITE_API_URL || "http://localhost:4005"}${customerLead.billUrl}`} alt="bill" className="h-20 w-auto object-contain mt-1 rounded-lg shadow-sm border border-green-200" />
                    ) : (
                      <a href={`${import.meta.env.VITE_API_URL || "http://localhost:4005"}${customerLead.billUrl}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline mt-1">View Document</a>
                    )}
                    <p className="text-[10px] text-green-600 mt-1">Click here to replace</p>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
                    <Camera className="w-4 h-4" /> Tap to upload terrace photo / light bill
                  </p>
                )}
              </div>
              {geoError && <p className="text-[10px] text-red-500 mt-1">{geoError}</p>}
            </div>"""

regex_india = r'<div className="mb-4">\s*<label className="text-\[10px\] font-bold text-slate-400 uppercase tracking-wider block mb-1">\s*Rooftop Photo \*\s*<\/label>[\s\S]*?\{geoError && <p className="text-\[10px\] text-red-500 mt-1">\{geoError\}<\/p>\}\s*<\/div>'
content = re.sub(regex_india, india_block.replace('\\', '\\\\'), content, count=1)

# Fix backslashes for the regex substitution
content = content.replace('\\\\', '\\')

# 4. In submit logic
content = content.replace(
    'if (!isAU && !rooftopPhoto) return setError("Rooftop photo upload karna zaroori hai");',
    'if (!isAU && !rooftopPhoto && !customerLead?.billUrl) return setError("Rooftop photo ya Light bill upload karna zaroori hai");'
)
content = content.replace(
    'if (!geo.lat && (!isAU || applyUploadFile)) return setError("Location capture nahi hui. Photo upload retry karein aur location allow karein.");',
    'if (!geo.lat && (rooftopPhoto || applyUploadFile)) return setError("Location capture nahi hui. Photo upload retry karein aur location allow karein.");'
)

# 5. Fix AU check for existingBillUrl
regex_au_check = r'if \(isAU && !applyUploadFile && customerLead\?\.billUrl\) \{'
content = re.sub(
    regex_au_check,
    r'if (!applyUploadFile && !rooftopPhoto && customerLead?.billUrl) {',
    content,
    count=1
)

with open(filepath, 'w', encoding='utf8') as f:
    f.write(content)

print("Patched!")
