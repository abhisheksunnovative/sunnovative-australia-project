const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
    "fd.append('billFile', file);\n      fd.append('country', formData.country);",
    "fd.append('country', formData.country);\n      fd.append('billFile', file);"
);

fs.writeFileSync(path, code);
console.log("Fixed FormData append order.");
