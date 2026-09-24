const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let code = fs.readFileSync(path, 'utf8');

// Replace the AU logic to make DB templates (ed) override baseParsed ALWAYS, just like India.
code = code.replace(
    /retailer: isAU \? \(baseParsed\.retailer \|\| ed\.retailer\) : \(ed\.retailer \|\| baseParsed\.retailer \|\| baseParsed\.discomId\),/g,
    "retailer: (ed.retailer || baseParsed.retailer || baseParsed.discomId),"
);
code = code.replace(
    /monthlyBill: isAU \? \(baseParsed\.quarterlyBillAmount \|\| ed\.monthlyBill\) : \(ed\.monthlyBill \|\| baseParsed\.billAmount\),/g,
    "monthlyBill: (ed.monthlyBill || baseParsed.quarterlyBillAmount || baseParsed.billAmount),"
);
code = code.replace(
    /fullName: isAU \? \(baseParsed\.customerName \|\| ed\.fullName\) : \(ed\.fullName \|\| baseParsed\.customerName\),/g,
    "fullName: (ed.fullName || baseParsed.customerName),"
);
code = code.replace(
    /consumerNumber: isAU \? \(baseParsed\.accountNumber \|\| baseParsed\.consumerNumber \|\| ed\.consumerNumber\) : \(ed\.consumerNumber \|\| baseParsed\.accountNumber \|\| baseParsed\.consumerNumber\),/g,
    "consumerNumber: (ed.consumerNumber || baseParsed.accountNumber || baseParsed.consumerNumber),"
);
code = code.replace(
    /dueDate: isAU \? \(baseParsed\.dueDate \|\| ed\.dueDate\) : \(ed\.dueDate \|\| baseParsed\.dueDate\),/g,
    "dueDate: (ed.dueDate || baseParsed.dueDate),"
);
code = code.replace(
    /tariffCategory: isAU \? \(baseParsed\.tariffType \|\| baseParsed\.tariffDesc \|\| ed\.tariffCategory\) : \(ed\.tariffCategory \|\| baseParsed\.tariffType \|\| baseParsed\.tariffDesc\),/g,
    "tariffCategory: (ed.tariffCategory || baseParsed.tariffType || baseParsed.tariffDesc),"
);
code = code.replace(
    /meterTypeInfo: isAU \? \(baseParsed\.meterType \|\| baseParsed\.meterCategory \|\| ed\.meterTypeInfo\) : \(ed\.meterTypeInfo \|\| baseParsed\.meterType \|\| baseParsed\.meterCategory\),/g,
    "meterTypeInfo: (ed.meterCategory || ed.meterTypeInfo || baseParsed.meterType || baseParsed.meterCategory),"
);
code = code.replace(
    /state: isAU \? \(baseParsed\.state \|\| baseParsed\.detectedState \|\| ed\.state\) : \(ed\.state \|\| baseParsed\.state \|\| baseParsed\.detectedState\),/g,
    "state: (ed.state || baseParsed.state || baseParsed.detectedState),"
);
code = code.replace(
    /city: isAU \? \(baseParsed\.suburb \|\| baseParsed\.district \|\| ed\.city\) : \(ed\.city \|\| baseParsed\.suburb \|\| baseParsed\.district\),/g,
    "city: (ed.city || baseParsed.suburb || baseParsed.district),"
);
code = code.replace(
    /postcode: isAU \? \(baseParsed\.postcode \|\| ed\.postcode\) : \(ed\.postcode \|\| baseParsed\.postcode\),/g,
    "postcode: (ed.postcode || baseParsed.postcode),"
);
code = code.replace(
    /quarterlyKwh: isAU \? \(baseParsed\.quarterlyKwh \|\| ed\.quarterlyKwh\) : \(ed\.quarterlyKwh \|\| baseParsed\.quarterlyKwh\),/g,
    "quarterlyKwh: (ed.quarterlyKwh || baseParsed.quarterlyKwh),"
);
code = code.replace(
    /billIssueDate: isAU \? \(baseParsed\.billDate \|\| ed\.billIssuedDate \|\| ed\.billIssueDate\) : \(ed\.billIssuedDate \|\| ed\.billIssueDate \|\| baseParsed\.billDate\)/g,
    "billIssueDate: (ed.billIssuedDate || ed.billIssueDate || baseParsed.billDate)"
);

fs.writeFileSync(path, code);
console.log("Fixed Merge Logic to ALWAYS prefer Admin Templates over Base Parser!");
