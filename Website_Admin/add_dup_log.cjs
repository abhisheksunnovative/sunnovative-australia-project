const fs = require('fs');
let backend = fs.readFileSync('../Website_Backend/src/controllers/leadController.js', 'utf8');

backend = backend.replace(
  `errors.push(\`\${leads.length - insertedCount} leads were skipped due to duplicate mobile numbers.\`);`,
  `errors.push(\`\${leads.length - insertedCount} leads were skipped due to duplicate mobile numbers.\`);\n        console.log(\"--- SKIPPED DUPLICATES ---\", \`\${leads.length - insertedCount} duplicates found!\`);`
);

fs.writeFileSync('../Website_Backend/src/controllers/leadController.js', backend);
console.log("Added duplicate log!");
