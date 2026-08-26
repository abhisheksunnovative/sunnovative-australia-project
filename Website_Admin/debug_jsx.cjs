const fs = require('fs');
const file = 'src/components/bde/BDEProspects.jsx';
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

let idx = lines.findIndex(l => l.includes('Move to Order Journey'));
console.log("Move to Order Journey is at line:", idx);

if (idx > -1) {
  for (let i = idx; i < idx + 10; i++) {
     console.log(i, lines[i]);
  }
}
