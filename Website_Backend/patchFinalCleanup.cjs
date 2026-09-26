const fs = require('fs');

const file = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let code = fs.readFileSync(file, 'utf8');

const targetFinalJson = /const finalJson = \{[\s\S]*?\};\s*if \(isAU\) \{/m;

const newFinalJson = `const finalJson = {
            monthlyBill: payableAmount,
            quarterlyBillAmount: payableAmount,
            billAmount: payableAmount,
            rawConsumptionAmount: merged.monthlyBill, 
            amountType: merged.amountType,
            fullName: merged.fullName || "",
            consumerNumber: merged.consumerNumber || "",
            scannedRetailer: merged.retailer || "",
            retailer: merged.retailer || "",
            dueDate: merged.dueDate || "",
            tariffCategory: merged.tariffCategory || "",
            tariffDesc: merged.tariffCategory || "",
            billingDays: merged.billingDays || null,
            meterTypeInfo: merged.meterTypeInfo || "",
            meterCategory: (countryContext === 'australia' ? (ed.meterCategory || baseParsed.meterType || baseParsed.meterCategory || merged.tariffCategory || "") : (ed.meterCategory || merged.meterTypeInfo || merged.tariffCategory || "")),
            state: merged.state || "",
            detectedState: merged.state || "",
            city: merged.city || "",
            district: merged.city || "",
            postcode: merged.postcode || "",
            billIssueDate: merged.billIssueDate || null
        };
        
        if (isAU) {
            finalJson.quarterlyKwh = finalKwh || null;
        } else {
            finalJson.monthlyUnits = merged.monthlyUnits || null;
        }

        if (isAU) {`;

code = code.replace(targetFinalJson, newFinalJson);

const targetResponse = /res\.status\(200\)\.json\(\{[\s\S]*?quarterlyKwh: finalKwh \|\| null,[\s\S]*?stcInfo: null,/;
const newResponse = `res.status(200).json({
            success: true,
            isManualReview: status === 'manual-review',
            extractedData: finalJson,
            ...(isAU ? { quarterlyKwh: finalKwh || null } : { monthlyUnits: merged.monthlyUnits || null }),
            stcInfo: null,`;

code = code.replace(targetResponse, newResponse);

fs.writeFileSync(file, code);
console.log("Cleaned up finalJson and response");
