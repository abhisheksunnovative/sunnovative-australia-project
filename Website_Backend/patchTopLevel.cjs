const fs = require('fs');

const file = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let code = fs.readFileSync(file, 'utf8');

const regex = /quarterlyKwh: finalKwh \|\| null,/;
const newCode = `...(isAU ? { quarterlyKwh: finalKwh || null } : { monthlyUnits: merged.monthlyUnits || null }),`;

code = code.replace(regex, newCode);
fs.writeFileSync(file, code);
console.log("Patched top-level response in lightBillScanController.js");
