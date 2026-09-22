import fs from 'fs';
let content = fs.readFileSync('src/components/LeadForm.jsx', 'utf8');

const hackRegex = /meterCategory:\s*ex\.tariffCategory\s*\|\|\s*ex\.meterCategory\s*\|\|\s*meterCategory,/m;
const original = 'meterCategory: ex.meterCategory || meterCategory,';

if (hackRegex.test(content)) {
    content = content.replace(hackRegex, original);
    fs.writeFileSync('src/components/LeadForm.jsx', content);
    console.log("Reverted frontend hack.");
} else {
    console.log("Frontend hack not found.");
}
