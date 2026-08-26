const fs = require('fs');
const file = 'src/components/bde/BDEProspects.jsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/                  \}\)\n                <\/div>\n              <\/div>\n\n              <\/div>\n            <\/div>\n          \}\)\}/g, 
`                  )}
                </div>
              </div>
            </div>
          ))}`);

fs.writeFileSync(file, code);
