const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
    'fieldName: fieldName,\n        selectionIndex: selectionIndex',
    'fieldName: fieldName,\n        selectionIndex: selectionIndex,\n        ruleType: formData.extractionRules[index].type'
);

code = code.replace(
    'fieldName: fieldName,\n        override: {',
    'fieldName: fieldName,\n        ruleType: rule.type,\n        override: {'
);

code = code.replace(
    '<option value="number">Number</option>\n                            <option value="date">Date</option>',
    '<option value="number">Number</option>\n                            <option value="date">Date</option>\n                            <option value="split-currency">Split Currency (Rs + Paise)</option>'
);

fs.writeFileSync(file, code);
console.log("Patched frontend for Split Currency");
