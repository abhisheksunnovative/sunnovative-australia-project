const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
    'const { text, isScanned } = await extractPdfText(req.file.buffer);',
    'const { rawText: text, usedOCR: isScanned } = await extractRawText(req.file.buffer, req.file.mimetype);'
);

fs.writeFileSync(path, code);
console.log("Successfully fixed extractRawText call.");
