const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `        const match = rawText.match(new RegExp(finalRegex, isStrictCase ? '' : 'i'));
        if (match) {`;

const replacement = `        const match = rawText.match(new RegExp(finalRegex, isStrictCase ? '' : 'i'));
        if (fieldName === 'quarterlyKwh') {
            console.log("=== DEBUG quarterlyKwh ===");
            console.log("Regex:", finalRegex);
            console.log("Match:", match ? match[1] : 'null');
            console.log("==========================");
        }
        if (match) {`;

code = code.replace(targetStr, replacement);
fs.writeFileSync(file, code);
console.log("Patched debug logs");
