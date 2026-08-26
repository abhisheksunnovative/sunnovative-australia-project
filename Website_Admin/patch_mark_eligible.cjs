const fs = require('fs');
const file = 'src/components/bde/BDELeadManagement.jsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /headers: \{ "Content-Type": "application\/json" \}\s*\}/;
const replacement = `headers: { "Content-Type": "application/json" },\n                              body: JSON.stringify({ isEligibleForInstallation: true })\n                            }`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync(file, code);
  console.log("Patched mark-eligible API call!");
}
