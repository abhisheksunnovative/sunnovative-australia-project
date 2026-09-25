const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let code = fs.readFileSync(file, 'utf8');

const startMarker = "// Fallback removed as per user request (no guess-multiply for low kWh)";
const endMarker = "// Tariff Category Verification against DB (India specific)";
const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

const replacement = `// Fallback removed as per user request (no guess-multiply for low kWh)
        let finalKwh = merged.quarterlyKwh;

        // Calculate Initial Confidence Score BEFORE Gemini
        const totalFields = isAU ? 7 : 8;
        let filledFields = 0;
        if (merged.monthlyBill) filledFields++;
        if (merged.retailer) filledFields++;
        if (merged.fullName) filledFields++;
        if (merged.consumerNumber) filledFields++;
        if (merged.dueDate) filledFields++;
        if (finalKwh || merged.monthlyUnits) filledFields++;
        if (merged.state) filledFields++;
        if (!isAU && (merged.meterTypeInfo || merged.tariffCategory)) filledFields++;
        
        let initialConfidence = Math.round((filledFields / totalFields) * 100);

        // Recommendation Safety Gate - Critical Fields Check
        let criticalFieldsConfirmed = !!(
            merged.monthlyBill && 
            (finalKwh || merged.monthlyUnits) && 
            (isAU || (merged.meterTypeInfo || merged.tariffCategory)) // meterCategory is critical for India sizing
        );
        
        let engineUsed = 'in-house';
        let fallbackReason = null;
        let geminiCost = 0;
        let needsTemplate = false;

        // Bill Recency Check
        const effectiveDate = merged.billIssueDate || merged.billingPeriodTo;
        console.log(\`[SafetyGate] Checking Recency. Effective Date found: \${effectiveDate || 'NONE'}\`);
        if (!effectiveDate) {
            criticalFieldsConfirmed = false;
            fallbackReason = 'Bill date not found — cannot verify recency';
        } else if (isBillTooOld(effectiveDate, countryContext)) {
            criticalFieldsConfirmed = false;
            fallbackReason = 'Bill is older than allowed limit — ask customer for a recent bill';
        }

        // --- UNIFIED ZERO-COST TEMPLATE ENGINE LOGIC (India & AU) ---
        if (!criticalFieldsConfirmed || initialConfidence < 70) {
            needsTemplate = true; 
            
            if (isAU) {
                // Australia: NO GEMINI. Wait for Admin Template.
                engineUsed = 'in-house-failed';
                fallbackReason = fallbackReason || 'Critical fields missing or low confidence on AU bill (Likely Parser Bug)';
                console.warn("[BillScan] AU Bill failed check. Flagged for Template Builder.");
            } else {
                // India: Use Gemini ONLY IF initialConfidence < 70
                if (initialConfidence < 70) {
                    console.log(\`[BillScan] India Bill confidence \${initialConfidence}% < 70%. Triggering Gemini Fallback...\`);
                    fallbackReason = fallbackReason || 'Confidence < 70% (Likely Blurry Image or Unknown Layout)';
                    
                    const geminiData = await runGeminiFallback(fileBuffer, mimeType, countryContext);
                    if (geminiData) {
                        engineUsed = 'gemini-fallback';
                        geminiCost = 0.0025;
                        
                        if (geminiData.monthlyBill) merged.monthlyBill = geminiData.monthlyBill;
                        if (geminiData.retailer) merged.retailer = geminiData.retailer;
                        if (geminiData.fullName) merged.fullName = geminiData.fullName;
                        if (geminiData.consumerNumber) merged.consumerNumber = geminiData.consumerNumber;
                        if (geminiData.dueDate) merged.dueDate = geminiData.dueDate;
                        if (geminiData.tariffCategory) merged.tariffCategory = geminiData.tariffCategory;
                        if (geminiData.state) merged.state = geminiData.state;
                        if (geminiData.quarterlyKwh) finalKwh = geminiData.quarterlyKwh;
                        if (geminiData.monthlyUnits) merged.monthlyUnits = geminiData.monthlyUnits;

                        criticalFieldsConfirmed = !!(
                            merged.monthlyBill && 
                            (finalKwh || merged.monthlyUnits) && 
                            (merged.meterTypeInfo || merged.tariffCategory)
                        );
                    } else {
                        engineUsed = 'in-house-failed';
                        fallbackReason = fallbackReason || 'Gemini Fallback failed or unavailable';
                    }
                } else {
                    engineUsed = 'in-house-failed';
                    fallbackReason = fallbackReason || 'Critical fields missing (Parser Failed)';
                    console.warn("[BillScan] IN Bill failed critical check but had >=70% confidence. No Gemini. Flagged for Template Builder.");
                }
            }
        }

        // ScanAnalytics Logging
        try {
            await ScanAnalytics.create({
                country: countryContext,
                engineUsed,
                geminiCost,
                needsTemplateCreation: needsTemplate, 
                rawText: rawText,
                confidenceScore: initialConfidence,
                fallbackReason: fallbackReason,
                extractedData: {
                    ...merged,
                    quarterlyKwh: finalKwh
                }
            });
            console.log(\`[BillScan] Logged \${engineUsed} analytics to DB. Admin NeedsTemplate: \${needsTemplate}\`);
        } catch (err) {
            console.error(\`[BillScan] Failed to log analytics:\`, err);
        }

        `;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);

const bottomConfStart = "// Combined Confidence Scoring (Context Aware)";
const bottomConfEnd = "// AU Credit Logic";
const bottomStartIndex = code.indexOf(bottomConfStart);
const bottomEndIndex = code.indexOf(bottomConfEnd);

if (bottomStartIndex !== -1 && bottomEndIndex !== -1) {
    const bottomReplacement = \`// Final Combined Confidence Scoring (After potential Gemini merge)
        let finalFilledFields = 0;
        if (merged.monthlyBill) finalFilledFields++;
        if (merged.retailer) finalFilledFields++;
        if (merged.fullName) finalFilledFields++;
        if (merged.consumerNumber) finalFilledFields++;
        if (merged.dueDate) finalFilledFields++;
        if (finalKwh || merged.monthlyUnits) finalFilledFields++;
        if (merged.state) finalFilledFields++;
        if (!isAU && (merged.meterTypeInfo || merged.tariffCategory)) finalFilledFields++;

        let confidenceScore = Math.round((finalFilledFields / totalFields) * 100);
        let status = criticalFieldsConfirmed ? (confidenceScore >= 80 ? 'success' : 'needs-review') : 'needs-review';
        if (confidenceScore < 50) status = 'manual-review';

        \`;
    code = code.substring(0, bottomStartIndex) + bottomReplacement + code.substring(bottomEndIndex);
}

fs.writeFileSync(file, code);
console.log("Applied!");
