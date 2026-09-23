const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Frontend/src/components/LeadForm.jsx';
let code = fs.readFileSync(path, 'utf8');

const oldStr = `) : (
            <div className="bg-amber-50/40 rounded-xl`;
const newStr = `) : (
            <>
            <div className="bg-amber-50/40 rounded-xl`;

if (code.includes(oldStr)) {
  code = code.replace(oldStr, newStr);
  console.log('Added <> to the else branch');
} else if (code.includes(oldStr.replace(/\n/g, '\r\n'))) {
  code = code.replace(oldStr.replace(/\n/g, '\r\n'), newStr.replace(/\n/g, '\r\n'));
  console.log('Added <> to the else branch (CRLF)');
}

fs.writeFileSync(path, code);
