const fs = require('fs');
let code = fs.readFileSync('src/components/bde/BDELayout.jsx', 'utf8');

const oldLoadCounts = `  const loadCounts = async () => {
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
             if (l.status === 'Converted' || l.status === 'Not Interested' || l.status === 'Lost' || l.bdeMovedToOrderJourney) return;
             
             if (l.status === "RAW") {
                 if (isFreelance) {
                   leadsCount++;
                   return;
                 }
             }
             
             // A lead that is moved to Order Journey leaves Prospects
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
      setTabCounts({ eligibility: eligibilityCount, myleads: leadsCount, prospects: prospectsCount, projects: projCount });
    } catch (e) {
      console.warn("Failed to load BDE tab counts", e);
    }
  };`;

const newLoadCounts = `  const loadCounts = async () => {
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

const oldNavItems = `  const navItems = [
    { id: "bde-aust", name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 text-emerald-400" /> },
    ...(isFreelancer ? [{ id: "bde-my-leads", name: "My Leads", icon: <Users className="w-5 h-5" />, count: tabCounts.myleads || 0 }] : []),
    ...(isFreelancer ? [{ id: "bde-customer-eligibility", name: "Customer Eligibility List", icon: <Users className="w-5 h-5" />, count: tabCounts.eligibility || 0 }] : []),
    { id: "bde-prospects", name: "My Prospects", icon: <CheckSquare className="w-5 h-5" />, count: tabCounts.prospects || 0 },
    { id: "bde-projects", name: "Customer Order Journey", icon: <ClipboardList className="w-5 h-5" />, count: tabCounts.projects || 0 },
    ...(!isFreelancer ? [{ id: "bde-demand", name: "Demand Pool", icon: <Map className="w-5 h-5" /> }] : []),
    { id: "bde-profile", name: "My Profile", icon: <User className="w-5 h-5" /> }
  ];`;

const newNavItems = `  const navItems = [
    { id: "bde-aust", name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 text-emerald-400" /> },
    ...(isFreelancer ? [{ id: "bde-my-leads", name: "My Leads", icon: <Users className="w-5 h-5" />, count: tabCounts.myleads || 0 }] : []),
    ...(isFreelancer ? [{ id: "bde-customer-eligibility", name: "Customer Eligibility List", icon: <Users className="w-5 h-5" />, count: tabCounts.eligibility || 0 }] : []),
    { id: "bde-prospects", name: "My Prospects", icon: <CheckSquare className="w-5 h-5" />, count: tabCounts.prospects || 0 },
    { id: "bde-projects", name: "Customer Order Journey", icon: <ClipboardList className="w-5 h-5" />, count: tabCounts.projects || 0 },
    ...(!isFreelancer ? [{ id: "bde-demand", name: "Demand Pool", icon: <Map className="w-5 h-5" />, count: tabCounts.demand || 0 }] : []),
    { id: "bde-profile", name: "My Profile", icon: <User className="w-5 h-5" /> }
  ];`;

code = code.replace(oldLoadCounts, newLoadCounts);
code = code.replace(oldNavItems, newNavItems);

fs.writeFileSync('src/components/bde/BDELayout.jsx', code);
