const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

// Insert a helper function for rendering context blocks
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

if (!code.includes('renderRegexContext')) {
    code = code.replace(
        'const BillTemplateManagementScreen = () => {',
        'const BillTemplateManagementScreen = () => {\n' + helperFunc
    );
}

// Inject the rendering block right under the preview span
const targetBlock = `{rule.previewValue === 'Not Found' || rule.previewValue === 'Regex Error' || rule.previewValue.includes('Invalid') 
                                  ? <span className="text-red-500 font-bold">❌ {rule.previewValue}</span>
                                  : <span className="text-green-600 font-bold">✅ {rule.previewValue}</span>}`;

const replacementBlock = `{rule.previewValue === 'Not Found' || rule.previewValue === 'Regex Error' || rule.previewValue.includes('Invalid') 
                                  ? <span className="text-red-500 font-bold">❌ {rule.previewValue}</span>
                                  : <span className="text-green-600 font-bold">✅ {rule.previewValue}</span>}
                                {renderRegexContext(rule.regex)}`;

code = code.replace(targetBlock, replacementBlock);

fs.writeFileSync(path, code);
console.log("Injected Context Render UI!");
