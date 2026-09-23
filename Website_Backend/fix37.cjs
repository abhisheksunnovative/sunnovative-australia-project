const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Frontend/src/components/LeadForm.jsx';
let code = fs.readFileSync(path, 'utf8');

const oldOnClick = `onClick={() => {
                           if (!manualBillDate) return alert("Please select a date first");
                           handleCheckEligibility({`;

const newOnClick = `onClick={() => {
                           if (!manualBillDate) return alert("Please select a date first");
                           setScanFallbackReason(null); // Clear so it shows the new response
                           handleCheckEligibility({`;

if (code.includes(oldOnClick)) {
  code = code.replace(oldOnClick, newOnClick);
} else if (code.includes(oldOnClick.replace(/\n/g, '\r\n'))) {
  code = code.replace(oldOnClick.replace(/\n/g, '\r\n'), newOnClick.replace(/\n/g, '\r\n'));
}

fs.writeFileSync(path, code);
console.log('Fixed UI button clear logic');
