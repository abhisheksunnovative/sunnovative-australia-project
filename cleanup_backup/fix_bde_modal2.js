const fs = require('fs');
const path = 'Website_Admin/src/components/UnifiedAddLeadModal.jsx';
let text = fs.readFileSync(path, 'utf8');

text = text.replace(
  'const calculateEligibility = (billAmt, apiKw) => {',
  'const calculateEligibility = async (billAmt, apiKw, extractedData) => {'
);

text = text.replace(
  'const calculateEligibility = (billAmt) => {',
  'const calculateEligibility = async (billAmt, apiKw, extractedData) => {'
);

// We need to fetch from check-eligibility
const newFallbackLogic = `    let eligible = false;
    let kw = apiKw || 3;

    try {
      const eligibilityRes = await fetch(\`\${API_BASE}/api/light-bill/check-eligibility\`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-country": isAU ? "australia" : "india"
        },
        body: JSON.stringify({
          billAmount: billAmt,
          monthlyUnits: extractedData?.monthlyKwhEquivalent || extractedData?.monthlyUnits || 0,
          state: formData.state || extractedData?.state || "",
          meterCategory: formData.meterCategory || extractedData?.meterCategory || extractedData?.tariffDesc || ""
        })
      });
      const eligibilityData = await eligibilityRes.json();
      if (eligibilityData.success && eligibilityData.data) {
        kw = eligibilityData.data.suggestedKW;
        eligible = true;
      } else {
        // Fallback
        if (apiKw) { kw = apiKw; eligible = true; }
        else if (isAU) { kw = Math.max(3, Math.ceil(billAmt/150)); eligible = true; }
      }
    } catch (e) {
      console.warn("Eligibility API failed", e);
      if (apiKw) { kw = apiKw; eligible = true; }
      else if (isAU) { kw = Math.max(3, Math.ceil(billAmt/150)); eligible = true; }
    }`;

// Wait, the previous block I injected was:
const oldFallbackBlock = `    // Fallback logic
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

text = text.replace(oldFallbackBlock, newFallbackLogic);

text = text.replace(
  'calculateEligibility(billAmt, data.recommendedKw);',
  'await calculateEligibility(billAmt, data.recommendedKw, extracted);'
);

text = text.replace(
  'calculateEligibility(billAmt);',
  'await calculateEligibility(billAmt, null, extracted);'
);

text = text.replace(
  'calculateEligibility(isAU ? 300 : 1500, null);',
  'await calculateEligibility(isAU ? 300 : 1500, null, null);'
);

text = text.replace(
  'calculateEligibility(isAU ? 300 : 1500);',
  'await calculateEligibility(isAU ? 300 : 1500, null, null);'
);

fs.writeFileSync(path, text);
console.log("Updated BDE modal to call check-eligibility API");
