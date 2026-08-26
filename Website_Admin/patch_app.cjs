const fs = require('fs');
let file = fs.readFileSync('../Website_Admin/src/App.jsx', 'utf8');

if (!file.includes('case "customer-eligibility":')) {
  file = file.replace(
    'case "bde-leads":\n        return <BDELeadManagement bdeId={userId} country={userCountry} bdeType={bdeType} />;',
    `case "customer-eligibility":
        return <BDELeadManagement bdeId={userId} country={userCountry} bdeType={bdeType} filterTab="eligibility" />;
      case "bde-leads":
        return <BDELeadManagement bdeId={userId} country={userCountry} bdeType={bdeType} filterTab="self-leads" />;`
  );
  fs.writeFileSync('../Website_Admin/src/App.jsx', file);
  console.log("Patched App.jsx");
}
