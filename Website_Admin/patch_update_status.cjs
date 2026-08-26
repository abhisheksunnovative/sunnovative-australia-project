const fs = require('fs');
const file = 'src/components/bde/BDELeadManagement.jsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /const updateLeadStatus = async \([\s\S]*?catch \(err\) \{ console\.error\(err\); \}\s*\};/;

const newFunc = `const updateLeadStatus = async (leadId, status, nextFollowUp = null) => {
    const targetLead = leads.find(l => l._id === leadId);
    if (!targetLead) return;

    try {
      const res = await fetch(\`\${API_BASE}/api/bde/leads/\${leadId}\`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, nextFollowUp })
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (err) { console.error(err); }
  };`;

if (code.match(regex)) {
  code = code.replace(regex, newFunc);
  fs.writeFileSync(file, code);
  console.log("updateLeadStatus fixed!");
} else {
  console.log("Could not find updateLeadStatus");
}
