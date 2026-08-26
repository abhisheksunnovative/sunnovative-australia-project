import re

with open("src/components/bde/BDELayout.jsx", "r", encoding="utf8") as f:
    content = f.read()

# Replace tabCounts state
content = re.sub(
    r'const \[tabCounts, setTabCounts\] = useState\(\{[\s\S]*?\}\);',
    'const [tabCounts, setTabCounts] = useState({ eligibility: 0, leads: 0, prospects: 0, projects: 0 });',
    content
)

# Update the navItems array for Customer Eligibility
content = content.replace(
    '{ id: "bde-customer-eligibility", name: "Customer Eligibility", icon: <ClipboardList className="w-5 h-5 text-amber-400" /> },',
    '{ id: "bde-customer-eligibility", name: "Customer Eligibility", icon: <ClipboardList className="w-5 h-5 text-amber-400" />, count: tabCounts.eligibility },'
)

# Overwrite loadCounts
load_counts_code = """  const loadCounts = async () => {
    try {
      if (!bdeId) return;
      const userStr = localStorage.getItem("user");
      let token = "";
      let isFreelancer = false;
      if (userStr) {
        const u = JSON.parse(userStr);
        token = u.token;
        isFreelancer = u.bdeType === "Freelancer";
      }
      
      const leadsRes = await fetch(`${API_BASE}/api/bde/leads/${isFreelancer ? "manual" : "all"}`, { headers: { Authorization: `Bearer ${token}` } });
      let eligibilityCount = 0;
      let leadsCount = 0;
      let prospectsCount = 0;
      
      if (leadsRes.ok) {
        const data = await leadsRes.json();
        const leads = data.leads || [];
        
        leads.forEach(l => {
          if (l.status === 'Converted' || l.status === 'Lost' || l.convertedProjectId) return;
          if (l.installDateBooked) prospectsCount++;
          else if (l.isEligibleForInstallation) leadsCount++;
          else eligibilityCount++;
        });
      }

      const projRes = await fetch(`${API_BASE}/api/bde/${bdeId}/projects`, { headers: { Authorization: `Bearer ${token}` } });
      let projectsCount = 0;
      if (projRes.ok) {
        const data = await projRes.json();
        projectsCount = (data.projects || []).length;
      }

      setTabCounts({ eligibility: eligibilityCount, leads: leadsCount, prospects: prospectsCount, projects: projectsCount });
    } catch (e) {
      console.error(e);
    }
  };"""

content = re.sub(r'const loadCounts = async \(\) => \{[\s\S]*?\}\s*catch\s*\(e\)\s*\{\s*console\.warn\("Failed to load BDE tab counts", e\);\s*\}\s*\};', load_counts_code, content)

with open("src/components/bde/BDELayout.jsx", "w", encoding="utf8") as f:
    f.write(content)
print("BDELayout patched")
