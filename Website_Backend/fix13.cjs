const fs = require('fs');

const scanPath = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let scan = fs.readFileSync(scanPath, 'utf8');

// 1. Add the function at the top (after imports)
const isBillTooOldFunc = `\nfunction isBillTooOld(billIssuedDate, countryContext) {
  if (!billIssuedDate) return null;
  const parsedDate = new Date(billIssuedDate);
  if (isNaN(parsedDate.getTime())) return null; // Invalid date format
  const monthsOld = (Date.now() - parsedDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
  const maxMonths = countryContext === 'australia' ? 4 : 3;
  return monthsOld > maxMonths;
}\n\n`;

if (!scan.includes('function isBillTooOld')) {
  scan = scan.replace("export const processBillUpload = async (req, res) => {", isBillTooOldFunc + "export const processBillUpload = async (req, res) => {");
}

// 2. Add the check after 'let needsTemplate = false;'
const targetStr = "let needsTemplate = false;";
const newCheck = `let needsTemplate = false;

        // Bill Recency Check
        if (isBillTooOld(merged.billIssuedDate || merged.billingPeriodTo, countryContext)) {
            criticalFieldsConfirmed = false;
            fallbackReason = 'Bill is older than allowed limit — ask customer for a recent bill';
        }`;

if (scan.includes(targetStr) && !scan.includes('Bill Recency Check')) {
  scan = scan.replace(targetStr, newCheck);
}

fs.writeFileSync(scanPath, scan);
console.log('lightBillScanController updated');
