const fs = require('fs');
let text = fs.readFileSync('Website_Admin/src/components/bde/BDEDemandPool.jsx', 'utf-8');
text = text.replace("Check 'My Leads'", "Check 'My Prospects'");
fs.writeFileSync('Website_Admin/src/components/bde/BDEDemandPool.jsx', text);
console.log('Fixed');
