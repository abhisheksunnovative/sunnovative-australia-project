const fs = require('fs');
const ocrPath = 'd:/sunnovative-australia-website/Website_Backend/src/utils/Ocrextractor.js';
let ocr = fs.readFileSync(ocrPath, 'utf8');

// 1. Import at top
ocr = ocr.replace(
  'import { getStateSubsidyData } from \'./stateSubsidyData.js\';',
  'import { getStateSubsidyData } from \'./stateSubsidyData.js\';\nimport { AU_RETAILERS, AU_DICT } from \'./RegexDictionary.js\';'
);

// 2. Remove AU_RETAILERS definition
ocr = ocr.replace(/const AU_RETAILERS = \[[\s\S]*?\];\n\n/m, '');

// 3. Replace Account match
ocr = ocr.replace(
  /const acctMatch = t\.match\(\/\(\?:Account\\s\+\(\?:Number\|No\\\\\.?\?\|#\)\|Account\\s\*\:\)\[\\s\:\]\*\(\[A\-Z0\-9\]\[A\-Z0\-9\\- \]{4,18}\[A\-Z0\-9\]\)\/i\);/,
  'const acctMatch = t.match(new RegExp(AU_DICT.accountNumber, \'i\'));'
);

// 4. Replace Due Date match
ocr = ocr.replace(
  /const dueDatePatterns = \[\s*\/\(\?:Due\\s\*Date\|Payable\\s\*by\|Due\\s\*by\)\\\^\?\\s\*\:\?\\s\*\(\[\\\\d\]\{1,2\}\\s\+\[A-Za-z\]\{3,9\}\\s\+\\\\d\{2,4\}\)\/i,\s*\];\s*for \(const p of dueDatePatterns\) {\s*const m = t\.match\(p\);\s*if \(m\) { dueDate = m\[1\]\.trim\(\); break; }\s*}/m,
  'const m = t.match(new RegExp(AU_DICT.dueDate, \'i\'));\n  if (m) { dueDate = m[1].trim(); }'
);

fs.writeFileSync(ocrPath, ocr);
console.log('Ocrextractor patched.');
