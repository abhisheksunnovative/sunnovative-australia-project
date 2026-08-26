const fs = require('fs');
const file = 'src/components/bde/BDEProspects.jsx';
let code = fs.readFileSync(file, 'utf8');

const oldStr = `                  )}
                </div>
              </div>

              </div>
            </div>
          ))}
        </div>`;

const newStr = `                  )}
                </div>
              </div>
            </div>
          ))}
        </div>`;

code = code.replace(oldStr, newStr);

fs.writeFileSync(file, code);
