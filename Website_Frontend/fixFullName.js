import fs from 'fs';
let content = fs.readFileSync('src/components/LeadForm.jsx', 'utf8');

const regex = /if\s*\(ex\.consumerName\)\s*setFullName\(ex\.consumerName\);/m;
const newCode = `if (ex.fullName || ex.consumerName || ex.customerName) setFullName(ex.fullName || ex.consumerName || ex.customerName);`;

if (regex.test(content)) {
    content = content.replace(regex, newCode);
    fs.writeFileSync('src/components/LeadForm.jsx', content);
    console.log("Fixed fullName mapping in LeadForm!");
} else {
    console.log("Could not find ex.consumerName mapping.");
}
