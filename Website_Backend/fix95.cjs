const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
    'let captureGroup = "([A-Za-z0-9\\\\s.&-]{2,50})"; // Generic string',
    'let captureGroup = "([^\\\\n\\\\r]{2,80}?)"; // Generic string'
);

fs.writeFileSync(path, code);
console.log("Successfully fixed generic capture group to allow parentheses!");
