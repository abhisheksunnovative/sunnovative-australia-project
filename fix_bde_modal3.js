const fs = require('fs');
const path = 'Website_Admin/src/components/UnifiedAddLeadModal.jsx';
let text = fs.readFileSync(path, 'utf8');

const regex = /const calculateEligibility = .*?setIsEligible\(eligible\);\s*setFormData[\s\S]*?\n  \};/s;

const newFunc = `const calculateEligibility = async (billAmt, apiKw, extractedData) => {
    let kw = apiKw || (isAU ? 6.6 : 3);
    let eligible = true;

    try {
      const eligibilityRes = await fetch(\`\${API_BASE}/api/light-bill/check-eligibility\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-country': isAU ? 'australia' : 'india'
        },
        body: JSON.stringify({
          billAmount: billAmt,
          monthlyUnits: extractedData?.monthlyKwhEquivalent || extractedData?.monthlyUnits || 0,
          state: formData.state || extractedData?.state || '',
          meterCategory: formData.meterCategory || extractedData?.meterCategory || extractedData?.tariffDesc || ''
        })
      });
      const eligibilityData = await eligibilityRes.json();
      if (eligibilityData.success && eligibilityData.data) {
        kw = eligibilityData.data.suggestedKW;
      }
    } catch (e) {
      console.warn('Eligibility API failed in BDE form', e);
    }
    
    setRecommendedKw(kw);
    setIsEligible(eligible);
    setFormData(prev => ({ ...prev, kw: kw, billAmount: billAmt, isEligibleForInstallation: eligible }));
  };`;

text = text.replace(regex, newFunc);
fs.writeFileSync(path, text);
console.log("Updated calculateEligibility in BDE form successfully");
