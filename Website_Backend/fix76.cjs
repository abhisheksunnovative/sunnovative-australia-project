const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
    /return res\.status\(200\)\.json\(\{ success: true, data: validatedAuTemplate \}\);/g,
    "return res.status(200).json({ success: true, data: validatedAuTemplate, rawText: extractedRawText });"
);

code = code.replace(
    /return res\.status\(200\)\.json\(\{ success: true, data: validatedGeminiTemplate \}\);/g,
    "return res.status(200).json({ success: true, data: validatedGeminiTemplate, rawText: extractedRawText });"
);

fs.writeFileSync(path, code);
console.log("Patched autoGenerateAliases to return rawText!");
