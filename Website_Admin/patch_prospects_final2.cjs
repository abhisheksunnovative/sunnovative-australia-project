const fs = require('fs');
const file = 'src/components/bde/BDEProspects.jsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Definition of getCountForProjectType & baseProspects
const oldFilteredStart = `  const filteredLeads = leads.filter(l => {
    const isProspect = l.installDateBooked && !l.tokenPaid && !l.convertedProjectId;
    if (!isProspect) return false;

    if (projectTypeFilter !== "All" && l.solarType !== projectTypeFilter) return false;`;

const newFilteredStart = `  const baseProspects = leads.filter(l => {
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

if (code.includes('const isProspect = l.installDateBooked && !l.tokenPaid && !l.convertedProjectId;')) {
  code = code.replace(oldFilteredStart, newFilteredStart);
  console.log("Patched filteredLeads and getCountForProjectType");
}

// 2. The cards are ALREADY there because I DID NOT REVERT BDEProspects after the first attempt?
// Wait, if I checked out BDEProspects from git, the cards SHOULD NOT BE THERE either!
// Why are the cards there? Let's check!
