import fs from 'fs';
import EligibilitySettings from '../models/EligibilitySettings.js';
import * as billParser from '../utils/billParser.js';
import * as templateExtractor from '../utils/templateExtractor.js';

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

        console.log('[BillScan] Step 2: Running Template Extractor...');
        const extractionResult = await templateExtractor.extractData(rawText, countryContext);

        if (!extractionResult.success || extractionResult.status === 'manual-review') {
            return res.status(200).json({
                success: true,
                isManualReview: true,
                message: "We couldn't automatically read this bill format. It has been queued for manual review.",
                extractedData: {
                    fullName: "", consumerNumber: "", monthlyBill: null, 
                    scannedRetailer: extractionResult.templateUsed || "Unknown",
                    tariffCategory: "", dueDate: "", meterTypeInfo: "", billingPeriodDays: null,
                    quarterlyKwh: null, monthlyUnits: null
                }
            });
        }

        const ed = extractionResult.extractedData;
        
        // For Red Energy / Synergy, we extract average daily kWh. Multiply by 90 for quarterly.
        let finalKwh = ed.quarterlyKwh;
        if (ed.retailer === 'Red Energy' || ed.retailer === 'Synergy') {
            if (finalKwh) finalKwh = Math.round(finalKwh * 90);
        }

        const finalJson = {
            monthlyBill: ed.monthlyBill || null,
            quarterlyBillAmount: ed.monthlyBill || null, // Support for old LeadForm AU logic
            billAmount: ed.monthlyBill || null,         // Support for old LeadForm IN logic
            fullName: ed.fullName || "",
            consumerNumber: ed.consumerNumber || "",
            scannedRetailer: ed.retailer || "",
            retailer: ed.retailer || "",
            dueDate: ed.dueDate || "",
            tariffCategory: ed.tariffCategory || "",
            tariffDesc: ed.tariffCategory || "",
            billingDays: ed.billingDays || null,
            meterTypeInfo: ed.meterTypeInfo || "",
            meterCategory: ed.meterTypeInfo || "",
            state: ed.state || "",
            detectedState: ed.state || "",
            city: ed.city || "",
            district: ed.city || "",
            postcode: ed.postcode || "",
            quarterlyKwh: finalKwh || null,
            monthlyUnits: ed.monthlyUnits || null
        };

        console.log('[BillScan] Success! Final JSON:', finalJson);
        console.log(`[BillScan] Confidence: ${extractionResult.confidenceScore}% | Status: ${extractionResult.status}`);

        res.status(200).json({
            success: true,
            extractedData: finalJson,
            // Re-adding backward compatibility fields for LeadForm state
            quarterlyKwh: finalKwh || null,
            stcInfo: null,
            confidenceScore: extractionResult.confidenceScore,
            status: extractionResult.status
        });

    } catch (err) {
        console.error('[BillScan] Controller Error:', err);
        res.status(500).json({ success: false, error: 'Failed to process bill. Please try again or enter details manually.' });
    }
};
