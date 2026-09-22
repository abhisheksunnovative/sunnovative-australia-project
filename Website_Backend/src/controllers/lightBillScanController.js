import fs from 'fs';
import EligibilitySettings from '../models/EligibilitySettings.js';
import * as billParser from '../utils/billParser.js';
import * as templateExtractor from '../utils/templateExtractor.js';
import { parseAuBillText, parseBillText } from '../utils/Ocrextractor.js';

import ScanAnalytics from '../models/ScanAnalytics.js';
import { runGeminiFallback } from '../utils/geminiExtractor.js';

export const scanLightBill = async (req, res) => {
    console.log('[BillScan] Received scan request');
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ success: false, error: 'No bill file uploaded or buffer missing.' });
        }

        const fileBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;
        
        const headerCountry = req.headers['x-country'];
        const isAU = (headerCountry === 'australia' || headerCountry === 'au') || req.body.country === 'australia';
        const countryContext = isAU ? 'australia' : 'india';

        console.log(`[BillScan] Step 1: Extracting Raw Text (Context: ${countryContext})...`);
        const { rawText, usedOCR } = await billParser.extractRawText(fileBuffer, mimeType);

        if (!rawText || rawText.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Could not extract text from the document.' });
        }

        console.log('[BillScan] Step 2: Running Unified Parsers...');
        
        // Base Parser
        let baseParsed = isAU ? parseAuBillText(rawText) : await parseBillText(rawText);
        
        // DB Override Parser
        const overrideResult = await templateExtractor.extractData(rawText, countryContext);
        const ed = overrideResult.extractedData || {};

        // Merge logic: DB overrides base, base fills gaps
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
        };

        // Red Energy / Synergy average daily fallback
        let finalKwh = merged.quarterlyKwh;
        if (merged.retailer === 'Red Energy' || merged.retailer === 'Synergy') {
            if (finalKwh && finalKwh < 200) finalKwh = Math.round(finalKwh * 90); // If average daily was extracted instead of quarterly sum
        }

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
        }
        // --- ADMIN VALIDATION FOR SAFETY GATE ---
        const matchMeterCategory = (ocrCategory, adminCategories) => {
            if (!ocrCategory || ocrCategory === 'Unknown') return null;
            const ocrLower = ocrCategory.toLowerCase();
            return adminCategories.find((c) => {
                const adminLower = (c.category || '').toLowerCase();
                if (ocrLower === adminLower) return true;
                if (ocrLower.includes(adminLower) || adminLower.includes(ocrLower)) return true;
                const keywords = ['residential', 'commercial', 'industrial', 'agricultural', 'ht', 'lt-1', 'lt-2', 'lt-3', 'lt-5', 'time of use', 'single rate'];
                for (const kw of keywords) {
                    if (ocrLower.includes(kw) && adminLower.includes(kw)) return true;
                }
                return false;
            }) || null;
        };

        let isValidCategory = false;
        try {
            const settings = await EligibilitySettings.findOne({ country: countryContext });
            if (settings && settings.eligibilityRules && settings.eligibilityRules.meterCategories) {
                // Determine the canonical category field being sent to eligibility
                const canonicalCat = countryContext === 'australia' ? merged.tariffCategory : (merged.meterTypeInfo || merged.tariffCategory || "");
                if (canonicalCat) {
                    const matched = matchMeterCategory(canonicalCat, settings.eligibilityRules.meterCategories);
                    if (matched) isValidCategory = true;
                }
            }
        } catch (e) {
            console.error("Failed to validate category against admin DB", e);
        }

        // If the extracted category is completely invalid/garbage, trigger Safety Gate
        if (!isValidCategory) {
            criticalFieldsConfirmed = false;
            merged.meterTypeInfo = ""; // Clear garbage
            merged.tariffCategory = ""; // Clear garbage
        }
        // ----------------------------------------

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
        if (confidenceScore < 50) status = 'manual-review';

        // AU Credit Logic
        let payableAmount = merged.monthlyBill;
        if (merged.amountType === 'credit') {
            payableAmount = 0;
        }

        const finalJson = {
            monthlyBill: payableAmount,
            quarterlyBillAmount: payableAmount,
            billAmount: payableAmount,
            rawConsumptionAmount: merged.monthlyBill, // Keep actual amount safe for sizing
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
            meterCategory: (countryContext === 'australia' ? (merged.tariffCategory || "") : (merged.meterTypeInfo || merged.tariffCategory || "")),
            state: merged.state || "",
            detectedState: merged.state || "",
            city: merged.city || "",
            district: merged.city || "",
            postcode: merged.postcode || "",
            quarterlyKwh: finalKwh || null,
            monthlyUnits: merged.monthlyUnits || null
        };

        console.log('[BillScan] Success! Final JSON:', finalJson);
        console.log(`[BillScan] Confidence: ${confidenceScore}% | Status: ${status}`);

        res.status(200).json({
            success: true,
            isManualReview: status === 'manual-review',
            extractedData: finalJson,
            quarterlyKwh: finalKwh || null,
            stcInfo: null,
            confidenceScore: confidenceScore,
            status: status,
            criticalFieldsConfirmed: criticalFieldsConfirmed
        });

    } catch (err) {
        console.error('[BillScan] Controller Error:', err);
        res.status(500).json({ success: false, error: 'Failed to process bill. Please try again or enter details manually.' });
    }
};

export const getScanAnalytics = async (req, res) => {
    try {
        const stats = await ScanAnalytics.aggregate([
            {
                $group: {
                    _id: "$engineUsed",
                    count: { $sum: 1 },
                    totalCost: { $sum: "$geminiEstimatedCost" }
                }
            }
        ]);

        const reasons = await ScanAnalytics.aggregate([
            { $match: { fallbackReason: { $ne: null } } },
            {
                $group: {
                    _id: "$fallbackReason",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const totalScans = await ScanAnalytics.countDocuments();
        
        res.status(200).json({ success: true, stats, reasons, totalScans });
    } catch (err) {
        console.error("[BillScan] Analytics Error:", err);
        res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
};
