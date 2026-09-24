const fs = require('fs');
const pathFE = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let codeFE = fs.readFileSync(pathFE, 'utf8');

const oldSelectionLogic = `            selectionIndex = bestIndex !== -1 ? bestIndex : domIndex;
        } else {
            selectionIndex = rawTextPreview.indexOf(selection);
        }
    }`;

const newSelectionLogic = `            selectionIndex = bestIndex !== -1 ? bestIndex : domIndex;
            console.log(\`[Frontend] 🖱️ Auto clicked for \${fieldName}\`);
            console.log(\`[Frontend] ✂️ Selected Text: "\${selection}"\`);
            console.log(\`[Frontend] 📏 DOM Index: \${domIndex}\`);
            console.log(\`[Frontend] 🎯 Best Matched Index in rawTextPreview: \${selectionIndex}\`);
        } else {
            selectionIndex = rawTextPreview.indexOf(selection);
            console.log(\`[Frontend] ⚠️ Fallback to basic indexOf: \${selectionIndex}\`);
        }
    }`;

codeFE = codeFE.replace(oldSelectionLogic, newSelectionLogic);
fs.writeFileSync(pathFE, codeFE);
console.log("Added frontend logs.");

const pathBE = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let codeBE = fs.readFileSync(pathBE, 'utf8');

const targetLog1 = `    let startIndex = -1;`;
const repLog1 = `    console.log(\`\\n[Backend] 🚀 Auto-Generate Request for: \${fieldName}\`);
    console.log(\`[Backend] ✂️ Selected Text: "\${selectedText}"\`);
    console.log(\`[Backend] 📍 Received selectionIndex: \${selectionIndex}\`);
    let startIndex = -1;`;

const targetLog2 = `    let traverseBefore = rawText.substring(0, startIndex);`;
const repLog2 = `    console.log(\`[Backend] 🎯 Final startIndex used: \${startIndex}\`);
    let traverseBefore = rawText.substring(0, startIndex);`;

const targetLog3 = `    let regexStr = "";
    if (anchorBefore && anchorAfter) {`;
const repLog3 = `    console.log(\`[Backend] 🛑 Anchor Before Chosen: "\${anchorBefore}"\`);
    console.log(\`[Backend] 🛑 Anchor After Chosen: "\${anchorAfter}"\`);
    let regexStr = "";
    if (anchorBefore && anchorAfter) {`;

const targetLog4 = `    try {
      const isStrictCase`;
const repLog4 = `    try {
      console.log(\`[Backend] ⚙️ Generated Regex: \${regexStr}\`);
      const isStrictCase`;

const targetLog5 = `      res.status(200).json({ success: true, data: { regex: regexStr, previewValue: extracted } });`;
const repLog5 = `      console.log(\`[Backend] 🧪 Test Result (Extracted): "\${extracted}"\\n\`);
      res.status(200).json({ success: true, data: { regex: regexStr, previewValue: extracted } });`;

codeBE = codeBE.replace(targetLog1, repLog1)
               .replace(targetLog2, repLog2)
               .replace(targetLog3, repLog3)
               .replace(targetLog4, repLog4)
               .replace(targetLog5, repLog5);
fs.writeFileSync(pathBE, codeBE);
console.log("Added backend logs.");
