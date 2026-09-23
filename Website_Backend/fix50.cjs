const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/utils/RegexDictionary.js';
let code = fs.readFileSync(path, 'utf8');

const oldStr1 = `    "(?:Total\\\\s*Amount\\\\s*Due|Amount\\\\s*Due|Please\\\\s*Pay)[\\\\s\\\\S]{0,30}?\\\\$\\\\s*([\\\\d,]+(?:\\\\.\\\\d{2})?)"\\r?\\n  ],`;
const oldStr1Regex = /"(?:\?:Total\\s\*Amount\\s\*Due\|Amount\\s\*Due\|Please\\s\*Pay)\[\\s\\S\]\{0,30\}\?\\\$[\s\S]*?\],/;

// Just replace everything between amountPatterns and usagePatterns
const patternRegex = /amountPatterns:\s*\[([\s\S]*?)\],\s*usagePatterns:\s*\[([\s\S]*?)\],\s*namePatterns:/;

const newBlock = `amountPatterns: [
    "(?:Total\\\\s*Amount\\\\s*(?:Due|Payable|Outstanding)|Amount\\\\s*(?:Due|Payable)|Balance\\\\s*Due|Please\\\\s*Pay|Total\\\\s*balance)\\\\s*[:\\\\-]?\\\\s*\\\\$\\\\s*([\\\\d,]+(?:\\\\.\\\\d{2})?)",
    "(?:Total\\\\s*(?:Current\\\\s*)?Bill|Bill\\\\s*Total)\\\\s*[:\\\\-]?\\\\s*\\\\$\\\\s*([\\\\d,]+(?:\\\\.\\\\d{2})?)",
    "\\\\$\\\\s*([\\\\d,]+\\\\.\\\\d{2})\\\\s*(?:is\\\\s*due|payable|due\\\\s*by)",
    "(?:TOTAL\\\\s*DUE|Total\\\\s*due)[\\\\s\\\\S]{0,80}?\\\\$\\\\s*([\\\\d,]+(?:\\\\.\\\\d{2})?)",
    "(?:Total\\\\s*Amount\\\\s*Due|Amount\\\\s*Due|Please\\\\s*Pay)[\\\\s\\\\S]{0,30}?\\\\$\\\\s*([\\\\d,]+(?:\\\\.\\\\d{2})?)",
    "(?:TOTAL\\\\s*CHARGES|Total\\\\s*\\\\(\\\$\\\\)\\\\s*amount\\\\s*due)\\\\s*[:\\\\-]?\\\\s*\\\\$\\\\s*([\\\\d,]+(?:\\\\.\\\\d{2})?)"
  ],
  
  usagePatterns: [
    "This\\\\s*bill\\\\s*[:\\\\-]?\\\\s*([\\\\d,]+(?:\\\\.\\\\d+)?)\\\\s*(?:kWh|units)",
    "(?:Energy\\\\s*Use|Energy\\\\s*Usage|electricity\\\\s*you\\\\s*used|Total\\\\s*electricity\\\\s*used)\\\\s*([\\\\d,]+(?:\\\\.\\\\d+)?)",
    "Equals\\\\s*total\\\\s*units\\\\s*used\\\\s*.*\\\\n.*\\\\s+([\\\\d,]+(?:\\\\.\\\\d+)?)",
    "(?:Total\\\\s*)?(?:Electricity\\\\s*)?(?:Usage|Used|Consumption|kWh\\\\s*Used|Units\\\\s*Used)[\\\\s\\\\S]{0,40}?([\\\\d,]+(?:\\\\.\\\\d+)?)\\\\s*(?:kWh|kW|units)",
    "([\\\\d,]+(?:\\\\.\\\\d+)?)\\\\s*kWh\\\\s*(?:used|consumed|usage|total)",
    "Total\\\\s*Consumption\\\\s*Charges\\\\s*[\\\\s\\\\S]{0,40}?([\\\\d,]+(?:\\\\.\\\\d+)?)\\\\s*kWh"
  ],

  namePatterns:`;

code = code.replace(patternRegex, newBlock);
fs.writeFileSync(path, code);
console.log("Patched RegexDictionary successfully!");
