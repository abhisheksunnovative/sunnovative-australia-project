import fs from 'fs';

let content = fs.readFileSync('src/utils/Ocrextractor.js', 'utf8');

const usageBroken = `  const usagePatterns = [
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

const usageFixed = `  const usagePatterns = [
    /This\\s*bill\\s*[:\\-]?\\s*([\\d,]+(?:\\.\\d+)?)\\s*(?:kWh|units)?/i,
    /(?:Energy\\s*Use|Energy\\s*Usage)\\s*([\\d,]+(?:\\.\\d+)?)/i,
    /Equals\\s*total\\s*units\\s*used\\s*.*\\n.*\\s+([\\d,]+(?:\\.\\d+)?)/i,
    /(?:Total\\s*)?(?:Electricity\\s*)?(?:Usage|Used|Consumption|kWh\\s*Used|Units\\s*Used)[\\s\\S]{0,40}?([\\d,]+(?:\\.\\d+)?)\\s*(?:kWh|kW|units)/i,
    /([\\d,]+(?:\\.\\d+)?)\\s*kWh\\s*(?:used|consumed|usage)/i,
    /(?:Peak\\s*\\+\\s*Off.?Peak|Total)\\s*(?:Usage)?\\s*[:\\-]?\\s*([\\d,]+(?:\\.\\d+)?)\\s*kWh/i,
  ];
  for (const p of usagePatterns) {
    const m = t.match(p);
    if (m && !/Average|daily/i.test(m[0])) {
      quarterlyKwh = parseFloat(m[1].replace(/,/g, ''));
      if (billingDays && billingDays > 0) dailyKwh = +(quarterlyKwh / billingDays).toFixed(2);
      break;
    }
  }`;

content = content.replace(usageBroken, usageFixed);
fs.writeFileSync('src/utils/Ocrextractor.js', content);
console.log("Patched Usage extraction");
