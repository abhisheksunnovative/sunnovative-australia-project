import fs from 'fs';
let content = fs.readFileSync('src/components/LeadForm.jsx', 'utf8');

const regexKeys = /setScanConfidence\(data\.confidence\);\s*const ex = data\.extracted;/m;
const newKeys = 'setScanConfidence(data.confidence || data.confidenceScore);\n      const ex = data.extracted || data.extractedData || {};';

if (regexKeys.test(content)) {
    content = content.replace(regexKeys, newKeys);
    fs.writeFileSync('src/components/LeadForm.jsx', content);
    console.log("Fixed keys properly with regex!");
} else {
    console.log("Regex didn't match! Current string is:");
    console.log(content.substring(content.indexOf('setScanConfidence'), content.indexOf('setScanConfidence') + 100));
}
