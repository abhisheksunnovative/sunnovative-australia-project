import fs from 'fs';
import EligibilitySettings from '../models/EligibilitySettings.js';
import * as billParser from '../utils/billParser.js';
import * as templateExtractor from '../utils/templateExtractor.js';
import { parseAuBillText, parseBillText } from '../utils/Ocrextractor.js';

import ScanAnalytics from '../models/ScanAnalytics.js';
import { runGeminiFallback } from '../utils/geminiExtractor.js';

// Define isBillTooOld helper
const isBillTooOld = (dateStr, countryContext) => {
    if (!dateStr) return false;
    try {
        const parsed = new Date(dateStr);
        if (isNaN(parsed)) return false; // cannot parse, assume it's okay for now or fallback manually
        
        const now = new Date();
        const diffMonths = (now.getFullYear() - parsed.getFullYear()) * 12 + (now.getMonth() - parsed.getMonth());
        
        // AU limit: 4 months. IN limit: 3 months
        const limit = countryContext === 'australia' ? 4 : 3;
        return diffMonths > limit;
    } catch(err) {
        return false;
    }
};

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
        const { rawText, usedOCR, wordsWithPositions } = await billParser.extractRawText(fileBuffer, mimeType);

        if (!rawText || rawText.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Could not extract text from the document.' });
        }

        console.log('[BillScan] Step 2: Running Unified Parsers...');
        
        // Base Parser
        let baseParsed = isAU ? parseAuBillText(rawText) : await parseBillText(rawText);
        
        // DB Override Parser
        let ed = {};
        try {
            const overrideResult = await templateExtractor.extractData(rawText, countryContext, wordsWithPositions);
            ed = overrideResult.extractedData || {};
        } catch (templateErr) {
            console.warn(`[BillScan] Template extraction skipped/failed: ${templateErr.message}`);
        }

        // Merge logic: For AU, Base (Ocrextractor) is robust so it overrides DB templates. For India, DB overrides base.
        const merged = {
            retailer: (ed.retailer || baseParsed.retailer || baseParsed.discomId),
            monthlyBill: (ed.monthlyBill || baseParsed.quarterlyBillAmount || baseParsed.billAmount),
            amountType: baseParsed.amountType || 'due',
            fullName: (ed.fullName || baseParsed.customerName),
            consumerNumber: (ed.consumerNumber || baseParsed.accountNumber || baseParsed.consumerNumber),
            dueDate: (ed.dueDate || baseParsed.dueDate),
            tariffCategory: (ed.tariffCategory || baseParsed.tariffType || baseParsed.tariffDesc),
            billingDays: ed.billingDays || baseParsed.billingDays,
            meterTypeInfo: (ed.meterCategory || ed.meterTypeInfo || baseParsed.meterType || baseParsed.meterCategory),
            state: (ed.state || baseParsed.state || baseParsed.detectedState),
            city: (ed.city || baseParsed.suburb || baseParsed.district),
            postcode: (ed.postcode || baseParsed.postcode),
            ...(isAU ? { quarterlyKwh: ed.quarterlyKwh || ed.monthlyUnits || baseParsed.quarterlyKwh } : {}),
            ...(!isAU ? { monthlyUnits: ed.monthlyUnits || ed.quarterlyKwh || baseParsed.monthlyUnitsUsed || baseParsed.quarterlyKwh } : {}),
              billIssueDate: (ed.billIssuedDate || ed.billIssueDate || baseParsed.billDate)
          };

        // Fallback removed as per user request (no guess-multiply for low kWh)
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
        console.log(`[SafetyGate] Checking Recency. Effective Date found: ${effectiveDate || 'NONE'}`);
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
                    console.log(`[BillScan] India Bill confidence ${initialConfidence}% < 70%. Triggering Gemini Fallback...`);
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
        } catch (err) {
            console.error(`[BillScan] Failed to log analytics:`, err);
        }
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
            // Removed clearing of fields so user can see extracted garbage and correct it
        }
        // ----------------------------------------

        // Final Combined Confidence Scoring (After potential Gemini merge)
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

        // AU Credit Logic
        let payableAmount = merged.monthlyBill;
        if (merged.amountType === 'credit') {
            payableAmount = 0;
        }

        const finalJson = {
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

        if (isAU) {
            delete finalJson.monthlyUnits;
        } else {
            delete finalJson.quarterlyKwh;
            if (finalJson.monthlyUnits && !finalJson.monthlyUnits) { // safety 
               finalJson.monthlyUnits = finalKwh;
            }
        }
        console.log('[BillScan] Success! Final JSON:', finalJson);
        console.log(`[BillScan] Confidence: ${confidenceScore}% | Status: ${status}`);

        res.status(200).json({
            success: true,
            isManualReview: status === 'manual-review',
            extractedData: finalJson,
            ...(isAU ? { quarterlyKwh: finalKwh || null } : { monthlyUnits: merged.monthlyUnits || null }),
            stcInfo: null,
            confidenceScore: confidenceScore,
            status: status,
            criticalFieldsConfirmed: criticalFieldsConfirmed,
            fallbackReason: fallbackReason || null
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
        const templateMatched = await ScanAnalytics.countDocuments({ engineUsed: { $ne: 'in-house-failed' } });
        const coveragePercent = totalScans > 0 ? ((templateMatched / totalScans) * 100).toFixed(1) : 0;
        
        res.status(200).json({ success: true, stats, reasons, totalScans, coveragePercent });
    } catch (err) {
        console.error("[BillScan] Analytics Error:", err);
        res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
};

export const getNeedsTemplateQueue = async (req, res) => {
    try {
        const { country } = req.query;
        const query = {
            needsTemplateCreation: true,
            resolvedTemplateId: null
        };
        if (country) query.country = country;
        
        const items = await ScanAnalytics.find(query)
            .sort({ createdAt: -1 })
            .limit(50);
            
        res.json({ success: true, count: items.length, items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
