const fs = require('fs');

let backend = fs.readFileSync('../Website_Backend/src/controllers/leadController.js', 'utf8');
backend = backend.replace(
  `export const uploadLeads = async (req, res) => {`,
  `export const uploadLeads = async (req, res) => {\n  console.log("=== BULK UPLOAD STARTED ===");\n  console.log("Body:", req.body);`
);
backend = backend.replace(
  `const inserted = await Lead.insertMany(leads, { ordered: false });`,
  `console.log("Attempting to insert:", leads.length, "leads");\n      const inserted = await Lead.insertMany(leads, { ordered: false });\n      console.log("Successfully inserted:", inserted.length);`
);
fs.writeFileSync('../Website_Backend/src/controllers/leadController.js', backend);

let bdeController = fs.readFileSync('../Website_Backend/src/controllers/bdeController.js', 'utf8');
bdeController = bdeController.replace(
  `export const getBDELeads = async (req, res) => {\n  try {\n    const leads = await Lead.find({ assignedBde: req.params.bdeId }).sort({ createdAt: -1 }).lean();`,
  `export const getBDELeads = async (req, res) => {\n  try {\n    const leads = await Lead.find({ assignedBde: req.params.bdeId }).sort({ createdAt: -1 }).lean();\n    console.log("getBDELeads fetched", leads.length, "for BDE", req.params.bdeId);`
);
fs.writeFileSync('../Website_Backend/src/controllers/bdeController.js', bdeController);

console.log("Added backend logs!");
