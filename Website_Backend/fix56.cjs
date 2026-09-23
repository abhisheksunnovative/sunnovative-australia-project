const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let code = fs.readFileSync(path, 'utf8');

const regexOverwrite = /fallbackReason = 'Critical fields missing on AU bill \\(Likely Parser Bug\\)';/g;
const replacementOverwrite = "if (!fallbackReason) fallbackReason = 'Critical fields missing on AU bill (Likely Parser Bug)';";
code = code.replace(regexOverwrite, replacementOverwrite);

const regexGeminiOverwrite = /fallbackReason = 'Critical fields missing \\(Likely Blurry Image\\)';/g;
const replacementGeminiOverwrite = "if (!fallbackReason) fallbackReason = 'Critical fields missing (Likely Blurry Image)';";
code = code.replace(regexGeminiOverwrite, replacementGeminiOverwrite);

fs.writeFileSync(path, code);
console.log("Patched lightBillScanController to preserve Safety Gate fallbackReason");
