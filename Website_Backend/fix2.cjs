const fs = require('fs');

// Fix 1: templateExtractor.js
const tePath = 'd:/sunnovative-australia-website/Website_Backend/src/utils/templateExtractor.js';
let te = fs.readFileSync(tePath, 'utf8');
te = te.replace(
  'if (!templates || templates.length === 0) {\n            throw new Error(`No active templates found for country: ${countryContext}`);\n        }',
  'if (!templates || templates.length === 0) {\n            return { extractedData: {}, matchedTemplate: null, confidenceScore: 0, status: \'manual-review\' };\n        }'
);
// Also account for CRLF
te = te.replace(
  'if (!templates || templates.length === 0) {\r\n            throw new Error(`No active templates found for country: ${countryContext}`);\r\n        }',
  'if (!templates || templates.length === 0) {\r\n            return { extractedData: {}, matchedTemplate: null, confidenceScore: 0, status: \'manual-review\' };\r\n        }'
);
fs.writeFileSync(tePath, te);
console.log('templateExtractor.js patched');

// Fix 2 & 3: Ocrextractor.js
const ocrPath = 'd:/sunnovative-australia-website/Website_Backend/src/utils/Ocrextractor.js';
let ocr = fs.readFileSync(ocrPath, 'utf8');

const oldTariffStr = `  // ── 10. Tariff type ───────────────────────────────────────────────────────
    let tariffType = null;
  const explicitTariffMatch = t.match(/Tariff(?:\\s*:|\\s*-)?\\s+([^\\n]{4,30})/i);
  const currentChargeMatch = t.match(/Current\\s*Account\\s*Charges\\s*\\n\\s*([a-zA-Z0-9\\- ]{4,30})/i);
  // FIX: [ :]+ instead of [\\s\\:]+ so it doesn't cross newlines. 
  // And a specific pattern for when it is explicitly on the very next line.
  const productMatch = t.match(/(?:Energy product|Your plan)[ :]+([^\\n]{4,30})/i) || t.match(/(?:Energy product|Your plan)[ :]*\\n\\s*([^\\n]{4,30})/i);
  // FIX: [a-zA-Z0-9\\- ] instead of \\s to prevent matching newlines
  const originAgreementMatch = t.match(/Your\\s*Current\\s*Agreement\\s*:\\s*\\n?\\s*([a-zA-Z0-9\\- ]{4,30})/i);

  if (currentChargeMatch && !/total|amount/i.test(currentChargeMatch[1])) {
    tariffType = currentChargeMatch[1].trim();
    console.log('[DEBUG] tariffType matched via currentChargeMatch:', currentChargeMatch[0]);
  } else if (originAgreementMatch) {`;

const newTariffStr = `  // ── Due Date (Australia) ────────────────────────────────────────────────
  let dueDate = null;
  const dueDatePatterns = [
    /(?:Due\\s*Date|Payable\\s*by|Due\\s*by)\\^?\\s*:?\\s*([\\d]{1,2}\\s+[A-Za-z]{3,9}\\s+\\d{2,4})/i,
  ];
  for (const p of dueDatePatterns) {
    const m = t.match(p);
    if (m) { dueDate = m[1].trim(); break; }
  }

  // ── 10. Tariff type ───────────────────────────────────────────────────────
  let tariffType = null;
  const yourTariffMatch = t.match(/Your\\s*tariff\\s*:\\s*([^\\n]{4,30})/i);
  const explicitTariffMatch = t.match(/Tariff(?:\\s*:|\\s*-)?\\s+([^\\n]{4,30})/i);
  const currentChargeMatch = t.match(/Current\\s*Account\\s*Charges\\s*\\n\\s*([a-zA-Z0-9\\- ]{4,30})/i);
  const productMatch = t.match(/(?:Energy product|Your plan)[ :]+([^\\n]{4,30})/i) || t.match(/(?:Energy product|Your plan)[ :]*\\n\\s*([^\\n]{4,30})/i);
  const originAgreementMatch = t.match(/Your\\s*Current\\s*Agreement\\s*:\\s*\\n?\\s*([a-zA-Z0-9\\- ]{4,30})/i);

  if (yourTariffMatch && !/period|:/i.test(yourTariffMatch[1])) {
    tariffType = yourTariffMatch[1].trim();
    console.log('[DEBUG] tariffType matched via yourTariffMatch:', yourTariffMatch[0]);
  } else if (currentChargeMatch && !/total|amount/i.test(currentChargeMatch[1])) {
    tariffType = currentChargeMatch[1].trim();
    console.log('[DEBUG] tariffType matched via currentChargeMatch:', currentChargeMatch[0]);
  } else if (originAgreementMatch) {`;

let replaced = ocr.replace(oldTariffStr, newTariffStr);
if (replaced === ocr) {
  replaced = ocr.replace(oldTariffStr.replace(/\n/g, '\r\n'), newTariffStr);
}
ocr = replaced;

const oldReturn = `    billingPeriodTo,
    billingDays,
    quarterlyKwh,`;
const newReturn = `    billingPeriodTo,
    billingDays,
    dueDate,
    quarterlyKwh,`;

replaced = ocr.replace(oldReturn, newReturn);
if (replaced === ocr) {
  replaced = ocr.replace(oldReturn.replace(/\n/g, '\r\n'), newReturn);
}
ocr = replaced;

fs.writeFileSync(ocrPath, ocr);
console.log('Ocrextractor.js patched');
