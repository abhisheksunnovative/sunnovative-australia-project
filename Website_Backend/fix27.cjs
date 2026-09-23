const fs = require('fs');
const fileP = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillEligibilityController.js';
let file = fs.readFileSync(fileP, 'utf8');

const oldStr = `      overrideKw,     // Optional: custom kW requested by user
      billDate, // from OCR

    } = req.body;`;

const newStr = `      overrideKw,     // Optional: custom kW requested by user
      billDate, // from OCR
      criticalFieldsConfirmed,

    } = req.body;
    
    // Fix: Block Safety Gate explicitly
    if (criticalFieldsConfirmed === false) {
       return res.status(200).json({
          isEligible: false,
          reasons: ['Bill is too old or expired. Recommendations blocked.'],
          suggestedKW: 0,
          subsidy: { central: 0, state: 0, total: 0 },
          message: "Please upload a recent bill to view accurate recommendations."
       });
    }`;

file = file.replace(oldStr, newStr);
file = file.replace(oldStr.replace(/\n/g, '\r\n'), newStr.replace(/\n/g, '\r\n'));
fs.writeFileSync(fileP, file);
console.log('Fixed Eligibility check for criticalFieldsConfirmed');
