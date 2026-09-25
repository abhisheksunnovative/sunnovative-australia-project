const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Backend/src/utils/templateExtractor.js';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `                if (match) { 
                    const capturedValue = match.slice(1).find(g => g !== undefined);`;
                    
const replacementStr = `                if (match) { 
                    let capturedValue;
                    if (rule.type === 'split-currency' && match[1] && match[2]) {
                        capturedValue = parseFloat(match[1].replace(/,/g, '') + '.' + match[2]).toString();
                    } else {
                        capturedValue = match.slice(1).find(g => g !== undefined);
                    }`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync(file, code);
console.log("Patched templateExtractor.js for split-currency");
