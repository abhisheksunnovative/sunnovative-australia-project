import re

filepath = 'src/components/bde/BDELeadManagement.jsx'
with open(filepath, 'r', encoding='utf8') as f:
    content = f.read()

# Replace Upload Bill Modal Logic
# 1. Add states
if 'const [rooftopFile, setRooftopFile] = useState(null);' not in content:
    content = content.replace(
        'const [scanError, setScanError] = useState("");',
        'const [scanError, setScanError] = useState("");\n  const [billFile, setBillFile] = useState(null);\n  const [rooftopFile, setRooftopFile] = useState(null);'
    )

# 2. Update handleBillUploadAndQualify to use state files and not auto-trigger on change
content = content.replace(
    'const handleBillUploadAndQualify = async (file) => {',
    'const handleBillUploadAndQualify = async () => {\n    const file = billFile;\n    if (!file) return setScanError("Please select a bill");\n    if (!isAU && !rooftopFile) return setScanError("Please select a rooftop photo");'
)

# 3. Add rooftop photo upload logic inside the function before saving
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

# 4. Update the Modal UI
modal_ui = """
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-600" /> Upload Documents
          </h2>
          
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
            
            <button 
              onClick={() => { setBillUploadLead(null); setScanError(""); setBillFile(null); setRooftopFile(null); }} 
              className="mt-2 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
            >
              Cancel
            </button>
          </div>
"""
regex_modal = r'<h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">\s*<UploadCloud className="w-5 h-5 text-blue-600" \/> Upload Bill\s*<\/h2>[\s\S]*?<\/button>\s*<\/div>'
content = re.sub(regex_modal, modal_ui, content, count=1)

# Change button text
content = content.replace('Upload Bill', 'Upload Documents')

# Update "Upload the bill" note on the card
note = """<div className="w-full text-center py-2 px-3 mb-2 border border-blue-200 bg-blue-50 text-blue-600 font-bold text-[10px] rounded-lg">
                            Note: First upload the documents, then click "Mark Eligible"
                          </div>
                          <button onClick={() => handleOpenUploadBill(lead)}"""
content = content.replace('<button onClick={() => handleOpenUploadBill(lead)}', note)


with open(filepath, 'w', encoding='utf8') as f:
    f.write(content)
print("Done")
