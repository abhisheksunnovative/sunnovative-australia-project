import fs from 'fs';

let content = fs.readFileSync('src/controllers/lightBillScanController.js', 'utf8');

// Update Confidence Scoring to account for AU missing meterCategory
const oldScoring = `        // Combined Confidence Scoring
        const totalFields = 8;
        let filledFields = 0;
        if (merged.monthlyBill) filledFields++;
        if (merged.retailer) filledFields++;
        if (merged.fullName) filledFields++;
        if (merged.consumerNumber) filledFields++;
        if (merged.dueDate) filledFields++;
        if (finalKwh || merged.monthlyUnits) filledFields++;
        if (merged.state) filledFields++;
        if (merged.meterTypeInfo || merged.tariffCategory) filledFields++;`;

const newScoring = `        // Combined Confidence Scoring (Context Aware)
        const totalFields = isAU ? 7 : 8; // AU bills don't explicitly list meterCategory (Residential/Commercial)
        let filledFields = 0;
        if (merged.monthlyBill) filledFields++;
        if (merged.retailer) filledFields++;
        if (merged.fullName) filledFields++;
        if (merged.consumerNumber) filledFields++;
        if (merged.dueDate) filledFields++;
        if (finalKwh || merged.monthlyUnits) filledFields++;
        if (merged.state) filledFields++;
        if (!isAU && (merged.meterTypeInfo || merged.tariffCategory)) filledFields++; // Only score category for India`;

content = content.replace(oldScoring, newScoring);

fs.writeFileSync('src/controllers/lightBillScanController.js', content);
console.log("Confidence scoring patched.");
