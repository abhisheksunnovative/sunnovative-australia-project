const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

// The line is: isActive: true,
// We want to add: status: 'approved',
code = code.replace(/isActive: true,/g, "isActive: true,\n      status: 'approved',");

// Also replace inside editing existing template
code = code.replace(/isActive: template.isActive,/g, "isActive: true,\n          status: 'approved',");

fs.writeFileSync(path, code);
console.log("Patched BillTemplateManagementScreen.jsx to send status: 'approved'");
