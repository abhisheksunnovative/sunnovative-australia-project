const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/utils/Ocrextractor.js';
let code = fs.readFileSync(path, 'utf8');

const targetAccount = `  let accountNumber = null;
  // Gap \`[\\s\\S]{0,10}?\` hata diya — sirf immediate-next value allow, taaki "Account: 1 number" jaisa caption-text na pakde
  const acctMatch = t.match(/(?:Account\\s+(?:Number|No\\.?|#)|Account\\s*:)[\s:]*([A-Z0-9][A-Z0-9\\- ]{4,18}[A-Z0-9])/i);
  if (acctMatch) {
    accountNumber = acctMatch[1].trim();
    console.log('[DEBUG] Account Number matched:', accountNumber);
  }
  if (accountNumber && /\\b(details|number|diss|name|account)\\b/i.test(accountNumber)) accountNumber = null;`;

const replacementAccount = `  let accountNumber = null;
  const acctMatches = [...t.matchAll(new RegExp(AU_DICT.accountNumber, 'gi'))];
  for (const m of acctMatches) {
    const context = t.substring(Math.max(0, m.index - 30), m.index + m[0].length);
    if (!/Payment|BSB|Bank/i.test(context)) {
      let val = m[1].trim();
      if (!/\\b(details|number|diss|name|account)\\b/i.test(val)) {
        accountNumber = val;
        console.log('[DEBUG] Account Number matched:', accountNumber);
        break;
      }
    }
  }`;

if (code.includes('const acctMatch = t.match(/(?:Account\\s+(?:Number|No\\.?|#)')) {
    // Just simple string replace
    const exactRegex = /let accountNumber = null;\s*\/\/[\s\S]*?accountNumber = null;/;
    code = code.replace(exactRegex, replacementAccount);
    fs.writeFileSync(path, code);
    console.log("Patched accountNumber extraction with Biller-Info exclusions!");
} else {
    console.log("Could not find exact block to replace");
}
