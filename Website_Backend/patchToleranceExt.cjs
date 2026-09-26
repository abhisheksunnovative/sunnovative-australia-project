const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Backend/src/utils/templateExtractor.js';
let code = fs.readFileSync(file, 'utf8');

const regex = /Math\.abs\(w\.x - headingWord\.x\) < 40/g;
code = code.replace(regex, `Math.abs(w.x - headingWord.x) < 80`);

fs.writeFileSync(file, code);
console.log("Widened X tolerance in Extractor to 80");
