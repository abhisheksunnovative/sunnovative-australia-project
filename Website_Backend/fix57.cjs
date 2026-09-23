const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Frontend/src/components/LeadForm.jsx';
let code = fs.readFileSync(path, 'utf8');

const regexUi = /<\/?div>\s*<h3 className="text-sm font-bold text-red-900 mb-1">Recommendation Unavailable<\/h3>\s*<p className="text-xs text-red-700">\{scanFallbackReason \|\| eligibilityResult\.reasons\?\.\[0\] \|\| 'Your bill does not meet the requirements for an automatic recommendation\. Please provide a valid, recent bill\.'\}<\/p>\s*<\/?\w+>/;

const newUi = `                   ) : scanFallbackReason === 'Bill is older than allowed limit — ask customer for a recent bill' ? (
                     <div>
                       <h3 className="text-sm font-bold text-red-900 mb-1">Bill is too old</h3>
                       <p className="text-xs text-red-700 mb-3">The bill you uploaded is outdated and no longer reflects current tariffs or government subsidies. Please upload a recent bill to get an accurate recommendation.</p>
                       <button className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold" onClick={() => window.location.reload()}>Upload New Bill</button>
                     </div>
                   ) : (
                     <div>
                       <h3 className="text-sm font-bold text-red-900 mb-1">Recommendation Unavailable</h3>
                       <p className="text-xs text-red-700">{scanFallbackReason || eligibilityResult.reasons?.[0] || 'Your bill does not meet the requirements for an automatic recommendation. Please provide a valid, recent bill.'}</p>
                     </div>
                   )`;

// Because regexes with so much HTML are fragile, I'll use index based replacement
const targetStr = `                   ) : (
                     <>
                       <h3 className="text-sm font-bold text-red-900 mb-1">Recommendation Unavailable</h3>
                       <p className="text-xs text-red-700">{scanFallbackReason || eligibilityResult.reasons?.[0] || 'Your bill does not meet the requirements for an automatic recommendation. Please provide a valid, recent bill.'}</p>
                     </>
                   )}`;
                   
if (code.includes(targetStr)) {
  code = code.replace(targetStr, newUi + '}');
  fs.writeFileSync(path, code);
  console.log("Patched LeadForm UI");
} else {
  console.log("Could not find string in LeadForm");
}
