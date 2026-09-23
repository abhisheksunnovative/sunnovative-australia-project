import fs from 'fs';
let content = fs.readFileSync('src/utils/Ocrextractor.js', 'utf8');

const amountRegex = /const amountPatterns = \[[\s\S]*?\];\s*for \(const p of amountPatterns\) \{\s*const m = t\.match\(p\);\s*if \(m\) \{\s*quarterlyBillAmount = parseFloat\(m\[1\]\.replace\(\/,\/g, ''\)\);\s*break;\s*\}\s*\}/m;

const newAmount = `const amountPatterns = [
  // 1. Strict exact matches (highest priority)
  /(?:Total\\s*Amount\\s*(?:Due|Payable|Outstanding)|Amount\\s*(?:Due|Payable)|Balance\\s*Due|Please\\s*Pay|Total\\s*balance)\\s*[:\\-]?\\s*\\$\\s*([\\d,]+(?:\\.\\d{2})?)/i,
  /(?:Total\\s*(?:Current\\s*)?Bill|Bill\\s*Total)\\s*[:\\-]?\\s*\\$\\s*([\\d,]+(?:\\.\\d{2})?)/i,
  /\\$\\s*([\\d,]+\\.\\d{2})\\s*(?:is\\s*due|payable|due\\s*by)/i,
  // 2. Wider scan for boxed/widget layouts (e.g. "TOTAL DUE" ... "$1,020.42" separated by date/labels)
  /(?:TOTAL\\s*DUE|Total\\s*due)[\\s\\S]{0,80}?\\$\\s*([\\d,]+(?:\\.\\d{2})?)/i,
  // 3. Loose matches (scan ahead up to 30 chars max)
  /(?:Total\\s*Amount\\s*Due|Amount\\s*Due|Please\\s*Pay)[\\s\\S]{0,30}?\\$\\s*([\\d,]+(?:\\.\\d{2})?)/i,
];
for (const p of amountPatterns) {
  const m = t.match(p);
  if (m) {
    quarterlyBillAmount = parseFloat(m[1].replace(/,/g, ''));
    break;
  }
}`;

if (amountRegex.test(content)) {
  content = content.replace(amountRegex, newAmount);
  fs.writeFileSync('src/utils/Ocrextractor.js', content);
  console.log("amountPatterns updated!");
} else {
  console.log("amountPatterns regex did not match");
}
