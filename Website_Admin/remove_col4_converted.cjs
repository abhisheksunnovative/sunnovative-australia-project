const fs = require('fs');

let c = fs.readFileSync('src/components/bde/BDELeadManagement.jsx', 'utf8');

const startStr = '{lead.status === "Converted" ? (';
const fallbackStr = ') : isFreelancer ? (';

if (c.includes(startStr) && c.includes(fallbackStr)) {
  const parts1 = c.split(startStr);
  const remaining = parts1[1];
  const parts2 = remaining.split(fallbackStr);
  
  c = parts1[0] + '{isFreelancer ? (' + parts2.slice(1).join(fallbackStr);
  fs.writeFileSync('src/components/bde/BDELeadManagement.jsx', c);
  console.log('Removed Converted block from Col 4!');
} else {
  console.log('Could not find strings.');
}
