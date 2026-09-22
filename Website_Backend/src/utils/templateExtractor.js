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
        
        const templates = await BillTemplate.find({ country: countryContext, isActive: true });
        
        if (!templates || templates.length === 0) {
            throw new Error(`No active templates found for country: ${countryContext}`);
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
                const regex = new RegExp(rule.regex, rule.flags || 'i');
                const match = rawText.match(regex);

                if (match && match[1]) { 
                    const val = sanitizeValue(match[1], rule.type);
                    if (val !== null) {
                        extractedData[rule.field] = val;
                        if (rule.required) fieldsMatched++;
                    }
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
