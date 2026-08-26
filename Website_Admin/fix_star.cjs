const fs = require('fs');
const file = 'src/components/bde/BDELeadManagement.jsx';
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

let idx = lines.findIndex(l => l.includes('⭐ {epc.rating || 4.9}'));

if (idx > -1) {
    // Find where the <div className="flex items-start justify-between gap-2"> starts
    let startIdx = idx - 1;
    while(startIdx > 0 && !lines[startIdx].includes('<div className="flex items-start justify-between gap-2">')) {
       startIdx--;
    }

    let replacement = `                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={\`w-5 h-5 rounded-full flex items-center justify-center border text-xs font-bold \${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-transparent'}\`}>
                            {isSelected ? '✓' : ''}
                          </span>
                          <h4 className="font-black text-slate-900 text-base">{epc.name || epc.companyName}</h4>
                        </div>
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-black rounded-lg shrink-0">
                          ⭐ {epc.rating || 4.9}
                        </span>
                      </div>`;
    
    // Let's just remove from startIdx to idx + 1 and insert replacement
    lines.splice(startIdx, (idx + 1 - startIdx + 1), replacement);
    fs.writeFileSync(file, lines.join('\n'));
    console.log('Fixed BDELeadManagement star bug!');
}
