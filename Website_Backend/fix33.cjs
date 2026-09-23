const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let code = fs.readFileSync(path, 'utf8');

const importStr = `import { runGeminiFallback } from '../utils/geminiExtractor.js';`;

const newImportStr = `import { runGeminiFallback } from '../utils/geminiExtractor.js';

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
};`;

if (code.includes(importStr)) {
    code = code.replace(importStr, newImportStr);
} else if (code.includes(importStr.replace(/\n/g, '\r\n'))) {
    code = code.replace(importStr.replace(/\n/g, '\r\n'), newImportStr.replace(/\n/g, '\r\n'));
}

// Add fallbackReason to the JSON response
const oldResponse = `        res.status(200).json({
            success: true,
            isManualReview: status === 'manual-review',
            extractedData: finalJson,
            quarterlyKwh: finalKwh || null,
            stcInfo: null,
            confidenceScore: confidenceScore,
            status: status,
            criticalFieldsConfirmed: criticalFieldsConfirmed
        });`;

const newResponse = `        res.status(200).json({
            success: true,
            isManualReview: status === 'manual-review',
            extractedData: finalJson,
            quarterlyKwh: finalKwh || null,
            stcInfo: null,
            confidenceScore: confidenceScore,
            status: status,
            criticalFieldsConfirmed: criticalFieldsConfirmed,
            fallbackReason: fallbackReason || null
        });`;

if (code.includes(oldResponse)) {
    code = code.replace(oldResponse, newResponse);
} else if (code.includes(oldResponse.replace(/\n/g, '\r\n'))) {
    code = code.replace(oldResponse.replace(/\n/g, '\r\n'), newResponse.replace(/\n/g, '\r\n'));
}

fs.writeFileSync(path, code);
console.log('Fixed lightBillScanController isBillTooOld and fallbackReason');
