const fs = require('fs');
let bdeLead = fs.readFileSync('src/components/bde/BDELeadManagement.jsx', 'utf8');

bdeLead = bdeLead.replace(
  `  displayedLeads.sort((a, b) => { if (sortOrder === "date-desc") return new Date(b.createdAt) - new Date(a.createdAt);`,
  `  console.log("Displayed leads count:", displayedLeads.length, { filterStatus, projectTypeFilter, activeTab, isFreelancer });\n  displayedLeads.sort((a, b) => { if (sortOrder === "date-desc") return new Date(b.createdAt) - new Date(a.createdAt);`
);

fs.writeFileSync('src/components/bde/BDELeadManagement.jsx', bdeLead);
console.log("Added displayedLeads log!");
