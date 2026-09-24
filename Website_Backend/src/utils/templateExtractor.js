import BillTemplate from '../models/BillTemplate.js';

function sanitizeValue(value, type) {
    if (!value) return null;
    value = value.trim();
    
    try {
        switch (type) {
            case 'number':
                const numStr = value.replace(/[^0-9.]/g, '');
                return numStr ? parseFloat(numStr) : null;
            case 'string':
            default:
                return value;
        }
    } catch (e) {
        return value;
    }
}

export async function extractData(rawText, countryContext = 'australia') {
    try {
        console.log(`[TemplateExtractor] Searching for matching template in ${countryContext}...`);
        
        const templates = await BillTemplate.find({ country: countryContext, isActive: true }).sort({ updatedAt: -1 });
        
        if (!templates || templates.length === 0) {
            return { extractedData: {}, matchedTemplate: null, confidenceScore: 0, status: 'manual-review' };
        }

        let matchedTemplate = null;

        for (const template of templates) {
            const isMatch = template.anchorKeywords.some(keyword => {
                const regex = new RegExp(keyword, 'i');
                return regex.test(rawText);
            });

            if (isMatch) {
                matchedTemplate = template;
                break;
            }
        }

        if (!matchedTemplate) {
            console.warn("[TemplateExtractor] Unknown Discom format. Sending to Manual Review.");
            return {
                success: false,
                confidenceScore: 0,
                message: "Unknown Discom. Manual Review Required.",
                extractedData: {},
                rawTextPreview: rawText.substring(0, 500)
            };
        }

        console.log(`[TemplateExtractor] Matched Template: ${matchedTemplate.discomName}`);

        const extractedData = {
            retailer: matchedTemplate.discomName,
            country: matchedTemplate.country
        };
        
        let fieldsMatched = 0;
        let totalRequiredFields = 0;

        for (const rule of matchedTemplate.extractionRules) {
            if (rule.required) totalRequiredFields++;

            try {
                const isStrictCase = rule.field === 'fullName' || rule.field === 'consumerName';
                const regex = new RegExp(rule.regex, rule.flags || (isStrictCase ? '' : 'i'));
                const match = rawText.match(regex);

                if (match) { 
                    const capturedValue = match.slice(1).find(g => g !== undefined);
                    console.log(`[TemplateExtractor][${rule.field}] 🔍 Regex Matched Full String: "${match[0]}"`);
                    console.log(`[TemplateExtractor][${rule.field}] 🎯 Captured Group Value: "${capturedValue}"`);
                    
                    if (!capturedValue) {
                         console.log(`[TemplateExtractor][${rule.field}] ⚠️ Match succeeded, but captured group was undefined (possible alternative group issue).`);
                         continue;
                    }
                    
                    let val = sanitizeValue(capturedValue, rule.type);
                    
                    // Regex Root-Cause Fix: Reject garbage extractions like "actual meter reading" for category fields
                    if (rule.field === 'meterTypeInfo' || rule.field === 'tariffCategory' || rule.field === 'meterCategory') {
                        if (typeof val === 'string' && val.toLowerCase().includes('reading')) {
                            console.log(`[TemplateExtractor][${rule.field}] 🗑️ Rejected Garbage Value (contains 'reading'): "${val}"`);
                            val = null; // Skip garbage extraction
                        }
                    }
                    
                    if (val !== null) {
                        console.log(`[TemplateExtractor][${rule.field}] ✅ FINAL EXTRACTED VALUE: ${val}`);
                        extractedData[rule.field] = val;
                        if (rule.required) fieldsMatched++;
                    } else {
                        console.log(`[TemplateExtractor][${rule.field}] ⚠️ Value became null after sanitization or garbage filter.`);
                    }
                } else {
                    console.log(`[TemplateExtractor][${rule.field}] FAILED MATCH. String length: ${rawText.length}, Regex used: ${regex}`);
                }
            } catch (err) {
                console.error(`[TemplateExtractor] Invalid regex for field ${rule.field}: ${rule.regex}`, err);
            }
        }

        let confidenceScore = 100;
        if (totalRequiredFields > 0) {
            confidenceScore = Math.round((fieldsMatched / totalRequiredFields) * 100);
        }

        console.log(`[TemplateExtractor] Extraction Complete. Confidence: ${confidenceScore}%`);

        let status = 'auto-save';
        if (confidenceScore < 40) status = 'manual-review';
        else if (confidenceScore < 80) status = 'needs-review';

        console.log('\n======================================================');
        console.log('[TemplateExtractor] ✅ SCAN COMPLETED!');
        console.log(`[TemplateExtractor] Discom Template Used: ${matchedTemplate.discomName}`);
        console.log(`[TemplateExtractor] Confidence Score: ${confidenceScore}%`);
        console.log('[TemplateExtractor] FINAL EXTRACTED DATA (JSON):');
        console.log(JSON.stringify(extractedData, null, 2));
        console.log('======================================================\n');

        return {
            success: true,
            status,
            confidenceScore,
            templateUsed: matchedTemplate.discomName,
            extractedData
        };

    } catch (error) {
        console.error("[TemplateExtractor] Error during extraction:", error);
        throw error;
    }
}
