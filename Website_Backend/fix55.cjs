const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/utils/Ocrextractor.js';
let code = fs.readFileSync(path, 'utf8');

const regex = /let dueDate = null;\s*const m = t\.match\(new RegExp\(AU_DICT\.dueDate, 'i'\)\);\s*if \(m\) \{ dueDate = m\[1\]\.trim\(\); \}/;

const replacementStr = `let dueDate = null;
  const m = t.match(new RegExp(AU_DICT.dueDate, 'i'));
  if (m) { dueDate = m[1].trim(); }
  
  let billDate = null;
  const mDate = t.match(new RegExp(AU_DICT.billIssueDate, 'i'));
  if (mDate) { billDate = mDate[1].trim(); }
  else {
    const fallbackDate = t.match(/(?:Issue\\\\s*Date|Date\\\\s*of\\\\s*Issue|Invoice\\\\s*Date|Bill\\\\s*Date|Statement\\\\s*Date)\\\\s*[:\\\\-]?\\\\s*([\\\\d]{1,2}\\\\s+[A-Za-z]{3,9}\\\\s+\\\\d{2,4}|[\\\\d]{1,2}[-/][\\\\d]{1,2}[-/][\\\\d]{2,4})/i);
    if (fallbackDate) { billDate = fallbackDate[1].trim(); }
  }`;

code = code.replace(regex, replacementStr);

const targetReturnRegex = /dueDate,\s*quarterlyKwh,/;
const replacementReturn = "dueDate,\n    billDate,\n    quarterlyKwh,";
code = code.replace(targetReturnRegex, replacementReturn);

fs.writeFileSync(path, code);
console.log("Patched using RegExp for robust line-ending matching");
