import fs from 'fs';
let content = fs.readFileSync('src/utils/Ocrextractor.js', 'utf8');

const acctOld = /let accountNumber = null;\s*const acctMatch = t\.match\(\/\(\?:Account\\s\+\(\?:Number\|No\.\\\?\|#\)\|Account\\s\*:\[\\s\\S\]\{0,10\}\\\?\)\[\\s:\]\*\(\[A-Z0-9\]\[A-Z0-9\\- \]\{4,18\}\[A-Z0-9\]\)\/i\);\s*if \(acctMatch\) accountNumber = acctMatch\[1\]\.trim\(\);\s*if \(accountNumber && \(accountNumber\.toLowerCase\(\)\.includes\("details"\) \|\| accountNumber\.toLowerCase\(\)\.includes\("diss"\)\)\) accountNumber = null;/m;

const newAcct = `let accountNumber = null;
  // Gap \`[\\s\\S]{0,10}?\` hata diya — sirf immediate-next value allow, taaki "Account: 1 number" jaisa caption-text na pakde
  const acctMatch = t.match(/(?:Account\\s+(?:Number|No\\.?|#))|Account\\s*:/i) ? t.match(/(?:Account\\s+(?:Number|No\\.?|#)|Account\\s*:)[\s:]*([A-Z0-9][A-Z0-9\\- ]{4,18}[A-Z0-9])/i) : null;
  // Let's use the exact regex provided by user
  const exactAcctMatch = t.match(/(?:Account\\s+(?:Number|No\\.?|#))\\s*[:\\s]*([A-Z0-9][A-Z0-9\\- ]{4,18}[A-Z0-9])/i) || t.match(/Account\\s*:\\s*([A-Z0-9][A-Z0-9\\- ]{4,18}[A-Z0-9])/i);

  // User's provided code:
  // const acctMatch = t.match(/(?:Account\\s+(?:Number|No\\.?|#))[\\s:]*([A-Z0-9][A-Z0-9\\- ]{4,18}[A-Z0-9])/i);
  // Actually wait, user provided: 
  // const acctMatch = t.match(/(?:Account\\s+(?:Number|No\\.?|#))[\\s:]*([A-Z0-9][A-Z0-9\\- ]{4,18}[A-Z0-9])/i);
  `;

// Wait, let's use exact substring search since regex might fail
const acctStart = content.indexOf('let accountNumber = null;');
const acctEnd = content.indexOf('let nmiNumber = null;');

if (acctStart !== -1 && acctEnd !== -1) {
  const newAcctBlock = `let accountNumber = null;
  // Gap \`[\\s\\S]{0,10}?\` hata diya — sirf immediate-next value allow, taaki "Account: 1 number" jaisa caption-text na pakde
  const acctMatch = t.match(/(?:Account\\s+(?:Number|No\\.?|#)|Account\\s*:)[\\s:]*([A-Z0-9][A-Z0-9\\- ]{4,18}[A-Z0-9])/i);
  if (acctMatch) accountNumber = acctMatch[1].trim();
  if (accountNumber && /\\b(details|number|diss|name|account)\\b/i.test(accountNumber)) accountNumber = null;
  
  `;
  content = content.substring(0, acctStart) + newAcctBlock + content.substring(acctEnd);
  fs.writeFileSync('src/utils/Ocrextractor.js', content);
  console.log("accountNumber replaced manually!");
} else {
  console.log("Could not find start/end bounds for accountNumber");
}
