const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `        if (Array.isArray(generatedRules)) {
           setFormData(prev => ({ ...prev, extractionRules: generatedRules }));`;

const replacement = `        if (Array.isArray(generatedRules)) {
           setFormData(prev => ({ 
             ...prev, 
             extractionRules: generatedRules,
             anchorKeywords: res.data.suggestedAnchor && prev.anchorKeywords === prev.discomName ? res.data.suggestedAnchor : (res.data.suggestedAnchor ? prev.anchorKeywords + ', ' + res.data.suggestedAnchor : prev.anchorKeywords)
           }));`;

code = code.replace(targetStr, replacement);
fs.writeFileSync(file, code);
console.log("Patched frontend for suggestedAnchor");
