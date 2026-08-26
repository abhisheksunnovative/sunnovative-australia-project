const fs = require('fs');
const file = 'src/components/bde/BDELeadManagement.jsx';
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

let idx = lines.findIndex(l => l.includes('⭐ {epc.rating || 4.9}'));
// check lines[idx+2]
if (lines[idx+2].includes('</div>')) {
   lines.splice(idx+2, 1);
   fs.writeFileSync(file, lines.join('\n'));
   console.log('Fixed extra div!');
}
