const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let code = fs.readFileSync(path, 'utf8');

const regex1 = /monthlyUnits:\s*ed\.monthlyUnits\s*\|\|\s*baseParsed\.monthlyUnitsUsed\r?\n\s*\};/;
code = code.replace(regex1, 'monthlyUnits: ed.monthlyUnits || baseParsed.monthlyUnitsUsed,\n              billIssuedDate: isAU ? (baseParsed.billIssuedDate || ed.billIssuedDate) : (ed.billIssuedDate || baseParsed.billIssuedDate)\n          };');

const regex2 = /\/\/ Bill Recency Check\r?\n\s*const effectiveDate = merged\.billIssuedDate \|\| merged\.billingPeriodTo;/;
code = code.replace(regex2, `// Bill Recency Check\n          console.log('[DEBUG] Raw billIssuedDate from template:', ed.billIssuedDate);\n          console.log('[DEBUG] Raw billIssuedDate from base parser:', baseParsed.billIssuedDate);\n          console.log('[DEBUG] merged.billIssuedDate:', merged.billIssuedDate);\n\n          const effectiveDate = merged.billIssuedDate || merged.billingPeriodTo;`);

fs.writeFileSync(path, code);
console.log("Patched using Regex!");
