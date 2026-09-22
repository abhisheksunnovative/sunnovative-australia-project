import fs from 'fs';
const f = 'src/utils/Ocrextractor.js';
let content = fs.readFileSync(f, 'utf8');

const oldKwhStr = `  // ── 6. kWh Usage (quarterly or whatever billing period) ───────────────────
  let quarterlyKwh = null, dailyKwh = null;

  // "Total Usage: 1,234 kWh" or "Electricity Used 987.5 kWh"
  const usagePatterns = [
    /(?:Total\\s*)?(?:Electricity\\s*)?(?:Usage|Used|Consumption|kWh\\s*Used|Units\\s*Used)[\\s\\S]{0,40}?([\\d,]+(?:\\.\\d+)?)\\s*(?:kWh|kW|units)/i,
    /([\\d,]+(?:\\.\\d+)?)\\s*kWh\\s*(?:used|consumed|usage)/i,
    /(?:Peak\\s*\\+\\s*Off.?Peak|Total)\\s*(?:Usage)?\\s*[:\\-]?\\s*([\\d,]+(?:\\.\\d+)?)\\s*kWh/i,
  ];
  for (const p of usagePatterns) {
    const m = t.match(p);
    if (m) {
      quarterlyKwh = parseFloat(m[1].replace(/,/g, ''));
      if (billingDays && billingDays > 0) dailyKwh = +(quarterlyKwh / billingDays).toFixed(2);
      break;
    }
  }`;

const newKwhStr = `  // ── 6. kWh Usage (quarterly or whatever billing period) ───────────────────
  let quarterlyKwh = null, dailyKwh = null;

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
  }
  if (quarterlyKwh && billingDays && billingDays > 0) dailyKwh = +(quarterlyKwh / billingDays).toFixed(2);`;

if (content.includes('const usagePatterns = [')) {
    content = content.replace(oldKwhStr, newKwhStr);
    fs.writeFileSync(f, content);
    console.log("Replaced kWh logic");
} else {
    console.log("Could not find old kWh string");
}
