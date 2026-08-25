const fs = require('fs');

function processDashboard(f) {
  let c = fs.readFileSync(f, 'utf8');
  
  // Move NEW COUNTRY CARD to top
  const ccStart = c.indexOf('{/* NEW COUNTRY CARD */}');
  if (ccStart > -1) {
    let ccEndStr = '<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">';
    let ccEnd = c.indexOf(ccEndStr);
    
    if (ccEnd > -1) {
      let block = c.substring(ccStart, ccEnd);
      c = c.substring(0, ccStart) + c.substring(ccEnd);
      
      let insertIdx = c.indexOf('{/* KPI CARDS */}');
      if (insertIdx === -1) {
          insertIdx = c.indexOf('{/* Target Progress Bars */}');
      }
      
      if (insertIdx > -1) {
        c = c.substring(0, insertIdx) + block + '\n      ' + c.substring(insertIdx);
      } else {
        console.log("Could not find insertion point for " + f);
      }
    }
  }
  
  fs.writeFileSync(f, c);
}

processDashboard('src/components/bde/BDEAustDashboard.jsx');
processDashboard('src/components/bde/BDEDashboard.jsx');
console.log("Done");
