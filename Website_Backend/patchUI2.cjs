const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(file, 'utf8');

const targetSelect = `                          <select value={rule.type} onChange={e => updateRule(idx, 'type', e.target.value)} className="w-full p-1.5 text-xs border border-slate-300 rounded bg-white">
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                          </select>
                        </div>
                      </div>`;

const newSelect = `                          <select value={rule.type} onChange={e => updateRule(idx, 'type', e.target.value)} className="w-full p-1.5 text-xs border border-slate-300 rounded bg-white">
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
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

code = code.replace(targetSelect, newSelect);
fs.writeFileSync(file, code);
console.log("Updated UI correctly");
