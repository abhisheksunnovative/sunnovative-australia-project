const fs = require('fs');
const file = 'src/components/bde/BDEProspects.jsx';
let code = fs.readFileSync(file, 'utf8');

const badBlock = `                  )}
                </div>
              </div>

              </div>
            </div>
          ))}
        </div>
      )}`;

const goodBlock = `                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}`;

if (code.includes(badBlock)) {
  code = code.replace(badBlock, goodBlock);
  fs.writeFileSync(file, code);
  console.log("Fixed JSX!");
} else {
  // Try regex
  code = code.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\}\)\}/g, '</div>\n              </div>\n            </div>\n          ))}');
  fs.writeFileSync(file, code);
  console.log("Fixed via regex!");
}
