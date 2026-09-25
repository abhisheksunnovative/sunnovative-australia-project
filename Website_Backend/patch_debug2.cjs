const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `    let previewValue = 'Not Found';
    try {
        const isStrictCase = fieldName === 'fullName' || fieldName === 'consumerName';
        const match = rawText.match(new RegExp(finalRegex, isStrictCase ? '' : 'i'));`;

const replacement = `    let previewValue = 'Not Found';
    try {
        const isStrictCase = fieldName === 'fullName' || fieldName === 'consumerName';
        const match = rawText.match(new RegExp(finalRegex, isStrictCase ? '' : 'i'));
        if (fieldName === 'quarterlyKwh') {
            const fs = require('fs');
            fs.writeFileSync('debug_quarterlyKwh.json', JSON.stringify({
                rawText: rawText,
                finalRegex: finalRegex,
                override: override,
                match: match ? match.slice(0, 3) : null
            }, null, 2));
        }`;

code = code.replace(targetStr, replacement);
fs.writeFileSync(file, code);
console.log("Patched debug dump");
