const fs = require('fs');

let backend = fs.readFileSync('../Website_Backend/src/controllers/leadController.js', 'utf8');

backend = backend.replace(
  `throw bulkErr;`,
  `console.error("INNER CATCH ERROR:", bulkErr);\n        throw bulkErr;`
);
backend = backend.replace(
  `console.error('uploadLeads error:', err);`,
  `console.error('==== OUTER CATCH uploadLeads error ====', err);`
);

fs.writeFileSync('../Website_Backend/src/controllers/leadController.js', backend);
console.log("Added detailed error logs");
