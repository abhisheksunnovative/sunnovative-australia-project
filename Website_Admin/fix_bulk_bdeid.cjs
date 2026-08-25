const fs = require('fs');

let c = fs.readFileSync('src/components/UnifiedAddLeadModal.jsx', 'utf8');

const oldFormAppend = `form.append("uploadSource", isBDE ? "bde_manual" : "admin_manual");`;
const newFormAppend = `form.append("uploadSource", isBDE ? "bde_manual" : "admin_manual");
      if (isBDE && bdeId) form.append("bdeId", bdeId);`;

if (c.includes(oldFormAppend)) {
  c = c.replace(oldFormAppend, newFormAppend);
  fs.writeFileSync('src/components/UnifiedAddLeadModal.jsx', c);
  console.log("Patched UnifiedAddLeadModal bdeId!");
} else {
  console.log("Could not find target in UnifiedAddLeadModal");
}
