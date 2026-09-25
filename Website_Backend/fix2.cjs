const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(file, 'utf8');

const debugBlock1 = `        if (fieldName === 'quarterlyKwh') {
            const fs = require('fs');
            fs.writeFileSync('debug_quarterlyKwh.json', JSON.stringify({
                rawText: rawText,
                finalRegex: finalRegex,
                override: override,
                match: match ? match.slice(0, 3) : null
            }, null, 2));
        }`;

const debugBlock2 = `        if (fieldName === 'quarterlyKwh') {
            console.log("=== DEBUG quarterlyKwh ===");
            console.log("Regex:", finalRegex);
            console.log("Match:", match ? match[1] : 'null');
            console.log("==========================");
        }`;

code = code.replace(debugBlock1, '');
code = code.replace(debugBlock2, '');

fs.writeFileSync(file, code);
console.log("Debug blocks removed successfully");
