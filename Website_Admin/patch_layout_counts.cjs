const fs = require('fs');
const file = 'src/components/bde/BDELayout.jsx';
let code = fs.readFileSync(file, 'utf8');

const loadCountsStart = "  const loadCounts = async () => {";
const loadCountsEnd = "  const loadNotifications = async () => {";

const startIdx = code.indexOf(loadCountsStart);
const endIdx = code.indexOf(loadCountsEnd);

if (startIdx !== -1 && endIdx !== -1) {
  const newLoadCounts = `  const loadCounts = async () => {
    try {
      const [leadsRes, projRes] = await Promise.all([
        fetch(\`\${API_BASE}/api/bde/\${bdeId}/leads\`).catch(() => null),
        fetch(\`\${API_BASE}/api/bde/\${bdeId}/projects\`).catch(() => null)
      ]);
      let eligibilityCount = 0;
      let leadsCount = 0;
      let prospectsCount = 0;
      let projCount = 0;
      
      if (leadsRes && leadsRes.ok) {
        const d = await leadsRes.json();
        const bdeLeads = d.leads || [];
        const isFreelance = bdeType?.toLowerCase().includes("freelance");
        
        bdeLeads.forEach(l => {
             const isManual = l.history?.some(h => h.action.includes("Manually created by BDE"));
             const isTargetSource = isFreelance ? isManual : !isManual;
             
             if (!isTargetSource) return;
             if (l.status === 'Converted' || l.status === 'Not Interested' || l.status === 'Lost' || l.convertedProjectId) return;
             
             const isAU = l.country === 'australia' || l.country === 'AU';
             const isEligibleForOrderJourney = isAU ? l.bdeMovedToOrderJourney : (l.tokenPaid && l.assignedEPCId);
             
             if (isEligibleForOrderJourney) return; // Means it's moved to order journey
             
             if (l.installDateBooked) {
                 prospectsCount++;
             } else {
                 if (isFreelance && !l.isEligibleForInstallation) {
                     eligibilityCount++;
                 } else {
                     leadsCount++;
                 }
             }
        });
      }
      if (projRes && projRes.ok) {
        const p = await projRes.json();
        projCount = p.data?.length || p.projects?.length || 0;
      }
      setTabCounts({ eligibility: eligibilityCount, leads: leadsCount, prospects: prospectsCount, projects: projCount });
    } catch (e) {
      console.warn("Failed to load BDE tab counts", e);
    }
  };

`;
  
  code = code.substring(0, startIdx) + newLoadCounts + code.substring(endIdx);
  fs.writeFileSync(file, code);
  console.log("Patched layout counts successfully");
} else {
  console.log("Could not find loadCounts");
}
