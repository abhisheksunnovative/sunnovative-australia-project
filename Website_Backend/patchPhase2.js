import fs from 'fs';

const ocrFile = 'src/utils/Ocrextractor.js';
let ocrContent = fs.readFileSync(ocrFile, 'utf8');

// 1. Add new DISCOMS
ocrContent = ocrContent.replace(
  /{ id: 'UPPCL', pattern: \/UPPCL\|uppcl\\\.org\/i,                                              state: 'Uttar Pradesh' },/,
  `{ id: 'UPCL', pattern: /\\bUPCL\\b|UTTARAKHAND\\s*POWER\\s*CORPORATION/i, state: 'Uttarakhand' },\n  { id: 'UPPCL', pattern: /UPPCL|uppcl\\.org/i,                                              state: 'Uttar Pradesh' },\n  { id: 'MePDCL', pattern: /Me[-\\s]?PDCL|MEGHALAYA\\s*POWER\\s*DISTRIBUTION/i, state: 'Meghalaya' },\n  { id: 'Puducherry Electricity', pattern: /Government\\s*of\\s*Puducherry|Puducherry.*Electricity\\s*Dept/i, state: 'Puducherry' },`
);

ocrContent = ocrContent.replace(
  /const UP_DISCOMS     = \['PVVNL', 'DVVNL', 'MVVNL', 'PuVVNL', 'UPPCL'\];/,
  `const UP_DISCOMS     = ['PVVNL', 'DVVNL', 'MVVNL', 'PuVVNL', 'UPPCL', 'UPCL'];\nconst OTHER_DISCOMS  = ['MePDCL', 'Puducherry Electricity'];`
);

// 2. Fix Multi-period kWh in parseAuBillText
ocrContent = ocrContent.replace(
  /let quarterlyKwh = null, dailyKwh = null;[\s\S]+?\}\n  \}/,
  `let quarterlyKwh = null, dailyKwh = null;

  const canonicalUsagePattern = /(?:Peak\\s*\\+\\s*Off.?Peak|Total\\s*Anytime|Peak|Shoulder|Off.?Peak|Controlled\\s*Load|Generation|Residential\\s*Anytime\\s*consumption|Usage)[\\s\\S]{0,40}?([\\d,]+(?:\\.\\d+)?)\\s*(?:kWh|kW|units)/gi;
  const matches = [...t.matchAll(canonicalUsagePattern)];
  if (matches.length > 0) {
      let sum = 0;
      for (const m of matches) sum += parseFloat(m[1].replace(/,/g, ''));
      quarterlyKwh = sum;
  } else {
      const fallbackUsagePatterns = [
        /(?:Total\\s*)?(?:Electricity\\s*)?(?:Usage|Used|Consumption|kWh\\s*Used|Units\\s*Used)[\\s\\S]{0,40}?([\\d,]+(?:\\.\\d+)?)\\s*(?:kWh|kW|units)/i,
        /([\\d,]+(?:\\.\\d+)?)\\s*kWh\\s*(?:used|consumed|usage)/i,
      ];
      for (const p of fallbackUsagePatterns) {
        const m = t.match(p);
        if (m) {
          quarterlyKwh = parseFloat(m[1].replace(/,/g, ''));
          break;
        }
      }
  }`
);

// 3. Fix AU Bill amount credit
ocrContent = ocrContent.replace(
  /let quarterlyBillAmount = null;\n\n  \/\/ "Total Amount Due[\s\S]+?quarterlyBillAmount = parseFloat\(m\[1\]\.replace\(\/,.*?\/g, ''\)\);\n      break;\n    \}\n  \}/,
  `let quarterlyBillAmount = null;
  let amountType = 'due';

  const amountPatterns = [
    /(?:Total\\s*balance|Total\\s*Amount\\s*(?:Due|Payable|Outstanding)|Amount\\s*(?:Due|Payable)|Balance\\s*Due|Please\\s*Pay|Total)[\\s\\S]{0,150}?\\$\\s*([\\d,]+(?:\\.\\d{2})?)\\s*(cr|credit)?/i,
    /(?:Total\\s*(?:Current\\s*)?Bill|Bill\\s*Total)\\s*[:\\-]?\\s*\\$\\s*([\\d,]+(?:\\.\\d{2})?)\\s*(cr|credit)?/i,
    /\\$\\s*([\\d,]+\\.\\d{2})\\s*(cr|credit)?\\s*(?:is\\s*due|payable|due\\s*by)/i,
  ];
  for (const p of amountPatterns) {
    const m = t.match(p);
    if (m) {
      quarterlyBillAmount = parseFloat(m[1].replace(/,/g, ''));
      if (m[2] && m[2].toLowerCase().startsWith('cr')) amountType = 'credit';
      break;
    }
  }`
);

// Add amountType to return of parseAuBillText
ocrContent = ocrContent.replace(
  /return \{\n    retailer,/,
  `return {\n    amountType,\n    retailer,`
);


fs.writeFileSync(ocrFile, ocrContent);
console.log("Ocrextractor.js patched successfully.");
