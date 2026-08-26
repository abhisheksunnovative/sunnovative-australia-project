const fs = require('fs');
let layout = fs.readFileSync('../Website_Admin/src/components/bde/BDELayout.jsx', 'utf8');
layout = layout.replace('id: "customer-eligibility"', 'id: "bde-customer-eligibility"');
fs.writeFileSync('../Website_Admin/src/components/bde/BDELayout.jsx', layout);

let app = fs.readFileSync('../Website_Admin/src/App.jsx', 'utf8');
app = app.replace(
  'case "bde-leads":\n        return <BDELeadManagement bdeId={userId} country={userCountry} bdeType={bdeType} />;',
  `case "bde-customer-eligibility":\n        return <BDELeadManagement bdeId={userId} country={userCountry} bdeType={bdeType} filterTab="eligibility" />;\n      case "bde-leads":\n        return <BDELeadManagement bdeId={userId} country={userCountry} bdeType={bdeType} filterTab="self-leads" />;`
);
fs.writeFileSync('../Website_Admin/src/App.jsx', app);
console.log("Patched correctly with bde-customer-eligibility!");
