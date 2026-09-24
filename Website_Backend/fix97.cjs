const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/utils/templateExtractor.js';
let code = fs.readFileSync(path, 'utf8');

// Change finding templates to use sort by updatedAt
code = code.replace(
    'const templates = await BillTemplate.find({ country: countryContext, isActive: true });',
    'const templates = await BillTemplate.find({ country: countryContext, isActive: true }).sort({ updatedAt: -1 });'
);

fs.writeFileSync(path, code);
console.log("Fixed: templateExtractor now sorts by updatedAt descending to use newest templates.");
