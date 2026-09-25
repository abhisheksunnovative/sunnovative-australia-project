const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let code = fs.readFileSync(path, 'utf8');

// Fix AU block
code = code.replace(
  `fallbackReason = 'Critical fields missing on AU bill (Likely Parser Bug)';`,
  `fallbackReason = fallbackReason || 'Critical fields missing on AU bill (Likely Parser Bug)';`
);

// Fix India block
code = code.replace(
  `fallbackReason = 'Critical fields missing (Likely Blurry Image)';`,
  `fallbackReason = fallbackReason || 'Critical fields missing (Likely Blurry Image)';`
);

fs.writeFileSync(path, code);
console.log("Fixed fallbackReason overwrite bug");
