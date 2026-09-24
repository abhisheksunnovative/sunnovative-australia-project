const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

const targetStr = `            const match = extractedRawText.match(regex);
            rule.previewValue = match ? match[1].trim() : 'Not Found';`;
const replacementStr = `            const match = extractedRawText.match(regex);
            if (match) {
              const val = match.slice(1).find(v => v !== undefined);
              rule.previewValue = val ? val.trim() : match[0].trim();
            } else {
              rule.previewValue = 'Not Found';
            }`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync(path, code);
console.log("Patched injectPreview to handle multiple capture groups correctly!");
