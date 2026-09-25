const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Fix JSX Syntax Error
code = code.replace(/1\. Highlight text here -> 2\. Click Auto on a field/g, '1. Highlight text here -&gt; 2. Click Auto on a field');

// 2. Fix missing setPdfFile
const scanBlockRegex = /(const handleScanSampleBill = async \(e\) => {[\s\n]*const file = e\.target\.files\[0\];[\s\n]*if \(\!file\) return;)/;
code = code.replace(scanBlockRegex, `$1\n\n    setPdfFile(file);`);

fs.writeFileSync(path, code);
console.log("Fixed JSX syntax error and missing setPdfFile.");
