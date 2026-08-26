const fs = require('fs');
const file = 'src/components/bde/BDEProspects.jsx';
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

let idx = -1;
for(let i = 250; i < lines.length; i++) {
   if(lines[i].includes('</button>')) {
      idx = i;
      break;
   }
}

if (idx > -1) {
  for (let i = idx; i < idx + 15; i++) {
     console.log(i, lines[i]);
  }
}
