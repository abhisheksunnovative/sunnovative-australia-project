const fs = require('fs');

let ocr = fs.readFileSync('d:/sunnovative-australia-website/Website_Backend/src/utils/Ocrextractor.js', 'utf8');

const anchor = '  // ── 10. Tariff type ───────────────────────────────────────────────────────\r\n    let tariffType = null;';
const altAnchor = '  // ── 10. Tariff type ───────────────────────────────────────────────────────\n    let tariffType = null;';

const insertion = `  // ── Due Date (Australia) ────────────────────────────────────────────────
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
  const yourTariffMatch = t.match(/Your\\s*tariff\\s*:\\s*([^\\n]{4,30})/i);`;

if (ocr.includes(anchor)) {
  ocr = ocr.replace(anchor, insertion);
} else if (ocr.includes(altAnchor)) {
  ocr = ocr.replace(altAnchor, insertion);
} else {
  console.log('anchor not found');
}

const currentChargeLogic = `  if (currentChargeMatch && !/total|amount/i.test(currentChargeMatch[1])) {
    tariffType = currentChargeMatch[1].trim();`;

const newChargeLogic = `  if (yourTariffMatch && !/period|:/i.test(yourTariffMatch[1])) {
    tariffType = yourTariffMatch[1].trim();
    console.log('[DEBUG] tariffType matched via yourTariffMatch:', yourTariffMatch[0]);
  } else if (currentChargeMatch && !/total|amount/i.test(currentChargeMatch[1])) {
    tariffType = currentChargeMatch[1].trim();`;

if (ocr.includes(currentChargeLogic)) {
  ocr = ocr.replace(currentChargeLogic, newChargeLogic);
} else if (ocr.includes(currentChargeLogic.replace(/\n/g, '\r\n'))) {
  ocr = ocr.replace(currentChargeLogic.replace(/\n/g, '\r\n'), newChargeLogic);
} else {
  console.log('logic anchor not found');
}

fs.writeFileSync('d:/sunnovative-australia-website/Website_Backend/src/utils/Ocrextractor.js', ocr);
console.log('done');
