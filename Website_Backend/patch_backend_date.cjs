const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
    "dueDate:       '([0-9]{1,2}\\\\s+[A-Za-z]{3,9}\\\\s+[0-9]{2,4})',",
    "dueDate:       '([0-9]{1,2}\\\\s+[A-Za-z]{3,9}\\\\s+[0-9]{2,4}|[0-9]{1,2}[-/][0-9]{1,2}[-/][0-9]{2,4})',"
);

fs.writeFileSync(file, code);
console.log("Patched dueDate regex");
