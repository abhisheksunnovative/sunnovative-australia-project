const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Frontend/src/components/LeadForm.jsx';
let code = fs.readFileSync(path, 'utf8');

const oldEnd = `              )}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-6">`;

const newEnd = `              )}
            </div>
            )}

            <div className="pt-4 border-t border-slate-100 mt-6">`;

if (code.includes(oldEnd)) {
  code = code.replace(oldEnd, newEnd);
  fs.writeFileSync(path, code);
  console.log('Fixed syntax error in LeadForm.jsx');
} else if (code.includes(oldEnd.replace(/\n/g, '\r\n'))) {
  code = code.replace(oldEnd.replace(/\n/g, '\r\n'), newEnd.replace(/\n/g, '\r\n'));
  fs.writeFileSync(path, code);
  console.log('Fixed syntax error in LeadForm.jsx (CRLF)');
} else {
  console.log('Could not find the closing div of Block 4');
}
