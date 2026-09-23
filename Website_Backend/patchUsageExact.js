import fs from 'fs';
let content = fs.readFileSync('src/utils/Ocrextractor.js', 'utf8');

const usageRegex = /const usagePatterns = \[[\s\S]*?\];\s*for \(const p of usagePatterns\) \{[\s\S]*?\}\s*\}\s*\}/m;

const newUsage = `const usagePatterns = [
  /This\\s*bill\\s*[:\\-]?\\s*([\\d,]+(?:\\.\\d+)?)\\s*(?:kWh|units)/i,   // note: unit suffix ab MANDATORY hai, optional nahi
  /(?:Energy\\s*Use|Energy\\s*Usage|electricity\\s*you\\s*used|Total\\s*electricity\\s*used)\\s*([\\d,]+(?:\\.\\d+)?)/i,
  /Equals\\s*total\\s*units\\s*used\\s*.*\\n.*\\s+([\\d,]+(?:\\.\\d+)?)/i,
  /(?:Total\\s*)?(?:Electricity\\s*)?(?:Usage|Used|Consumption|kWh\\s*Used|Units\\s*Used)[\\s\\S]{0,40}?([\\d,]+(?:\\.\\d+)?)\\s*(?:kWh|kW|units)/i,
  /([\\d,]+(?:\\.\\d+)?)\\s*kWh\\s*(?:used|consumed|usage|total)/i,
];

// Single-value patterns: try each, take FIRST valid (non-average) match, then STOP.
for (const p of usagePatterns) {
  const m = t.match(p);
  if (m) {
    const context = t.substring(Math.max(0, m.index - 25), m.index + m[0].length);
    if (!/Average|daily/i.test(context)) {
      quarterlyKwh = parseFloat(m[1].replace(/,/g, ''));
      if (billingDays && billingDays > 0) dailyKwh = +(quarterlyKwh / billingDays).toFixed(2);
      break;
    }
  }
}

// Multi-period sum: ONLY for explicit tariff-band bills (Peak/Off-peak/Shoulder), run separately if above found nothing.
if (quarterlyKwh === null) {
  const bandPattern = /(?:Peak|Off.?Peak|Shoulder|High\\s*shoulder|Low\\s*shoulder)\\s*(?:Energy)?\\s*[:\\-]?\\s*([\\d,]+(?:\\.\\d+)?)\\s*kWh/ig;
  const bandMatches = [...t.matchAll(bandPattern)];
  if (bandMatches.length > 0) {
    const sum = bandMatches.reduce((acc, match) => acc + parseFloat(match[1].replace(/,/g, '')), 0);
    if (sum > 0) {
      quarterlyKwh = sum;
      if (billingDays && billingDays > 0) dailyKwh = +(quarterlyKwh / billingDays).toFixed(2);
    }
  }
}`;

if (usageRegex.test(content)) {
  content = content.replace(usageRegex, newUsage);
  fs.writeFileSync('src/utils/Ocrextractor.js', content);
  console.log("usagePatterns updated!");
} else {
  console.log("usagePatterns regex did not match");
}
