const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

// Use a simple ASCII regex to avoid encoding corruption
const corruptRegex1 = /\[\\\\s\\\\n:\$A\uFFFD,\uFFFD,-\]/g;
const corruptRegex2 = /\\[\\s\\n:\$A,,-\\]/g;
const corruptRegex3 = /\\[\\s\\n:\$.*?-\\]/g;

// Instead of string replace, let's just use regex replace to catch any corrupted versions
code = code.replace(/\[\\s\\n:\$[^\]]+\]\{0,50\}\?/g, '[\\\\s\\\\n:$,\\\\-]\{0,50\}\?');

fs.writeFileSync(path, code);
console.log("Fixed corrupted regex string.");
