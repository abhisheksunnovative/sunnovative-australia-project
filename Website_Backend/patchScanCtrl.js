import fs from 'fs';

let content = fs.readFileSync('src/controllers/lightBillScanController.js', 'utf8');

content = content.replace(/city:\s*merged\.city\s*\|\|\s*'',/g, "");
content = content.replace(/district:\s*merged\.district\s*\|\|\s*'',/g, "");
content = content.replace(/postcode:\s*merged\.postcode\s*\|\|\s*'',/g, "");

fs.writeFileSync('src/controllers/lightBillScanController.js', content);
console.log("lightBillScanController updated to remove city, district, postcode");
