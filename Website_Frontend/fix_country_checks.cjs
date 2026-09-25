const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Frontend/src/components/LeadForm.jsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/data\.country === "australia"/g, `(getCountryCode() === "australia" || data.country === "australia")`);

fs.writeFileSync(path, code);
console.log("Fixed remaining data.country checks");
