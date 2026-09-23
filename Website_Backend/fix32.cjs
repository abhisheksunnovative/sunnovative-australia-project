const fs = require('fs');
const lfPath = 'd:/sunnovative-australia-website/Website_Frontend/src/components/LeadForm.jsx';
let lf = fs.readFileSync(lfPath, 'utf8');

const oldBlock = `{/* 4. Customize Your System Size (customer-chosen kW) */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="rounded-2xl border-2 border-solar-sky/30 bg-gradient-to-br from-sky-50/60 to-blue-50/40 p-5 mt-4" id="section-customize-kw">`;

const newBlock = `{/* 4. Customize Your System Size (customer-chosen kW) */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {!(eligibilityResult && eligibilityResult.isEligible === false) && (
            <div className="rounded-2xl border-2 border-solar-sky/30 bg-gradient-to-br from-sky-50/60 to-blue-50/40 p-5 mt-4" id="section-customize-kw">`;

const endBlock = `{/* 5. Additional Information (Lead Questions) */}`;
const newEndBlock = `)}
            {/* 5. Additional Information (Lead Questions) */}`;

if (lf.includes(oldBlock)) {
  lf = lf.replace(oldBlock, newBlock);
  // I need to be careful not to replace the endBlock incorrectly since I already did it for Block 3.
  // Wait! My fix28 already replaced `{/* 5. Additional Information (Lead Questions) */}` with `)}\n{/* 5...`
  // Let's replace the NEW string that was created in fix28.
} else if (lf.includes(oldBlock.replace(/\n/g, '\r\n'))) {
  lf = lf.replace(oldBlock.replace(/\n/g, '\r\n'), newBlock.replace(/\n/g, '\r\n'));
}

// Instead of matching the end block, let's match just before block 5.
const endOfBlock4 = `</div>
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}`;
const replaceEndOfBlock4 = `</div>
            )}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}`;

if (lf.includes(endOfBlock4)) {
  lf = lf.replace(endOfBlock4, replaceEndOfBlock4);
} else if (lf.includes(endOfBlock4.replace(/\n/g, '\r\n'))) {
  lf = lf.replace(endOfBlock4.replace(/\n/g, '\r\n'), replaceEndOfBlock4.replace(/\n/g, '\r\n'));
}

fs.writeFileSync(lfPath, lf);
console.log('Block 4 wrapped successfully!');
