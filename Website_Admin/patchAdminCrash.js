import fs from 'fs';

let content = fs.readFileSync('src/components/BillTemplateManagementScreen.jsx', 'utf8');

content = content.replace(
    'setTemplates(allTemplates.filter(t => \n        discomNamesInState.includes(t.discomName.toLowerCase().trim())\n      ));',
    'setTemplates(allTemplates.filter(t => \n        t.discomName && discomNamesInState.includes(t.discomName.toLowerCase().trim())\n      ));'
);

fs.writeFileSync('src/components/BillTemplateManagementScreen.jsx', content);
console.log("Admin UI crash fixed.");
