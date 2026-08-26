const fs = require('fs');
let c = fs.readFileSync('src/components/bde/BDEAustDashboard.jsx', 'utf8');

c = c.replace(
  /targetLeads: data\.stats\.targetLeads \|\| 200 \s*\},/g,
  'targetLeads: data.stats.targetLeads || 200\n          },\n          districtStats: data.stats.districtStats || [],\n          followupList: data.stats.followupList || [],\n          todaysFollowups: data.stats.todaysFollowups || 0,'
);

c = c.replace(
  /conversionRatio: "40\.00",\s*isFreelancer:/g,
  'conversionRatio: "40.00",\n          districtStats: [],\n          followupList: [],\n          todaysFollowups: 0,\n          isFreelancer:'
);

fs.writeFileSync('src/components/bde/BDEAustDashboard.jsx', c);
console.log("Fixed state in BDEAustDashboard");
