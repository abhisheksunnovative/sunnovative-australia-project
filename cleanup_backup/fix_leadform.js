const fs = require('fs');
const path = 'Website_Frontend/src/components/LeadForm.jsx';
let text = fs.readFileSync(path, 'utf8');

text = text.replace(
  'if (ex.meterCategory)  setMeterCategory(ex.meterCategory);',
  'if (ex.meterCategory)  setMeterCategory(ex.meterCategory);\n      if (ex.tariffType) setMeterCategory(ex.tariffType);'
);

fs.writeFileSync(path, text);
console.log("Updated LeadForm meterCategory logic");
