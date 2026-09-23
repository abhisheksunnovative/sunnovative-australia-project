const fs = require('fs');

const path = 'd:/sunnovative-australia-website/Website_Backend/src/utils/Ocrextractor.js';
let ocr = fs.readFileSync(path, 'utf8');

ocr = ocr.replace(
  /const yourTariffMatch = t.match\(\/Your\\s\*tariff\\s\*:\\s\*\(\[\\^\\n\]\{4,30\}\)\/i\);/,
  'const yourTariffMatch = t.match(/Your\\s*tariff\\s*:\\s*([^\\n]{2,30}?)(?=\\s+Period\\b|\\n|$)/i);'
);

ocr = ocr.replace(
  'if (yourTariffMatch && !/period|:/i.test(yourTariffMatch[1])) {',
  'if (yourTariffMatch) {'
);

fs.writeFileSync(path, ocr);
console.log('Replaced');
