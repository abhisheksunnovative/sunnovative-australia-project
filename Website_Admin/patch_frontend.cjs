const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Regex Pattern</label>
                          <input type="text" value={rule.regex} onChange={e => updateRule(idx, 'regex', e.target.value)} className="w-full p-1.5 text-xs font-mono border border-slate-300 rounded bg-white" placeholder="e.g. Total Amount\\s*([0-9.]+)" />
                          {rule.previewValue && (
                            <div className="mt-1 text-xs truncate max-w-full">
                              {rule.previewValue === 'Not Found' || rule.previewValue === 'Regex Error' || rule.previewValue.includes('Invalid') 
                                ? <span className="text-red-500 font-bold">❌ {rule.previewValue}</span>
                                : <span className="text-green-600 font-bold">✅ {rule.previewValue}</span>}
                                {renderRegexContext(rule.regex)}
                            </div>
                          )}
                        </div>`;

const replacement = `                        <div className="col-span-2">
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
                              <input type="text" value={rule.regex} onChange={e => updateRule(idx, 'regex', e.target.value)} className="w-full p-1.5 text-xs font-mono border border-slate-300 rounded bg-white" placeholder="e.g. Total Amount\\s*([0-9.]+)" />
                              {rule.previewValue && (
                                <div className="mt-1 text-xs truncate max-w-full">
                                  {rule.previewValue === 'Not Found' || rule.previewValue === 'Regex Error' || rule.previewValue.includes('Invalid') 
                                    ? <span className="text-red-500 font-bold">❌ {rule.previewValue}</span>
                                    : <span className="text-green-600 font-bold">✅ {rule.previewValue}</span>}
                                    {renderRegexContext(rule.regex)}
                                </div>
                              )}
                            </>
                          )}
                        </div>`;

if (code.includes(targetStr)) {
    fs.writeFileSync(file, code.replace(targetStr, replacement));
    console.log("Successfully patched frontend UI");
} else {
    console.log("Target string not found in file. It might have slight whitespace differences.");
    console.log(code.indexOf('Regex Pattern'));
}
