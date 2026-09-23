import fs from 'fs';
let content = fs.readFileSync('src/utils/Ocrextractor.js', 'utf8');

// Fix 1 & 2: Tariff regexes
const tariffOld = `  const explicitTariffMatch = t.match(/Tariff(?:\\s*:|\\s*-)?\\s+([^\\n]{4,30})/i);
  const currentChargeMatch = t.match(/Current\\s*Account\\s*Charges\\s*\\n\\s*([a-zA-Z0-9\\- ]{4,30})/i);
  const productMatch = t.match(/(?:Energy product|Your plan)[\\s\\:]+([^\\n]{4,30})/i);
  const originAgreementMatch = t.match(/Your\\s*Current\\s*Agreement\\s*:\\s*\\n?\\s*([a-zA-Z0-9\\-\\s]{4,30})/i);`;

const tariffNew = `  const explicitTariffMatch = t.match(/Tariff(?:\\s*:|\\s*-)?\\s+([^\\n]{4,30})/i);
  const currentChargeMatch = t.match(/Current\\s*Account\\s*Charges\\s*\\n\\s*([a-zA-Z0-9\\- ]{4,30})/i);
  // FIX: [ :]+ instead of [\\s\\:]+ so it doesn't cross newlines. 
  // And a specific pattern for when it is explicitly on the very next line.
  const productMatch = t.match(/(?:Energy product|Your plan)[ :]+([^\\n]{4,30})/i) || t.match(/(?:Energy product|Your plan)[ :]*\\n\\s*([^\\n]{4,30})/i);
  // FIX: [a-zA-Z0-9\\- ] instead of \\s to prevent matching newlines
  const originAgreementMatch = t.match(/Your\\s*Current\\s*Agreement\\s*:\\s*\\n?\\s*([a-zA-Z0-9\\- ]{4,30})/i);`;

content = content.replace(tariffOld, tariffNew);

// Fix 3: Customer Name regex
const nameOld = `  const namePatterns = [
    /(?:Customer|Account\\s*Holder|Account\\s*Name)\\s*[:\\-]?\\s*([A-Z][a-z]+(?:\\s+[A-Z][a-z]+){1,3})(?=\\s*(?:Supply|Account|NMI|$))/i,
    /Dear\\s+(?:Mr\\.?\\s*|Ms\\.?\\s*|Mrs\\.?\\s*)?([A-Z][a-z]+(?:\\s+[A-Z][a-z]+){0,3}),?/i,
  ];`;

const nameNew = `  const namePatterns = [
    /(?:[Cc]ustomer|[Aa]ccount\\s*[Hh]older|[Aa]ccount\\s*[Nn]ame)\\s*[:\\-]?\\s*([A-Z][a-z]+(?:\\s+[A-Z][a-z]+){1,3})(?=\\s*(?:Supply|Account|NMI|$))/,
    /Dear\\s+(?:Mr\\.?\\s*|Ms\\.?\\s*|Mrs\\.?\\s*)?([A-Z][a-z]+(?:\\s+[A-Z][a-z]+){0,3}),?/i,
  ];`;

content = content.replace(nameOld, nameNew);

fs.writeFileSync('src/utils/Ocrextractor.js', content);
console.log("Regexes patched!");
