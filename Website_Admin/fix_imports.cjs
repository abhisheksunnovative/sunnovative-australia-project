const fs = require('fs');

function fixImports(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    'import { useAdminSettings }\nimport { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"; from "../../hooks/useAdminSettings";',
    'import { useAdminSettings } from "../../hooks/useAdminSettings";\nimport { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";'
  );
  fs.writeFileSync(file, content);
}

fixImports('src/components/bde/BDEDashboard.jsx');
fixImports('src/components/bde/BDEAustDashboard.jsx');
console.log("Imports fixed!");
