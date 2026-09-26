const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /<select value=\{rule\.type\}([\s\S]*?)<\/select>\s*<\/div>\s*<\/div>/;

const newSelect = `<select value={rule.type}$1</select>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 w-full col-span-full">
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                          <span>Match Strategy:</span>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" name={\`matchStrategy-\${idx}\`} checked={!rule.matchStrategy || rule.matchStrategy === 'inline'} onChange={() => updateRule(idx, 'matchStrategy', 'inline')} className="text-blue-600" />
                            Same-line (Inline)
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer" title="Matches data vertically below the heading">
                            <input type="radio" name={\`matchStrategy-\${idx}\`} checked={rule.matchStrategy === 'column-below'} onChange={() => updateRule(idx, 'matchStrategy', 'column-below')} className="text-emerald-600" />
                            Column-below
                          </label>
                        </div>
                      </div>`;

code = code.replace(regex, newSelect);
fs.writeFileSync(file, code);
console.log("Replaced using Regex!");
