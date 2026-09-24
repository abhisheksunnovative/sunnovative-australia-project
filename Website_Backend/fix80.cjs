const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

const regexTrash = /<button onClick=\{\(\) => removeRule\(idx\)\} className="p-1 text-red-500 hover:bg-red-50 rounded mt-5">\s*<Trash2 className="w-4 h-4" \/>\s*<\/button>/g;

const replacementTrash = `<div className="flex flex-col gap-2 mt-5">
                        <button onClick={() => removeRule(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded border border-red-100 bg-red-50/50" title="Delete Rule">
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                        <button onClick={() => handleHighlightGenerate(idx, rule.field)} title="Generate regex from highlighted text" className="p-1 text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-200 bg-indigo-50/50 flex flex-col items-center justify-center">
                          <span className="text-sm leading-none">🖊️</span>
                          <span className="text-[8px] font-bold">Auto</span>
                        </button>
                      </div>`;

code = code.replace(regexTrash, replacementTrash);
fs.writeFileSync(path, code);
console.log("Successfully replaced the Trash button with the new Action buttons!");
