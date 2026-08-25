const fs = require('fs');

let c = fs.readFileSync('src/components/bde/BDELeadManagement.jsx', 'utf8');

const col3Start = '{/* Col 3: Status & Follow-up */}';
const col4Start = '{/* Col 4: Actions */}';

if (c.includes(col3Start) && c.includes(col4Start)) {
  const p1 = c.split(col3Start);
  if (p1.length === 2) {
    const p2 = p1[1].split(col4Start);
    if (p2.length >= 2) {
      c = p1[0] + col4Start + p2.slice(1).join(col4Start);
      fs.writeFileSync('src/components/bde/BDELeadManagement.jsx', c);
      console.log('Removed Col 3 successfully!');
    }
  }
}
