const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(file, 'utf8');

const oldCode = `           setFormData(prev => ({ 
             ...prev, 
             extractionRules: generatedRules,
             anchorKeywords: res.data.suggestedAnchor && prev.anchorKeywords === prev.discomName ? res.data.suggestedAnchor : (res.data.suggestedAnchor ? prev.anchorKeywords + ', ' + res.data.suggestedAnchor : prev.anchorKeywords)
           }));`;

const newCode = `           setFormData(prev => {
             let newAnchors = prev.anchorKeywords;
             if (res.data.suggestedAnchor) {
                 if (!prev.anchorKeywords || prev.anchorKeywords === prev.discomName) {
                     newAnchors = res.data.suggestedAnchor;
                 } else if (!prev.anchorKeywords.includes(res.data.suggestedAnchor.split(',')[0])) {
                     newAnchors = prev.anchorKeywords + ', ' + res.data.suggestedAnchor;
                 }
                 // Remove duplicates
                 newAnchors = [...new Set(newAnchors.split(',').map(a => a.trim()).filter(a => a))].join(', ');
             }
             return { 
               ...prev, 
               extractionRules: generatedRules,
               anchorKeywords: newAnchors
             };
           });`;

code = code.replace(oldCode, newCode);
fs.writeFileSync(file, code);
console.log("Patched frontend for suggestedAnchor (refined)");
