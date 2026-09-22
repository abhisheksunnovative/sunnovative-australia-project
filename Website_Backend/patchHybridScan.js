import fs from 'fs';

let content = fs.readFileSync('src/controllers/lightBillScanController.js', 'utf8');

const importStatement = `import ScanAnalytics from '../models/ScanAnalytics.js';\nimport { runGeminiFallback } from '../utils/geminiExtractor.js';\n\nexport const scanLightBill`;
content = content.replace("export const scanLightBill", importStatement);

const oldLogicStart = `        // Recommendation Safety Gate - Critical Fields Check
        const criticalFieldsConfirmed = !!(
            merged.monthlyBill && 
            (finalKwh || merged.monthlyUnits) && 
            (isAU || (merged.meterTypeInfo || merged.tariffCategory)) // meterCategory is critical for India sizing
        );`;

const newLogicStart = `        // Recommendation Safety Gate - Critical Fields Check
        let criticalFieldsConfirmed = !!(
            merged.monthlyBill && 
            (finalKwh || merged.monthlyUnits) && 
            (isAU || (merged.meterTypeInfo || merged.tariffCategory)) // meterCategory is critical for India sizing
        );
        
        let engineUsed = 'in-house';
        let fallbackReason = null;
        let geminiCost = 0;
        let needsTemplate = false;

        if (!criticalFieldsConfirmed) {
            if (isAU) {
                // AU/NZ Handle: Parser bugs on Digital PDFs
                engineUsed = 'in-house-failed';
                fallbackReason = 'Critical fields missing on AU bill (Likely Parser Bug)';
                console.warn("[BillScan] AU Bill failed critical check. Logging as parser bug. No Gemini fallback.");
            } else {
                // Hybrid Gemini Fallback for India/Other (Blurry photos)
                console.log("[BillScan] Critical fields missing. Triggering Gemini Fallback...");
                fallbackReason = 'Critical fields missing (Likely Blurry Image)';
                
                const geminiData = await runGeminiFallback(fileBuffer, mimeType, countryContext);
                if (geminiData) {
                    engineUsed = 'gemini-fallback';
                    geminiCost = 0.0025; // Estimated vision cost
                    needsTemplate = true; // Flag for self-learning Admin loop
                    
                    // Merge Gemini data into our unified object
                    if (geminiData.monthlyBill) merged.monthlyBill = geminiData.monthlyBill;
                    if (geminiData.retailer) merged.retailer = geminiData.retailer;
                    if (geminiData.fullName) merged.fullName = geminiData.fullName;
                    if (geminiData.consumerNumber) merged.consumerNumber = geminiData.consumerNumber;
                    if (geminiData.dueDate) merged.dueDate = geminiData.dueDate;
                    if (geminiData.tariffCategory) merged.tariffCategory = geminiData.tariffCategory;
                    if (geminiData.state) merged.state = geminiData.state;
                    if (geminiData.quarterlyKwh) finalKwh = geminiData.quarterlyKwh;
                    if (geminiData.monthlyUnits) merged.monthlyUnits = geminiData.monthlyUnits;

                    // Re-evaluate Safety Gate
                    criticalFieldsConfirmed = !!(
                        merged.monthlyBill && 
                        (finalKwh || merged.monthlyUnits) && 
                        (isAU || (merged.meterTypeInfo || merged.tariffCategory))
                    );
                } else {
                    engineUsed = 'in-house-failed';
                    fallbackReason = 'Gemini Fallback also failed or unavailable';
                }
            }
        }

        // ScanAnalytics Logging (As requested by Senior/Boss)
        try {
            await ScanAnalytics.create({
                engineUsed: engineUsed,
                geminiEstimatedCost: geminiCost,
                fallbackReason: fallbackReason,
                country: countryContext,
                needsTemplateCreation: needsTemplate,
                rawText: rawText,
                geminiResult: engineUsed === 'gemini-fallback' ? merged : null
            });
        } catch (analyticsErr) {
            console.error("[BillScan] Failed to log ScanAnalytics:", analyticsErr);
        }`;

content = content.replace(oldLogicStart, newLogicStart);

fs.writeFileSync('src/controllers/lightBillScanController.js', content);
console.log("lightBillScanController successfully updated with Hybrid Fallback and Logging.");
