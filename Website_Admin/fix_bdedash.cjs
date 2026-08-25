const fs = require('fs');

let c = fs.readFileSync('src/components/bde/BDEDashboard.jsx', 'utf8');

c = c.replace(
  '  if (loading || !stats) {\n    const type = freelancerSettings?.commissionType || "Fixed";',
  `  if (loading || !stats) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading Dashboard Data...</div>;
  }

  const leadsPct = stats.targetLeads > 0 ? Math.min(100, Math.round((stats.totalAssigned / stats.targetLeads) * 100)) : 0;
  const convPct = stats.targetConversions > 0 ? Math.min(100, Math.round((stats.ordersGenerated / stats.targetConversions) * 100)) : 0;
  const isFreelancer = bdeData?.bdeType === "Freelancer";
  
  const freelancerSettings = bdeData?.freelancerSettings || { commissionType: "PerKW", commissionAmount: 50, totalEarnings: 1250 };

  const handleProjectClick = async (p) => {
    const rate = freelancerSettings?.commissionAmount || 50;
    const type = freelancerSettings?.commissionType || "Fixed";`
);

// We also need to fix `{trueLeadsCount}` inside the component since they are no longer defined
c = c.replace(/\{trueLeadsCount\}/g, '{stats?.totalAssigned || 0}');
c = c.replace(/\{trueProspectsCount\}/g, '{stats?.activeCustomers || 0}');
c = c.replace(/\{trueOrderJourneyCount\}/g, '{stats?.ordersGenerated || 0}');

fs.writeFileSync('src/components/bde/BDEDashboard.jsx', c);
