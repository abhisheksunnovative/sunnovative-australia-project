const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add imports
const importsTarget = `import NeedsTemplateReviewQueue from './NeedsTemplateReviewQueue';`;
const newImports = `import NeedsTemplateReviewQueue from './NeedsTemplateReviewQueue';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = \`//unpkg.com/pdfjs-dist@\${pdfjs.version}/build/pdf.worker.min.mjs\`;`;
code = code.replace(importsTarget, newImports);

// 2. Add pdfFile state
const stateTarget = `  const [isScanning, setIsScanning] = useState(false);
  const [rawTextPreview, setRawTextPreview] = useState('');`;
const newState = `  const [isScanning, setIsScanning] = useState(false);
  const [rawTextPreview, setRawTextPreview] = useState('');
  const [pdfFile, setPdfFile] = useState(null);`;
code = code.replace(stateTarget, newState);

// 3. Clear pdfFile when closing modal or opening from analytics
const analyticsTarget = `    setRawTextPreview(analyticsItem.rawText || '');
    setIsModalOpen(true);`;
const newAnalytics = `    setRawTextPreview(analyticsItem.rawText || '');
    setPdfFile(null);
    setIsModalOpen(true);`;
code = code.replace(analyticsTarget, newAnalytics);

// 4. Set pdfFile when uploading sample bill
const scanTarget = `  const handleScanSampleBill = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);`;
const newScan = `  const handleScanSampleBill = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPdfFile(file);
    setIsScanning(true);`;
code = code.replace(scanTarget, newScan);

// 5. Replace <pre> with PDF Viewer logic
const renderTarget = `<div className="space-y-3 flex flex-col h-full overflow-hidden border border-slate-200 rounded-xl bg-slate-50">
               <div className="p-3 bg-slate-200 border-b border-slate-300 font-bold text-xs text-slate-700 flex justify-between">
                  Raw Bill Text
                  <span className="text-[10px] font-normal text-indigo-700">1. Highlight text here ➜ 2. Click 🪄 on a field</span>
               </div>
               <pre className="p-3 text-[10px] font-mono whitespace-pre-wrap flex-1 overflow-y-auto text-slate-600">
                  {rawTextPreview || "Upload a sample bill to see raw text here..."}
               </pre>
            </div>`;
const newRender = `<div className="space-y-3 flex flex-col h-full overflow-hidden border border-slate-200 rounded-xl bg-slate-50">
               <div className="p-3 bg-slate-200 border-b border-slate-300 font-bold text-xs text-slate-700 flex justify-between">
                  {pdfFile ? "Visual Bill Viewer" : "Raw Bill Text"}
                  <span className="text-[10px] font-normal text-indigo-700">1. Highlight text here ➜ 2. Click 🪄 on a field</span>
               </div>
               {pdfFile ? (
                 <div className="flex-1 overflow-y-auto bg-slate-200 relative flex justify-center py-4">
                   <Document 
                     file={pdfFile} 
                     loading={<div className="text-sm text-slate-500">Loading PDF...</div>}
                     error={<div className="text-sm text-red-500">Failed to load PDF. Is it a valid file?</div>}
                   >
                     <Page 
                       pageNumber={1} 
                       renderTextLayer={true} 
                       renderAnnotationLayer={false} 
                       scale={1.2} 
                       className="shadow-lg"
                     />
                   </Document>
                 </div>
               ) : (
                 <pre className="p-3 text-[10px] font-mono whitespace-pre-wrap flex-1 overflow-y-auto text-slate-600">
                    {rawTextPreview || "Upload a sample bill to see raw text here..."}
                 </pre>
               )}
            </div>`;
code = code.replace(renderTarget, newRender);

fs.writeFileSync(path, code);
console.log("Updated React component to use react-pdf viewer.");
