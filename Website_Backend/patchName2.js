import fs from 'fs';
let content = fs.readFileSync('src/utils/Ocrextractor.js', 'utf8');

const nameFixed = `  let customerName = null;
  const namePatterns = [
    /(?:Customer|Account\\s*Holder|Account\\s*Name|Name)\\s*[:\\-]?\\s*([A-Z][a-z]+(?:\\s+[A-Z][a-z]+){1,3})(?=\\s*(?:Supply|Account|NMI|$))/i,
    /Dear\\s+(?:Mr\\.?\\s*|Ms\\.?\\s*|Mrs\\.?\\s*)?([A-Z][a-z]+(?:\\s+[A-Z][a-z]+){0,3}),?/i,
  ];
  for (const p of namePatterns) {
    const m = t.match(p);
    if (m) { customerName = m[1].trim(); break; }
  }
  
  if (!customerName) {
    const nameMatch = t.match(/(?:Name|Customer|Account\\s*holder)[\\s:]*([A-Z][a-zA-Z\\s\\-']{3,30})/i);
    if (nameMatch && !/Name/i.test(nameMatch[1]) && !/account/i.test(nameMatch[1])) {
      customerName = nameMatch[1].trim();
    } else {
      const upperName = t.match(/\\b([A-Z][A-Z\\s]{5,30})\\b/);
      if (upperName && !/TAX|INVOICE|ACCOUNT|SUMMARY|ELECTRICITY/i.test(upperName[1])) {
         customerName = upperName[1].trim();
      }
    }
  }`;

const regex = /let customerName = null;\s*for \(const p of namePatterns\) \{\s*const m = t\.match\(p\);\s*if \(m\) \{ customerName = m\[1\]\.trim\(\); break; \}\s*\}/m;

content = content.replace(regex, nameFixed);
fs.writeFileSync('src/utils/Ocrextractor.js', content);
console.log("Patched name extraction!");
