import fs from 'fs';
let content = fs.readFileSync('src/components/LeadForm.jsx', 'utf8');

// Fix extracted and confidence keys
content = content.replace(
    'setScanConfidence(data.confidence);\n      const ex = data.extracted;',
    'setScanConfidence(data.confidence || data.confidenceScore);\n      const ex = data.extracted || data.extractedData;'
);

const oldScanCall = /if \(ex\.billAmount\) \{\n\s*await handleCheckEligibility\(\{\n\s*meterCategory: ex\.meterCategory,\n\s*billAmount: ex\.billAmount,\n\s*monthlyUnits: units,\n\s*dueAmount: ex\.dueAmount \|\| 0,\n\s*billStatus: ex\.billStatus,\n\s*monthsOverdue: ex\.monthsOverdue \|\| 0,\n\s*billDate: ex\.billIssueDate \|\| ex\.billingPeriodTo \|\| null,?\n\s*\}\);\n\s*\}/m;

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

if(oldScanCall.test(content)) {
    content = content.replace(oldScanCall, newScanCall);
}

fs.writeFileSync('src/components/LeadForm.jsx', content);
console.log("LeadForm data keys patched.");
