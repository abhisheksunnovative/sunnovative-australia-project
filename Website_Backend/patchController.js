import fs from 'fs';

let content = fs.readFileSync('src/controllers/lightBillScanController.js', 'utf8');

// 1. Remove the aggressive clearing of tariffCategory
const safetyGateOld = `        // If the extracted category is completely invalid/garbage, trigger Safety Gate
        if (!isValidCategory) {
            criticalFieldsConfirmed = false;
            merged.meterTypeInfo = ""; // Clear garbage
            merged.tariffCategory = ""; // Clear garbage
        }`;
const safetyGateNew = `        // If the extracted category is completely invalid/garbage, trigger Safety Gate
        if (!isValidCategory) {
            criticalFieldsConfirmed = false;
            // Removed clearing of fields so user can see extracted garbage and correct it
        }`;
content = content.replace(safetyGateOld, safetyGateNew);

// 2. Fix average daily fallback for all AU low kWh bills
const fallbackOld = `        // Red Energy / Synergy average daily fallback
        let finalKwh = merged.quarterlyKwh;
        if (merged.retailer === 'Red Energy' || merged.retailer === 'Synergy') {
            if (finalKwh && finalKwh < 200) finalKwh = Math.round(finalKwh * 90); // If average daily was extracted instead of quarterly sum
        }`;
const fallbackNew = `        // Average daily fallback for low kWh values (e.g. Origin 27.78, Horizon 25)
        let finalKwh = merged.quarterlyKwh;
        if (isAU && finalKwh && finalKwh < 150) {
            finalKwh = Math.round(finalKwh * (merged.billingDays || 90));
        }`;
content = content.replace(fallbackOld, fallbackNew);

fs.writeFileSync('src/controllers/lightBillScanController.js', content);
console.log("Patched lightBillScanController.js");
