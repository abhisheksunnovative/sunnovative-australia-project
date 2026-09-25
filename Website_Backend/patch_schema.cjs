const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Backend/src/models/BillTemplate.js';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `    type: { type: String, enum: ['string', 'number', 'date', 'boolean'], default: 'string' },
    required: { type: Boolean, default: false }`;

const replacement = `    type: { type: String, enum: ['string', 'number', 'date', 'boolean', 'split-currency'], default: 'string' },
    required: { type: Boolean, default: false },
    heading: { type: String, default: '' },
    mainData: { type: String, default: '' },
    trailing: { type: String, default: '' }`;

code = code.replace(targetStr, replacement);
fs.writeFileSync(file, code);
console.log("Patched BillTemplate schema");
