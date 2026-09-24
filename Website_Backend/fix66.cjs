const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/\{ field: "consumerName", regex: AU_DICT\.namePatterns\.join\('\|'\)/, '{ field: "fullName", regex: AU_DICT.namePatterns.join(\'|\')');

fs.writeFileSync(path, code);
console.log("Patched billTemplateController.js to output fullName instead of consumerName!");
