const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

// Append country to FormData for auto-generate
code = code.replace(
    "fd.append('billFile', file);",
    "fd.append('billFile', file);\n      fd.append('country', formData.country);"
);

fs.writeFileSync(path, code);
console.log("Appended country to auto-generate request!");
