import fs from 'fs';
let content = fs.readFileSync('src/controllers/lightBillScanController.js', 'utf8');

const regexMap = /meterCategory:\s*merged\.meterTypeInfo\s*\|\|\s*"",/m;
const newMap = `meterCategory: (countryContext === 'australia' ? (merged.tariffCategory || "") : (merged.meterTypeInfo || merged.tariffCategory || "")),`;

if (regexMap.test(content)) {
    content = content.replace(regexMap, newMap);
    fs.writeFileSync('src/controllers/lightBillScanController.js', content);
    console.log("Canonical mapping updated in scan controller.");
} else {
    console.log("Could not find meterCategory mapping in scan controller.");
}
