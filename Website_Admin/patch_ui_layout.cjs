const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `                              <div className="flex justify-between items-center">
                                {rule.previewValue && (
                                  <div className="text-xs truncate max-w-full">
                                    {rule.previewValue === 'Not Found' || rule.previewValue === 'Regex Error' || rule.previewValue.includes('Invalid') 
                                      ? <span className="text-red-500 font-bold">❌ {rule.previewValue}</span>
                                      : <span className="text-green-600 font-bold">✅ {rule.previewValue}</span>}
                                    {rule.regex && !rule.heading && <span className="text-[9px] text-slate-400 ml-2">(Using Generic Pre-defined Regex)</span>}
                                  </div>
                                )}
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => handleRegenerate(idx, rule.field)} className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200" disabled={!rule.mainData}>
                                    🔄 Regenerate & Test
                                    </button>
                                </div>
                              </div>`;

const replacement = `                              <div className="flex flex-col gap-2 mt-1">
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => handleRegenerate(idx, rule.field)} className="w-full text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-1.5 rounded hover:bg-indigo-200" disabled={!rule.mainData}>
                                    🔄 Regenerate Regex
                                    </button>
                                </div>
                                {rule.previewValue && (
                                  <div className="text-xs break-all bg-slate-100 p-1.5 rounded">
                                    {rule.previewValue === 'Not Found' || rule.previewValue === 'Regex Error' || rule.previewValue.includes('Invalid') 
                                      ? <span className="text-red-500 font-bold">❌ {rule.previewValue}</span>
                                      : <span className="text-green-600 font-bold">✅ {rule.previewValue}</span>}
                                    {rule.regex && !rule.heading && <span className="text-[9px] text-slate-400 ml-2 block mt-1">(Using Generic Pre-defined Regex)</span>}
                                  </div>
                                )}
                              </div>`;

code = code.replace(targetStr, replacement);

const targetStr2 = `                            <div className="flex flex-col gap-2">
                              <div className="grid grid-cols-3 gap-2">`;
const replacement2 = `                            <div className="flex flex-col gap-2">
                              <div className="grid grid-cols-3 gap-2 relative z-10">`;

code = code.replace(targetStr2, replacement2);

fs.writeFileSync(file, code);
console.log("Patched UI layout");
