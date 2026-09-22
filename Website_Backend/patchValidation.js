import fs from 'fs';
let content = fs.readFileSync('src/controllers/lightBillScanController.js', 'utf8');

const anchorRegex = /\s*\/\/\s*Combined Confidence Scoring \(Context Aware\)/;

const validationLogic = `
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
`;

if (anchorRegex.test(content)) {
    content = content.replace(anchorRegex, validationLogic + "\n        // Combined Confidence Scoring (Context Aware)");
    fs.writeFileSync('src/controllers/lightBillScanController.js', content);
    console.log("Validation layer added to trigger Safety Gate.");
} else {
    console.log("Anchor not found.");
}
