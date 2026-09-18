const fs = require('fs');

const path = 'Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let content = fs.readFileSync(path, 'utf8');

const newFetchLogic = `
      // Fetch DISCOMS for this country to get the active states
      const res = await fetch(\`\${API_URL}/api/discoms?country=\${countryName}\`);
      const data = await res.json();
      let stateList = [];
      if (data.success && data.data) {
        stateList = [...new Set(data.data.filter(d => d.isActive).map(d => d.state).filter(Boolean))].sort();
      } else if (Array.isArray(data)) {
        stateList = [...new Set(data.filter(d => d.isActive).map(d => d.state).filter(Boolean))].sort();
      }
      setStates(stateList);
`;

content = content.replace(
  /const res = await fetch\(`\$\{API_URL\}\/api\/districts\/states\?country=\$\{countryName\.toLowerCase\(\)\}`\);\s+const data = await res\.json\(\);\s+const stateList = data\.success \? data\.data : \(Array\.isArray\(data\) \? data : \[\]\);\s+setStates\(stateList\);/,
  newFetchLogic.trim()
);

fs.writeFileSync(path, content);
console.log('Patched BillTemplateManagementScreen.jsx');
