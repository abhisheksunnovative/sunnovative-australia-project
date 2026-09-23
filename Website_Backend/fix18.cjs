const fs = require('fs');

const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let file = fs.readFileSync(path, 'utf8');

const oldStr = "meterCategory: (countryContext === 'australia' ? (merged.tariffCategory || \"\") : (merged.meterTypeInfo || merged.tariffCategory || \"\")),";
const newStr = "meterCategory: (countryContext === 'australia' ? (ed.meterCategory || baseParsed.meterType || baseParsed.meterCategory || merged.tariffCategory || \"\") : (ed.meterCategory || merged.meterTypeInfo || merged.tariffCategory || \"\")),";

if (file.includes(oldStr)) {
  file = file.replace(oldStr, newStr);
  fs.writeFileSync(path, file);
  console.log('lightBillScanController meterCategory updated');
} else {
  console.log('Could not find oldStr');
}
