import fs from 'fs';

let content = fs.readFileSync('src/controllers/lightBillScanController.js', 'utf8');

// Update confidence scoring logic to define and return criticalFieldsConfirmed
const oldScoring = `        // Combined Confidence Scoring (Context Aware)
        const totalFields = isAU ? 7 : 8; // AU bills don't explicitly list meterCategory (Residential/Commercial)
        let filledFields = 0;
        if (merged.monthlyBill) filledFields++;
        if (merged.retailer) filledFields++;
        if (merged.fullName) filledFields++;
        if (merged.consumerNumber) filledFields++;
        if (merged.dueDate) filledFields++;
        if (finalKwh || merged.monthlyUnits) filledFields++;
        if (merged.state) filledFields++;
        if (!isAU && (merged.meterTypeInfo || merged.tariffCategory)) filledFields++; // Only score category for India

        let confidenceScore = Math.round((filledFields / totalFields) * 100);
        let status = confidenceScore >= 50 ? 'needs-review' : 'manual-review';
        if (confidenceScore === 100) status = 'success';`;

const newScoring = `        // Recommendation Safety Gate - Critical Fields Check
        const criticalFieldsConfirmed = !!(
            merged.monthlyBill && 
            (finalKwh || merged.monthlyUnits) && 
            (isAU || (merged.meterTypeInfo || merged.tariffCategory)) // meterCategory is critical for India sizing
        );

        // Combined Confidence Scoring (Context Aware)
        const totalFields = isAU ? 7 : 8; // AU bills don't explicitly list meterCategory (Residential/Commercial)
        let filledFields = 0;
        if (merged.monthlyBill) filledFields++;
        if (merged.retailer) filledFields++;
        if (merged.fullName) filledFields++;
        if (merged.consumerNumber) filledFields++;
        if (merged.dueDate) filledFields++;
        if (finalKwh || merged.monthlyUnits) filledFields++;
        if (merged.state) filledFields++;
        if (!isAU && (merged.meterTypeInfo || merged.tariffCategory)) filledFields++; // Only score category for India

        let confidenceScore = Math.round((filledFields / totalFields) * 100);
        let status = criticalFieldsConfirmed ? (confidenceScore >= 80 ? 'success' : 'needs-review') : 'needs-review';
        if (confidenceScore < 50) status = 'manual-review';`;

content = content.replace(oldScoring, newScoring);

const oldResponse = `            status: status
        });`;

const newResponse = `            status: status,
            criticalFieldsConfirmed: criticalFieldsConfirmed
        });`;

content = content.replace(oldResponse, newResponse);

fs.writeFileSync('src/controllers/lightBillScanController.js', content);
console.log("lightBillScanController updated with Safety Gate.");
