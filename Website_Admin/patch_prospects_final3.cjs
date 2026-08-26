const fs = require('fs');
const file = 'src/components/bde/BDEProspects.jsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /const filteredLeads = leads\.filter\(l => \{[\s\S]*?if \(!isProspect\) return false;\s*if \(projectTypeFilter !== "All" && l\.solarType !== projectTypeFilter\) return false;/;

const newFiltered = `const baseProspects = leads.filter(l => {
    const isAU = l.country === 'australia' || l.country === 'AU';
    const isEligibleForOrderJourney = isAU ? l.bdeMovedToOrderJourney : (l.tokenPaid && l.assignedEPCId);
    return l.installDateBooked && !isEligibleForOrderJourney;
  });

  const getCountForProjectType = (ptValue) => {
    if (ptValue === "All") return baseProspects.length;
    return baseProspects.filter(l => (l.solarType || l.projectType || "").toLowerCase() === ptValue.toLowerCase()).length;
  };

  const filteredLeads = baseProspects.filter(l => {
    if (projectTypeFilter !== "All" && (l.solarType || l.projectType || "").toLowerCase() !== projectTypeFilter.toLowerCase()) return false;`;

if (code.match(regex)) {
  code = code.replace(regex, newFiltered);
  fs.writeFileSync(file, code);
  console.log("SUCCESS!");
} else {
  console.log("Failed to match regex!");
}
