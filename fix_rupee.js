const fs = require('fs');
const path = 'Website_Backend/src/controllers/lightBillEligibilityController.js';
let text = fs.readFileSync(path, 'utf8');

text = text.replace(/₹\$\{billAmount\}/g, "${currency}${billAmount}");
text = text.replace(/₹\$\{isEligibleCat/g, "${currency}${isEligibleCat");

fs.writeFileSync(path, text);
console.log("Replaced rupees with currency");
