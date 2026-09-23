const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let code = fs.readFileSync(path, 'utf8');

const oldMerged = `              quarterlyKwh: isAU ? (baseParsed.quarterlyKwh || ed.quarterlyKwh) : (ed.quarterlyKwh || baseParsed.quarterlyKwh),
              monthlyUnits: ed.monthlyUnits || baseParsed.monthlyUnitsUsed
          };`;

const newMerged = `              quarterlyKwh: isAU ? (baseParsed.quarterlyKwh || ed.quarterlyKwh) : (ed.quarterlyKwh || baseParsed.quarterlyKwh),
              monthlyUnits: ed.monthlyUnits || baseParsed.monthlyUnitsUsed,
              billIssuedDate: isAU ? (baseParsed.billIssuedDate || ed.billIssuedDate) : (ed.billIssuedDate || baseParsed.billIssuedDate)
          };`;

if (code.includes(oldMerged)) {
  code = code.replace(oldMerged, newMerged);
  console.log("Patched merged object (LF)");
} else if (code.includes(oldMerged.replace(/\n/g, '\r\n'))) {
  code = code.replace(oldMerged.replace(/\n/g, '\r\n'), newMerged.replace(/\n/g, '\r\n'));
  console.log("Patched merged object (CRLF)");
}

const oldLogs = `          // Bill Recency Check
          const effectiveDate = merged.billIssuedDate || merged.billingPeriodTo;`;

const newLogs = `          // Bill Recency Check
          console.log('[DEBUG] Raw billIssuedDate from template:', ed.billIssuedDate);
          console.log('[DEBUG] Raw billIssuedDate from base parser:', baseParsed.billIssuedDate);
          console.log('[DEBUG] merged.billIssuedDate:', merged.billIssuedDate);
          
          const effectiveDate = merged.billIssuedDate || merged.billingPeriodTo;`;

if (code.includes(oldLogs)) {
  code = code.replace(oldLogs, newLogs);
  console.log("Patched logs (LF)");
} else if (code.includes(oldLogs.replace(/\n/g, '\r\n'))) {
  code = code.replace(oldLogs.replace(/\n/g, '\r\n'), newLogs.replace(/\n/g, '\r\n'));
  console.log("Patched logs (CRLF)");
}

fs.writeFileSync(path, code);
