const fs = require('fs');
const file = 'src/components/bde/BDEProspects.jsx';
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

lines.splice(262, 1);

fs.writeFileSync(file, lines.join('\n'));
console.log('Fixed line 263!');
