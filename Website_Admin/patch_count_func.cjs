const fs = require('fs');
const file = 'src/components/bde/BDELeadManagement.jsx';
let code = fs.readFileSync(file, 'utf8');

// Insert it right before the JSX return
if (!code.includes('const getCountForProjectType =')) {
  code = code.replace(/return \(/, `
  const getCountForProjectType = (ptValue) => {
    // 1. Get base leads depending on active tab
    const baseList = activeTab === "manual" ? manualLeads : websiteLeads;
    
    // 2. Filter by filterTab (eligibility vs self-leads)
    const filteredByTab = baseList.filter(l => {
      if (filterTab === "eligibility") {
        if (l.isEligibleForInstallation === true) return false;
      } else if (filterTab === "self-leads") {
        if (isFreelancer && l.isEligibleForInstallation !== true) return false;
      }
      return true;
    });

    if (ptValue === "All") return filteredByTab.length;
    return filteredByTab.filter(l => (l.solarType || l.projectType || "").toLowerCase() === ptValue.toLowerCase()).length;
  };

  return (`);
  
  fs.writeFileSync(file, code);
  console.log("Added getCountForProjectType to BDELeadManagement");
} else {
  console.log("Already exists");
}
