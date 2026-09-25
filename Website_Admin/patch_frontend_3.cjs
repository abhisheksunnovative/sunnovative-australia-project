const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

let start = -1;
let end = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('className="col-span-2"') && lines[i+1].includes('Regex Pattern')) {
        start = i;
    }
    if (start !== -1 && i > start && lines[i].includes('</div>') && lines[i+1].includes('<div>') && lines[i+2].includes('Type</label>')) {
        end = i;
        break;
    }
}

console.log("Start:", start, "End:", end);

const newUI = `                        <div className="col-span-2">
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
                        </div>`.split('\\n'); // Ah wait, newUI has real newlines

const newUILines = newUI[0].split('\n');

if (start !== -1 && end !== -1) {
    const newFileLines = [...lines.slice(0, start), ...newUILines, ...lines.slice(end + 1)];
    fs.writeFileSync(file, newFileLines.join('\n'));
    console.log("Successfully replaced UI lines");
}
