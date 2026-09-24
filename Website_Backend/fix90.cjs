const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/utils/templateExtractor.js';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
    "const templates = await BillTemplate.find({ country: countryContext, isActive: true, status: 'approved' });",
    "const templates = await BillTemplate.find({ country: countryContext, isActive: true });"
);

fs.writeFileSync(path, code);
console.log("Removed status: 'approved' filter from templateExtractor.js!");
