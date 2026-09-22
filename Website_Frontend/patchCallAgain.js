import fs from 'fs';
let content = fs.readFileSync('src/components/LeadForm.jsx', 'utf8');

const oldScanCall = /if\s*\(ex\.billAmount\)\s*\{\s*await\s+handleCheckEligibility\(\{\s*meterCategory:\s*ex\.meterCategory,\s*billAmount:\s*ex\.billAmount,\s*monthlyUnits:\s*units,\s*dueAmount:\s*ex\.dueAmount\s*\|\|\s*0,\s*billStatus:\s*ex\.billStatus,\s*monthsOverdue:\s*ex\.monthsOverdue\s*\|\|\s*0,\s*billDate:\s*ex\.billIssueDate\s*\|\|\s*ex\.billingPeriodTo\s*\|\|\s*null,?\s*\}\);\s*\}/m;

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

if (oldScanCall.test(content)) {
    content = content.replace(oldScanCall, newScanCall);
    console.log("handleCheckEligibility CALL inside handleScanBill patched!");
} else {
    console.log("Failed to match handleScanBill CALL!");
}

fs.writeFileSync('src/components/LeadForm.jsx', content);
