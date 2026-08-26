const fs = require('fs');
const file = 'src/components/bde/BDEProspects.jsx';
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

let idx = -1;
for (let i = 0; i < lines.length; i++) {
   if (lines[i].includes('Move to Order Journey')) {
       idx = i;
   }
}

if (idx !== -1) {
    let endIdx = -1;
    for (let i = idx; i < lines.length; i++) {
        if (lines[i].includes(')}')) {
            endIdx = i;
            break;
        }
    }
    
    if (endIdx !== -1) {
        // delete until we see {bookingLead && (
        let bookingIdx = -1;
        for (let i = endIdx; i < lines.length; i++) {
            if (lines[i].includes('{bookingLead && (')) {
               bookingIdx = i;
               break;
            }
        }

        if (bookingIdx !== -1) {
             lines.splice(endIdx + 1, bookingIdx - endIdx - 1, 
                '                </div>',
                '              </div>',
                '            </div>',
                '          ))}',
                '        </div>',
                '      )}'
             );
             fs.writeFileSync(file, lines.join('\n'));
             console.log('Fixed properly!');
        }
    }
}
