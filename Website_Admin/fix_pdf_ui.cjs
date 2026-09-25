const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

// Use regex to match the whole block securely
const regexBlock = /<div className="space-y-3 flex flex-col h-full overflow-hidden border border-slate-200 rounded-xl bg-slate-50">[\s\S]*?<\/pre>\s*<\/div>/;

const newRender = `<div className="space-y-3 flex flex-col h-full overflow-hidden border border-slate-200 rounded-xl bg-slate-50">
               <div className="p-3 bg-slate-200 border-b border-slate-300 font-bold text-xs text-slate-700 flex justify-between">
                  {pdfFile ? "Visual Bill Viewer" : "Raw Bill Text"}
                  <span className="text-[10px] font-normal text-indigo-700">1. Highlight text here -> 2. Click Auto on a field</span>
               </div>
               {pdfFile ? (
                 <div className="flex-1 overflow-y-auto bg-slate-200 relative flex justify-center py-4">
                   <Document 
                     file={pdfFile} 
                     loading={<div className="text-sm text-slate-500 p-4">Loading visual PDF viewer...</div>}
                     error={<div className="text-sm text-red-500 p-4">Failed to load PDF visual layer.</div>}
                   >
                     <Page 
                       pageNumber={1} 
                       renderTextLayer={true} 
                       renderAnnotationLayer={false} 
                       scale={1.2} 
                       className="shadow-lg bg-white"
                     />
                   </Document>
                 </div>
               ) : (
                 <pre className="p-3 text-[10px] font-mono whitespace-pre-wrap flex-1 overflow-y-auto text-slate-600">
                    {rawTextPreview || "Upload a sample bill to see raw text here..."}
                 </pre>
               )}
            </div>`;

code = code.replace(regexBlock, newRender);

fs.writeFileSync(path, code);
console.log("Successfully replaced the UI block with react-pdf viewer.");
