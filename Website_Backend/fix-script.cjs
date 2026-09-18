const fs = require('fs');
let c = fs.readFileSync('seed-discoms.cjs', 'utf8');
c = c.replace(/require\('\.\/src\/models\/DiscomModel\.js'\)\.default/, "require('./src/models/DiscomModel.js').Discom");
fs.writeFileSync('seed-discoms.cjs', c);
