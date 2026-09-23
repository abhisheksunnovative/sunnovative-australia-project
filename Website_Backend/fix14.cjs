const fs = require('fs');

const scanPath = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let scan = fs.readFileSync(scanPath, 'utf8');

const oldCheck = `        // Bill Recency Check
        if (isBillTooOld(merged.billIssuedDate || merged.billingPeriodTo, countryContext)) {
            criticalFieldsConfirmed = false;
            fallbackReason = 'Bill is older than allowed limit — ask customer for a recent bill';
        }`;

const newCheck = `        // Bill Recency Check
        const effectiveDate = merged.billIssuedDate || merged.billingPeriodTo;
        if (!effectiveDate) {
            criticalFieldsConfirmed = false;
            fallbackReason = 'Bill date not found — cannot verify recency';
        } else if (isBillTooOld(effectiveDate, countryContext)) {
            criticalFieldsConfirmed = false;
            fallbackReason = 'Bill is older than allowed limit — ask customer for a recent bill';
        }`;

if (scan.includes(oldCheck)) {
  scan = scan.replace(oldCheck, newCheck);
  fs.writeFileSync(scanPath, scan);
  console.log('lightBillScanController updated with missing date logic');
} else if (scan.includes(oldCheck.replace(/\n/g, '\r\n'))) {
  scan = scan.replace(oldCheck.replace(/\n/g, '\r\n'), newCheck);
  fs.writeFileSync(scanPath, scan);
  console.log('lightBillScanController updated with missing date logic');
} else {
  console.log('Recency logic not found to replace');
}
