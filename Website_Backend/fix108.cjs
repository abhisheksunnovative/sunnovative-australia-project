const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
    "console.log('[Gemini Aliases] AU/NZ detected. Bypassing Gemini completely for template builder.');",
    "console.log('[Gemini Aliases] AU/NZ detected. Bypassing Gemini completely for template builder. Text length:', extractedRawText.length);"
);

fs.writeFileSync(path, code);
console.log("Added length log to autoGenerateAliases.");
