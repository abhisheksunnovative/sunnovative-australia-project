const fs = require('fs');

let content = fs.readFileSync('src/components/LeadForm.jsx', 'utf8');

// 1. Update handleCheckEligibility
const oldCheckElig = /const handleCheckEligibility = async \(\{[\s\S]*?overrideKw = 0 \}\) => \{[\s\S]*?overrideKw,\n\s*\}, \{ headers: \{ "x-country": getCountryCode\(\) \} \}\);/m;

const newCheckElig = `const handleCheckEligibility = async ({ meterCategory, billAmount, monthlyUnits, dueAmount, billStatus, monthsOverdue,
        billDate, overrideKw = 0, passedState, isCustomerVerified = false, criticalFieldsConfirmed = true }) => {
    setIsCheckingEligibility(true);
    setEligibilityError("");
    setEligibilityResult(null);

    try {
      const { data } = await billScanApi.post("/api/light-bill/check-eligibility", {
        meterCategory,
        billAmount,
        monthlyUnits,
        dueAmount,
        billStatus,
        monthsOverdue,
        state: passedState || customerState,
        overrideKw,
        isCustomerVerified,
        criticalFieldsConfirmed
      }, { headers: { "x-country": getCountryCode() } });`;

content = content.replace(oldCheckElig, newCheckElig);

// 2. Update handleScanBill call (and extract state properly)
const oldScanCall = /if \(ex\.billAmount\) \{\n\s*await handleCheckEligibility\(\{\n\s*meterCategory: ex\.meterCategory,\n\s*billAmount: ex\.billAmount,\n\s*monthlyUnits: units,\n\s*dueAmount: ex\.dueAmount \|\| 0,\n\s*billStatus: ex\.billStatus,\n\s*monthsOverdue: ex\.monthsOverdue \|\| 0,\n\s*billDate: ex\.billIssueDate \|\| ex\.billingPeriodTo \|\| null,\n\s*\}\);\n\s*\}/m;

const newScanCall = `
        let finalStateToPass = customerState;
        if (data.country === "australia" && ex.state) {
            const auStates = countryStatesMap["AU"] || [];
            const matchedState = auStates.find(s => s.toLowerCase() === ex.state.toLowerCase());
            if (matchedState) finalStateToPass = matchedState;
        } else if (ex.detectedState) {
            const inStates = countryStatesMap["IN"] || [];
            const matchedState = inStates.find(s => s.toLowerCase() === ex.detectedState.toLowerCase());
            if (matchedState) finalStateToPass = matchedState;
        }

        if (ex.billAmount || units || ex.meterCategory || data.criticalFieldsConfirmed === false) {
          await handleCheckEligibility({
            meterCategory: ex.meterCategory || meterCategory,
            billAmount: ex.billAmount || monthlyBill,
            monthlyUnits: units,
            dueAmount: ex.dueAmount || 0,
            billStatus: ex.billStatus,
            monthsOverdue: ex.monthsOverdue || 0,
            billDate: ex.billIssueDate || ex.billingPeriodTo || null,
            passedState: finalStateToPass,
            criticalFieldsConfirmed: data.criticalFieldsConfirmed,
            isCustomerVerified: false
          });
        }`;

content = content.replace(oldScanCall, newScanCall);

fs.writeFileSync('src/components/LeadForm.jsx', content);
console.log("LeadForm.jsx fixed.");
