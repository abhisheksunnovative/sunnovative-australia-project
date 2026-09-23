const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/utils/RegexDictionary.js';
let code = fs.readFileSync(path, 'utf8');

// 1. Add amountPattern
const oldAmountPatterns = `"(\\?:Total\\\\s*Amount\\\\s*Due|Amount\\\\s*Due|Please\\\\s*Pay)[\\\\s\\\\S]{0,30}\\?\\$\\\\s*([\\\\d,]+(?:\\\\.\\\\d{2})\\?)"
  ],`;
const newAmountPatterns = `"(?:Total\\s*Amount\\s*Due|Amount\\s*Due|Please\\s*Pay)[\\s\\S]{0,30}?\\$\\s*([\\d,]+(?:\\.\\d{2})?)",
    "(?:TOTAL\\s*CHARGES|Total\\s*\\(\\$\\)\\s*amount\\s*due)\\s*[:\\-]?\\s*\\$\\s*([\\d,]+(?:\\.\\d{2})?)"
  ],`;

// The exact string in the file is:
// "(?:Total\s*Amount\s*Due|Amount\s*Due|Please\s*Pay)[\s\S]{0,30}?\$\s*([\d,]+(?:\.\d{2})?)"

const regexAmount = /"\(\?:Total\\s\*Amount\\s\*Due\|Amount\\s\*Due\|Please\\s\*Pay\)\[\\s\\S\]\{0,30\}\\\?\\\$\\s\*\(\[\\d,\]\+\(\?:\\\\.\\d\{2\}\)\?\)"\n\s*\],/;
const replacementAmount = `"(?:Total\\s*Amount\\s*Due|Amount\\s*Due|Please\\s*Pay)[\\s\\S]{0,30}?\\$\\s*([\\d,]+(?:\\.\\d{2})?)",\n    "(?:TOTAL\\s*CHARGES|Total\\s*\\\\(\\\$\\\\)\\s*amount\\s*due)\\s*[:\\\\-]?\\s*\\$\\s*([\\\\d,]+(?:\\\\.\\\\d{2})?)"\n  ],`;

if (regexAmount.test(code)) {
  code = code.replace(regexAmount, replacementAmount);
  console.log("Patched amountPatterns via regex");
} else {
  // Let's use string replace for CRLF/LF robustly
  const target1 = `"(?:Total\\s*Amount\\s*Due|Amount\\s*Due|Please\\s*Pay)[\\s\\S]{0,30}?\\$\\s*([\\d,]+(?:\\.\\d{2})?)"\n  ],`;
  const target1_crlf = target1.replace(/\n/g, '\r\n');
  const rep1 = `"(?:Total\\s*Amount\\s*Due|Amount\\s*Due|Please\\s*Pay)[\\s\\S]{0,30}?\\$\\s*([\\d,]+(?:\\.\\d{2})?)",\n    "(?:TOTAL\\s*CHARGES|Total\\s*\\(\\$\\)\\s*amount\\s*due)\\s*[:\\-]?\\s*\\$\\s*([\\d,]+(?:\\.\\d{2})?)"\n  ],`;
  if (code.includes(target1)) {
    code = code.replace(target1, rep1);
    console.log("Patched amountPatterns (LF)");
  } else if (code.includes(target1_crlf)) {
    code = code.replace(target1_crlf, rep1.replace(/\n/g, '\r\n'));
    console.log("Patched amountPatterns (CRLF)");
  } else {
    console.log("Failed to patch amountPatterns");
  }
}

// 2. Add usagePattern
const target2 = `"([\\d,]+(?:\\.\\d+)?)\\s*kWh\\s*(?:used|consumed|usage|total)"\n  ],`;
const target2_crlf = target2.replace(/\n/g, '\r\n');
const rep2 = `"([\\d,]+(?:\\.\\d+)?)\\s*kWh\\s*(?:used|consumed|usage|total)",\n    "Total\\s*Consumption\\s*Charges\\s*[\\s\\S]{0,40}?([\\d,]+(?:\\.\\d+)?)\\s*kWh"\n  ],`;
if (code.includes(target2)) {
  code = code.replace(target2, rep2);
  console.log("Patched usagePatterns (LF)");
} else if (code.includes(target2_crlf)) {
  code = code.replace(target2_crlf, rep2.replace(/\n/g, '\r\n'));
  console.log("Patched usagePatterns (CRLF)");
} else {
  console.log("Failed to patch usagePatterns");
}

fs.writeFileSync(path, code);
