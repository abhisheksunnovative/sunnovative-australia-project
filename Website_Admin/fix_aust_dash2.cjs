const fs = require('fs');

let c = fs.readFileSync('src/components/bde/BDEAustDashboard.jsx', 'utf8');

const commStartStr = '{/* PROJECT TYPES CARDS REPLACING STC */}';

if (c.includes(commStartStr) && !c.includes('{isFreelancer && (\n      <div>\n        <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">\n          <Zap')) {
  const parts1 = c.split(commStartStr);
  if (parts1.length === 2) {
    const endStr = '    </div>\n  );\n}';
    const parts2 = parts1[1].split(endStr);
    if (parts2.length >= 2) {
      const commissionBlock = parts2[0];
      // Note: The commissionBlock ends with `      </div>\n\n`
      // Let's trim and wrap
      const wrappedBlock = `\n      {isFreelancer && (${commissionBlock}      )}\n\n`;
      
      c = parts1[0] + commStartStr + wrappedBlock + endStr;
    }
  }
}

fs.writeFileSync('src/components/bde/BDEAustDashboard.jsx', c);
