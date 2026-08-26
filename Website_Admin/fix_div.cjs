const fs = require('fs');
const file = 'src/components/bde/BDEProspects.jsx';
let code = fs.readFileSync(file, 'utf8');

const bad = `                  )}
                </div>
              </div>

              </div>
            </div>
          ))}`;

const good = `                  )}
                </div>
              </div>
            </div>
          ))}`;

code = code.replace(bad, good);
fs.writeFileSync(file, code);
console.log('Fixed BDEProspects div!');
