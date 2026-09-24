const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

const correctCode = `    let regexStr = "";
    if (anchorBefore && anchorAfter) {
      regexStr = "(?:" + anchorBefore + ")[\\\\s\\\\n:$,\\\\-]{0,50}?" + captureGroup + "(?=[\\\\s\\\\n:$,\\\\-]{0,50}?" + anchorAfter + ")";
    } else if (anchorBefore) {
      regexStr = "(?:" + anchorBefore + ")[\\\\s\\\\n:$,\\\\-]{0,50}?" + captureGroup;
    } else {
       regexStr = escapeRegex(selectedText).replace(/\\d+/g, '\\\\d+');
    }`;

// Find the block from let regexStr = ""; to } else { regexStr = ... }
const regexBlock = /let regexStr = "";[\s\S]*?escapeRegex\(selectedText\)\.replace\(\/\\d\+\/g, '\\\\d\+'\);\n\s*\}/;

code = code.replace(regexBlock, correctCode);
fs.writeFileSync(path, code);
console.log("Forced replacement of regex block.");
