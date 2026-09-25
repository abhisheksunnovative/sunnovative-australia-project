const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

// Add numPages state
const stateTarget = `const [pdfFile, setPdfFile] = useState(null);`;
const newState = `const [pdfFile, setPdfFile] = useState(null);\n  const [numPages, setNumPages] = useState(null);`;
code = code.replace(stateTarget, newState);

// Update Document render logic
const renderTarget = /<Document[\s\n]*file=\{pdfFile\}[\s\n]*loading=\{<div className="text-sm text-slate-500 p-4">Loading visual PDF viewer...<\/div>\}[\s\n]*error=\{<div className="text-sm text-red-500 p-4">Failed to load PDF visual layer\.<\/div>\}[\s\n]*>[\s\n]*<Page[\s\n]*pageNumber=\{1\}[\s\n]*renderTextLayer=\{true\}[\s\n]*renderAnnotationLayer=\{false\}[\s\n]*scale=\{1\.2\}[\s\n]*className="shadow-lg bg-white"[\s\n]*\/>[\s\n]*<\/Document>/;

const newRender = `<Document 
                     file={pdfFile} 
                     onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                     loading={<div className="text-sm text-slate-500 p-4">Loading visual PDF viewer...</div>}
                     error={<div className="text-sm text-red-500 p-4">Failed to load PDF visual layer.</div>}
                   >
                     {numPages ? Array.from(new Array(numPages), (el, index) => (
                       <Page 
                         key={\`page_\${index + 1}\`}
                         pageNumber={index + 1} 
                         renderTextLayer={true} 
                         renderAnnotationLayer={false} 
                         scale={1.2} 
                         className="shadow-lg bg-white mb-4"
                       />
                     )) : (
                       <Page 
                         pageNumber={1} 
                         renderTextLayer={true} 
                         renderAnnotationLayer={false} 
                         scale={1.2} 
                         className="shadow-lg bg-white mb-4"
                       />
                     )}
                   </Document>`;

code = code.replace(renderTarget, newRender);

fs.writeFileSync(path, code);
console.log("Updated Document to render all pages.");
