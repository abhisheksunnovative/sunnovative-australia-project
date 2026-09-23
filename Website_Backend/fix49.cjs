const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let code = fs.readFileSync(path, 'utf8');

// 1. Patch `merged` mapping
const mergedRegex = /billIssuedDate:\s*isAU\s*\?\s*\(baseParsed\.billIssuedDate\s*\|\|\s*ed\.billIssuedDate\)\s*:\s*\(ed\.billIssuedDate\s*\|\|\s*baseParsed\.billIssuedDate\)/g;
code = code.replace(mergedRegex, 'billIssueDate: isAU ? (baseParsed.billDate || ed.billIssueDate) : (ed.billIssueDate || baseParsed.billDate)');

// 2. Patch debug logs
const logsRegex = /console\.log\('\[DEBUG\] Raw billIssuedDate from template:', ed\.billIssuedDate\);\s*console\.log\('\[DEBUG\] Raw billIssuedDate from base parser:', baseParsed\.billIssuedDate\);\s*console\.log\('\[DEBUG\] merged\.billIssuedDate:', merged\.billIssuedDate\);\s*const effectiveDate = merged\.billIssuedDate \|\| merged\.billingPeriodTo;/g;
code = code.replace(logsRegex, "console.log('[DEBUG] Raw billIssueDate from template:', ed.billIssueDate);\n          console.log('[DEBUG] Raw billDate from base parser:', baseParsed.billDate);\n          console.log('[DEBUG] merged.billIssueDate:', merged.billIssueDate);\n\n          const effectiveDate = merged.billIssueDate || merged.billingPeriodTo;");

// 3. Patch finalJson
const finalJsonRegex = /monthlyUnits:\s*merged\.monthlyUnits\s*\|\|\s*null/g;
code = code.replace(finalJsonRegex, 'monthlyUnits: merged.monthlyUnits || null,\n              billIssueDate: merged.billIssueDate || null');

fs.writeFileSync(path, code);
console.log("Patched field names!");
