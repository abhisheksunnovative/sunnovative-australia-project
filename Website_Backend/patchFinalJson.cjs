const fs = require('fs');

const file = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let code = fs.readFileSync(file, 'utf8');

const regex = /console\.log\('\[BillScan\] Success! Final JSON:', finalJson\);/;
const newCode = `if (isAU) {
            delete finalJson.monthlyUnits;
        } else {
            delete finalJson.quarterlyKwh;
            if (finalJson.monthlyUnits && !finalJson.monthlyUnits) { // safety 
               finalJson.monthlyUnits = finalKwh;
            }
        }
        console.log('[BillScan] Success! Final JSON:', finalJson);`;

code = code.replace(regex, newCode);
fs.writeFileSync(file, code);
console.log("Patched finalJson output in lightBillScanController.js");
