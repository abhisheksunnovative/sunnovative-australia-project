const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/models/BillTemplate.js';
let code = fs.readFileSync(path, 'utf8');

// Remove status field
code = code.replace(/\s*status:\s*\{\s*type:\s*String,\s*enum:.*?\},/, '');

// Set isActive default to true
code = code.replace(/isActive:\s*\{\s*type:\s*Boolean,\s*default:\s*false\s*\}/, 'isActive: { type: Boolean, default: true }');

fs.writeFileSync(path, code);
console.log("Simplified BillTemplate Schema!");
