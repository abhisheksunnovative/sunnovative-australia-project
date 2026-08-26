const fs = require('fs');
let c = fs.readFileSync('../Website_Admin/src/components/bde/BDEProjectTracking.jsx', 'utf8');

c = c.replace(
  "if (!activeStep || !activeStep.isOverdue) return { isOverdue: false, type: null, days: 0, stepTitle: \"\" };",
  "if (!activeStep) return { isOverdue: false, type: null, days: 0, stepTitle: \"Unknown Stage\" };\n    if (!activeStep.isOverdue) return { isOverdue: false, type: activeStep.assignedTo === 'customer' ? 'customer' : 'epc', days: 0, stepTitle: activeStep.title || \"Unknown Stage\" };"
);

fs.writeFileSync('../Website_Admin/src/components/bde/BDEProjectTracking.jsx', c);
console.log("Patched getOverdueInfo!");
