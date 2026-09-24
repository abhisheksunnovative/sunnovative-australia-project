const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

const targetInput = '<input type="text" value={rule.regex} onChange={e => updateRule(idx, \'regex\', e.target.value)} className="w-full p-1.5 text-xs font-mono border border-slate-300 rounded bg-white" placeholder="e.g. Total Amount\\s*([0-9.]+)" />';
const replacement = targetInput + `
                          {rule.previewValue && (
                            <div className="mt-1 text-xs truncate max-w-full">
                              {rule.previewValue === 'Not Found' || rule.previewValue === 'Regex Error' || rule.previewValue.includes('Invalid') 
                                ? <span className="text-red-500 font-bold">❌ {rule.previewValue}</span>
                                : <span className="text-green-600 font-bold">✅ {rule.previewValue}</span>}
                            </div>
                          )}`;

if (code.includes(targetInput)) {
  code = code.replace(targetInput, replacement);
  fs.writeFileSync(path, code);
  console.log("Patched BillTemplateManagementScreen to show previewValue ✅");
} else {
  console.log("Could not find input to replace.");
}
