const fs = require('fs');

let c = fs.readFileSync('../Website_Backend/src/controllers/leadController.js', 'utf8');

const oldAssignedTo = `assignedTo: req.body.bdeId ? req.body.bdeId : undefined,`;
const newAssignedTo = `assignedBde: req.body.bdeId ? req.body.bdeId : undefined,`;

if (c.includes(oldAssignedTo)) {
  c = c.replace(oldAssignedTo, newAssignedTo);
  fs.writeFileSync('../Website_Backend/src/controllers/leadController.js', c);
  console.log("Patched leadController to use assignedBde!");
} else {
  console.log("Could not find target in leadController");
}
