const fs = require('fs');

function patchBDEProspects() {
  const file = 'src/components/bde/BDEProspects.jsx';
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Fix signature (none needed for prospects)

  // Find where filteredLeads is defined
  const filterBlockOld = `  const filteredLeads = leads.filter(l => {
    const isAU = l.country === 'australia' || l.country === 'AU';
    const isEligibleForOrderJourney = isAU ? l.bdeMovedToOrderJourney : (l.tokenPaid && l.assignedEPCId);
    const isProspect = l.installDateBooked && !isEligibleForOrderJourney;
    if (!isProspect) return false;

    // Apply filters
    if (projectTypeFilter !== "All" && (l.solarType || l.projectType || "").toLowerCase() !== projectTypeFilter.toLowerCase()) return false;
    if (kwFilter !== "All" && l.kw !== kwFilter) return false;
    if (searchQuery) {
      const sq = searchQuery.toLowerCase();
      if (!((l.name || "").toLowerCase().includes(sq) || (l.email || "").toLowerCase().includes(sq) || (l.mobile || "").toLowerCase().includes(sq))) {
        return false;
      }
    }
    return true;
  });`;

  const filterBlockNew = `  const baseProspects = leads.filter(l => {
    const isAU = l.country === 'australia' || l.country === 'AU';
    const isEligibleForOrderJourney = isAU ? l.bdeMovedToOrderJourney : (l.tokenPaid && l.assignedEPCId);
    return l.installDateBooked && !isEligibleForOrderJourney;
  });

  const getCountForProjectType = (ptValue) => {
    if (ptValue === "All") return baseProspects.length;
    return baseProspects.filter(l => (l.solarType || l.projectType || "").toLowerCase() === ptValue.toLowerCase()).length;
  };

  const filteredLeads = baseProspects.filter(l => {
    if (projectTypeFilter !== "All" && (l.solarType || l.projectType || "").toLowerCase() !== projectTypeFilter.toLowerCase()) return false;
    if (kwFilter !== "All" && l.kw !== kwFilter) return false;
    if (searchQuery) {
      const sq = searchQuery.toLowerCase();
      if (!((l.name || "").toLowerCase().includes(sq) || (l.email || "").toLowerCase().includes(sq) || (l.mobile || "").toLowerCase().includes(sq))) {
        return false;
      }
    }
    return true;
  });`;

  if (code.includes('const filteredLeads = leads.filter(l => {')) {
    code = code.replace(filterBlockOld, filterBlockNew);
  }

  // Update cards
  const cardsOld = `        {dynamicProjectTypes.map(pt => (
          <option key={pt.value} value={pt.value}>{pt.label}</option>
        ))}`;
        
  // Wait, in BDEProspects I might still have a select for projectType! Let's check how projectTypeFilter is used in BDEProspects.
}

patchBDEProspects();
