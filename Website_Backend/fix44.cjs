const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Frontend/src/components/LeadForm.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Patch stateKeyMap
const stateMapRegex = /const stateKeyMap = \{([\s\S]*?)billFile: \[null, null\], \/\/ handled separately\s*\};/;
const newStateKeyMapStr = `const stateKeyMap = {$1dueDate: [dueDate, setDueDate],
        billingPeriodDays: [billingPeriodDays, setBillingPeriodDays],
        scannedQuarterlyKwh: [scannedQuarterlyKwh, setScannedQuarterlyKwh],
        ocrMonthlyUnits: [ocrMonthlyUnits, setOcrMonthlyUnits],
        manualBillDate: [manualBillDate, setManualBillDate],
        billFile: [null, null], // handled separately
      };`;
code = code.replace(stateMapRegex, newStateKeyMapStr);
console.log('Patched stateKeyMap');

// 2. Patch dynamicFields.push block
const pushBlockRegex = /(if \(!dynamicFields\.find\(f => f\.key === 'discom'\)\) dynamicFields\.push\(\{ label: 'Discom \/ Retailer', key: 'discom', type: 'text', required: false, options: \[\] \}\);)/g;
const newPushBlockStr = `$1
                          if (!dynamicFields.find(f => f.key === 'dueDate')) dynamicFields.push({ label: 'Due Date', key: 'dueDate', type: 'text', required: false, options: [] });
                          if (!dynamicFields.find(f => f.key === 'billingPeriodDays')) dynamicFields.push({ label: 'Billing Period (Days)', key: 'billingPeriodDays', type: 'text', required: false, options: [] });
                          if (!dynamicFields.find(f => f.key === 'scannedQuarterlyKwh')) dynamicFields.push({ label: 'Quarterly Usage (kWh)', key: 'scannedQuarterlyKwh', type: 'number', required: false, options: [] });
                          if (!dynamicFields.find(f => f.key === 'ocrMonthlyUnits')) dynamicFields.push({ label: 'Monthly Usage (Units)', key: 'ocrMonthlyUnits', type: 'number', required: false, options: [] });
                          if (!dynamicFields.find(f => f.key === 'manualBillDate')) dynamicFields.push({ label: 'Bill Issue Date', key: 'manualBillDate', type: 'date', required: false, options: [] });`;

code = code.replace(pushBlockRegex, newPushBlockStr);
console.log('Patched dynamicFields push block');

fs.writeFileSync(path, code);
