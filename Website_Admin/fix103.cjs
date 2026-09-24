const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

// Use a fallback-safe regex to append renderRegexContext
code = code.replace(
    /(\<span className\="text-green-600 font-bold"\>.*?<\/span>\})([\s\n]+<\/div>)/,
    '$1\n                                {renderRegexContext(rule.regex)}$2'
);

fs.writeFileSync(path, code);
console.log("Successfully injected renderRegexContext!");
