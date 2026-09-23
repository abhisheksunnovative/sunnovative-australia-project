import fs from 'fs';
let content = fs.readFileSync('src/utils/Ocrextractor.js', 'utf8');

const oldTariff = `  if (currentChargeMatch && !/total|amount/i.test(currentChargeMatch[1])) {
    tariffType = currentChargeMatch[1].trim();
  } else if (originAgreementMatch) {
    tariffType = originAgreementMatch[1].trim();
  } else if (productMatch) {
    tariffType = productMatch[1].trim();
  } else if (explicitTariffMatch && !/total|amount/i.test(explicitTariffMatch[1]) && !explicitTariffMatch[1].includes('NMI')) {
    tariffType = explicitTariffMatch[1].trim();
  } else if (/Time\\s*of\\s*Use|TOU|Peak.*Shoulder|Shoulder.*Peak/is.test(t)) {
    tariffType = 'Time of Use (TOU)';
  } else if (/Single\\s*Rate|Flat\\s*Rate/i.test(t)) {
    tariffType = 'Single Rate';
  } else if (/Controlled\\s*Load|Off.?Peak/i.test(t)) {
    tariffType = 'Controlled Load';
  }`;

const newTariff = `  if (currentChargeMatch && !/total|amount/i.test(currentChargeMatch[1])) {
    tariffType = currentChargeMatch[1].trim();
    console.log('[DEBUG] tariffType matched via currentChargeMatch:', currentChargeMatch[0]);
  } else if (originAgreementMatch) {
    tariffType = originAgreementMatch[1].trim();
    console.log('[DEBUG] tariffType matched via originAgreementMatch:', originAgreementMatch[0]);
  } else if (productMatch) {
    tariffType = productMatch[1].trim();
    console.log('[DEBUG] tariffType matched via productMatch:', productMatch[0]);
  } else if (explicitTariffMatch && !/total|amount/i.test(explicitTariffMatch[1]) && !explicitTariffMatch[1].includes('NMI')) {
    tariffType = explicitTariffMatch[1].trim();
    console.log('[DEBUG] tariffType matched via explicitTariffMatch:', explicitTariffMatch[0]);
  } else if (/Time\\s*of\\s*Use|TOU|Peak.*Shoulder|Shoulder.*Peak/is.test(t)) {
    tariffType = 'Time of Use (TOU)';
    console.log('[DEBUG] tariffType matched via TOU regex');
  } else if (/Single\\s*Rate|Flat\\s*Rate/i.test(t)) {
    tariffType = 'Single Rate';
    console.log('[DEBUG] tariffType matched via Single Rate regex');
  } else if (/Controlled\\s*Load|Off.?Peak/i.test(t)) {
    tariffType = 'Controlled Load';
    console.log('[DEBUG] tariffType matched via Controlled Load regex');
  }`;

if (content.includes(oldTariff)) {
  content = content.replace(oldTariff, newTariff);
  fs.writeFileSync('src/utils/Ocrextractor.js', content);
  console.log("Added console.log for tariffType");
} else {
  console.log("Tariff block not found");
}
