import fs from 'fs';

let content = fs.readFileSync('src/utils/Ocrextractor.js', 'utf8');

const tariffOld = `  let tariffType = null;
  if (/Time\\s*of\\s*Use|TOU|Peak.*Shoulder|Shoulder.*Peak/is.test(t)) tariffType = 'Time of Use (TOU)';
  else if (/Single\\s*Rate|Flat\\s*Rate/i.test(t)) tariffType = 'Single Rate';
  else if (/Controlled\\s*Load|Off.?Peak/i.test(t)) tariffType = 'Controlled Load';`;

const tariffNew = `  let tariffType = null;
  const explicitTariffMatch = t.match(/Tariff(?:\\s*:|\\s*-)?\\s+([^\\n]{4,30})/i);
  const currentChargeMatch = t.match(/Current\\s*Account\\s*Charges\\s*\\n\\s*([a-zA-Z0-9\\- ]{4,30})/i);
  const productMatch = t.match(/(?:Energy product|Your plan)[\\s\\:]+([^\\n]{4,30})/i);
  const originAgreementMatch = t.match(/Your\\s*Current\\s*Agreement\\s*:\\s*\\n?\\s*([a-zA-Z0-9\\-\\s]{4,30})/i);

  if (currentChargeMatch && !/total|amount/i.test(currentChargeMatch[1])) {
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

if (content.includes(tariffOld)) {
  content = content.replace(tariffOld, tariffNew);
  fs.writeFileSync('src/utils/Ocrextractor.js', content);
  console.log("Patched Tariff extraction");
} else {
  console.log("Tariff old string not found");
}
