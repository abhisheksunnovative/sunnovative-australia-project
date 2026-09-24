const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/utils/Ocrextractor.js';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
    "const namePatterns = AU_DICT.namePatterns.map(p => new RegExp(p, 'i'));",
    "const namePatterns = AU_DICT.namePatterns.map(p => new RegExp(p)); // strict case"
);

fs.writeFileSync(path, code);
console.log("Patched Ocrextractor.js to use strict case for names!");
