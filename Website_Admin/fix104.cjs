const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

const helperFunc = `
  const renderRegexContext = (regexStr) => {
    if (!regexStr) return null;
    let before = "";
    let after = "";
    
    try {
      const beforeMatch = regexStr.match(/^\\(\\?\\:([^)]+)\\)/);
      if (beforeMatch) {
         before = beforeMatch[1].replace(/\\[\\\\s\\\\n\\]\\+/g, ' ').replace(/\\\\/g, '');
      }
      
      const afterMatch = regexStr.match(/\\(\\?\\=\\[\\\\s\\\\n\\]\\*([^)]+)\\)$/);
      if (afterMatch) {
         after = afterMatch[1].replace(/\\[\\\\s\\\\n\\]\\+/g, ' ').replace(/\\\\/g, '');
      }
      
      if (before || after) {
         return (
           <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 p-1 rounded border border-slate-200">
             {before && <span className="font-semibold text-blue-600 px-1 bg-blue-100 rounded">Heading: {before}</span>}
             <span className="text-slate-400">➜</span>
             <span className="font-semibold text-emerald-600 px-1 bg-emerald-100 rounded">Main Data</span>
             <span className="text-slate-400">➜</span>
             {after && <span className="font-semibold text-purple-600 px-1 bg-purple-100 rounded">Tail: {after}</span>}
           </div>
         );
      }
    } catch(e) {}
    return null;
  };
`;

if (!code.includes('const renderRegexContext = (regexStr) => {')) {
    code = code.replace(
        'export default function BillTemplateManagementScreen() {',
        'export default function BillTemplateManagementScreen() {\n' + helperFunc
    );
    fs.writeFileSync(path, code);
    console.log("Injected renderRegexContext successfully!");
} else {
    console.log("Already exists.");
}
