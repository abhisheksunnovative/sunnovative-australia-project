const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/utils/Ocrextractor.js';
let code = fs.readFileSync(path, 'utf8');

const targetStr = "let dueDate = null;\n  const m = t.match(new RegExp(AU_DICT.dueDate, 'i'));\n  if (m) { dueDate = m[1].trim(); }";
const replacementStr = `let dueDate = null;
  const m = t.match(new RegExp(AU_DICT.dueDate, 'i'));
  if (m) { dueDate = m[1].trim(); }
  
  let billDate = null;
  const mDate = t.match(new RegExp(AU_DICT.billIssueDate, 'i'));
  if (mDate) { billDate = mDate[1].trim(); }
  else {
    // Fallback manual hardcoded regex just in case dictionary fails
    const fallbackDate = t.match(/(?:Issue\\s*Date|Date\\s*of\\s*Issue|Invoice\\s*Date|Bill\\s*Date|Statement\\s*Date)\\s*[:\\-]?\\s*([\\d]{1,2}\\s+[A-Za-z]{3,9}\\s+\\d{2,4}|[\\d]{1,2}[-/][\\d]{1,2}[-/][\\d]{2,4})/i);
    if (fallbackDate) { billDate = fallbackDate[1].trim(); }
  }`;

code = code.replace(targetStr, replacementStr);

const targetReturn = "dueDate,\n    quarterlyKwh,";
const replacementReturn = "dueDate,\n    billDate,\n    quarterlyKwh,";
code = code.replace(targetReturn, replacementReturn);

fs.writeFileSync(path, code);
console.log("Patched Ocrextractor to fallback parse billDate for AU bills");
