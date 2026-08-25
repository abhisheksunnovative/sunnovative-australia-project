const fs = require('fs');

// 1. Fix \n in BDELeadManagement.jsx
let leadMgmt = fs.readFileSync('src/components/bde/BDELeadManagement.jsx', 'utf8');
leadMgmt = leadMgmt.replace('\\n      <div className="space-y-4">', '      <div className="space-y-4">');
fs.writeFileSync('src/components/bde/BDELeadManagement.jsx', leadMgmt);

// 2. Fix counters in BDELayout.jsx
let layout = fs.readFileSync('src/components/bde/BDELayout.jsx', 'utf8');

const oldCountsLogic = `      if (leadsRes && leadsRes.ok) {
        const d = await leadsRes.json();
        leadsCount = (d.leads || []).filter(l => !l.installDateBooked && l.status !== 'Converted' && l.status !== 'Not Interested').length;
        prospectsCount = (d.leads || []).filter(l => l.installDateBooked && !l.tokenPaid).length;
      }`;

const newCountsLogic = `      if (leadsRes && leadsRes.ok) {
        const d = await leadsRes.json();
        const bdeLeads = d.leads || [];
        const isFreelance = bdeType?.toLowerCase().includes("freelance");
        
        leadsCount = bdeLeads.filter(l => {
             const isManual = l.history?.some(h => h.action.includes("Manually created by BDE"));
             const isTargetSource = isFreelance ? isManual : !isManual;
             return isTargetSource && !l.installDateBooked && l.status !== 'Converted' && l.status !== 'Not Interested';
        }).length;
        
        prospectsCount = bdeLeads.filter(l => {
             const isManual = l.history?.some(h => h.action.includes("Manually created by BDE"));
             const isTargetSource = isFreelance ? isManual : !isManual;
             return isTargetSource && l.installDateBooked && !l.tokenPaid;
        }).length;
      }`;

if (layout.includes(oldCountsLogic)) {
  layout = layout.replace(oldCountsLogic, newCountsLogic);
}
fs.writeFileSync('src/components/bde/BDELayout.jsx', layout);

// 3. Fix Dashboards Top 4 cards to match the true counts!
function fixDashboardCounts(file) {
  let dash = fs.readFileSync(file, 'utf8');
  
  // Dashboard currently uses `stats.leadsTarget?.totalAssigned` or `stats.totalAssigned`.
  // Wait, in BDEDashboard, `stats.totalAssigned` comes from the API `/api/bde/${bdeId}/dashboard`.
  // If the API counts everything, the dashboard card will be wrong too!
  // But wait, the user said "jo self leads se connect kro counyter ko jitte self leads ho utr hi counter show kroe... same ful time wale bde ke liye bi wesbitlead jit ho utt hi countern shwo kre".
  // Since we also fetch \`leads\` in BDEDashboard to render the graph:
  // \`const fetchLeads = async () => { try { const res = await fetch(\`\${API_BASE}/api/bde/\${bdeId}/leads\`); ... }\`
  // We can calculate the TRUE leads count right inside the frontend!
  
  const trueLeadsLogic = `
  const isFreelancer = bdeData?.bdeType === "Freelancer" || stats?.isFreelancer;
  const trueLeads = leads.filter(l => {
     const isManual = l.history?.some(h => h.action.includes("Manually created by BDE"));
     return isFreelancer ? isManual : !isManual;
  });
  const trueLeadsCount = trueLeads.filter(l => !l.installDateBooked && l.status !== 'Converted' && l.status !== 'Not Interested').length;
  const trueProspectsCount = trueLeads.filter(l => l.installDateBooked && !l.tokenPaid).length;
  const trueOrderJourneyCount = trueLeads.filter(l => l.tokenPaid || l.convertedProjectId).length;
  `;
  
  if (!dash.includes('const trueLeadsCount')) {
     dash = dash.replace(/const isFreelancer = /g, 'const isFreelancerVar = ');
     // Replace inside the return component body
     dash = dash.replace(
       'return (',
       \`${trueLeadsLogic}\n  return (\`
     );
     
     // Update the Total Leads card
     dash = dash.replace(/{stats\.leadsTarget\?\.totalAssigned \|\| 0}/g, '{trueLeadsCount}');
     dash = dash.replace(/{stats\.totalAssigned \|\| 0}/g, '{trueLeadsCount}');
     
     // Update the Total Prospects card
     dash = dash.replace(/Total Prospects<\/p>\\n            <h3 className="text-3xl font-black text-slate-900 mt-0\.5">.*?<\/h3>/g, 'Total Prospects</p>\n            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{trueProspectsCount}</h3>');
     
     // Update the Order Journey card
     dash = dash.replace(/Order Journey<\/p>\\n            <h3 className="text-3xl font-black text-slate-900 mt-0\.5">.*?<\/h3>/g, 'Order Journey</p>\n            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{trueOrderJourneyCount}</h3>');
  }

  fs.writeFileSync(file, dash);
}

fixDashboardCounts('src/components/bde/BDEDashboard.jsx');
fixDashboardCounts('src/components/bde/BDEAustDashboard.jsx');

