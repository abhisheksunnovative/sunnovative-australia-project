const fs = require('fs');

// 1. Add logs to handleBulkUpload
let unified = fs.readFileSync('src/components/UnifiedAddLeadModal.jsx', 'utf8');
unified = unified.replace(
  `const handleBulkUpload = async () => {`,
  `const handleBulkUpload = async () => {\n    console.log("Starting bulk upload... bdeId:", bdeId);`
);
unified = unified.replace(
  `const data = await res.json();`,
  `const data = await res.json();\n      console.log("Bulk upload response:", data);`
);
fs.writeFileSync('src/components/UnifiedAddLeadModal.jsx', unified);

// 2. Add logs to BDELeadManagement
let bdeLead = fs.readFileSync('src/components/bde/BDELeadManagement.jsx', 'utf8');
bdeLead = bdeLead.replace(
  `const baseLeads = leads.filter`,
  `console.log("Total leads fetched:", leads.length);\n  const baseLeads = leads.filter`
);
bdeLead = bdeLead.replace(
  `const manualLeads = baseLeads.filter(l => l.history?.some(h => h.action.includes("Manually created by BDE")));`,
  `const manualLeads = baseLeads.filter(l => l.history?.some(h => h.action.includes("Manually created by BDE")));\n  console.log("Manual leads count:", manualLeads.length);`
);
fs.writeFileSync('src/components/bde/BDELeadManagement.jsx', bdeLead);

console.log("Added frontend logs!");
