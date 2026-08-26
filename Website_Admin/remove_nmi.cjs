const fs = require('fs');
const file = 'src/components/bde/BDELeadManagement.jsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /<div className="bg-slate-50 p-2\.5 rounded-xl border border-slate-200">[\s\S]*?NMI \/ Acc #[\s\S]*?<\/div>\s*<\/div>/;

if (code.match(regex)) {
  code = code.replace(regex, '');
  fs.writeFileSync(file, code);
  console.log("NMI Box removed via regex!");
} else {
  console.log("Regex not found");
}
