import fs from 'fs';
let content = fs.readFileSync('src/utils/Ocrextractor.js', 'utf8');

const nameRegex = /let customerName = null;\s*const namePatterns = \[[\s\S]*?\];\s*for \(const p of namePatterns\) \{\s*const m = t\.match\(p\);\s*if \(m\) \{ customerName = m\[1\]\.trim\(\); break; \}\s*\}\s*if \(!customerName\) \{\s*const nameMatch = t\.match\(\/\(\?:Name\|Customer\|Account\\s\*holder\)\[\\s:\]\*\(\[A-Z\]\[a-zA-Z\\s\\-'\]\{3,30\}\)\/i\);\s*if \(nameMatch && !\/Name\/i\.test\(nameMatch\[1\]\) && !\/account\/i\.test\(nameMatch\[1\]\)\) \{\s*customerName = nameMatch\[1\]\.trim\(\);\s*\} else \{\s*const upperName = t\.match\(\/\\\\b\(\[A-Z\]\[A-Z\\s\]\{5,30\}\)\\\\b\/\);\s*if \(upperName && !\/TAX\|INVOICE\|ACCOUNT\|SUMMARY\|ELECTRICITY\/i\.test\(upperName\[1\]\)\) \{\s*customerName = upperName\[1\]\.trim\(\);\s*\}\s*\}\s*\}/m;

const newName = `let customerName = null;
const namePatterns = [
  /(?:Customer|Account\\s*Holder|Account\\s*Name)\\s*[:\\-]?\\s*([A-Z][a-z]+(?:\\s+[A-Z][a-z]+){1,3})(?=\\s*(?:Supply|Account|NMI|$))/i,
  /Dear\\s+(?:Mr\\.?\\s*|Ms\\.?\\s*|Mrs\\.?\\s*)?([A-Z][a-z]+(?:\\s+[A-Z][a-z]+){0,3}),?/i,
];
for (const p of namePatterns) {
  const m = t.match(p);
  if (m) { customerName = m[1].trim(); break; }
}

// Uppercase-only fallback (bills me naam aksar ALL CAPS hota hai address-block me)
if (!customerName) {
  const nameMatch = t.match(/(?:Name|Customer|Account\\s*holder)[\\s:]*\\n?([A-Z][A-Z\\s\\-'&]{3,40})(?=\\n)/);
  if (nameMatch) customerName = nameMatch[1].trim();
}`;

if (nameRegex.test(content)) {
  content = content.replace(nameRegex, newName);
  fs.writeFileSync('src/utils/Ocrextractor.js', content);
  console.log("customerName updated!");
} else {
  console.log("customerName regex did not match");
}
