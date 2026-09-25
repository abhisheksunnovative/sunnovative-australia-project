const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

const target = `const selection = sel.toString();`;
const replacement = `let selection = sel.toString();
    // Clean up invisible characters that PDF.js text layer often injects
    selection = selection.replace(/[\\u200B-\\u200D\\uFEFF]/g, '').trim();`;

code = code.replace(target, replacement);

fs.writeFileSync(path, code);
console.log("Cleaned up selection text from PDF.js artifacts.");
