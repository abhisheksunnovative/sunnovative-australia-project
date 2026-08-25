const fs = require('fs');

let c = fs.readFileSync('src/components/bde/BDELeadManagement.jsx', 'utf8');

const oldFilter = `const manualLeads = leads.filter(l => l.history?.some(h => h.action.includes("Manually created by BDE")));
  const websiteLeads = leads.filter(l => !l.history?.some(h => h.action.includes("Manually created by BDE")));`;

const newFilter = `const baseLeads = leads.filter(l => !l.installDateBooked && l.status !== 'Converted' && l.status !== 'Not Interested' && l.status !== 'Lost' && !l.convertedProjectId);
  const manualLeads = baseLeads.filter(l => l.history?.some(h => h.action.includes("Manually created by BDE")));
  const websiteLeads = baseLeads.filter(l => !l.history?.some(h => h.action.includes("Manually created by BDE")));`;

if (c.includes(oldFilter)) {
  c = c.replace(oldFilter, newFilter);
  fs.writeFileSync('src/components/bde/BDELeadManagement.jsx', c);
  console.log("Updated Lead Management filtering!");
} else {
  console.log("Could not find the old filter string in Lead Management.");
}
