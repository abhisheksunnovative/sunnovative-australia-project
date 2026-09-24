const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

// Fix the Capture Group in backend to allow ALL characters except newline
code = code.replace(
    /let captureGroup = "\(\[A-Za-z0-9\\\\\\\\s\.\&-\]\{2,50\}\)";/g,
    'let captureGroup = "([^\\\\n\\\\r]{2,80}?)";' // Generic string matching that stops gracefully and allows ()
);

fs.writeFileSync(path, code);
console.log("Fixed Capture Group in Regex Generator to allow parentheses and special chars!");
