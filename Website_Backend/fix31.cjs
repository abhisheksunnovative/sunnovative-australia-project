const fs = require('fs');

const dictPath = 'd:/sunnovative-australia-website/Website_Backend/src/utils/RegexDictionary.js';
let dict = fs.readFileSync(dictPath, 'utf8');

const oldTariff = 'tariffCategory: "(?:Your\\s*tariff\\s*:\\s*|Tariff(?:\\s*:|\\s*-)?\\s+|Current\\s*Account\\s*Charges\\s*\\n\\s*)([^\\n]{4,30})"';
const newTariff = 'tariffCategory: "(?:Your\\s*tariff\\s*:\\s*|Tariff(?:\\s*:|\\s*-)?\\s+|Current\\s*Account\\s*Charges\\s*\\n\\s*)([A-Za-z0-9\\s\\/\\-]+?)(?=\\s+Period\\b|\\n|$)"';

if (dict.includes(oldTariff)) {
  dict = dict.replace(oldTariff, newTariff);
  fs.writeFileSync(dictPath, dict);
  console.log('Fixed Tariff RegexDictionary!');
} else {
  // Try CRLF
  const oldTariff2 = 'tariffCategory: "(?:Your\\\\s*tariff\\\\s*:\\\\s*|Tariff(?:\\\\s*:|\\\\s*-)?\\\\s+|Current\\\\s*Account\\\\s*Charges\\\\s*\\\\n\\\\s*)([^\\\\n]{4,30})"';
  const newTariff2 = 'tariffCategory: "(?:Your\\\\s*tariff\\\\s*:\\\\s*|Tariff(?:\\\\s*:|\\\\s*-)?\\\\s+|Current\\\\s*Account\\\\s*Charges\\\\s*\\\\n\\\\s*)([A-Za-z0-9\\\\s\\\\/\\\\-]+?)(?=\\\\s+Period\\\\b|\\\\n|$)"';
  if (dict.includes(oldTariff2)) {
      dict = dict.replace(oldTariff2, newTariff2);
      fs.writeFileSync(dictPath, dict);
      console.log('Fixed Tariff RegexDictionary! (escaped)');
  } else {
      console.log('Tariff string not found');
  }
}
