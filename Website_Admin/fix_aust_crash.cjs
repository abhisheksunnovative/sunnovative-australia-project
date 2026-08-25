const fs = require('fs');

let c = fs.readFileSync('src/components/bde/BDEAustDashboard.jsx', 'utf8');

const trueLeadsLogic = `  const isFreelancer = stats?.isFreelancer;
  const trueLeads = leads.filter(l => {
     const isManual = l.history?.some(h => h.action.includes("Manually created by BDE"));
     return isFreelancer ? isManual : !isManual;
  });
  const trueLeadsCount = trueLeads.filter(l => !l.installDateBooked && l.status !== 'Converted' && l.status !== 'Not Interested').length;
  const trueProspectsCount = trueLeads.filter(l => l.installDateBooked && !l.tokenPaid).length;
  const trueOrderJourneyCount = trueLeads.filter(l => l.tokenPaid || l.convertedProjectId).length;`;

c = c.replace(trueLeadsLogic, '  const isFreelancer = stats?.isFreelancer;\n  // removed trueLeads for Aust Dashboard since leads are not fetched here directly\n');

c = c.replace(/\{trueLeadsCount\}/g, '{stats?.leadsTarget?.totalAssigned || 0}');
c = c.replace(/\{trueProspectsCount\}/g, '{stats?.activeCustomers || 0}');
c = c.replace(/\{trueOrderJourneyCount\}/g, '{stats?.ordersGenerated || 0}');

fs.writeFileSync('src/components/bde/BDEAustDashboard.jsx', c);
