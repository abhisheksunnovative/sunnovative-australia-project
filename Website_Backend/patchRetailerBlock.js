import fs from 'fs';
let content = fs.readFileSync('src/utils/Ocrextractor.js', 'utf8');

const retailerOldRegex = /let retailer = null;\s*for \(const r of AU_RETAILERS\) \{\s*if \(r\.pattern\.test\(t\)\) \{\s*retailer = r\.id;\s*break;\s*\}\s*\}/m;

const retailerNew = `let retailer = null;

// Step A: Domain-based match wins outright (strongest signal)
for (const r of AU_RETAILERS) {
  const domainSlug = r.id.toLowerCase().replace(/\\s+/g, '');
  const domainPattern = new RegExp(domainSlug + '\\\\.com\\\\.au', 'i');
  if (domainPattern.test(t)) { retailer = r.id; break; }
}

// Step B: Fallback to brand-keyword scan, but SKIP matches that are just a
// "call X for faults/emergencies" style distributor mention
if (!retailer) {
  for (const r of AU_RETAILERS) {
    const m = r.pattern.exec(t);
    if (m) {
      const context = t.substring(Math.max(0, m.index - 40), m.index + m[0].length + 10);
      if (!/(?:call|faults?|emergenc(?:y|ies)|distributor|network)\\b/i.test(context)) {
        retailer = r.id;
        break;
      }
    }
  }
}`;

if (retailerOldRegex.test(content)) {
  content = content.replace(retailerOldRegex, retailerNew);
  fs.writeFileSync('src/utils/Ocrextractor.js', content);
  console.log("Retailer extraction updated!");
} else {
  console.log("Retailer extraction regex did not match!");
}
