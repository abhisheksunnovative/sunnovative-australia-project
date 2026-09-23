import fs from 'fs';
let content = fs.readFileSync('src/controllers/lightBillScanController.js', 'utf8');

const mergeOld = `        // Merge logic: DB overrides base, base fills gaps
        const merged = {
            retailer: ed.retailer || baseParsed.retailer || baseParsed.discomId,
            monthlyBill: ed.monthlyBill || (isAU ? baseParsed.quarterlyBillAmount : baseParsed.billAmount),
            amountType: baseParsed.amountType || 'due',
            fullName: ed.fullName || baseParsed.customerName,
            consumerNumber: ed.consumerNumber || baseParsed.accountNumber || baseParsed.consumerNumber,
            dueDate: ed.dueDate || baseParsed.dueDate,
            tariffCategory: ed.tariffCategory || baseParsed.tariffType || baseParsed.tariffDesc,
            billingDays: ed.billingDays || baseParsed.billingDays,
            meterTypeInfo: ed.meterTypeInfo || baseParsed.meterType || baseParsed.meterCategory,
            state: ed.state || baseParsed.state || baseParsed.detectedState,
            city: ed.city || baseParsed.suburb || baseParsed.district,
            postcode: ed.postcode || baseParsed.postcode,
            quarterlyKwh: ed.quarterlyKwh || baseParsed.quarterlyKwh,
            monthlyUnits: ed.monthlyUnits || baseParsed.monthlyUnitsUsed
        };`;

const mergeNew = `        // Merge logic: For AU, Base (Ocrextractor) is robust so it overrides DB templates. For India, DB overrides base.
        const merged = {
            retailer: isAU ? (baseParsed.retailer || ed.retailer) : (ed.retailer || baseParsed.retailer || baseParsed.discomId),
            monthlyBill: isAU ? (baseParsed.quarterlyBillAmount || ed.monthlyBill) : (ed.monthlyBill || baseParsed.billAmount),
            amountType: baseParsed.amountType || 'due',
            fullName: isAU ? (baseParsed.customerName || ed.fullName) : (ed.fullName || baseParsed.customerName),
            consumerNumber: isAU ? (baseParsed.accountNumber || baseParsed.consumerNumber || ed.consumerNumber) : (ed.consumerNumber || baseParsed.accountNumber || baseParsed.consumerNumber),
            dueDate: isAU ? (baseParsed.dueDate || ed.dueDate) : (ed.dueDate || baseParsed.dueDate),
            tariffCategory: isAU ? (baseParsed.tariffType || baseParsed.tariffDesc || ed.tariffCategory) : (ed.tariffCategory || baseParsed.tariffType || baseParsed.tariffDesc),
            billingDays: ed.billingDays || baseParsed.billingDays,
            meterTypeInfo: isAU ? (baseParsed.meterType || baseParsed.meterCategory || ed.meterTypeInfo) : (ed.meterTypeInfo || baseParsed.meterType || baseParsed.meterCategory),
            state: isAU ? (baseParsed.state || baseParsed.detectedState || ed.state) : (ed.state || baseParsed.state || baseParsed.detectedState),
            city: isAU ? (baseParsed.suburb || baseParsed.district || ed.city) : (ed.city || baseParsed.suburb || baseParsed.district),
            postcode: isAU ? (baseParsed.postcode || ed.postcode) : (ed.postcode || baseParsed.postcode),
            quarterlyKwh: isAU ? (baseParsed.quarterlyKwh || ed.quarterlyKwh) : (ed.quarterlyKwh || baseParsed.quarterlyKwh),
            monthlyUnits: ed.monthlyUnits || baseParsed.monthlyUnitsUsed
        };`;

if (content.includes(mergeOld)) {
  content = content.replace(mergeOld, mergeNew);
  fs.writeFileSync('src/controllers/lightBillScanController.js', content);
  console.log("Merge logic patched!");
} else {
  console.log("Merge logic string not found!");
}
