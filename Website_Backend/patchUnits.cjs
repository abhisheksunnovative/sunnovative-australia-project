const fs = require('fs');

const file = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let code = fs.readFileSync(file, 'utf8');

const regex = /quarterlyKwh: \(ed\.quarterlyKwh \|\| baseParsed\.quarterlyKwh\),\s*monthlyUnits: ed\.monthlyUnits \|\| baseParsed\.monthlyUnitsUsed,/;

const newCode = `...(isAU ? { quarterlyKwh: ed.quarterlyKwh || ed.monthlyUnits || baseParsed.quarterlyKwh } : {}),
            ...(!isAU ? { monthlyUnits: ed.monthlyUnits || ed.quarterlyKwh || baseParsed.monthlyUnitsUsed || baseParsed.quarterlyKwh } : {}),`;

code = code.replace(regex, newCode);
fs.writeFileSync(file, code);
console.log("Patched country-specific units logic in lightBillScanController.js");
