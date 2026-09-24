const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add state variables
if (!code.includes('const [rawTextPreview')) {
  code = code.replace(
    "const [isScanning, setIsScanning] = useState(false);",
    "const [isScanning, setIsScanning] = useState(false);\n  const [rawTextPreview, setRawTextPreview] = useState('');"
  );
}

// 2. Set rawTextPreview on scan
if (!code.includes('setRawTextPreview(res.data.rawText)')) {
  code = code.replace(
    "setFormData(prev => ({ ...prev, extractionRules: generatedRules }));",
    "setFormData(prev => ({ ...prev, extractionRules: generatedRules }));\n             if (res.data.rawText) setRawTextPreview(res.data.rawText);"
  );
}

// 3. Add handleHighlightGenerate function
const highlightFunc = `
  const handleHighlightGenerate = async (index, fieldName) => {
    const selection = window.getSelection().toString();
    if (!selection || !selection.trim()) return alert("Please highlight a value in the Raw Bill Text pane first!");
    if (!fieldName) return alert("Please select a Field Name from the dropdown first!");
    if (!rawTextPreview) return alert("Raw text is empty!");
    
    try {
      const res = await axios.post(\`\${API_URL}/api/v2/bill-templates/generate-from-selection\`, {
        rawText: rawTextPreview,
        selectedText: selection,
        fieldName: fieldName
      });
      if (res.data.success) {
        const rules = [...formData.extractionRules];
        rules[index].regex = res.data.data.regex;
        rules[index].previewValue = res.data.data.previewValue;
        setFormData({ ...formData, extractionRules: rules });
      }
    } catch(e) {
      console.error(e);
      alert("Failed to generate regex from selection.");
    }
  };
`;
if (!code.includes('handleHighlightGenerate')) {
  code = code.replace(
    "const updateRule = (index, key, value) => {",
    highlightFunc + "\n  const updateRule = (index, key, value) => {"
  );
}

// 4. Update the layout to Split Pane (max-w-7xl and grid grid-cols-2)
code = code.replace("max-w-4xl", "max-w-7xl");
if (!code.includes('Raw Bill Text')) {
  code = code.replace(
    /<div className="p-6 overflow-y-auto flex-1 space-y-6">([\s\S]*?)<\/div>\s*<\/div>\s*<div className="p-4 border-t/g,
    `<div className="p-6 overflow-hidden flex-1 grid grid-cols-2 gap-6">
              <div className="space-y-6 overflow-y-auto pr-2">
                $1
              </div>
              <div className="space-y-3 flex flex-col h-full overflow-hidden border border-slate-200 rounded-xl bg-slate-50">
                 <div className="p-3 bg-slate-200 border-b border-slate-300 font-bold text-xs text-slate-700 flex justify-between">
                    Raw Bill Text
                    <span className="text-[10px] font-normal text-indigo-700">1. Highlight text here ➔ 2. Click 🖊️ on a field</span>
                 </div>
                 <pre className="p-3 text-[10px] font-mono whitespace-pre-wrap flex-1 overflow-y-auto text-slate-600">
                    {rawTextPreview || "Upload a sample bill to see raw text here..."}
                 </pre>
              </div>
            </div>
            </div>
            <div className="p-4 border-t`
  );
}

// 5. Add Highlight button next to Trash icon
const trashIconStr = '<Trash2 className="w-4 h-4" />\n                        </button>';
const replacementButton = trashIconStr + `
                        <button onClick={() => handleHighlightGenerate(idx, rule.field)} title="Generate regex from highlighted text" className="p-1 text-indigo-600 hover:bg-indigo-50 rounded mt-2 flex flex-col items-center justify-center w-full">
                          <span className="text-sm">🖊️</span>
                          <span className="text-[8px] font-bold">Auto</span>
                        </button>`;
if (!code.includes('handleHighlightGenerate(idx')) {
  code = code.replace(trashIconStr, replacementButton);
}

fs.writeFileSync(path, code);
console.log("Fully injected Highlight-to-Generate Split-Pane UI into React!");
