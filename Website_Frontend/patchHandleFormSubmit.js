import fs from 'fs';

let content = fs.readFileSync('src/components/LeadForm.jsx', 'utf8');

const injectionPoint = /if \(eligibilityResult && eligibilityResult\.isEligible === false\) \{\n\s*alert\("Eligibility Check Failed:\\n" \+ \(eligibilityResult\.reasons\?\.join\('\\n'\) \|\| "Your bill does not meet the requirements\."\)\);\n\s*return;\n\s*\}/m;

const newLogic = `
    let currentEligibility = eligibilityResult;
    if (!currentEligibility && meterCategory) {
      // Re-verify eligibility with the edited fields
      try {
        const { data } = await billScanApi.post("/api/light-bill/check-eligibility", {
          meterCategory,
          billAmount: monthlyBill,
          monthlyUnits: null,
          dueAmount: dueAmount || 0,
          billStatus: "Pending",
          monthsOverdue: 0,
          state: customerState,
          solarEligible: true,
          overrideKw: customKw || 0,
          isCustomerVerified: true,
          criticalFieldsConfirmed: true
        }, { headers: { "x-country": getCountryCode() } });
        currentEligibility = data;
        setEligibilityResult(data);
      } catch (err) {
        console.error("Re-check failed", err);
      }
    }

    if (currentEligibility && currentEligibility.isEligible === false) {
      alert("Eligibility Check Failed:\\n" + (currentEligibility.reasons?.join('\\n') || "Your bill does not meet the requirements."));
      return;
    }
`;

content = content.replace(injectionPoint, newLogic);
fs.writeFileSync('src/components/LeadForm.jsx', content);
console.log("Patched handleFormSubmit to re-check eligibility");
