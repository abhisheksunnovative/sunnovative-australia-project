const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Frontend/src/components/LeadForm.jsx';
let code = fs.readFileSync(path, 'utf8');

const helperCode = `
      setScanConfidence(data.confidence || data.confidenceScore);
      const ex = data.extracted || data.extractedData || {};

      const formatToYYYYMMDD = (dateStr) => {
          if (!dateStr) return "";
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return dateStr;
          const pad = (n) => n.toString().padStart(2, '0');
          return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
      };
`;

code = code.replace(
  `      setScanConfidence(data.confidence || data.confidenceScore);
      const ex = data.extracted || data.extractedData || {};`,
  helperCode
);

code = code.replace(/if \(ex\.dueDate\) setDueDate\(ex\.dueDate\);/g, `if (ex.dueDate) setDueDate(formatToYYYYMMDD(ex.dueDate));`);
code = code.replace(/if \(data\.country === "australia"\) \{/g, `if (getCountryCode() === "australia" || data.country === "australia") {`);

const auExtraCode = `        if (ex.quarterlyKwh) setScannedQuarterlyKwh(ex.quarterlyKwh);
        if (ex.billIssueDate) setManualBillDate(formatToYYYYMMDD(ex.billIssueDate));`;

code = code.replace(/if \(ex\.quarterlyKwh\) setScannedQuarterlyKwh\(ex\.quarterlyKwh\);/g, auExtraCode);

fs.writeFileSync(path, code);
console.log("Fixed LeadForm scan mapping");
