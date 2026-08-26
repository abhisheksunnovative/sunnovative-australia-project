const fs = require('fs');
let file = fs.readFileSync('../Website_Admin/src/components/bde/BDELayout.jsx', 'utf8');

if (!file.includes('id: "customer-eligibility"')) {
  file = file.replace(
    '{ id: "bde-leads", name: isFreelancer ? "Self Leads" : "My Leads", icon: <Users className="w-5 h-5" />, count: tabCounts.leads },',
    `{ id: "customer-eligibility", name: "Customer Eligibility", icon: <ClipboardList className="w-5 h-5 text-amber-400" /> },
    { id: "bde-leads", name: isFreelancer ? "Self Leads" : "My Leads", icon: <Users className="w-5 h-5 text-blue-400" />, count: tabCounts.leads },`
  );
  fs.writeFileSync('../Website_Admin/src/components/bde/BDELayout.jsx', file);
  console.log("Patched BDELayout.jsx");
}
