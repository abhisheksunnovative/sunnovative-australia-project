const fs = require('fs');

let c = fs.readFileSync('src/components/bde/BDELeadManagement.jsx', 'utf8');

// 1. Add state for billUploadLead
if (!c.includes('const [billUploadLead, setBillUploadLead] = useState(null);')) {
  c = c.replace(
    'const [qualifyingLead, setQualifyingLead] = useState(null);',
    'const [qualifyingLead, setQualifyingLead] = useState(null);\n  const [billUploadLead, setBillUploadLead] = useState(null);'
  );
}

// 2. Add handleOpenUploadBill and handleBillUploadAndQualify
const uploadLogic = `
  const handleOpenUploadBill = (lead) => {
    setBillUploadLead(lead);
    setUploadedFile(null);
    setScanError("");
  };

  const handleBillUploadAndQualify = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    setIsScanning(true);
    setScanError("");

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("billFile", file);

      const res = await fetch(\`\${API_BASE}/api/light-bill/scan\`, {
        method: "POST",
        headers: { "x-country": isAU ? "australia" : "india" },
        body: formDataUpload
      });
      const data = await res.json();

      if (data.success && data.details) {
         // Now update the lead with these details!
         const updateRes = await fetch(\`\${API_BASE}/api/bde/leads/\${billUploadLead._id}/details\`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "x-country": isAU ? "australia" : "india" },
            body: JSON.stringify({
               billAmount: data.details.billAmount,
               nmi: data.details.nmi || data.details.consumerNumber,
               consumerNumber: data.details.consumerNumber,
               retailer: data.details.retailer || data.details.discom,
               discom: data.details.discom,
               kw: data.details.kwRecommendation,
               solarType: data.details.projectTypeRecommendation
            })
         });
         if (updateRes.ok) {
            alert("Bill scanned and Lead details updated successfully!");
            setBillUploadLead(null);
            fetchLeads();
         }
      } else {
        setScanError(data.message || "Failed to extract details.");
      }
    } catch (err) {
      setScanError("Error scanning bill.");
    } finally {
      setIsScanning(false);
    }
  };
`;
if (!c.includes('const handleOpenUploadBill')) {
  c = c.replace(
    'const handleQualify = async (lead) => {',
    uploadLogic + '\n  const handleQualify = async (lead) => {'
  );
}

// 3. Replace the Action Col 4 Buttons
const oldButtons = `<div className="w-full flex flex-col gap-2 mt-auto">
                    <button onClick={() => handleQualify(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                      Qualify & Book <ArrowRight className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleReject(lead)} className="w-full justify-center px-4 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold border border-rose-100 transition-colors flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5"/> Reject Lead
                    </button>
                  </div>`;

const newButtons = `{isFreelancer ? (
                  !lead.billAmount ? (
                    <div className="w-full flex flex-col gap-2 mt-auto">
                      <button onClick={() => handleOpenUploadBill(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                        <Zap className="w-4 h-4" /> Upload Bill
                      </button>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col gap-2 mt-auto">
                      <button onClick={() => handleQualify(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                        <Calendar className="w-4 h-4" /> Finalize Date
                      </button>
                    </div>
                  )
                ) : (
                  <div className="w-full flex flex-col gap-2 mt-auto">
                    <button onClick={() => handleQualify(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                      Qualify & Book <ArrowRight className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleReject(lead)} className="w-full justify-center px-4 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold border border-rose-100 transition-colors flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5"/> Reject Lead
                    </button>
                  </div>
                )}`;

if (c.includes(oldButtons)) {
  c = c.replace(oldButtons, newButtons);
}

// 4. Add the Upload Bill Modal at the bottom
const uploadModal = `
      {/* Upload Bill Modal for Freelancers */}
      {billUploadLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden p-6 relative">
            <button onClick={() => setBillUploadLead(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><XCircle className="w-6 h-6"/></button>
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
            {scanError && <p className="text-xs text-rose-500 font-bold mt-4 text-center">{scanError}</p>}
          </div>
        </div>
      )}
`;

if (!c.includes('Upload Bill Modal for Freelancers')) {
  c = c.replace('{/* EPC Calendar Modal */}', uploadModal + '\n      {/* EPC Calendar Modal */}');
}

fs.writeFileSync('src/components/bde/BDELeadManagement.jsx', c);
