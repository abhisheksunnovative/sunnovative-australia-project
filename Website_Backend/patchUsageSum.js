import fs from 'fs';
let content = fs.readFileSync('src/utils/Ocrextractor.js', 'utf8');

const regexUsage = /const usagePatterns = \[[\s\S]*?\];\s*for \(const p of usagePatterns\) \{\s*const m = t\.match\(p\);\s*if \(m\) \{\s*const context = t\.substring\(Math\.max\(0, m\.index - 20\), m\.index \+ m\[0\]\.length\);\s*if \(!\/Average\|daily\/i\.test\(context\)\) \{\s*quarterlyKwh = parseFloat\(m\[1\]\.replace\(\/,\/g, ''\)\);\s*if \(billingDays && billingDays > 0\) dailyKwh = \+\(quarterlyKwh \/ billingDays\)\.toFixed\(2\);\s*break;\s*\}\s*\}\s*\}/m;

const newUsage = `  const usagePatterns = [
    /This\\s*bill\\s*[:\\-]?\\s*([\\d,]+(?:\\.\\d+)?)\\s*(?:kWh|units)?/ig,
    /(?:Energy\\s*Use|Energy\\s*Usage|electricity\\s*you\\s*used|Total\\s*electricity\\s*used)\\s*([\\d,]+(?:\\.\\d+)?)/ig,
    /Equals\\s*total\\s*units\\s*used\\s*.*\\n.*\\s+([\\d,]+(?:\\.\\d+)?)/ig,
    /(?:Total\\s*)?(?:Electricity\\s*)?(?:Usage|Used|Consumption|kWh\\s*Used|Units\\s*Used)[\\s\\S]{0,40}?([\\d,]+(?:\\.\\d+)?)\\s*(?:kWh|kW|units)/ig,
    /([\\d,]+(?:\\.\\d+)?)\\s*kWh\\s*(?:used|consumed|usage|total)/ig,
    /(?:Peak\\s*\\+\\s*Off.?Peak|Total)\\s*(?:Usage)?\\s*[:\\-]?\\s*([\\d,]+(?:\\.\\d+)?)\\s*kWh/ig,
    /([\\d,]{3,}(?:\\.\\d+)?)\\s*(?:kWh|kW)/ig // Generic fallback for large kWh numbers
  ];

  for (const p of usagePatterns) {
    const matches = [...t.matchAll(p)];
    if (matches && matches.length > 0) {
      let sum = 0;
      let validMatchFound = false;
      
      for (const m of matches) {
        const context = t.substring(Math.max(0, m.index - 20), m.index + m[0].length);
        if (!/Average|daily/i.test(context)) {
          sum += parseFloat(m[1].replace(/,/g, ''));
          validMatchFound = true;
        }
      }
      
      if (validMatchFound) {
        // Only sum if we have multiple different values, but avoid double counting if the exact same value appears twice (e.g. on two pages)
        // Wait, if it's Peak 100, OffPeak 200, it's safer to sum. But if it's Total 300 on page 1 and Total 300 on page 2, sum is 600 (wrong).
        // A safer multi-period sum: only use unique values, or sum them if they are small? 
        // Let's just sum unique matches to avoid page duplication, or if they are the exact same match text, maybe deduplicate?
        // Let's deduplicate by the exact parsed number.
        const uniqueVals = [...new Set(matches.map(m => {
          const ctx = t.substring(Math.max(0, m.index - 20), m.index + m[0].length);
          if (!/Average|daily/i.test(ctx)) {
             return parseFloat(m[1].replace(/,/g, ''));
          }
          return null;
        }).filter(v => v !== null))];
        
        quarterlyKwh = uniqueVals.reduce((a, b) => a + b, 0);
        if (billingDays && billingDays > 0) dailyKwh = +(quarterlyKwh / billingDays).toFixed(2);
        break; // Stop checking other patterns once we found a match
      }
    }
  }`;

if (regexUsage.test(content)) {
  content = content.replace(regexUsage, newUsage);
  fs.writeFileSync('src/utils/Ocrextractor.js', content);
  console.log("Multi-period usage patched!");
} else {
  console.log("Usage regex did not match!");
}
