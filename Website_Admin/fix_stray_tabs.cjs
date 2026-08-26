const fs = require('fs');
const file = 'src/components/bde/BDELeadManagement.jsx';
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

let idx = -1;
for (let i = 0; i < lines.length; i++) {
   if (lines[i].includes('Assigned Leads ({websiteLeads.length})') && i < 750) {
       idx = i - 4; // Start of the <div className="flex items-center gap-2"> that I mistakenly injected
       break;
   }
}

if (idx > -1) {
    // Delete the 13 lines I injected
    lines.splice(idx, 14, '                        {isFreelancer ? (');
    
    fs.writeFileSync(file, lines.join('\n'));
    console.log('Fixed stray tabs!');
} else {
    console.log('Not found');
}
