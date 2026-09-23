const fs = require('fs');

const path = 'd:/sunnovative-australia-website/Website_Backend/src/utils/templateExtractor.js';
let file = fs.readFileSync(path, 'utf8');

const oldStr = `if (match && match[1]) { 
                    let val = sanitizeValue(match[1], rule.type);`;
const newStr = `if (match) { 
                    const capturedValue = match.slice(1).find(g => g !== undefined);
                    if (!capturedValue) continue;
                    let val = sanitizeValue(capturedValue, rule.type);`;

if (file.includes(oldStr)) {
  file = file.replace(oldStr, newStr);
  fs.writeFileSync(path, file);
  console.log('templateExtractor.js updated.');
} else {
  // try without exact spacing
  const regex = /if\s*\(match\s*&&\s*match\[1\]\)\s*\{\s*let\s*val\s*=\s*sanitizeValue\(match\[1\],\s*rule\.type\);/;
  if (regex.test(file)) {
    file = file.replace(regex, `if (match) { \n                    const capturedValue = match.slice(1).find(g => g !== undefined);\n                    if (!capturedValue) continue;\n                    let val = sanitizeValue(capturedValue, rule.type);`);
    fs.writeFileSync(path, file);
    console.log('templateExtractor.js updated using regex fallback.');
  } else {
    console.log('Could not find match[1] logic in templateExtractor.js');
  }
}
