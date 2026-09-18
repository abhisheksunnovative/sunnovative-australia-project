const fs = require('fs');
let code = fs.readFileSync('Website_Admin/src/components/UnifiedAddLeadModal.jsx', 'utf8');
code = code.replace(
  'state: existingLead?.state || (isAU ? "New South Wales" : "Gujarat"),',
  'state: existingLead?.state || "",'
);
fs.writeFileSync('Website_Admin/src/components/UnifiedAddLeadModal.jsx', code);
