const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/utils/RegexDictionary.js';
let code = fs.readFileSync(path, 'utf8');

const targetStr = '"(?:Account\\\\s+(?:Number|No\\\\.?|#)|Account\\\\s*:)[\\\\s:]*([A-Z0-9][A-Z0-9\\\\- ]{4,18}[A-Z0-9])"';
const replacementStr = '"(?<!Payment\\\\s*)(?:Account\\\\s+(?:Number|No\\\\.?|#)|Account\\\\s*:)[\\\\s:]*([A-Z0-9][A-Z0-9\\\\- ]{4,15}[A-Z0-9])"'; // reduced max len to 15 to cut off garbage like '   1'

code = code.replace(targetStr, replacementStr);
fs.writeFileSync(path, code);
console.log("Patched RegexDictionary.js accountNumber with negative lookbehind!");
