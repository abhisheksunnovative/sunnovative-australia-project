import fs from 'fs';
let content = fs.readFileSync('src/components/LeadForm.jsx', 'utf8');

const regex = /const dynamicFields = \[\.\.\.formSettings\.fields\.filter\(f => f\.key !== 'billFile'\)\];/m;
const newCode = `const dynamicFields = [...formSettings.fields.filter(f => f.key !== 'billFile')];
                    
                    // Force inject missing critical contact fields
                    if (!dynamicFields.find(f => f.key === 'customerState' || f.key === 'state')) dynamicFields.unshift({ label: 'State', key: 'customerState', type: 'select', required: true });
                    if (!dynamicFields.find(f => f.key === 'city')) dynamicFields.unshift({ label: 'City', key: 'city', type: 'text', required: true });
                    if (getCountryCode() !== 'india' && !dynamicFields.find(f => f.key === 'email')) dynamicFields.unshift({ label: 'Email', key: 'email', type: 'email', required: false });
                    if (!dynamicFields.find(f => f.key === 'mobileNumber' || f.key === 'mobile')) dynamicFields.unshift({ label: 'Mobile Number', key: 'mobileNumber', type: 'tel', required: true });`;

if (regex.test(content)) {
    content = content.replace(regex, newCode);
    
    // Also fix contactKeys to ensure email is always searched if we injected it
    const regex2 = /const contactKeys = \['mobile', \.\.\.\(isAU \? \['email'\] : \[\]\), 'state', 'city', 'postcode', 'district'\];/m;
    const newCode2 = `const contactKeys = ['mobile', 'email', 'state', 'city', 'postcode', 'district'];`;
    if (regex2.test(content)) {
        content = content.replace(regex2, newCode2);
    }
    
    fs.writeFileSync('src/components/LeadForm.jsx', content);
    console.log("Injected contact fields into dynamic form!");
} else {
    console.log("Could not find dynamicFields mapping.");
}
