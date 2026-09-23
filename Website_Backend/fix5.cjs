const fs = require('fs');
const p = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(p, 'utf8');

const oldRegex = '{ field: "tariffCategory", regex: "(?:Tariff(?:\\\\s*:|\\\\s*-)?\\\\s+|Your\\\\s*Current\\\\s*Agreement\\\\s*:\\\\s*\\\\n?\\\\s*|Current\\\\s*Account\\\\s*Charges\\\\s*\\\\n\\\\s*)([^\\\\n]{4,30})", type: "string", required: false },';
const newRegex = '{ field: "tariffCategory", regex: "(?:Your\\\\s*tariff\\\\s*:\\\\s*|Tariff(?:\\\\s*:|\\\\s*-)?\\\\s+|Current\\\\s*Account\\\\s*Charges\\\\s*\\\\n\\\\s*)([^\\\\n]{4,30})", type: "string", required: false },';

if (code.includes(oldRegex)) {
  code = code.replace(oldRegex, newRegex);
  fs.writeFileSync(p, code);
  console.log('Successfully patched billTemplateController.js');
} else {
  console.log('Regex not found. Writing debug info:');
  console.log(code.substring(code.indexOf('tariffCategory') - 50, code.indexOf('tariffCategory') + 200));
}
