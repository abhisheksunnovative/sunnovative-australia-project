import fs from 'fs';
let content = fs.readFileSync('src/utils/Ocrextractor.js', 'utf8');

const amountRegex = /const amountPatterns = \[[\s\S]*?\];/m;
const amountNew = `const amountPatterns = [
    /(?:Total\\s*balance|Total\\s*Amount\\s*(?:Due|Payable|Outstanding)|Amount\\s*(?:Due|Payable)|Balance\\s*Due|Please\\s*Pay)[\\s\\S]{0,150}?\\$\\s*([\\d,]+(?:\\.\\d{2})?)/i,
    /(?:Total\\s*(?:Current\\s*)?Bill|Bill\\s*Total)\\s*[:\\-]?\\s*\\$\\s*([\\d,]+(?:\\.\\d{2})?)/i,
    /\\$\\s*([\\d,]+\\.\\d{2})\\s*(?:is\\s*due|payable|due\\s*by)/i,
    /\\bTotal\\s*[:\\-]?\\s*\\$\\s*([\\d,]+(?:\\.\\d{2})?)/i,
  ];`;

if (amountRegex.test(content)) {
  content = content.replace(amountRegex, amountNew);
  fs.writeFileSync('src/utils/Ocrextractor.js', content);
  console.log("Amount patched");
}
