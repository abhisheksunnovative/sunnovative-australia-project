const fs = require('fs');

let c = fs.readFileSync('../Website_Backend/src/controllers/leadController.js', 'utf8');

const oldUploadSource = `uploadSource: 'bde_manual',`;
const newUploadSource = `uploadSource: req.body.bdeId ? 'bde_manual' : 'admin_manual',
        assignedTo: req.body.bdeId ? req.body.bdeId : undefined,`;

if (c.includes(oldUploadSource)) {
  c = c.replace(oldUploadSource, newUploadSource);
  fs.writeFileSync('../Website_Backend/src/controllers/leadController.js', c);
  console.log("Patched leadController bdeId assignment!");
} else {
  console.log("Could not find target in leadController");
}
