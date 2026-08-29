const fs = require('fs');
const path = 'Website_Admin/src/components/UnifiedAddLeadModal.jsx';
let text = fs.readFileSync(path, 'utf8');

text = text.replace(
  'const calculateEligibility = (billAmt) => {',
  'const calculateEligibility = (billAmt, apiKw) => {'
);

const fallbackLogic = `    // Fallback logic
    if (isAU) {
       kw = Math.max(2, Math.ceil(billAmt / 150));
       if (kw > 15) kw = 15;
       eligible = billAmt > 0;
    } else {
       const estimatedUnits = Math.round(billAmt / 7.5);
       kw = Math.max(1, Math.ceil(estimatedUnits / 120));
       if (kw > 10) kw = 10;
       eligible = billAmt >= 500;
    }`;

const newFallbackLogic = `    // Fallback logic
    if (apiKw) {
       kw = apiKw;
       eligible = true;
    } else if (isAU) {
       // Mock AU rules matching backend if API fails
       const monthlyUnits = Math.round((billAmt/150)*300) / 3; 
       kw = Math.max(3, Math.min(20, Math.ceil((monthlyUnits / 115) * 1.1)));
       eligible = billAmt > 0;
    } else {
       const estimatedUnits = Math.round(billAmt / 7.5);
       kw = Math.max(1, Math.ceil(estimatedUnits / 120));
       if (kw > 10) kw = 10;
       eligible = billAmt >= 500;
    }`;

text = text.replace(fallbackLogic, newFallbackLogic);

text = text.replace(
  'calculateEligibility(billAmt);',
  'calculateEligibility(billAmt, data.recommendedKw);'
);

text = text.replace(
  'calculateEligibility(isAU ? 300 : 1500);',
  'calculateEligibility(isAU ? 300 : 1500, null);'
);

// Also need to fix the display STC calc: calcStcForKw(recommendedKw, formData.pincode)
// Let's ensure it's correct. Wait, the problem is `data.recommendedKw` from the scan API is used!
// But does the scan API actually return the CORRECT `recommendedKw` for Australia?
// No! Because `lightBillScanController.js` has its own hardcoded logic for AU: 
// `recommendedKw = Math.ceil(parsed.monthlyBillEquivalent / 100);` 
// We saw this earlier!

fs.writeFileSync(path, text);
console.log("Updated UnifiedAddLeadModal logic");
