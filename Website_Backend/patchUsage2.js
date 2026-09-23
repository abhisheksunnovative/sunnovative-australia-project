import fs from 'fs';
let content = fs.readFileSync('src/utils/Ocrextractor.js', 'utf8');

const regex = /const usagePatterns = \[[\s\S]*?\];\s*for \(const p of usagePatterns\) \{\s*const m = t\.match\(p\);\s*if \(m\) \{\s*quarterlyKwh = parseFloat\(m\[1\]\.replace\(\/,\/g, ''\)\);\s*if \(billingDays && billingDays > 0\) dailyKwh = \+\(quarterlyKwh \/ billingDays\)\.toFixed\(2\);\s*break;\s*\}\s*\}/m;

const newUsage = `const usagePatterns = [
    /This\\s*bill\\s*[:\\-]?\\s*([\\d,]+(?:\\.\\d+)?)\\s*(?:kWh|units)?/i,
    /(?:Energy\\s*Use|Energy\\s*Usage)\\s*([\\d,]+(?:\\.\\d+)?)/i,
    /Equals\\s*total\\s*units\\s*used\\s*.*\\n.*\\s+([\\d,]+(?:\\.\\d+)?)/i,
    /(?:Total\\s*)?(?:Electricity\\s*)?(?:Usage|Used|Consumption|kWh\\s*Used|Units\\s*Used)[\\s\\S]{0,40}?([\\d,]+(?:\\.\\d+)?)\\s*(?:kWh|kW|units)/i,
    /([\\d,]+(?:\\.\\d+)?)\\s*kWh\\s*(?:used|consumed|usage)/i,
    /(?:Peak\\s*\\+\\s*Off.?Peak|Total)\\s*(?:Usage)?\\s*[:\\-]?\\s*([\\d,]+(?:\\.\\d+)?)\\s*kWh/i,
  ];
  for (const p of usagePatterns) {
    const m = t.match(p);
    if (m) {
      const context = t.substring(Math.max(0, m.index - 20), m.index + m[0].length);
      if (!/Average|daily/i.test(context)) {
        quarterlyKwh = parseFloat(m[1].replace(/,/g, ''));
        if (billingDays && billingDays > 0) dailyKwh = +(quarterlyKwh / billingDays).toFixed(2);
        break;
      }
    }
  }`;

if (regex.test(content)) {
  content = content.replace(regex, newUsage);
  fs.writeFileSync('src/utils/Ocrextractor.js', content);
  console.log("Usage patched successfully");
} else {
  console.log("Usage regex did not match!");
}
