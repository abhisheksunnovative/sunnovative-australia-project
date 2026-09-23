const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/utils/RegexDictionary.js';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /"\(\?:Total\\\\s\*Amount\\\\s\*Due\|Amount\\\\s\*Due\|Please\\\\s\*Pay\)\[\\\\s\\\\S\]\{0,30\}\\\?\\\\\\$\\\\s\*\(\[\\\\d,\]\+\(\?:\\\\.\\\\d\{2\}\)\?\)"\s*\],/,
  `"(?:Total\\s*Amount\\s*Due|Amount\\s*Due|Please\\s*Pay)[\\s\\S]{0,30}?\\$\\s*([\\d,]+(?:\\.\\d{2})?)",\n    "(?:TOTAL\\s*CHARGES|Total\\s*\\\\(\\\$\\\\)\\s*amount\\s*due)\\s*[:\\\\-]?\\s*\\$\\s*([\\\\d,]+(?:\\\\.\\\\d{2})?)"\n  ],`
);

code = code.replace(
  /"\(\[\\\\d,\]\+\(\?:\\\\.\\\\d\+\)\?\)\\\\s\*kWh\\\\s\*\(\?:used\|consumed\|usage\|total\)"\s*\],/,
  `"([\\d,]+(?:\\.\\d+)?)\\s*kWh\\s*(?:used|consumed|usage|total)",\n    "Total\\s*Consumption\\s*Charges\\s*[\\s\\S]{0,40}?([\\d,]+(?:\\.\\d+)?)\\s*kWh"\n  ],`
);

fs.writeFileSync(path, code);
console.log("Patched dictionary using regex!");
