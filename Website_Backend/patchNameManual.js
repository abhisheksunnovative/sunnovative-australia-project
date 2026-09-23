import fs from 'fs';
let content = fs.readFileSync('src/utils/Ocrextractor.js', 'utf8');

const nameStart = content.indexOf('let customerName = null;');
const nameEnd = content.indexOf('// Distributor (DNSP)');

if (nameStart !== -1 && nameEnd !== -1) {
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
  }

  `;
  
  content = content.substring(0, nameStart) + newName + content.substring(nameEnd);
  fs.writeFileSync('src/utils/Ocrextractor.js', content);
  console.log("customerName replaced manually!");
} else {
  console.log("Could not find start/end bounds for customerName");
}
