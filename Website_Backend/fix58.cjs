const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Frontend/src/components/LeadForm.jsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /<\/>\s*\)\s*:\s*\(\s*<>\s*<h3 className="text-sm font-bold text-red-900 mb-1">Recommendation Unavailable<\/h3>\s*<p className="text-xs text-red-700">\{scanFallbackReason \|\| eligibilityResult\.reasons\?\.\[0\] \|\| 'Your bill does not meet the requirements for an automatic recommendation\. Please provide a valid, recent bill\.'\}<\/p>\s*<\/>\s*\)\}/;

const targetStr = `                   ) : (
                     <>
                       <h3 className="text-sm font-bold text-red-900 mb-1">Recommendation Unavailable</h3>
                       <p className="text-xs text-red-700">{scanFallbackReason || eligibilityResult.reasons?.[0] || 'Your bill does not meet the requirements for an automatic recommendation. Please provide a valid, recent bill.'}</p>
                     </>
                   )}`;

const replacement = `                   ) : scanFallbackReason === 'Bill is older than allowed limit — ask customer for a recent bill' ? (
                     <div>
                       <h3 className="text-sm font-bold text-red-900 mb-1">Bill is too old</h3>
                       <p className="text-xs text-red-700 mb-3">The bill you uploaded is outdated (more than 6-12 months old) and no longer reflects current tariffs or government subsidies. Please upload a recent bill to get an accurate recommendation.</p>
                       <button className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition" onClick={(e) => { e.preventDefault(); window.location.reload(); }}>Upload New Bill</button>
                     </div>
                   ) : (
                     <div>
                       <h3 className="text-sm font-bold text-red-900 mb-1">Recommendation Unavailable</h3>
                       <p className="text-xs text-red-700">{scanFallbackReason || eligibilityResult.reasons?.[0] || 'Your bill does not meet the requirements for an automatic recommendation. Please provide a valid, recent bill.'}</p>
                     </div>
                   )}`;

code = code.replace(targetStr, replacement);
fs.writeFileSync(path, code);
console.log("Replaced UI in LeadForm.jsx");
