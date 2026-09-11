const fs = require('fs');
const path = 'src/components/LeadForm.jsx';
let content = fs.readFileSync(path, 'utf8');

// The dynamic fields filter currently is:
// const contactKeys = ['mobile', 'email', 'state', 'city', 'postcode', 'district'];
// We want to make it:
// const contactKeys = ['mobile', ...(isAU ? ['email'] : []), 'state', 'city', 'postcode', 'district'];

const oldDynamicKeys = "const contactKeys = ['mobile', 'email', 'state', 'city', 'postcode', 'district'];";
const newDynamicKeys = "const contactKeys = ['mobile', ...(isAU ? ['email'] : []), 'state', 'city', 'postcode', 'district'];";

if(content.includes(oldDynamicKeys)) {
    // There are two occurrences of this (one for contactFields, one for otherFields filtering)
    content = content.split(oldDynamicKeys).join(newDynamicKeys);
    fs.writeFileSync(path, content);
    console.log("Successfully removed email from contactKeys for India (dynamic fields).");
} else {
    console.log("Could not find dynamic contactKeys string.");
}
