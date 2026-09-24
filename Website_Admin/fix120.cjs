const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

const targetFunction = `  const handleHighlightGenerate = async (index, fieldName) => {
    const selection = window.getSelection().toString();
    if (!selection || !selection.trim()) return alert("Please highlight a value in the Raw Bill Text pane first!");
    if (!fieldName) return alert("Please select a Field Name from the dropdown first!");
    if (!rawTextPreview) return alert("Raw text is empty!");
    
    try {
      const res = await axios.post(\`\${API_URL}/api/v2/bill-templates/generate-from-selection\`, {
        rawText: rawTextPreview,
        selectedText: selection,
        fieldName: fieldName
      });`;

const replacementFunction = `  const handleHighlightGenerate = async (index, fieldName) => {
    const sel = window.getSelection();
    const selection = sel.toString();
    if (!selection || !selection.trim()) return alert("Please highlight a value in the Raw Bill Text pane first!");
    if (!fieldName) return alert("Please select a Field Name from the dropdown first!");
    if (!rawTextPreview) return alert("Raw text is empty!");
    
    let selectionIndex = -1;
    if (sel.anchorNode && sel.anchorNode.textContent === rawTextPreview) {
        selectionIndex = Math.min(sel.anchorOffset, sel.focusOffset);
    }
    
    try {
      const res = await axios.post(\`\${API_URL}/api/v2/bill-templates/generate-from-selection\`, {
        rawText: rawTextPreview,
        selectedText: selection,
        fieldName: fieldName,
        selectionIndex: selectionIndex
      });`;

code = code.replace(targetFunction, replacementFunction);
fs.writeFileSync(path, code);
console.log("Updated handleHighlightGenerate to send selectionIndex.");
