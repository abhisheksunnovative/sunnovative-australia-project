const fs = require('fs');
const file = 'src/components/bde/BDEProspects.jsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\}\)\}/g, '</div>\n              </div>\n            </div>\n          ))}');
fs.writeFileSync(file, code);
