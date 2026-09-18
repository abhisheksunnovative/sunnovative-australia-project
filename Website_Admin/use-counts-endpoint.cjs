const fs = require('fs');
let code = fs.readFileSync('src/components/bde/BDELayout.jsx', 'utf8');

const oldLoadCounts = `  const loadCounts = async () => {
    try {
      const isFreelance = bdeType?.toLowerCase().includes("freelance");
      const fetches = [
        fetch(\`\${API_BASE}/api/bde/\${bdeId}/leads\`).catch(() => null),
        fetch(\`\${API_BASE}/api/bde/\${bdeId}/projects\`).catch(() => null)
      ];
      if (!isFreelance) {
        fetches.push(fetch(\`\${API_BASE}/api/bde/\${bdeId}/demand-pool\`).catch(() => null));
      }
      const [leadsRes, projRes, demandRes] = await Promise.all(fetches);
      
      let eligibilityCount = 0;
      let leadsCount = 0;
      let prospectsCount = 0;
      let projCount = 0;
      let demandCount = 0;
      
      if (leadsRes && leadsRes.ok) {
        const d = await leadsRes.json();
        const bdeLeads = d.leads || [];
        
        bdeLeads.forEach(l => {
             const isManual = l.history?.some(h => h.action.includes("Manually created by BDE"));
             const isTargetSource = isFreelance ? isManual : !isManual;
             
             if (!isTargetSource) return;
             if (l.status === 'Converted' || l.status === 'Not Interested' || l.status === 'Lost' || l.bdeMovedToOrderJourney) return;
             
             if (l.status === "RAW") {
                 if (isFreelance) {
                   leadsCount++;
                   return;
                 }
             }
             
             const isInOrderJourney = l.bdeMovedToOrderJourney;

             if (isFreelance) {
               if (l.isEligibleForInstallation || l.installDateBooked) {
                 if (!isInOrderJourney) prospectsCount++;
               } else {
                 eligibilityCount++;
               }
             } else {
               if (!isInOrderJourney) prospectsCount++;
             }
        });
      }
      if (projRes && projRes.ok) {
        const p = await projRes.json();
        projCount = p.data?.length || p.projects?.length || 0;
      }
      if (demandRes && demandRes.ok) {
        const dp = await demandRes.json();
        demandCount = dp.data?.length || dp.leads?.length || 0;
      }
      
      setTabCounts({ eligibility: eligibilityCount, myleads: leadsCount, prospects: prospectsCount, projects: projCount, demand: demandCount });
    } catch (e) {
      console.warn("Failed to load BDE tab counts", e);
    }
  };`;

const newLoadCounts = `  const loadCounts = async () => {
    try {
      const res = await fetch(\`\${API_BASE}/api/bde/\${bdeId}/counts\`);
      const data = await res.json();
      if (data.success && data.counts) {
        setTabCounts(data.counts);
      }
    } catch (e) {
      console.warn("Failed to load BDE tab counts", e);
    }
  };`;

code = code.replace(oldLoadCounts, newLoadCounts);
fs.writeFileSync('src/components/bde/BDELayout.jsx', code);
