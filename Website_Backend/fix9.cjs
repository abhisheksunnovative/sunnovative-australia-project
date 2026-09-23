const fs = require('fs');

const ocrPath = 'd:/sunnovative-australia-website/Website_Backend/src/utils/Ocrextractor.js';
let ocr = fs.readFileSync(ocrPath, 'utf8');

// Add import
if (!ocr.includes('AU_DICT')) {
  ocr = ocr.replace(
    "import { getStateSubsidyData } from './stateSubsidyData.js';",
    "import { getStateSubsidyData } from './stateSubsidyData.js';\nimport { AU_RETAILERS, AU_DICT } from './RegexDictionary.js';"
  );
}

// Remove the AU_RETAILERS definition block
ocr = ocr.replace(/const AU_RETAILERS = \[[\s\S]*?\];\n+/m, '');

// Target AU parse block
const auStart = ocr.indexOf('export const parseAuBillText =');

// Safely replace AU account number
const acctOld = "const acctMatch = t.match(/(?:Account\\s+(?:Number|No\\.?|#)|Account\\s*:)[\s:]*([A-Z0-9][A-Z0-9\\- ]{4,18}[A-Z0-9])/i);";
const acctNew = "const acctMatch = t.match(new RegExp(AU_DICT.accountNumber, 'i'));";
const acctRegex = /const acctMatch = t\.match\(\/\(\?:Account\\s\+\(\?:Number\|No\\\\\.?\?\|#\)\|Account\\s\*\:\)\[\\s\:\].*?\/i\);/;
const idxAcct = ocr.substring(auStart).search(acctRegex);
if (idxAcct !== -1) {
  ocr = ocr.substring(0, auStart + idxAcct) + acctNew + ocr.substring(auStart + idxAcct + ocr.substring(auStart).match(acctRegex)[0].length);
}

// Safely replace dueDate in AU block
const dueDateRegex = /const dueDatePatterns = \[[\s\S]*?\];\s*for \([\s\S]*?break;\s*\}\s*\}/;
const idxDueDate = ocr.substring(auStart).search(dueDateRegex);
if (idxDueDate !== -1) {
  const dueDateNew = "const m = t.match(new RegExp(AU_DICT.dueDate, 'i'));\n  if (m) { dueDate = m[1].trim(); }";
  ocr = ocr.substring(0, auStart + idxDueDate) + dueDateNew + ocr.substring(auStart + idxDueDate + ocr.substring(auStart).match(dueDateRegex)[0].length);
}

// Safely replace amountPatterns in AU block
const amountRegex = /const amountPatterns = \[[\s\S]*?\];/;
const idxAmount = ocr.substring(auStart).search(amountRegex);
if (idxAmount !== -1) {
  const amountNew = "const amountPatterns = AU_DICT.amountPatterns.map(p => new RegExp(p, 'i'));";
  ocr = ocr.substring(0, auStart + idxAmount) + amountNew + ocr.substring(auStart + idxAmount + ocr.substring(auStart).match(amountRegex)[0].length);
}

// Safely replace usagePatterns in AU block
const usageRegex = /const usagePatterns = \[[\s\S]*?\];/;
const idxUsage = ocr.substring(auStart).search(usageRegex);
if (idxUsage !== -1) {
  const usageNew = "const usagePatterns = AU_DICT.usagePatterns.map(p => new RegExp(p, 'i'));";
  ocr = ocr.substring(0, auStart + idxUsage) + usageNew + ocr.substring(auStart + idxUsage + ocr.substring(auStart).match(usageRegex)[0].length);
}

// Safely replace namePatterns in AU block
const nameRegex = /const namePatterns = \[[\s\S]*?\];/;
const idxName = ocr.substring(auStart).search(nameRegex);
if (idxName !== -1) {
  const nameNew = "const namePatterns = AU_DICT.namePatterns.map(p => new RegExp(p, 'i'));";
  ocr = ocr.substring(0, auStart + idxName) + nameNew + ocr.substring(auStart + idxName + ocr.substring(auStart).match(nameRegex)[0].length);
}

fs.writeFileSync(ocrPath, ocr);
console.log('Ocrextractor patched safely.');
