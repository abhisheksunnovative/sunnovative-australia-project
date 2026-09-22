import fs from 'fs';
let content = fs.readFileSync('src/components/LeadForm.jsx', 'utf8');

const regexKeys = /meterCategory:\s*ex\.meterCategory\s*\|\|\s*meterCategory,/m;
const newKeys = 'meterCategory: ex.tariffCategory || ex.meterCategory || meterCategory,';

if (regexKeys.test(content)) {
    content = content.replace(regexKeys, newKeys);
    fs.writeFileSync('src/components/LeadForm.jsx', content);
    console.log("Fixed meterCategory fallback!");
} else {
    console.log("Regex didn't match!");
}
