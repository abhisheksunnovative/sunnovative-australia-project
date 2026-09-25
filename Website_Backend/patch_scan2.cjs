const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let code = fs.readFileSync(file, 'utf8');

const startMarker = "// Fallback removed as per user request (no guess-multiply for low kWh)";
const endMarker = "// Tariff Category Verification against DB (India specific)";
const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

const replacement = 
"        // Fallback removed as per user request (no guess-multiply for low kWh)\n" +
"        let finalKwh = merged.quarterlyKwh;\n" +
"\n" +
"        // Calculate Initial Confidence Score BEFORE Gemini\n" +
"        const totalFields = isAU ? 7 : 8;\n" +
"        let filledFields = 0;\n" +
"        if (merged.monthlyBill) filledFields++;\n" +
"        if (merged.retailer) filledFields++;\n" +
"        if (merged.fullName) filledFields++;\n" +
"        if (merged.consumerNumber) filledFields++;\n" +
"        if (merged.dueDate) filledFields++;\n" +
"        if (finalKwh || merged.monthlyUnits) filledFields++;\n" +
"        if (merged.state) filledFields++;\n" +
"        if (!isAU && (merged.meterTypeInfo || merged.tariffCategory)) filledFields++;\n" +
"        \n" +
"        let initialConfidence = Math.round((filledFields / totalFields) * 100);\n" +
"\n" +
"        // Recommendation Safety Gate - Critical Fields Check\n" +
"        let criticalFieldsConfirmed = !!(\n" +
"            merged.monthlyBill && \n" +
"            (finalKwh || merged.monthlyUnits) && \n" +
"            (isAU || (merged.meterTypeInfo || merged.tariffCategory)) // meterCategory is critical for India sizing\n" +
"        );\n" +
"        \n" +
"        let engineUsed = 'in-house';\n" +
"        let fallbackReason = null;\n" +
"        let geminiCost = 0;\n" +
"        let needsTemplate = false;\n" +
"\n" +
"        // Bill Recency Check\n" +
"        const effectiveDate = merged.billIssueDate || merged.billingPeriodTo;\n" +
"        console.log('[SafetyGate] Checking Recency. Effective Date found: ' + (effectiveDate || 'NONE'));\n" +
"        if (!effectiveDate) {\n" +
"            criticalFieldsConfirmed = false;\n" +
"            fallbackReason = 'Bill date not found — cannot verify recency';\n" +
"        } else if (isBillTooOld(effectiveDate, countryContext)) {\n" +
"            criticalFieldsConfirmed = false;\n" +
"            fallbackReason = 'Bill is older than allowed limit — ask customer for a recent bill';\n" +
"        }\n" +
"\n" +
"        // --- UNIFIED ZERO-COST TEMPLATE ENGINE LOGIC (India & AU) ---\n" +
"        if (!criticalFieldsConfirmed || initialConfidence < 70) {\n" +
"            needsTemplate = true; \n" +
"            \n" +
"            if (isAU) {\n" +
"                // Australia: NO GEMINI. Wait for Admin Template.\n" +
"                engineUsed = 'in-house-failed';\n" +
"                fallbackReason = fallbackReason || 'Critical fields missing or low confidence on AU bill (Likely Parser Bug)';\n" +
"                console.warn('[BillScan] AU Bill failed check. Flagged for Template Builder.');\n" +
"            } else {\n" +
"                // India: Use Gemini ONLY IF initialConfidence < 70\n" +
"                if (initialConfidence < 70) {\n" +
"                    console.log('[BillScan] India Bill confidence ' + initialConfidence + '% < 70%. Triggering Gemini Fallback...');\n" +
"                    fallbackReason = fallbackReason || 'Confidence < 70% (Likely Blurry Image or Unknown Layout)';\n" +
"                    \n" +
"                    const geminiData = await runGeminiFallback(fileBuffer, mimeType, countryContext);\n" +
"                    if (geminiData) {\n" +
"                        engineUsed = 'gemini-fallback';\n" +
"                        geminiCost = 0.0025;\n" +
"                        \n" +
"                        if (geminiData.monthlyBill) merged.monthlyBill = geminiData.monthlyBill;\n" +
"                        if (geminiData.retailer) merged.retailer = geminiData.retailer;\n" +
"                        if (geminiData.fullName) merged.fullName = geminiData.fullName;\n" +
"                        if (geminiData.consumerNumber) merged.consumerNumber = geminiData.consumerNumber;\n" +
"                        if (geminiData.dueDate) merged.dueDate = geminiData.dueDate;\n" +
"                        if (geminiData.tariffCategory) merged.tariffCategory = geminiData.tariffCategory;\n" +
"                        if (geminiData.state) merged.state = geminiData.state;\n" +
"                        if (geminiData.quarterlyKwh) finalKwh = geminiData.quarterlyKwh;\n" +
"                        if (geminiData.monthlyUnits) merged.monthlyUnits = geminiData.monthlyUnits;\n" +
"\n" +
"                        criticalFieldsConfirmed = !!(\n" +
"                            merged.monthlyBill && \n" +
"                            (finalKwh || merged.monthlyUnits) && \n" +
"                            (merged.meterTypeInfo || merged.tariffCategory)\n" +
"                        );\n" +
"                    } else {\n" +
"                        engineUsed = 'in-house-failed';\n" +
"                        fallbackReason = fallbackReason || 'Gemini Fallback failed or unavailable';\n" +
"                    }\n" +
"                } else {\n" +
"                    engineUsed = 'in-house-failed';\n" +
"                    fallbackReason = fallbackReason || 'Critical fields missing (Parser Failed)';\n" +
"                    console.warn('[BillScan] IN Bill failed critical check but had >=70% confidence. No Gemini. Flagged for Template Builder.');\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"\n" +
"        // ScanAnalytics Logging\n" +
"        try {\n" +
"            await ScanAnalytics.create({\n" +
"                country: countryContext,\n" +
"                engineUsed,\n" +
"                geminiCost,\n" +
"                needsTemplateCreation: needsTemplate, \n" +
"                rawText: rawText,\n" +
"                confidenceScore: initialConfidence,\n" +
"                fallbackReason: fallbackReason,\n" +
"                extractedData: {\n" +
"                    ...merged,\n" +
"                    quarterlyKwh: finalKwh\n" +
"                }\n" +
"            });\n" +
"            console.log('[BillScan] Logged ' + engineUsed + ' analytics to DB. Admin NeedsTemplate: ' + needsTemplate);\n" +
"        } catch (err) {\n" +
"            console.error('[BillScan] Failed to log analytics:', err);\n" +
"        }\n\n        ";

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);

const bottomConfStart = "// Combined Confidence Scoring (Context Aware)";
const bottomConfEnd = "// AU Credit Logic";
const bottomStartIndex = code.indexOf(bottomConfStart);
const bottomEndIndex = code.indexOf(bottomConfEnd);

if (bottomStartIndex !== -1 && bottomEndIndex !== -1) {
    const bottomReplacement = 
"        // Final Combined Confidence Scoring (After potential Gemini merge)\n" +
"        let finalFilledFields = 0;\n" +
"        if (merged.monthlyBill) finalFilledFields++;\n" +
"        if (merged.retailer) finalFilledFields++;\n" +
"        if (merged.fullName) finalFilledFields++;\n" +
"        if (merged.consumerNumber) finalFilledFields++;\n" +
"        if (merged.dueDate) finalFilledFields++;\n" +
"        if (finalKwh || merged.monthlyUnits) finalFilledFields++;\n" +
"        if (merged.state) finalFilledFields++;\n" +
"        if (!isAU && (merged.meterTypeInfo || merged.tariffCategory)) finalFilledFields++;\n" +
"\n" +
"        let confidenceScore = Math.round((finalFilledFields / totalFields) * 100);\n" +
"        let status = criticalFieldsConfirmed ? (confidenceScore >= 80 ? 'success' : 'needs-review') : 'needs-review';\n" +
"        if (confidenceScore < 50) status = 'manual-review';\n\n        ";
    code = code.substring(0, bottomStartIndex) + bottomReplacement + code.substring(bottomEndIndex);
}

fs.writeFileSync(file, code);
console.log("Applied unified scan correctly!");
