import re

with open("src/components/bde/BDELeadManagement.jsx", "r", encoding="utf8") as f:
    content = f.read()

# 1. Add missing states
if 'const [rooftopFile, setRooftopFile] = useState(null);' not in content:
    content = content.replace(
        'const [uploadedFile, setUploadedFile] = useState(null);',
        'const [uploadedFile, setUploadedFile] = useState(null);\n  const [billFile, setBillFile] = useState(null);\n  const [rooftopFile, setRooftopFile] = useState(null);'
    )

# 2. Update handleBillUploadAndQualify
old_func = """  const handleBillUploadAndQualify = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    setIsScanning(true);
    setScanError("");"""
    
new_func = """  const handleBillUploadAndQualify = async () => {
    const file = billFile;
    if (!file) return setScanError("Please select a bill");
    if (!isAU && !rooftopFile) return setScanError("Please select a rooftop photo");
    setUploadedFile(file);
    setIsScanning(true);
    setScanError("");"""
content = content.replace(old_func, new_func)

rooftop_upload = """
      let uploadedRooftopUrl = "";
      if (!isAU && rooftopFile) {
        const rfd = new FormData();
        rfd.append("file", rooftopFile);
        try {
          const rres = await fetch(`${API_BASE}/api/upload-file`, { method: "POST", body: rfd });
          const rdata = await rres.json();
          if(rdata.success) uploadedRooftopUrl = rdata.fileUrl;
        } catch(e) {}
      }
"""
content = content.replace(
    'if (data.success || savedBillUrl) {',
    rooftop_upload + '\n      if (data.success || savedBillUrl) {'
)

content = content.replace(
    'billUrl: savedBillUrl',
    'billUrl: savedBillUrl,\n               rooftopPhoto: uploadedRooftopUrl || undefined'
)

# 3. Update the Modal UI
old_modal = """            <button onClick={() => setBillUploadLead(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><XCircle className="w-6 h-6"/></button>
            <h3 className="text-xl font-black text-slate-800 mb-2">Upload Customer Bill</h3>
            <p className="text-sm text-slate-500 mb-6">Scan bill for {billUploadLead.name} to auto-fill details and qualify lead.</p>
            
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 flex flex-col items-center justify-center relative">
              <input type="file" accept="image/*,application/pdf" onChange={handleBillUploadAndQualify} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isScanning} />
              {isScanning ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-bold text-blue-600">Scanning Document...</span>
                </div>
              ) : (
                <>
                  <Zap className="w-10 h-10 text-slate-300 mb-3" />
                  <span className="text-sm font-bold text-slate-700">Click to Browse or Drag Bill Here</span>
                  <span className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 5MB</span>
                </>
              )}
            </div>
            {scanError && <p className="text-xs text-rose-500 font-bold mt-4 text-center">{scanError}</p>}"""

new_modal = """            <button onClick={() => setBillUploadLead(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><XCircle className="w-6 h-6"/></button>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" /> Upload Documents
            </h2>
            <p className="text-sm text-slate-500 mb-6">Upload documents for {billUploadLead.name}.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{isAU ? "Utility Bill" : "Electricity Bill"} *</label>
                <input 
                  type="file" 
                  accept="image/*,application/pdf"
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={(e) => setBillFile(e.target.files[0])}
                />
              </div>

              {!isAU && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Rooftop Photo *</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                    onChange={(e) => setRooftopFile(e.target.files[0])}
                  />
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button 
                onClick={handleBillUploadAndQualify} 
                disabled={isScanning}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-50"
              >
                {isScanning ? "Uploading & Scanning..." : "Submit Documents"}
              </button>

              {scanError && <p className="text-sm text-red-500 text-center font-bold">{scanError}</p>}
            </div>"""

content = content.replace(old_modal, new_modal)


with open("src/components/bde/BDELeadManagement.jsx", "w", encoding="utf8") as f:
    f.write(content)
print("Done modal patch")
