const fs = require('fs');

// 1. Fix \n in BDELeadManagement.jsx
let leadMgmt = fs.readFileSync('src/components/bde/BDELeadManagement.jsx', 'utf8');
leadMgmt = leadMgmt.replace('\\n      <div className="space-y-4">', '      <div className="space-y-4">');
fs.writeFileSync('src/components/bde/BDELeadManagement.jsx', leadMgmt);

// 2. Fix counters in BDELayout.jsx
let layout = fs.readFileSync('src/components/bde/BDELayout.jsx', 'utf8');

const oldCountsLogic = "      if (leadsRes && leadsRes.ok) {\\n        const d = await leadsRes.json();\\n        leadsCount = (d.leads || []).filter(l => !l.installDateBooked && l.status !== 'Converted' && l.status !== 'Not Interested').length;\\n        prospectsCount = (d.leads || []).filter(l => l.installDateBooked && !l.tokenPaid).length;\\n      }";

const newCountsLogic = \`      if (leadsRes && leadsRes.ok) {
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
      }\`;

if (layout.includes("leadsCount = (d.leads || []).filter")) {
  // Manual string replace by lines since block replace might fail
  layout = layout.replace(/leadsCount = \(d\.leads \|\| \[\]\)\.filter[^;]+;/g, "");
  layout = layout.replace(/prospectsCount = \(d\.leads \|\| \[\]\)\.filter[^;]+;/g, newCountsLogic.replace("      if (leadsRes && leadsRes.ok) {\\n        const d = await leadsRes.json();", ""));
}
fs.writeFileSync('src/components/bde/BDELayout.jsx', layout);

// 3. Fix Dashboards Top 4 cards to match the true counts!
function fixDashboardCounts(file) {
  let dash = fs.readFileSync(file, 'utf8');
  
  const trueLeadsLogic = \`
  const isFreelancer = bdeData?.bdeType === "Freelancer" || stats?.isFreelancer;
  const trueLeads = leads.filter(l => {
     const isManual = l.history?.some(h => h.action.includes("Manually created by BDE"));
     return isFreelancer ? isManual : !isManual;
  });
  const trueLeadsCount = trueLeads.filter(l => !l.installDateBooked && l.status !== 'Converted' && l.status !== 'Not Interested').length;
  const trueProspectsCount = trueLeads.filter(l => l.installDateBooked && !l.tokenPaid).length;
  const trueOrderJourneyCount = trueLeads.filter(l => l.tokenPaid || l.convertedProjectId).length;
  \`;
  
  if (!dash.includes('const trueLeadsCount')) {
     dash = dash.replace(/const isFreelancer = /g, 'const isFreelancerVar = ');
     // Replace inside the return component body
     dash = dash.replace('return (', trueLeadsLogic + '\\n  return (');
     
     // Update the Total Leads card
     dash = dash.replace(/{stats\\.leadsTarget\\?\\.totalAssigned \\|\\| 0}/g, '{trueLeadsCount}');
     dash = dash.replace(/{stats\\.totalAssigned \\|\\| 0}/g, '{trueLeadsCount}');
     
     // Update the Total Prospects card
     dash = dash.replace(/Total Prospects<\\/p>\\s*<h3 className="text-3xl font-black text-slate-900 mt-0\\.5">.*?<\\/h3>/g, 'Total Prospects</p>\\n            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{trueProspectsCount}</h3>');
     
     // Update the Order Journey card
     dash = dash.replace(/Order Journey<\\/p>\\s*<h3 className="text-3xl font-black text-slate-900 mt-0\\.5">.*?<\\/h3>/g, 'Order Journey</p>\\n            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{trueOrderJourneyCount}</h3>');
  }

  fs.writeFileSync(file, dash);
}

fixDashboardCounts('src/components/bde/BDEDashboard.jsx');
fixDashboardCounts('src/components/bde/BDEAustDashboard.jsx');
