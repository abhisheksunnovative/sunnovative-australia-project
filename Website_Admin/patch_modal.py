import re

filepath = '../Website_Admin/src/components/bde/BDELeadManagement.jsx'
with open(filepath, 'r', encoding='utf8') as f:
    content = f.read()

# 1. Add state for rooftopPhoto
if 'const [scanError, setScanError] = useState("");' in content:
    content = content.replace(
        'const [scanError, setScanError] = useState("");',
        'const [scanError, setScanError] = useState("");\n  const [rooftopFile, setRooftopFile] = useState(null);'
    )

# 2. Add UI for Rooftop Photo in the Modal
modal_ui = """
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-600" /> Upload Documents
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{isAU ? "Utility Bill" : "Electricity Bill"}</label>
              <input 
                type="file" 
                accept="image/*,application/pdf"
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e) => {
                  const f = e.target.files[0];
                  if(f) handleBillUploadAndQualify(f);
                }}
              />
            </div>

            {!isAU && (
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Rooftop Photo</label>
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
            {isScanning && <p className="text-sm font-bold text-blue-600 flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> Scanning...</p>}
            {scanError && <p className="text-sm text-red-500 text-center font-bold">{scanError}</p>}
            
            <button 
              onClick={() => {
                if(!isAU && !rooftopFile && !isScanning && !scanError) {
                    setScanError("Please upload rooftop photo and bill first");
                    return;
                }
                setBillUploadLead(null); 
                setScanError(""); 
                setRooftopFile(null);
              }} 
              className="mt-2 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
            >
              Close
            </button>
          </div>
"""

# Replace the modal content
regex_modal = r'<h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">\s*<UploadCloud className="w-5 h-5 text-blue-600" \/> Upload Bill\s*<\/h2>[\s\S]*?<\/button>\s*<\/div>'
content = re.sub(regex_modal, modal_ui, content, count=1)

# Fix the button text in the Card UI
content = content.replace('Upload Bill', 'Upload Documents')

# 3. Add rooftop file uploading logic in `handleBillUploadAndQualify`
# Wait, handleBillUploadAndQualify only gets triggered on file change right now!
# Let's change it so there's an actual submit button!
# The user can select both files, then click "Upload".
# Since time is short, let's just make the user select the bill, and then it auto-submits. But wait, if they need both, they should select both and click "Submit".
