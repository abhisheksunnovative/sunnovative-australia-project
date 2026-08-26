const fs = require('fs');
const file = 'src/components/bde/BDELeadManagement.jsx';
let code = fs.readFileSync(file, 'utf8');

// Replace "Self-Sourced Leads ({manualLeads.length})" with a dynamic label based on filterTab
const oldToggle = /Self-Sourced Leads \(\{manualLeads\.length\}\)/g;
const newToggle = `{filterTab === 'eligibility' ? 'Customer Eligibility' : 'Self-Sourced Leads'} ({manualLeads.length})`;

if (code.match(oldToggle)) {
  code = code.replace(oldToggle, newToggle);
  console.log("Renamed tab based on filterTab");
} else {
  console.log("Could not rename tab");
}

fs.writeFileSync(file, code);
