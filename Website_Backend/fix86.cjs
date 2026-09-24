const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("model: 'gemini-1.5-flash'", "model: 'gemini-pro'");
code = code.replace("model: 'gemini-3.6-flash'", "model: 'gemini-pro'");

fs.writeFileSync(path, code);
console.log("Switched Gemini model to gemini-pro!");
