const fs = require('fs');
const file = 'src/components/bde/BDEProspects.jsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/                  \}\)\r?\n                <\/div>\r?\n              <\/div>\r?\n\r?\n              <\/div>\r?\n            <\/div>\r?\n          \}\)\}/,
`                  )}
                </div>
              </div>
            </div>
          ))}`);

fs.writeFileSync(file, code);
console.log('Fixed BDEProspects div with regex!');
