const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Frontend/src/components/LeadForm.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Patch stateKeyMap
const oldStateKeyMap = `      const stateKeyMap = {
        consumerNumber: [consumerNumber, setConsumerNumber],
        fullName: [fullName, setFullName],
        mobileNumber: [mobileNumber, (v) => setMobileNumber(v.replace(/\\D/g, ""))],
        email: [email, setEmail],
        city: [city, setCity],
        customerState: [customerState, setCustomerState],
        monthlyBill: [monthlyBill, (v) => { setMonthlyBill(Number(v)); setEligibilityResult(null); }],
        postcode: [postcode, setPostcode],
        tariffDesc: [tariffDesc, (v) => { setTariffDesc(v); setEligibilityResult(null); }],
          meterCategory: [meterCategory, (v) => { setMeterCategory(v); setEligibilityResult(null); }],
          discom: [discom, setDiscom],
          ownsProperty: [ownsProperty ? "Yes" : "No", (v) => setOwnsProperty(v === "Yes")],
        billFile: [null, null], // handled separately
      };`;

const newStateKeyMap = `      const stateKeyMap = {
        consumerNumber: [consumerNumber, setConsumerNumber],
        fullName: [fullName, setFullName],
        mobileNumber: [mobileNumber, (v) => setMobileNumber(v.replace(/\\D/g, ""))],
        email: [email, setEmail],
        city: [city, setCity],
        customerState: [customerState, setCustomerState],
        monthlyBill: [monthlyBill, (v) => { setMonthlyBill(Number(v)); setEligibilityResult(null); }],
        postcode: [postcode, setPostcode],
        tariffDesc: [tariffDesc, (v) => { setTariffDesc(v); setEligibilityResult(null); }],
        meterCategory: [meterCategory, (v) => { setMeterCategory(v); setEligibilityResult(null); }],
        discom: [discom, setDiscom],
        ownsProperty: [ownsProperty ? "Yes" : "No", (v) => setOwnsProperty(v === "Yes")],
        dueDate: [dueDate, setDueDate],
        billingPeriodDays: [billingPeriodDays, setBillingPeriodDays],
        scannedQuarterlyKwh: [scannedQuarterlyKwh, setScannedQuarterlyKwh],
        ocrMonthlyUnits: [ocrMonthlyUnits, setOcrMonthlyUnits],
        manualBillDate: [manualBillDate, setManualBillDate],
        billFile: [null, null], // handled separately
      };`;

if (code.includes(oldStateKeyMap)) {
  code = code.replace(oldStateKeyMap, newStateKeyMap);
} else if (code.includes(oldStateKeyMap.replace(/\n/g, '\r\n'))) {
  code = code.replace(oldStateKeyMap.replace(/\n/g, '\r\n'), newStateKeyMap.replace(/\n/g, '\r\n'));
} else {
  console.log("Could not find stateKeyMap!");
}

// 2. Patch dynamicFields.push block
const oldPushBlock = `                          if (!dynamicFields.find(f => f.key === 'tariffDesc')) dynamicFields.push({ label: 'Tariff', key: 'tariffDesc', type: 'text', required: false, options: [] });
                          if (!dynamicFields.find(f => f.key === 'meterCategory')) dynamicFields.push({ label: 'Meter Category', key: 'meterCategory', type: 'text', required: false, options: [] });
                          if (!dynamicFields.find(f => f.key === 'discom')) dynamicFields.push({ label: 'Discom / Retailer', key: 'discom', type: 'text', required: false, options: [] });`;

const newPushBlock = `                          if (!dynamicFields.find(f => f.key === 'tariffDesc')) dynamicFields.push({ label: 'Tariff', key: 'tariffDesc', type: 'text', required: false, options: [] });
                          if (!dynamicFields.find(f => f.key === 'meterCategory')) dynamicFields.push({ label: 'Meter Category', key: 'meterCategory', type: 'text', required: false, options: [] });
                          if (!dynamicFields.find(f => f.key === 'discom')) dynamicFields.push({ label: 'Discom / Retailer', key: 'discom', type: 'text', required: false, options: [] });
                          if (!dynamicFields.find(f => f.key === 'dueDate')) dynamicFields.push({ label: 'Due Date', key: 'dueDate', type: 'text', required: false, options: [] });
                          if (!dynamicFields.find(f => f.key === 'billingPeriodDays')) dynamicFields.push({ label: 'Billing Period (Days)', key: 'billingPeriodDays', type: 'text', required: false, options: [] });
                          if (!dynamicFields.find(f => f.key === 'scannedQuarterlyKwh')) dynamicFields.push({ label: 'Quarterly Usage (kWh)', key: 'scannedQuarterlyKwh', type: 'number', required: false, options: [] });
                          if (!dynamicFields.find(f => f.key === 'ocrMonthlyUnits')) dynamicFields.push({ label: 'Monthly Usage (Units)', key: 'ocrMonthlyUnits', type: 'number', required: false, options: [] });
                          if (!dynamicFields.find(f => f.key === 'manualBillDate')) dynamicFields.push({ label: 'Bill Issue Date', key: 'manualBillDate', type: 'date', required: false, options: [] });`;

if (code.includes(oldPushBlock)) {
  code = code.replace(oldPushBlock, newPushBlock);
} else if (code.includes(oldPushBlock.replace(/\n/g, '\r\n'))) {
  code = code.replace(oldPushBlock.replace(/\n/g, '\r\n'), newPushBlock.replace(/\n/g, '\r\n'));
} else {
  console.log("Could not find dynamicFields push block!");
}

fs.writeFileSync(path, code);
console.log("Patched LeadForm fields.");
