const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

// I need to add the closing div and the right pane BEFORE the footer
// The footer looks like this:
/*
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
*/

const targetCloseRegex = / {12}<\/div>\s+<\/div>\s+<\/div>\s+<div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">/;

const replacement = `            </div>
              </div>
            </div>

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

code = code.replace(targetCloseRegex, replacement);

fs.writeFileSync(path, code);
console.log("Fixed the syntax error by closing the div and adding the right pane!");
