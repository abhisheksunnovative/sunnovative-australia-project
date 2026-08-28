const fs = require("fs");
let text = fs.readFileSync("Website_Admin/src/components/bde/BDEProspects.jsx", "utf-8");

const pattern = /<div className="flex items-center gap-2"><Zap className="w-4 h-4 text-slate-400"\/> \{lead\.kw\} kW \(\{dynamicProjectTypes\?\.find\(pt => pt\.value === lead\.solarType\)\?\.label \|\| lead\.solarType\}\)<\/div>/;

const replacement = `<div className="flex items-center gap-2"><Zap className="w-4 h-4 text-slate-400"/> {lead.kw} kW ({lead.solarType === 'au-standard-family' ? 'Residential' : (dynamicProjectTypes?.find(pt => pt.value === lead.solarType)?.label || (lead.solarType === 'surya-ghar' ? 'PM Surya Ghar' : lead.solarType))})</div>`;

text = text.replace(pattern, replacement);

fs.writeFileSync("Website_Admin/src/components/bde/BDEProspects.jsx", text);
