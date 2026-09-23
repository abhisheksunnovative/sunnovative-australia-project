const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillEligibilityController.js';
let code = fs.readFileSync(path, 'utf8');

const importStr = `    } = req.body;

    // Fix: Block Safety Gate explicitly
    if (criticalFieldsConfirmed === false) {`;

const newImportStr = `    } = req.body;

    // Define isBillTooOld helper
    const isBillTooOld = (dateStr, countryContext) => {
        if (!dateStr) return false;
        try {
            const parsed = new Date(dateStr);
            if (isNaN(parsed)) return false;
            const now = new Date();
            const diffMonths = (now.getFullYear() - parsed.getFullYear()) * 12 + (now.getMonth() - parsed.getMonth());
            const limit = countryContext === 'australia' ? 4 : 3;
            return diffMonths > limit;
        } catch(err) {
            return false;
        }
    };

    // If criticalFieldsConfirmed is true but they provided a manual billDate, verify it again
    const countryContext = req.headers['x-country'] === 'australia' || req.headers['x-country'] === 'au' ? 'australia' : 'india';
    
    if (criticalFieldsConfirmed !== false && billDate && isBillTooOld(billDate, countryContext)) {
       return res.status(200).json({
          isEligible: false,
          reasons: ['Bill is older than allowed limit — ask customer for a recent bill'],
          suggestedKW: 0,
          subsidy: { central: 0, state: 0, total: 0 }
       });
    }

    // Fix: Block Safety Gate explicitly
    if (criticalFieldsConfirmed === false) {`;

if (code.includes(importStr)) {
    code = code.replace(importStr, newImportStr);
} else if (code.includes(importStr.replace(/\n/g, '\r\n'))) {
    code = code.replace(importStr.replace(/\n/g, '\r\n'), newImportStr.replace(/\n/g, '\r\n'));
}

fs.writeFileSync(path, code);
console.log('Added isBillTooOld to lightBillEligibilityController');
