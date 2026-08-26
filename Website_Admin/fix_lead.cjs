const fs = require('fs');
const file = 'src/components/bde/BDELeadManagement.jsx';
let code = fs.readFileSync(file, 'utf8');

// I will overwrite Col 4
const oldCol4Start = '{/* Col 4: Actions */}';
const c4StartIdx = code.indexOf(oldCol4Start);

if(c4StartIdx !== -1) {
   const nextMapEnd = code.indexOf('))}', c4StartIdx);
   // We slice from c4StartIdx to nextMapEnd, wait, there are a few </div> before ))}
   // Let's just find the exact block and replace it.
}

