const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/utils/RegexDictionary.js';
let code = fs.readFileSync(path, 'utf8');

// Replace {0,40} and {0,30} and {0,80} with {0,200}
code = code.replace(/\[\\s\\S\]\{0,30\}\?/g, '[\\s\\S]{0,150}?');
code = code.replace(/\[\\s\\S\]\{0,40\}\?/g, '[\\s\\S]{0,200}?');
code = code.replace(/\[\\s\\S\]\{0,80\}\?/g, '[\\s\\S]{0,200}?');

const targetName = '"(?:[Cc]ustomer|[Aa]ccount\\\\s*[Hh]older|[Aa]ccount\\\\s*[Nn]ame)\\\\s*[:\\\\-]?\\\\s*([A-Z][a-z]+(?:\\\\s+[A-Z][a-z]+){1,3})(?=\\\\s*(?:Supply|Account|NMI|$))"';
const replacementName = '"(?:[Cc]ustomer|[Aa]ccount\\\\s*[Hh]older|[Aa]ccount\\\\s*[Nn]ame)\\\\s*[:\\\\-]?\\\\s*([A-Z][A-Za-z]+\\\\s+[A-Z][A-Za-z]+(?:\\\\s+[A-Z][A-Za-z]+)?)"';
code = code.replace(targetName, replacementName);

const targetTariff = '"(?:Your\\\\s*tariff\\\\s*:\\\\s*|Tariff(?:\\\\s*:|\\\\s*-)?\\\\s+|Current\\\\s*Account\\\\s*Charges\\\\s*\\\\n\\\\s*)([A-Za-z0-9\\\\s\\\\/\\\\-]+?)(?=\\\\s+Period\\\\b|\\\\n|$)"';
const replacementTariff = '"(?:Your\\\\s*tariff\\\\s*:\\\\s*|Tariff(?:\\\\s*:|\\\\s*-)?\\\\s+|Current\\\\s*Account\\\\s*Charges\\\\s*\\\\n\\\\s*)([A-Za-z0-9\\\\/\\\\- ]+?)(?=\\\\s+Period\\\\b|\\\\n|\\\\r|$)"';
code = code.replace(targetTariff, replacementTariff);

fs.writeFileSync(path, code);
console.log("Patched RegexDictionary.js securely!");
