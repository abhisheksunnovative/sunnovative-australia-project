const fs = require("fs");
let text = fs.readFileSync("Website_Admin/src/components/bde/BDEProspects.jsx", "utf-8");

const pattern = /<div className="flex items-center gap-2"><Zap className="w-4 h-4 text-slate-400"\/> \{lead\.kw\} kW \(\{lead\.solarType\}\)<\/div>\s*<\/div>\s*<\/div>/;
const replacement = `<div className="flex items-center gap-2"><Zap className="w-4 h-4 text-slate-400"/> {lead.kw} kW ({dynamicProjectTypes?.find(pt => pt.value === lead.solarType)?.label || lead.solarType})</div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowDetailsModal(lead); }}
                    className="mt-4 w-full md:w-3/4 justify-center px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-colors border border-slate-200 flex items-center gap-2 shadow-sm"
                  >
                    <User className="w-4 h-4 text-blue-500"/> Show Details
                  </button>
                </div>`;

text = text.replace(pattern, replacement);
fs.writeFileSync("Website_Admin/src/components/bde/BDEProspects.jsx", text);
