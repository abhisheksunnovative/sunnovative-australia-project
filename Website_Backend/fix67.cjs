const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/utils/templateExtractor.js';
let code = fs.readFileSync(path, 'utf8');

const targetRegex = "const regex = new RegExp(rule.regex, rule.flags || 'i');";
const replacementRegex = "const isStrictCase = rule.field === 'fullName' || rule.field === 'consumerName';\n                const regex = new RegExp(rule.regex, rule.flags || (isStrictCase ? '' : 'i'));";

code = code.replace(targetRegex, replacementRegex);
fs.writeFileSync(path, code);
console.log("Patched templateExtractor.js to remove /i flag for names!");
