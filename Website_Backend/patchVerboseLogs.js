import fs from 'fs';
let content = fs.readFileSync('src/utils/Ocrextractor.js', 'utf8');

// Add log for retailer
content = content.replace(
  /if \(domainPattern\.test\(t\)\) \{ retailer = r\.id; break; \}/g,
  "if (domainPattern.test(t)) { retailer = r.id; console.log('[DEBUG] Retailer matched via Domain:', r.id); break; }"
);
content = content.replace(
  /if \(!\/\(\?:call\|faults\?\\|emergenc\(\?:y\\|ies\)\\|distributor\\|network\)\\\\b\/i\.test\(context\)\) \{\s*retailer = r\.id;\s*break;\s*\}/g,
  "if (!/(?:call|faults?|emergenc(?:y|ies)|distributor|network)\\b/i.test(context)) {\n        retailer = r.id;\n        console.log('[DEBUG] Retailer matched via Keyword:', r.id);\n        break;\n      }"
);

// Add log for accountNumber
content = content.replace(
  /if \(acctMatch\) accountNumber = acctMatch\[1\]\.trim\(\);/g,
  "if (acctMatch) {\n    accountNumber = acctMatch[1].trim();\n    console.log('[DEBUG] Account Number matched:', accountNumber);\n  }"
);

// Add log for customerName
content = content.replace(
  /if \(m\) \{ customerName = m\[1\]\.trim\(\); break; \}/g,
  "if (m) { customerName = m[1].trim(); console.log('[DEBUG] Customer Name matched via namePatterns:', customerName); break; }"
);
content = content.replace(
  /if \(nameMatch\) customerName = nameMatch\[1\]\.trim\(\);/g,
  "if (nameMatch) { customerName = nameMatch[1].trim(); console.log('[DEBUG] Customer Name matched via ALL-CAPS fallback:', customerName); }"
);

// Add log for usage quarterlyKwh
content = content.replace(
  /quarterlyKwh = parseFloat\(m\[1\]\.replace\(\/,\/g, ''\)\);/g,
  "quarterlyKwh = parseFloat(m[1].replace(/,/g, ''));\n      console.log('[DEBUG] Usage (kWh) matched via standard pattern:', quarterlyKwh);"
);
content = content.replace(
  /quarterlyKwh = sum;/g,
  "quarterlyKwh = sum;\n      console.log('[DEBUG] Usage (kWh) matched via Multi-period sum:', quarterlyKwh);"
);

// Add log for quarterlyBillAmount
content = content.replace(
  /quarterlyBillAmount = parseFloat\(m\[1\]\.replace\(\/,\/g, ''\)\);/g,
  "quarterlyBillAmount = parseFloat(m[1].replace(/,/g, ''));\n    console.log('[DEBUG] Bill Amount matched:', quarterlyBillAmount);"
);

fs.writeFileSync('src/utils/Ocrextractor.js', content);
console.log("Added comprehensive debug logs!");
