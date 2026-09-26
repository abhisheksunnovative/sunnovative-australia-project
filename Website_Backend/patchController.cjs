const fs = require('fs');

const file = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let code = fs.readFileSync(file, 'utf8');

const regex = /const overrideResult = await templateExtractor\.extractData\(rawText, countryContext\);/;
const newCode = `const overrideResult = await templateExtractor.extractData(rawText, countryContext, wordsWithPositions);`;

code = code.replace(regex, newCode);
fs.writeFileSync(file, code);
console.log("Patched lightBillScanController.js to pass wordsWithPositions");
