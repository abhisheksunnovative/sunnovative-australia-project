const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let code = fs.readFileSync(path, 'utf8');

const regexMerge = /billIssueDate:\s*isAU\s*\?\s*\(baseParsed\.billDate\s*\|\|\s*ed\.billIssueDate\)\s*:\s*\(ed\.billIssueDate\s*\|\|\s*baseParsed\.billDate\)/;
const replacementMerge = 'billIssueDate: isAU ? (baseParsed.billDate || ed.billIssuedDate || ed.billIssueDate) : (ed.billIssuedDate || ed.billIssueDate || baseParsed.billDate)';

code = code.replace(regexMerge, replacementMerge);

const regexLogs = /console\.log\('\[DEBUG\] Raw billIssueDate from template:', ed\.billIssueDate\);/g;
const replacementLogs = "console.log('[DEBUG] Raw billIssueDate from template:', ed.billIssueDate || ed.billIssuedDate);";

code = code.replace(regexLogs, replacementLogs);

fs.writeFileSync(path, code);
console.log("Patched to support both billIssuedDate and billIssueDate from templates");
