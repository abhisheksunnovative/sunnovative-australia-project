const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let code = fs.readFileSync(path, 'utf8');

const targetLogs = "console.log('\\[DEBUG\\] Raw billIssueDate from template:', ed.billIssueDate \\|\\| ed.billIssuedDate);";
const replacementLogs = "console.log('[DEBUG] Full Extracted Data from template:', JSON.stringify(ed));\n          console.log('[DEBUG] Raw billIssueDate from template:', ed.billIssueDate || ed.billIssuedDate);";

code = code.replace(new RegExp(targetLogs, "g"), replacementLogs);
fs.writeFileSync(path, code);
console.log("Patched to dump the full `ed` object");
