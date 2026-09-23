const fs = require('fs');

const lfPath = 'd:/sunnovative-australia-website/Website_Frontend/src/components/LeadForm.jsx';
let lf = fs.readFileSync(lfPath, 'utf8');

const oldRecBlock = `{/* 3. Recommended System & Subsidy (Auto-calculated, read-only) */}
            <div className="bg-amber-50/40 rounded-xl border border-amber-200/60 p-3 mt-2">`;

const newRecBlock = `{/* 3. Recommended System & Subsidy (Auto-calculated, read-only) */}
            {eligibilityResult && eligibilityResult.isEligible === false ? (
               <div className="bg-red-50 rounded-xl border border-red-200 p-4 mt-2">
                 <h3 className="text-sm font-bold text-red-900 mb-1">Recommendation Unavailable</h3>
                 <p className="text-xs text-red-700">{eligibilityResult.reasons?.[0] || 'Your bill does not meet the requirements for an automatic recommendation. Please provide a valid, recent bill.'}</p>
               </div>
            ) : (
            <div className="bg-amber-50/40 rounded-xl border border-amber-200/60 p-3 mt-2">`;

const closeRecBlock = `{/* 5. Additional Information (Lead Questions) */}`;
const newCloseRecBlock = `)}
            {/* 5. Additional Information (Lead Questions) */}`;

if (lf.includes(oldRecBlock)) {
  lf = lf.replace(oldRecBlock, newRecBlock);
  lf = lf.replace(closeRecBlock, newCloseRecBlock);
  fs.writeFileSync(lfPath, lf);
  console.log('LeadForm.jsx updated to block recommendations on isEligible false');
} else if (lf.includes(oldRecBlock.replace(/\n/g, '\r\n'))) {
  lf = lf.replace(oldRecBlock.replace(/\n/g, '\r\n'), newRecBlock.replace(/\n/g, '\r\n'));
  lf = lf.replace(closeRecBlock.replace(/\n/g, '\r\n'), newCloseRecBlock.replace(/\n/g, '\r\n'));
  fs.writeFileSync(lfPath, lf);
  console.log('LeadForm.jsx updated to block recommendations on isEligible false (CRLF)');
} else {
  console.log('LeadForm.jsx old block not found');
}
