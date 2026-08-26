const fs = require('fs');
let c = fs.readFileSync('../Website_Backend/src/models/ProjectModel.js', 'utf8');

c = c.replace(/\\\`/g, '\`');
c = c.replace(/\\\$/g, '$');

fs.writeFileSync('../Website_Backend/src/models/ProjectModel.js', c);
