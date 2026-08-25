const fs = require('fs');

let c = fs.readFileSync('src/components/bde/BDEDashboard.jsx', 'utf8');

// Fix "GLOBAL" to actual country
c = c.replace('<h3 className="text-xl font-black text-slate-900 mt-0.5">GLOBAL</h3>', '<h3 className="text-xl font-black text-slate-900 mt-0.5 uppercase">{bdeData?.country || "INDIA"}</h3>');

// Fix Commission Per Lead visibility
const targetStart = '{/* PROJECT TYPES CARDS (REPLACING ANY OLD METRICS / STC) */}';
if (c.includes(targetStart)) {
  const startIndex = c.indexOf(targetStart);
  
  // Find where this div ends. It ends right before {/* Recent Activity */} or the end of the return statement.
  // Actually, let's just find the exact block.
  const endMarker = '<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 mt-6">';
  const endIndex = c.indexOf(endMarker);
  
  if (startIndex !== -1 && endIndex !== -1 && !c.includes('{isFreelancer && (\n      <div>\n        <h3 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">')) {
    
    // We want to replace `{/* PROJECT TYPES CARDS (REPLACING ANY OLD METRICS / STC) */}\n      <div>`
    // with `{isFreelancer && (\n        <div>`
    
    // Let's do it carefully with regex or slice.
    const block = c.substring(startIndex, endIndex);
    const wrappedBlock = `{isFreelancer && (\n${block}\n      )}\n\n      `;
    
    c = c.substring(0, startIndex) + wrappedBlock + c.substring(endIndex);
  }
}

fs.writeFileSync('src/components/bde/BDEDashboard.jsx', c);
