const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
    /create Regex extraction rules.*?consumerName/is,
    (match) => match.replace('consumerName', 'fullName')
);

fs.writeFileSync(path, code);
console.log("Patched Gemini prompt for fullName!");
