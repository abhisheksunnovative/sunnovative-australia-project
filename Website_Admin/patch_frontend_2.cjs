const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(file, 'utf8');

const regexInputDivStr = `<div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Regex Pattern</label>`;

const replacement = `<div className="col-span-2">
                          {rule.heading !== undefined ? (
                            <div className="flex flex-col gap-2">
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 mb-1">🏷️ Heading</label>
                                  <input type="text" value={rule.heading} onChange={e => updateRule(idx, 'heading', e.target.value)} className="w-full p-1 text-xs font-mono border border-slate-300 rounded bg-white" />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 mb-1">🎯 Main Data</label>
                                  <input type="text" value={rule.mainData} readOnly className="w-full p-1 text-xs font-mono border border-slate-300 rounded bg-slate-100 text-slate-500 cursor-not-allowed" />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 mb-1">➡️ Trailing word</label>
                                  <input type="text" value={rule.trailing} onChange={e => updateRule(idx, 'trailing', e.target.value)} className="w-full p-1 text-xs font-mono border border-slate-300 rounded bg-white" />
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                {rule.previewValue && (
                                  <div className="text-xs truncate max-w-full">
                                    {rule.previewValue === 'Not Found' || rule.previewValue === 'Regex Error' || rule.previewValue.includes('Invalid') 
                                      ? <span className="text-red-500 font-bold">❌ {rule.previewValue}</span>
                                      : <span className="text-green-600 font-bold">✅ {rule.previewValue}</span>}
                                  </div>
                                )}
                                <button type="button" onClick={() => handleRegenerate(idx, rule.field)} className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200">
                                  🔄 Regenerate & Test
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">Regex Pattern</label>
`;

if (code.includes(regexInputDivStr)) {
    code = code.replace(regexInputDivStr, replacement);
    
    // We also need to close the `</>` fragment after the original div content.
    // Let's find the `</div>` that closes `<div className="col-span-2">`.
    const endStr = `                                {renderRegexContext(rule.regex)}
                            </div>
                          )}
                        </div>`;
    const replacementEnd = `                                {renderRegexContext(rule.regex)}
                            </div>
                          )}
                            </>
                          )}
                        </div>`;
                        
    code = code.replace(endStr, replacementEnd);
    fs.writeFileSync(file, code);
    console.log("Successfully patched frontend UI");
} else {
    console.log("Not found.");
}
