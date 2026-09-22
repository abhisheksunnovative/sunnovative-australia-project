import fs from 'fs';

let content = fs.readFileSync('src/components/BillTemplateManagementScreen.jsx', 'utf8');

// 1. Remove "+ Custom Template" standalone button
content = content.replace(
    `<button onClick={() => handleOpenModal()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700">\n            <Plus className="w-4 h-4" /> Custom Template\n          </button>`,
    ""
);

// 2. Add isScanning state and handleScanSampleBill function
const fnAdd = `
  const [isScanning, setIsScanning] = useState(false);

  const handleScanSampleBill = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    const fd = new FormData();
    fd.append('billFile', file);
    e.target.value = ''; 

    try {
      const res = await axios.post(\`\${API_URL}/api/v2/bill-templates/auto-generate\`, fd);
      if (res.data.success) {
        let generatedRules = res.data.data;
        if (typeof generatedRules === 'string') {
           generatedRules = JSON.parse(generatedRules);
        }
        if (Array.isArray(generatedRules)) {
           setFormData(prev => ({ ...prev, extractionRules: generatedRules }));
           alert("Template Rules automatically generated from sample bill!");
        }
      }
    } catch (err) {
      console.error("Error scanning bill", err);
      alert("Failed to auto-generate from bill");
    } finally {
      setIsScanning(false);
    }
  };

  const updateRule =`;
content = content.replace("const updateRule =", fnAdd);

// 3. Add the Upload button in the modal header
const oldModalHeader = `<h2 className="text-lg font-bold text-slate-800">{editingTemplate ? 'Edit Template Override' : 'New Template Override'}</h2>`;
const newModalHeader = `<h2 className="text-lg font-bold text-slate-800">{editingTemplate ? 'Edit Template Override' : 'New Template Override'}</h2>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-4 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 flex items-center gap-2">
                  {isScanning ? "Scanning PDF..." : "Upload Sample Bill (Auto-Generate Regex)"}
                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleScanSampleBill} disabled={isScanning} />
                </label>
              </div>`;
content = content.replace(oldModalHeader, newModalHeader);

// 4. Ensure "Country" is read-only in the modal
content = content.replace(
    `<select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full p-2 border rounded-lg text-sm" disabled>`,
    `<select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full p-2 border border-slate-300 bg-slate-100 rounded-lg text-sm" disabled>`
);

fs.writeFileSync('src/components/BillTemplateManagementScreen.jsx', content);
console.log("BillTemplateManagementScreen updated with Upload Sample Bill and disabled custom creation.");
