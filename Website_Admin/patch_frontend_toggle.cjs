const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add state for viewMode
code = code.replace(
  'const [activeTab, setActiveTab] = useState("templates");',
  'const [activeTab, setActiveTab] = useState("templates");\n  const [viewMode, setViewMode] = useState("visual");'
);

// 2. Change the header of the viewer to include a toggle button
const targetHeader = `<div className="p-3 bg-slate-200 border-b border-slate-300 font-bold text-xs text-slate-700 flex justify-between">
                  {pdfFile ? "Visual Bill Viewer" : "Raw Bill Text"}
                  <span className="text-[10px] font-normal text-indigo-700">1. Highlight text here -&gt; 2. Click Auto on a field</span>
               </div>`;

const newHeader = `<div className="p-3 bg-slate-200 border-b border-slate-300 font-bold text-xs text-slate-700 flex justify-between items-center">
                  <div className="flex gap-2">
                      <button type="button" onClick={() => setViewMode('visual')} className={\`px-2 py-1 rounded \${viewMode === 'visual' ? 'bg-indigo-500 text-white' : 'bg-slate-300 text-slate-600'}\`}>Visual Viewer</button>
                      <button type="button" onClick={() => setViewMode('raw')} className={\`px-2 py-1 rounded \${viewMode === 'raw' ? 'bg-indigo-500 text-white' : 'bg-slate-300 text-slate-600'}\`}>Raw Text</button>
                  </div>
                  <span className="text-[10px] font-normal text-indigo-700">1. Highlight text here -&gt; 2. Click Auto on a field</span>
               </div>`;

code = code.replace(targetHeader, newHeader);

// 3. Change the conditional rendering from `pdfFile ? ... : ...` to `pdfFile && viewMode === 'visual' ? ... : ...`
const targetBody = `{pdfFile ? (
                 <div className="flex-1 overflow-auto bg-slate-200 relative flex justify-center py-4">`;

const newBody = `{pdfFile && viewMode === 'visual' ? (
                 <div className="flex-1 overflow-auto bg-slate-200 relative flex justify-center py-4">`;

code = code.replace(targetBody, newBody);

fs.writeFileSync(file, code);
console.log("Patched UI for Raw Text Toggle");
