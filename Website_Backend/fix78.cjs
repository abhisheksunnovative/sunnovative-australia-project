const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

const targetOpen = '<div className="p-6 overflow-y-auto flex-1 space-y-6">';
const replacementOpen = '<div className="p-6 overflow-hidden flex-1 grid grid-cols-2 gap-6"><div className="space-y-6 overflow-y-auto pr-2">';

code = code.replace(targetOpen, replacementOpen);

const targetClose = `              </div>
  
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">`;

const replacementClose = `              </div>
              <div className="space-y-3 flex flex-col h-full overflow-hidden border border-slate-200 rounded-xl bg-slate-50">
                 <div className="p-3 bg-slate-200 border-b border-slate-300 font-bold text-xs text-slate-700 flex justify-between">
                    Raw Bill Text
                    <span className="text-[10px] font-normal text-indigo-700">1. Highlight text here ➔ 2. Click 🖊️ on a field</span>
                 </div>
                 <pre className="p-3 text-[10px] font-mono whitespace-pre-wrap flex-1 overflow-y-auto text-slate-600">
                    {rawTextPreview || "Upload a sample bill to see raw text here..."}
                 </pre>
              </div>
            </div>
  
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">`;

code = code.replace(targetClose, replacementClose);

// Also add the button properly since the regex for the button might have failed too
const targetTrash = `<button onClick={() => removeRule(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded mt-5">
                          <Trash2 className="w-4 h-4" />
                        </button>`;
const replacementTrash = `<div className="flex flex-col gap-2 mt-5">
                          <button onClick={() => removeRule(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Delete Rule">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleHighlightGenerate(idx, rule.field)} title="Generate regex from highlighted text" className="p-1 text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-200 bg-indigo-50/50 flex flex-col items-center justify-center">
                            <span className="text-sm">🖊️</span>
                            <span className="text-[8px] font-bold">Auto</span>
                          </button>
                        </div>`;

code = code.replace(targetTrash, replacementTrash); // Note: replace only replaces the first occurrence! I should use split/join or global replace
code = code.split(targetTrash).join(replacementTrash);

fs.writeFileSync(path, code);
console.log("Fixed Layout!");
